'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { getCookie } from 'cookies-next';
import { AdminDashboardSidebar } from '@/src/components/admin-dashboard-sidebar';
import { DashboardHeader } from '@/src/components/dashboard-header';
import {
  Loader2,
  Search,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const API_BASE = 'http://localhost:8080';

// Enums (mantidos)
const AGENDAMENTO_STATUS = [
  { label: 'Criado', value: 0 },
  { label: 'Processando', value: 1 },
  { label: 'Rejeitado', value: 2 },
  { label: 'Confirmado', value: 3 },
  { label: 'Finalizado', value: 4 },
];

const PAGAMENTO_TIPO = [
  { label: 'Espécie', value: 0 },
  { label: 'Pix', value: 1 },
  { label: 'Crédito', value: 2 },
  { label: 'Débito', value: 3 },
];

const PAGAMENTO_STATUS = [
  { label: 'Criado', value: 0 },
  { label: 'Processando', value: 1 },
  { label: 'Rejeitado', value: 2 },
  { label: 'Aprovado', value: 3 },
];

type PagamentoTypeEnum = 0 | 1 | 2 | 3;
type PagamentoStatusEnum = 0 | 1 | 2 | 3;
type AgendamentoStatusEnum = 0 | 1 | 2 | 3 | 4;

type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T | null;
};

type Endereco = {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
};

type CacambaDTO = {
  codigo: string;
  tamanho: number | string;
};

type Pagamento = {
  id?: number;
  valor?: number;
  tipoPagamento?: PagamentoTypeEnum;
  statusPagamento?: PagamentoStatusEnum;
};

type AgendamentoAdminItem = {
  agendamentoId: number;
  endereco: Endereco;
  cacamba: CacambaDTO;
  clientId: number;
  clientCpf: string;
  clientName: string;
  pagamento: Pagamento | null;
  statusAgendamento: AgendamentoStatusEnum | null;
  dataInicial: string;
  dataFinal: string;
};

type Filters = {
  // Essenciais
  apenasAtivos: boolean;
  statusAgendamento: '' | AgendamentoStatusEnum;
  tipoPagamento: '' | PagamentoTypeEnum;

  // Busca rápida (front)
  q: string;

  // Datas simplificadas (só 2)
  dataInicial: string; // yyyy-mm-dd (vira DataInicialFrom)
  dataFinal: string; // yyyy-mm-dd (vira DataFinalTo)

  // Extras úteis (colapsável)
  hasPagamento: '' | 'true' | 'false';
  statusPagamento: '' | PagamentoStatusEnum;

  // Paginação/ordem
  page: number;
  pageSize: number; // backend geralmente limita, mas aqui fica no máximo 100
  sortBy: 'CreationDate' | 'DataInicial' | 'DataFinal';
  sortDesc: boolean;
};

function toQueryString(filters: Filters) {
  const qs = new URLSearchParams();

  qs.set('ApenasAtivos', String(filters.apenasAtivos));
  qs.set('Page', String(filters.page));
  qs.set('PageSize', String(filters.pageSize));
  qs.set('SortBy', filters.sortBy);
  qs.set('SortDesc', String(filters.sortDesc));

  if (filters.statusAgendamento !== '') qs.set('StatusAgendamento', String(filters.statusAgendamento));
  if (filters.tipoPagamento !== '') qs.set('TipoPagamento', String(filters.tipoPagamento));
  if (filters.statusPagamento !== '') qs.set('StatusPagamento', String(filters.statusPagamento));
  if (filters.hasPagamento !== '') qs.set('HasPagamento', filters.hasPagamento);

  // ✅ Só 2 datas no UI, mas mapeando pros parâmetros do backend
  if (filters.dataInicial) qs.set('DataInicialFrom', filters.dataInicial);
  if (filters.dataFinal) qs.set('DataFinalTo', filters.dataFinal);

  return qs.toString();
}

function formatDateBR(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

function statusLabel(v: AgendamentoStatusEnum | null) {
  if (v === null || v === undefined) return '-';
  return AGENDAMENTO_STATUS.find(s => s.value === v)?.label ?? String(v);
}

function tipoPagamentoLabel(v?: PagamentoTypeEnum) {
  if (v === null || v === undefined) return '-';
  return PAGAMENTO_TIPO.find(s => s.value === v)?.label ?? String(v);
}

function statusPagamentoLabel(v?: PagamentoStatusEnum) {
  if (v === null || v === undefined) return '-';
  return PAGAMENTO_STATUS.find(s => s.value === v)?.label ?? String(v);
}

// 🔎 Busca rápida no FRONT (não ocupa query do backend)
function matchesQuickSearch(item: AgendamentoAdminItem, qRaw: string) {
  const q = qRaw.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    String(item.agendamentoId ?? ''),
    String(item.clientId ?? ''),
    String(item.clientCpf ?? ''),
    String(item.clientName ?? ''),
    String(item.cacamba?.codigo ?? ''),
    String(item.cacamba?.tamanho ?? ''),
    String(item.endereco?.rua ?? ''),
    String(item.endereco?.bairro ?? ''),
    String(item.endereco?.cidade ?? ''),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

export default function AgendamentosAdminPage() {
  const [filters, setFilters] = useState<Filters>({
    apenasAtivos: true,
    statusAgendamento: '',
    tipoPagamento: '',

    q: '',

    // ✅ apenas 2 datas
    dataInicial: '',
    dataFinal: '',

    // avançados
    hasPagamento: '',
    statusPagamento: '',

    page: 1,
    pageSize: 100,
    sortBy: 'CreationDate',
    sortDesc: true,
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [data, setData] = useState<PagedResponse<AgendamentoAdminItem> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryString = useMemo(() => toQueryString(filters), [
    filters.apenasAtivos,
    filters.statusAgendamento,
    filters.tipoPagamento,
    filters.dataInicial,
    filters.dataFinal,
    filters.hasPagamento,
    filters.statusPagamento,
    filters.page,
    filters.pageSize,
    filters.sortBy,
    filters.sortDesc,
  ]);

  const fetchAgendamentos = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const token = getCookie('token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const res = await fetch(`${API_BASE}/api/Admin/ListarTodosAgendamentos?${queryString}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.mensagem || body?.message || `Erro HTTP ${res.status}`);
      }

      const json: ApiResponse<PagedResponse<AgendamentoAdminItem>> = await res.json();
      if (!json.status || !json.dados) {
        throw new Error(json.mensagem || 'Falha ao listar agendamentos.');
      }

      setData({
        items: (json.dados as any).items ?? (json.dados as any).Items ?? [],
        page: (json.dados as any).page ?? (json.dados as any).Page ?? filters.page,
        pageSize: (json.dados as any).pageSize ?? (json.dados as any).PageSize ?? filters.pageSize,
        total: (json.dados as any).total ?? (json.dados as any).Total ?? 0,
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Erro ao buscar agendamentos.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters(prev => ({ ...prev, [name]: checked, page: 1 }));
      return;
    }

    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      apenasAtivos: true,
      statusAgendamento: '',
      tipoPagamento: '',
      q: '',
      dataInicial: '',
      dataFinal: '',
      hasPagamento: '',
      statusPagamento: '',
      page: 1,
      pageSize: 100,
      sortBy: 'CreationDate',
      sortDesc: true,
    });
    setIsAdvancedOpen(false);
  };

  const total = data?.total ?? 0;
  const page = data?.page ?? filters.page;
  const pageSize = data?.pageSize ?? filters.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Busca rápida no front
  const tableItems = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter(i => matchesQuickSearch(i, filters.q));
  }, [data?.items, filters.q]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-6 md:p-10 min-h-0 overflow-hidden">
          <header className="mb-4 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Todos os Agendamentos</h1>
              <p className="text-lg text-gray-500">Filtros compactos + avançados recolhíveis e só 2 datas.</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={fetchAgendamentos}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
              >
                <RefreshCw className="w-5 h-5" />
                Atualizar
              </button>

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 font-bold hover:bg-red-100"
              >
                <XCircle className="w-5 h-5" />
                Limpar
              </button>
            </div>
          </header>

          {/* ✅ FILTROS COMPACTOS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 md:col-span-1">
                <input
                  type="checkbox"
                  name="apenasAtivos"
                  checked={filters.apenasAtivos}
                  onChange={onInput}
                  className="h-4 w-4"
                />
                Apenas ativos
              </label>

              <div className="space-y-1 md:col-span-2 xl:col-span-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Busca rápida</span>
                <input
                  name="q"
                  value={filters.q}
                  onChange={onInput}
                  placeholder="ID, nome, CPF, clientId, código caçamba..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Status</span>
                <select
                  name="statusAgendamento"
                  value={filters.statusAgendamento}
                  onChange={onInput}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="">Todos</option>
                  {AGENDAMENTO_STATUS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Tipo Pagamento</span>
                <select
                  name="tipoPagamento"
                  value={filters.tipoPagamento}
                  onChange={onInput}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="">Todos</option>
                  {PAGAMENTO_TIPO.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAdvancedOpen(v => !v)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Avançado
                {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* ✅ AVANÇADOS (só o que vale a pena) */}
            {isAdvancedOpen && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Tem Pagamento?</span>
                  <select
                    name="hasPagamento"
                    value={filters.hasPagamento}
                    onChange={onInput}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="">Tanto faz</option>
                    <option value="true">Somente com pagamento</option>
                    <option value="false">Somente sem pagamento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Status Pagamento</span>
                  <select
                    name="statusPagamento"
                    value={filters.statusPagamento}
                    onChange={onInput}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="">Todos</option>
                    {PAGAMENTO_STATUS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ SÓ 2 DATAS */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Data Inicial (a partir de)</span>
                  <input
                    type="date"
                    name="dataInicial"
                    value={filters.dataInicial}
                    onChange={onInput}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Data Final (até)</span>
                  <input
                    type="date"
                    name="dataFinal"
                    value={filters.dataFinal}
                    onChange={onInput}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Ordenação</span>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={onInput}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="CreationDate">Criação</option>
                      <option value="DataInicial">Data Inicial</option>
                      <option value="DataFinal">Data Final</option>
                    </select>

                    <select
                      name="sortDesc"
                      value={String(filters.sortDesc)}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, sortDesc: e.target.value === 'true', page: 1 }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="true">Desc</option>
                      <option value="false">Asc</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">PageSize</span>
                  <select
                    name="pageSize"
                    value={String(filters.pageSize)}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    {[20, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                    <Search className="w-5 h-5" />
                    Aplicando
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ TABELA COM MAIS TELA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[74vh]">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Carregando agendamentos...
              </div>
            ) : errorMsg ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 p-8 text-center">
                <XCircle className="w-10 h-10 text-red-500" />
                <p className="font-bold text-gray-800">Falha ao carregar</p>
                <p className="text-sm">{errorMsg}</p>
              </div>
            ) : (
              <>
                <div className="overflow-auto custom-scrollbar flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Caçamba</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Datas</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Pagamento</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                      {tableItems.map((item) => (
                        <tr key={item.agendamentoId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-base text-gray-700 font-bold">
                            #{item.agendamentoId}
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-base text-gray-700">
                            {statusLabel(item.statusAgendamento)}
                          </td>

                          <td className="px-6 py-3">
                            <div className="text-base font-medium text-gray-900">{item.clientName}</div>
                            <div className="text-sm text-gray-500">ID: {item.clientId} • CPF: {item.clientCpf}</div>
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-base text-gray-700">
                            {item.cacamba?.codigo} • {item.cacamba?.tamanho}m³
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-base text-gray-700">
                            <div className="text-sm text-gray-500">Início</div>
                            <div className="font-medium">{formatDateBR(item.dataInicial)}</div>
                            <div className="text-sm text-gray-500 mt-2">Fim</div>
                            <div className="font-medium">{formatDateBR(item.dataFinal)}</div>
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-base text-gray-700">
                            {item.pagamento ? (
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500">Tipo</div>
                                <div className="font-medium">{tipoPagamentoLabel(item.pagamento.tipoPagamento)}</div>
                                <div className="text-sm text-gray-500">Status</div>
                                <div className="font-medium">{statusPagamentoLabel(item.pagamento.statusPagamento)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sem pagamento</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {tableItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                            Nenhum agendamento encontrado com os filtros atuais.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-700">{total}</span> • Página{' '}
                    <span className="font-bold text-gray-700">{page}</span> de{' '}
                    <span className="font-bold text-gray-700">{totalPages}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
