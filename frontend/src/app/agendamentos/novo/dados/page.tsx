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

type EnderecoPayload = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  descricaoLocal?: string | null;
  referencia?: string | null;
};

type AgendamentoCreatePayload = {
  coord_X?: number | null;
  coord_Y?: number | null;
  endereco: EnderecoPayload;
  cacambaId: number;
  dataInicial: string; // ISO
  dataFinal: string;   // ISO
};

export default function NovoAgendamentoDadosPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const API_BASE = useMemo(() => "http://localhost:8080", []);

  const cacambaIdRaw = sp.get("cacambaId") ?? "";
  const inicio = sp.get("inicio") ?? "";
  const fim = sp.get("fim") ?? "";

  const cacambaId = Number(cacambaIdRaw);

  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    rua: "",
    bairro: "",
    cidade: "",
    estado: "",
    descricaoLocal: "",
    referencia: "",
    coord_X: "",
    coord_Y: "",
  });

  const voltarParaCacambas = () => {
    if (inicio && fim) {
      router.push(`/agendamentos/cacambas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
      return;
    }
    router.push("/agendamentos/novo");
  };

  const submit = async () => {
    if (!cacambaIdRaw || Number.isNaN(cacambaId) || cacambaId <= 0) {
      alert("Caçamba inválida. Volte e selecione uma caçamba.");
      voltarParaCacambas();
      return;
    }
    if (!inicio || !fim) {
      alert("Datas não informadas. Volte e selecione as datas.");
      router.push("/agendamentos/novo");
      return;
    }

    if (!form.rua.trim() || !form.bairro.trim() || !form.cidade.trim() || !form.estado.trim()) {
      alert("Preencha rua, bairro, cidade e estado.");
      return;
    }

    setIsLoading(true);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Você não está autenticado. Faça login novamente.");

      const payload: AgendamentoCreatePayload = {
        cacambaId,
        dataInicial: new Date(inicio).toISOString(),
        dataFinal: new Date(fim).toISOString(),
        coord_X: form.coord_X ? Number(form.coord_X) : null,
        coord_Y: form.coord_Y ? Number(form.coord_Y) : null,
        endereco: {
          rua: form.rua.trim(),
          bairro: form.bairro.trim(),
          cidade: form.cidade.trim(),
          estado: form.estado.trim(),
          descricaoLocal: form.descricaoLocal.trim() ? form.descricaoLocal.trim() : null,
          referencia: form.referencia.trim() ? form.referencia.trim() : null,
        },
      };

      const res = await fetch(`${API_BASE}/api/Agendamento/CadastrarAgendamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.mensagem || body?.message || `Erro HTTP ${res.status}`);
      }

      const json: ApiResponse<any> = await res.json();
      if (!json.status) throw new Error(json.mensagem || "Falha ao criar agendamento.");

      alert("Agendamento criado com sucesso!");

        const agId =
        (json.dados as any)?.id ??
        (json.dados as any)?.Id;

        if (agId) {
        router.push(`/agendamentos/pagamento?id=${encodeURIComponent(String(agId))}`);
        } else {
        // fallback caso não venha o Id
        router.push("/agendamentos");
        };
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Erro ao criar agendamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900">Finalizar agendamento</h1>
            <p className="text-gray-600 mt-2">
              Caçamba: <strong>#{cacambaIdRaw || "—"}</strong> • {inicio || "—"} até {fim || "—"}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Rua</label>
                <input
                  value={form.rua}
                  onChange={(e) => setForm((p) => ({ ...p, rua: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Bairro</label>
                <input
                  value={form.bairro}
                  onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Cidade</label>
                <input
                  value={form.cidade}
                  onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Estado</label>
                <input
                  value={form.estado}
                  onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Referência (opcional)</label>
                <input
                  value={form.referencia}
                  onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Descrição do local (opcional)</label>
                <input
                  value={form.descricaoLocal}
                  onChange={(e) => setForm((p) => ({ ...p, descricaoLocal: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Coord_X (opcional)</label>
                <input
                  value={form.coord_X}
                  onChange={(e) => setForm((p) => ({ ...p, coord_X: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  placeholder="ex: -3.73"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Coord_Y (opcional)</label>
                <input
                  value={form.coord_Y}
                  onChange={(e) => setForm((p) => ({ ...p, coord_Y: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  placeholder="ex: -38.52"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={voltarParaCacambas}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                Voltar
              </button>

              <button
                onClick={submit}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                {isLoading ? "Enviando..." : "Confirmar agendamento"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
