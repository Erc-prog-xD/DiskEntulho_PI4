'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type PagamentoApi = {
  valor: number;
  tipoPagamento: number;   // 0..3
  statusPagamento: number; // 0..3
};

type AgendamentoApi = {
  agendamentoId?: number; // seu dto
  AgendamentoId?: number; // fallback se vier PascalCase

  coord_X?: number | null;
  Coord_X?: number | null;

  coord_Y?: number | null;
  Coord_Y?: number | null;

  statusAgendamento?: string | number | null;
  StatusAgendamento?: string | number | null;

  dataInicial?: string;
  DataInicial?: string;

  dataFinal?: string;
  DataFinal?: string;

  pagamento?: PagamentoApi | null;
  Pagamento?: PagamentoApi | null;

  endereco?: {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    descricaoLocal?: string | null;
    referencia?: string | null;
  };
  Endereco?: any;

  cacamba?: {
    codigo: string;
    tamanho: number; // 0..2
  };
  Cacamba?: any;
};

function getAgendamentoId(a: AgendamentoApi) {
  return a.agendamentoId ?? a.AgendamentoId ?? 0;
}
function getDataInicial(a: AgendamentoApi) {
  return a.dataInicial ?? a.DataInicial ?? "";
}
function getDataFinal(a: AgendamentoApi) {
  return a.dataFinal ?? a.DataFinal ?? "";
}
function getEndereco(a: AgendamentoApi) {
  return a.endereco ?? a.Endereco ?? null;
}
function getCacamba(a: AgendamentoApi) {
  return a.cacamba ?? a.Cacamba ?? null;
}
function getPagamento(a: AgendamentoApi) {
  return a.pagamento ?? a.Pagamento ?? null;
}

function tamanhoEnumParaM3(t: number) {
  if (t === 0) return "3m³";
  if (t === 1) return "5m³";
  if (t === 2) return "7m³";
  return "?";
}

function formatDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("pt-BR");
}

function pagamentoTipoLabel(t?: number | null) {
  if (t === 0) return "Espécie";
  if (t === 1) return "Pix";
  if (t === 2) return "Crédito";
  if (t === 3) return "Débito";
  return "—";
}

function pagamentoStatusLabel(s?: number | null) {
  if (s === 0) return "Criado";
  if (s === 1) return "Processando";
  if (s === 2) return "Rejeitado";
  if (s === 3) return "Aprovado";
  return "Sem pagamento";
}

function pagamentoStatusBadgeClass(s?: number | null) {
  if (s === 3) return "bg-green-50 text-green-700";
  if (s === 2) return "bg-red-50 text-red-700";
  if (s === 1) return "bg-yellow-50 text-yellow-700";
  if (s === 0) return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

export default function AgendamentosPage() {
  const router = useRouter();
  const API_BASE = "http://localhost:8080";

  const [items, setItems] = useState<AgendamentoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getCookie("token");
      if (!token) throw new Error("Você não está autenticado. Faça login novamente.");

      const res = await fetch(`${API_BASE}/api/Agendamento/AgendamentosFeitosUsuarioLogado`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.mensagem || body?.message || `Erro HTTP ${res.status}`);
      }

      const json: ApiResponse<AgendamentoApi[]> = await res.json();
      if (!json.status) throw new Error(json.mensagem || "Falha ao buscar agendamentos.");

      setItems(json.dados ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Erro ao carregar agendamentos.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Meus agendamentos</h1>
              <p className="text-gray-600">Acompanhe seus agendamentos e faça o pagamento.</p>
            </div>

            <button
              onClick={() => router.push("/agendamentos/novo")}
              className="h-12 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Novo agendamento
            </button>
          </div>

          {loading && <p className="text-gray-600">Carregando...</p>}
          {!loading && error && <p className="text-red-600 font-medium">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <Image src="/assets/empty-box.png" alt="Nenhum agendamento" width={220} height={220} />
              <h2 className="text-xl font-semibold text-gray-900 mt-6">
                Você ainda não possui agendamentos.
              </h2>
              <p className="text-gray-600 mt-2 mb-6">
                Clique em “Novo agendamento” para começar.
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {items.map((a, idx) => {
                const agId = getAgendamentoId(a);
                const endereco = getEndereco(a);
                const cacamba = getCacamba(a);
                const pagamento = getPagamento(a);

                const statusPagamento = pagamento?.statusPagamento ?? null;
                const podePagar = statusPagamento !== 3; // != Aprovado

                return (
                  <div key={agId || idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Caçamba {cacamba?.codigo ?? "—"} • {tamanhoEnumParaM3(cacamba?.tamanho ?? -1)}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {formatDate(getDataInicial(a))} até {formatDate(getDataFinal(a))}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Agendamento #{agId}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pagamentoStatusBadgeClass(statusPagamento)}`}>
                        {pagamentoStatusLabel(statusPagamento)}
                        {pagamento ? ` • ${pagamentoTipoLabel(pagamento.tipoPagamento)}` : ""}
                      </span>
                    </div>

                    <div className="mt-4 text-gray-700">
                      <p>
                        <strong>Endereço:</strong>{" "}
                        {endereco?.rua}, {endereco?.bairro} — {endereco?.cidade}/{endereco?.estado}
                      </p>
                      {endereco?.referencia ? (
                        <p className="mt-1"><strong>Referência:</strong> {endereco.referencia}</p>
                      ) : null}
                      {endereco?.descricaoLocal ? (
                        <p className="mt-1"><strong>Descrição:</strong> {endereco.descricaoLocal}</p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
                      {pagamento ? (
                        <div className="text-gray-700 text-sm">
                          <strong>Valor:</strong> R$ {Number(pagamento.valor ?? 0).toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-gray-700 text-sm">
                          <strong>Pagamento:</strong> ainda não escolhido
                        </div>
                      )}

                      {podePagar && agId > 0 && (
                        <button
                          onClick={() => router.push(`/agendamentos/pagamento?id=${encodeURIComponent(String(agId))}`)}
                          className="h-10 px-5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
