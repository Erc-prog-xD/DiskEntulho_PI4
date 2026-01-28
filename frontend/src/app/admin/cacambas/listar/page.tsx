'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Loader2, PackageSearch } from "lucide-react";
import { apiFetch } from "@/src/lib/api";

/* =========================
   Tipos
========================= */

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type CacambaApi = {
  id: number;
  codigo: string;
  tamanho: number;       // enum: 0/1/2
  statusCacamba: number; // enum: 0/1
};

type PrecoApi = {
  id: number;
  valor: number;
  tamanho: number; // enum
};

/* =========================
   Helpers
========================= */

function tamanhoEnumParaM3(tamanhoEnum: number): string {
  if (tamanhoEnum === 0) return '3';
  if (tamanhoEnum === 1) return '5';
  if (tamanhoEnum === 2) return '7';
  return '?';
}

function statusParaTexto(status: number): { label: string; className: string } {
  if (status === 1) {
    return { label: 'Disponível', className: 'text-green-600' };
  }
  return { label: 'Indisponível', className: 'text-red-500' };
}

function formatarPreco(valor?: number) {
  if (valor == null) return '—';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/* =========================
   Página
========================= */

export default function ListarCacambasPage() {
  const [cacambas, setCacambas] = useState<CacambaApi[]>([]);
  const [precos, setPrecos] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Load Caçambas
  ========================= */

  const loadCacambas = async () => {
    try {
      const json = await apiFetch<ApiResponse<CacambaApi[]>>(
        '/api/Cacamba/ListarTodasCacambas',
        { method: 'GET' }
      );

      setCacambas(json.dados ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Erro ao carregar caçambas.');
      setCacambas([]);
    }
  };

  /* =========================
     Load Preços
  ========================= */

  const loadPrecos = async () => {
    try {
      const json = await apiFetch<ApiResponse<PrecoApi[]>>(
        '/api/Preco/Listar',
        { method: 'GET' }
      );

      const mapa: Record<number, number> = {};
      (json.dados ?? []).forEach(p => {
        mapa[p.tamanho] = p.valor;
      });

      setPrecos(mapa);
    } catch (e) {
      console.error('Erro ao carregar preços', e);
      setPrecos({});
    }
  };

  /* =========================
     Init
  ========================= */

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([loadCacambas(), loadPrecos()])
      .finally(() => setIsLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Render
  ========================= */

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-10 min-h-0 overflow-y-auto">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Lista de Caçambas
              </h1>
              <p className="text-lg text-gray-500">
                Visualize todas as caçambas cadastradas no sistema.
              </p>
            </div>

            <button
              onClick={() => {
                setIsLoading(true);
                Promise.all([loadCacambas(), loadPrecos()])
                  .finally(() => setIsLoading(false));
              }}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-3 rounded-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Recarregar'}
            </button>
          </header>

          {isLoading && (
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando caçambas...
            </div>
          )}

          {!isLoading && error && (
            <div className="text-red-600 font-medium">{error}</div>
          )}

          {!isLoading && !error && cacambas.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <PackageSearch className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">
                Nenhuma caçamba encontrada.
              </p>
            </div>
          )}

          {!isLoading && !error && cacambas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cacambas.map((c) => {
                const tam = tamanhoEnumParaM3(c.tamanho);
                const st = statusParaTexto(c.statusCacamba);
                const preco = precos[c.tamanho];

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      <Image
                        src="/assets/cacamba.png"
                        alt={`Caçamba ${c.codigo}`}
                        width={300}
                        height={200}
                        className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
                        {tam}m³
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            Caçamba {c.codigo || `#${c.id}`}
                          </h3>
                          <p className={`text-sm font-medium ${st.className}`}>
                            {st.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {c.id}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            Diária
                          </p>
                          <p className="font-bold text-blue-600">
                            {formatarPreco(preco)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(String(c.id))
                        }
                        className="mt-auto w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-lg font-bold transition-all duration-200"
                      >
                        Copiar ID
                      </button>
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
