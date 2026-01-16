'use client';

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

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

type Pagamento = {
  id?: number;
  valor?: number;
  tipoPagamento?: PagamentoTypeEnum;
  statusPagamento?: number; // 0..3
  pagBankQrCode?: string | null;
  pagBankOrderId?: string | null;
};

type Agendamento = {
  id?: number;
  pagamento?: Pagamento | null;
};

export default function PagamentoAgendamentoPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const API_BASE = useMemo(() => "http://localhost:8080", []);

  const idRaw = sp.get("id") ?? "";
  const idAgendamento = Number(idRaw);

  const [tipo, setTipo] = useState<PagamentoTypeEnum>(1); // default Pix
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const pagarDepois = () => router.push("/agendamentos");

  const confirmar = async () => {
    setMsg(null);
    setQr(null);

    if (!idRaw || Number.isNaN(idAgendamento) || idAgendamento <= 0) {
      setMsg("Agendamento inválido. Volte para a listagem.");
      return;
    }

    setLoading(true);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Token não encontrado. Faça login novamente.");

      // OBS: o backend espera idAgendamento e TipoPagamento (ver AddPagementoDTO)
      const body = {
        idAgendamento,
        TipoPagamento: tipo,
      };

      const res = await fetch(`${API_BASE}/api/Pagamento/AddPagamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.mensagem || b?.message || `Erro HTTP ${res.status}`);
      }

      const json: ApiResponse<Agendamento> = await res.json();
      if (!json.status) throw new Error(json.mensagem || "Falha ao adicionar pagamento.");

      setMsg("Pagamento criado! Aguarde a confirmação.");

      // Se for PIX, o backend coloca PagBankQrCode quando cria a cobrança
      const pixQr =
        (json.dados as any)?.pagamento?.pagBankQrCode ??
        (json.dados as any)?.Pagamento?.PagBankQrCode ??
        null;

      if (pixQr) setQr(pixQr);
    } catch (e: any) {
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
              Agendamento: <strong>#{idRaw || "—"}</strong>
            </p>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forma de pagamento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(Number(e.target.value) as PagamentoTypeEnum)}
                className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white"
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
                <div className="font-bold text-blue-900">PIX gerado</div>
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
                onClick={pagarDepois}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                Pagar depois
              </button>

              <button
                onClick={confirmar}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                {loading ? "Processando..." : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
