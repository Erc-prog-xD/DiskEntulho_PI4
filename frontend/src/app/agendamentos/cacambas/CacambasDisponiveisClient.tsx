'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type CacambaApi = {
  id: number;
  codigo: string;
  tamanho: number; // 0/1/2
};

function tamanhoEnumParaM3(t: number) {
  if (t === 0) return "3m³";
  if (t === 1) return "5m³";
  if (t === 2) return "7m³";
  return "?";
}

export default function CacambasDisponiveisClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const API_BASE = useMemo(() => "http://localhost:8080", []);

  const inicio = sp.get("inicio") ?? "";
  const fim = sp.get("fim") ?? "";

  const [items, setItems] = useState<CacambaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      // Se abriu sem query, volta pra escolher datas
      if (!inicio || !fim) {
        router.push("/agendamentos/novo");
        return;
      }

      // token (remove Bearer se tiver)
      const raw = getCookie("token");
      const token = String(raw ?? "").replace(/^Bearer\s+/i, "").trim();
      if (!token) throw new Error("Você não está autenticado. Faça login novamente.");

      const url = `${API_BASE}/api/Cacamba/CacambasDisponiveis?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.mensagem || body?.message || `Erro HTTP ${res.status}`);
      }

      const json: ApiResponse<CacambaApi[]> = await res.json();
      if (!json.status) throw new Error(json.mensagem || "Falha ao buscar caçambas.");

      setItems(json.dados ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Erro ao carregar caçambas.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicio, fim]);

  const escolher = (cacambaId: number) => {
    router.push(
      `/agendamentos/novo/dados?cacambaId=${encodeURIComponent(String(cacambaId))}&inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Caçambas disponíveis</h1>
              <p className="text-gray-600">
                Intervalo: <strong>{inicio}</strong> até <strong>{fim}</strong>
              </p>
            </div>

            <button
              onClick={() => router.push("/agendamentos/novo")}
              className="h-12 px-6 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Trocar datas
            </button>
          </div>

          {loading && <p className="text-gray-600">Carregando...</p>}
          {!loading && error && <p className="text-red-600 font-medium">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 text-gray-600">
              Nenhuma caçamba disponível nesse intervalo.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="text-sm text-gray-500">ID #{c.id}</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    Caçamba {c.codigo || `#${c.id}`}
                  </div>
                  <div className="text-gray-600 mt-2">Tamanho: {tamanhoEnumParaM3(c.tamanho)}</div>

                  <button
                    onClick={() => escolher(c.id)}
                    className="w-full mt-6 h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Escolher esta caçamba
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
