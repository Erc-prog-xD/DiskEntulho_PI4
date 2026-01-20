'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  PlayCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

// ---------------- TIPAGENS (wrapper do backend) ----------------
type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type PagedResponseDTO<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

type Endereco = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  descricaoLocal?: string | null;
  referencia?: string | null;
};

type CacambaDTO = {
  codigo: string;
  tamanho: number;
};

type Pagamento = {
  valor?: number;
  Valor?: number; // fallback caso venha PascalCase
};

type AgendamentoAdminDTO = {
  agendamentoId: number;
  endereco: Endereco;
  cacamba: CacambaDTO;
  clientId: number;
  clientCpf: string;
  clientName: string;
  pagamento: Pagamento;
  statusAgendamento?: number; // 0..4
  dataInicial: string; // ISO
  dataFinal: string;   // ISO
};

type StatusLabel = 'Criado' | 'Processando' | 'Rejeitado' | 'Confirmado' | 'Finalizado';

// ---------------- HELPERS ----------------
function statusEnumToLabel(status?: number): StatusLabel {
  // 0 Criado, 1 Processando, 2 Rejeitado, 3 Confirmado, 4 Finalizado
  switch (status) {
    case 0: return 'Criado';
    case 1: return 'Processando';
    case 2: return 'Rejeitado';
    case 3: return 'Confirmado';
    case 4: return 'Finalizado';
    default: return 'Criado';
  }
}

function formatarDataBR(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

function formatarValorBR(valor?: number | null) {
  if (valor == null) return '-';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function enderecoLinha1(e: Endereco) {
  const extra = e.descricaoLocal ? ` - ${e.descricaoLocal}` : '';
  return `${e.rua}${extra}`;
}

function enderecoLinha2(e: Endereco) {
  return `${e.bairro}, ${e.cidade} - ${e.estado}`;
}

function iniciaisNome(nome?: string) {
  const ini = (nome ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');
  return ini || 'CL';
}

// ---------------- UI: BADGE DE STATUS ----------------
const StatusBadge = ({ status }: { status: StatusLabel }) => {
  const statusConfig: Record<StatusLabel, { style: string; icon: any; spin?: boolean }> = {
    Criado: { style: 'bg-blue-50 text-blue-700 border border-blue-100', icon: Clock },
    Processando: { style: 'bg-yellow-50 text-yellow-700 border border-yellow-100', icon: Loader2, spin: true },
    Confirmado: { style: 'bg-green-50 text-green-700 border border-green-100', icon: CheckCircle },
    Finalizado: { style: 'bg-gray-100 text-gray-600 border border-gray-200', icon: PlayCircle },
    Rejeitado: { style: 'bg-red-50 text-red-700 border border-red-100', icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.style}`}>
      <Icon className={`w-4 h-4 ${config.spin ? 'animate-spin' : ''}`} />
      {status}
    </span>
  );
};

export default function AgendamentosEspeciePage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [items, setItems] = useState<AgendamentoAdminDTO[]>([]);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // loading de ação por linha (confirmar/rejeitar)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // modal de confirmação para rejeitar
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  const totalPages = useMemo(() => {
    if (!total || !pageSize) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const fetchAgendamentos = async (p: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const json = await apiFetch<ApiResponse<PagedResponseDTO<AgendamentoAdminDTO>>>(
        `/api/Admin/ListarAgendamentosEmEspecie?page=${p}&pageSize=${pageSize}`,
        { method: 'GET' }
      );

      const paged = json.dados;

      setItems(paged?.items ?? []);
      setTotal(paged?.total ?? 0);
      setPage(paged?.page ?? p);
    } catch (e: any) {
      console.error(e);
      setItems([]);
      setTotal(0);
      setError(e?.message ?? 'Erro ao carregar agendamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAgendamentos(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ✅ FUNÇÃO ÚNICA: confirma (true) ou rejeita (false) no MESMO endpoint
  const decidirAgendamento = async (idAgendamento: number, aprovar: boolean) => {
    try {
      setActionLoadingId(idAgendamento);
      setError(null);

      await apiFetch<ApiResponse<any>>(
        `/api/Admin/ConfirmarAgendamento/${idAgendamento}?ConfirmarAgendamento=${aprovar}`,
        { method: 'PUT' }
      );

      // fecha modal se era rejeição
      setIsRejectModalOpen(false);
      setRejectTargetId(null);

      alert(aprovar ? 'Agendamento confirmado!' : 'Agendamento rejeitado!');
      fetchAgendamentos(page); // reload da lista sem F5
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Erro ao executar ação.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const abrirModalRejeitar = (id: number) => {
    setRejectTargetId(id);
    setIsRejectModalOpen(true);
  };

  const fecharModalRejeitar = () => {
    if (actionLoadingId) return; // evita fechar no meio
    setIsRejectModalOpen(false);
    setRejectTargetId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-6 md:p-10 min-h-0 overflow-hidden">
          <header className="mb-8 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendamentos em Espécie</h1>
              <p className="text-lg text-gray-500">
                Gerencie locações com pagamento em dinheiro (confirmação manual).
              </p>
            </div>

            <button
              onClick={() => fetchAgendamentos(page)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
            {error && (
              <div className="px-6 py-4 text-red-600 font-medium border-b border-gray-100">
                {error}
              </div>
            )}

            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Endereço de Entrega</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Valor (Espécie)</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Caçamba</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Data Inicial</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Data Final</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Carregando agendamentos...
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-gray-500">
                        Nenhum agendamento em espécie encontrado.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const statusLabel = statusEnumToLabel(item.statusAgendamento);
                      const valor =
                        item.pagamento?.valor ??
                        item.pagamento?.Valor ??
                        null;

                      const podeDecidir = statusLabel === 'Criado' || statusLabel === 'Processando';
                      const rowLoading = actionLoadingId === item.agendamentoId;

                      return (
                        <tr key={item.agendamentoId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <StatusBadge status={statusLabel} />
                          </td>

                          <td className="px-6 py-5">
                            <div className="text-base font-medium text-gray-900">
                              {enderecoLinha1(item.endereco)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enderecoLinha2(item.endereco)}
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-base font-bold text-gray-900">
                              {formatarValorBR(valor)}
                            </div>
                            <div className="text-sm text-gray-500">Pagamento na entrega</div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                            {item.cacamba?.codigo ? (
                              <span className="font-medium text-gray-900">{item.cacamba.codigo}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-base">
                                {iniciaisNome(item.clientName)}
                              </div>
                              <div className="ml-3">
                                <div className="text-base font-medium text-gray-900">{item.clientName}</div>
                                <div className="text-sm text-gray-500">CPF: {item.clientCpf}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                            {formatarDataBR(item.dataInicial)}
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                            {formatarDataBR(item.dataFinal)}
                          </td>

                          {/* AÇÕES */}
                          <td className="px-6 py-5 whitespace-nowrap">
                            {podeDecidir ? (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => decidirAgendamento(item.agendamentoId, true)}
                                  disabled={rowLoading}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition disabled:opacity-60"
                                >
                                  {rowLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Confirmar
                                </button>

                                <button
                                  onClick={() => abrirModalRejeitar(item.agendamentoId)}
                                  disabled={rowLoading}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-60"
                                >
                                  {rowLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  Rejeitar
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span> • Total:{' '}
                <span className="font-semibold text-gray-900">{total}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={isLoading || page <= 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={isLoading || page >= totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL REJEITAR */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Rejeição</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Tem certeza que deseja <span className="text-red-600 font-semibold">rejeitar</span> este agendamento?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => rejectTargetId != null && decidirAgendamento(rejectTargetId, false)}
                  disabled={actionLoadingId != null}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {actionLoadingId != null ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Rejeitando...
                    </>
                  ) : (
                    'Sim, rejeitar'
                  )}
                </button>

                <button
                  onClick={fecharModalRejeitar}
                  disabled={actionLoadingId != null}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-4 rounded-xl transition-colors disabled:opacity-70"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Disk Entulho Gestão</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
