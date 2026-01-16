'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Loader2, PackageSearch } from "lucide-react";

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

function tamanhoEnumParaM3(tamanhoEnum: number): string {
  // 0=Pequeno, 1=Medio, 2=Grande
  if (tamanhoEnum === 0) return '3';
  if (tamanhoEnum === 1) return '5';
  if (tamanhoEnum === 2) return '7';
  return '?';
}

function statusParaTexto(status: number): { label: string; className: string } {
  // 0=Indisponivel, 1=Disponivel
  if (status === 1) return { label: 'Disponível', className: 'text-green-600' };
  return { label: 'Indisponível', className: 'text-red-500' };
}

export default function ListarCacambasPage() {
  const API_BASE = 'http://localhost:8080';

  const [cacambas, setCacambas] = useState<CacambaApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCacambas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie('token');
      if (!token) {
        setError('Você não está autenticado. Faça login novamente.');
        setCacambas([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/Cacamba/ListarTodasCacambas`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        let msg = `Erro ao listar caçambas (HTTP ${res.status})`;
        const body = await res.json().catch(() => null);
        if (body?.mensagem) msg = body.mensagem;
        if (body?.message) msg = body.message;
        throw new Error(msg);
      }

      const json: ApiResponse<CacambaApi[]> = await res.json();
      setCacambas(json.dados ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Erro ao carregar lista.');
      setCacambas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCacambas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de Caçambas</h1>
              <p className="text-lg text-gray-500">
                Visualize todas as caçambas cadastradas no sistema.
              </p>
            </div>

            <button
              onClick={loadCacambas}
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
              <p className="text-xl font-medium">Nenhuma caçamba encontrada.</p>
            </div>
          )}

          {!isLoading && !error && cacambas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cacambas.map((c) => {
                const tam = tamanhoEnumParaM3(c.tamanho);
                const st = statusParaTexto(c.statusCacamba);

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
                          <p className="text-xs text-gray-400 mt-1">ID: {c.id}</p>
                        </div>

                        {/* Backend atual não tem preço, então deixo placeholder */}
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Diária</p>
                          <p className="font-bold text-blue-600">—</p>
                        </div>
                      </div>

                      {/* Se quiser, aqui você pode colocar botões de Editar/Deletar */}
                      <button
                        onClick={() => navigator.clipboard.writeText(String(c.id))}
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
