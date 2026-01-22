'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";
import { apiFetch } from "@/src/lib/api";

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T | null;
};

type PagamentoTypeEnum = 0 | 1 | 2 | 3;

const PAGAMENTO_TIPO: { label: string; value: PagamentoTypeEnum }[] = [
  { label: "Espécie", value: 0 },
  { label: "Pix", value: 1 },
  { label: "Crédito", value: 2 },
  { label: "Débito", value: 3 },
];

type CalculoValorDTO = {
  agendamentoId: number;
  dias: number;
  valorDiaria: number;
  valorTotal: number;
  tamanho: number;
};

type PagamentoDTO = {
  id?: number;
  Id?: number;

  valor?: number;
  Valor?: number;

  tipoPagamento?: number;
  TipoPagamento?: number;

  statusPagamento?: number;
  StatusPagamento?: number;

  pagBankQrCode?: string | null;
  PagBankQrCode?: string | null;

  pagBankOrderId?: string | null;
  PagBankOrderId?: string | null;
};

function getTipoPagamento(p: PagamentoDTO | null) {
  if (!p) return null;
  return p.tipoPagamento ?? p.TipoPagamento ?? null;
}
function getStatusPagamento(p: PagamentoDTO | null) {
  if (!p) return null;
  return p.statusPagamento ?? p.StatusPagamento ?? null;
}
function getQrPix(p: PagamentoDTO | null) {
  if (!p) return null;
  return p.pagBankQrCode ?? p.PagBankQrCode ?? null;
}
function getValor(p: PagamentoDTO | null) {
  if (!p) return null;
  const v = p.valor ?? p.Valor;
  return typeof v === "number" ? v : null;
}

export default function PagamentoAgendamentoClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const idAgendamentoRaw = sp.get("id") ?? "";
  const idAgendamento = Number(idAgendamentoRaw);

  const pagamentoIdRaw = sp.get("pagamentoId") ?? "";
  const pagamentoId = Number(pagamentoIdRaw);

  const [tipo, setTipo] = useState<PagamentoTypeEnum>(1);

  const [loading, setLoading] = useState(false);
  const [loadingTopo, setLoadingTopo] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  const [qr, setQr] = useState<string | null>(null);
  const [pixGerado, setPixGerado] = useState(false);
  const [EspecieConfirmado, setEspecieConfirmado] = useState(false);

  const [calculo, setCalculo] = useState<CalculoValorDTO | null>(null);

  // se carregou pagamento por id, guarda aqui
  const [pagamentoExistente, setPagamentoExistente] = useState<PagamentoDTO | null>(null);

  const voltar = () => router.push("/usuario/agendamentos");

  useEffect(() => {
    const run = async () => {
      setMsg(null);
      setQr(null);
      setPixGerado(false);
      setCalculo(null);
      setPagamentoExistente(null);

      setLoadingTopo(true);
      try {
        // 1) Se veio pagamentoId -> busca pagamento diretamente
        if (pagamentoIdRaw && !Number.isNaN(pagamentoId) && pagamentoId > 0) {
          const json = await apiFetch<ApiResponse<PagamentoDTO>>(
            `/api/Pagamento/PagamentoPorId/${pagamentoId}`,
            { method: "GET" }
          );

          if (!json.status || !json.dados) {
            throw new Error(json.mensagem || "Pagamento não encontrado.");
          }

          setPagamentoExistente(json.dados);

          const tipoPag = getTipoPagamento(json.dados);
          const statusPag = getStatusPagamento(json.dados);
          const qrExistente = getQrPix(json.dados);

          // Se for PIX e não estiver aprovado, mostra QR e remove confirmar
          if (tipoPag === 1 && statusPag !== 3 && qrExistente) {
            setTipo(1);
            setQr(qrExistente);
            setPixGerado(true);
            setMsg("PIX pendente encontrado. Use o QR abaixo para pagar.");
            return;
          }

          // Se não for pix pendente, só informa
          const v = getValor(json.dados);
          if (v !== null) setMsg(`Pagamento encontrado. Valor: R$ ${v.toFixed(2)}`);
          else setMsg("Pagamento encontrado.");
          return;
        }

        // 2) Se não veio pagamentoId, usa o id do agendamento para calcular (fluxo normal)
        if (!idAgendamentoRaw || Number.isNaN(idAgendamento) || idAgendamento <= 0) {
          setMsg("Agendamento inválido. Volte para a listagem.");
          return;
        }

        const jsonCalc = await apiFetch<ApiResponse<CalculoValorDTO>>(
          `/api/Pagamento/CalcularValorAgendamento/${idAgendamento}`,
          { method: "GET" }
        );

        if (!jsonCalc.status || !jsonCalc.dados) {
          throw new Error(jsonCalc.mensagem || "Falha ao calcular valor.");
        }

        setCalculo(jsonCalc.dados);
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "Erro ao carregar dados do pagamento.");
      } finally {
        setLoadingTopo(false);
      }
    };

    run();
  }, [pagamentoIdRaw, pagamentoId, idAgendamentoRaw, idAgendamento]);

  // POST - criar pagamento (só quando NÃO existe pagamentoId e NÃO tem pix pendente)
  const confirmar = async () => {
    setMsg(null);
    setQr(null);

    if (!idAgendamentoRaw || Number.isNaN(idAgendamento) || idAgendamento <= 0) {
      setMsg("Agendamento inválido. Volte para a listagem.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        idAgendamento,
        TipoPagamento: tipo,
      };

      const json = await apiFetch<ApiResponse<any>>(
        "/api/Pagamento/AddPagamento",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      if (!json.status) throw new Error(json.mensagem || "Falha ao adicionar pagamento.");

      const pixQr =
        json.dados?.pagamento?.pagBankQrCode ??
        json.dados?.Pagamento?.PagBankQrCode ??
        json.dados?.pagamento?.PagBankQrCode ??
        json.dados?.pagBankQrCode ??
        json.dados?.PagBankQrCode ??
        null;

      if (tipo === 0) {
        setEspecieConfirmado(true);
        setMsg("Pagamento em espécie confirmado! Aguarde o Admin aprovar.");
        return;
      }
      if (tipo === 1 && pixQr) {
        setQr(pixQr);
        setPixGerado(true);
        setMsg("PIX gerado! Use o QR Code abaixo para pagar.");
        return;
      }
      setMsg("Pagamento criado com sucesso! Aguarde o Admin aprovar.");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Erro ao adicionar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900">Pagamento</h1>

            <p className="text-gray-600 mt-2">
              {pagamentoIdRaw
                ? <>Pagamento: <strong>#{pagamentoIdRaw}</strong></>
                : <>Agendamento: <strong>#{idAgendamentoRaw || "—"}</strong></>
              }
            </p>

            {/* Valor antes (só no fluxo de agendamento, e só se não tiver pix pendente) */}
            {!pixGerado && !pagamentoIdRaw && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                {loadingTopo ? (
                  <p className="text-gray-700">Carregando...</p>
                ) : calculo ? (
                  <div className="text-gray-800 space-y-1">
                    <p>
                      <strong>Valor total:</strong> R$ {Number(calculo.valorTotal).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Diária: R$ {Number(calculo.valorDiaria).toFixed(2)} • Dias: {calculo.dias}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700">Não foi possível carregar o valor.</p>
                )}
              </div>
            )}

            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forma de pagamento
              </label>

              <select
                value={tipo}
                disabled={pixGerado || Boolean(pagamentoIdRaw)} // se veio pagamentoId, não faz sentido trocar
                onChange={(e) => setTipo(Number(e.target.value) as PagamentoTypeEnum)}
                className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white disabled:opacity-60"
              >
                {PAGAMENTO_TIPO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {msg && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700">
                {msg}
              </div>
            )}

            {qr && (
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="font-bold text-blue-900">PIX</div>
                <div className="text-blue-800 mt-2 break-all">
                  Link do QR Code:{" "}
                  <a className="underline" href={qr} target="_blank" rel="noreferrer">
                    abrir
                  </a>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button
                onClick={voltar}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                Voltar
              </button>

              {/* Confirmar só existe quando NÃO veio pagamentoId e NÃO tem pix gerado */}
              {!pagamentoIdRaw && !(tipo === 1 && pixGerado) && !(tipo === 0 && EspecieConfirmado) && (
                <button
                  onClick={confirmar}
                  disabled={loading || loadingTopo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {loading ? "Processando..." : "Confirmar pagamento"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
