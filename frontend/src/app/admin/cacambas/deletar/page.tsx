'use client';

import { useEffect, useState } from 'react';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Trash2, AlertTriangle } from "lucide-react";
import Image from 'next/image';
import { apiFetch } from "@/src/lib/api";

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type CacambaApi = {
  id: number;
  codigo: string;
  tamanho: number; // enum: 0,1,2
};

type DumpsterCard = {
  id: string;
  nome: string;
  tamanhoM3: string;
  imagem: string;
  status?: string;
  preco?: string;
};

function tamanhoEnumParaM3(tamanhoEnum: number): string {
  if (tamanhoEnum === 0) return '3';
  if (tamanhoEnum === 1) return '5';
  if (tamanhoEnum === 2) return '7';
  return '?';
}

export default function DeletarCacambaPage() {
  const [dumpsters, setDumpsters] = useState<DumpsterCard[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  // 1) GET - listar todas
  useEffect(() => {
    const load = async () => {
      setIsLoadingList(true);
      setListError(null);

      try {
        const json = await apiFetch<ApiResponse<CacambaApi[]>>(
          "/api/Cacamba/ListarTodasCacambas",
          { method: "GET" }
        );

        if (!json.status) throw new Error(json.mensagem || "Falha ao listar caçambas.");

        const mapped: DumpsterCard[] = (json.dados ?? []).map((c) => ({
          id: String(c.id),
          nome: c.codigo ? `Caçamba ${c.codigo}` : `Caçamba #${c.id}`,
          tamanhoM3: tamanhoEnumParaM3(c.tamanho),
          imagem: '/assets/cacamba.png',
          status: '—',
          preco: '—',
        }));

        setDumpsters(mapped);
      } catch (e: any) {
        console.error(e);
        setListError(e?.message ?? 'Erro ao carregar lista.');
        setDumpsters([]);
      } finally {
        setIsLoadingList(false);
      }
    };

    load();
  }, []);

  // 2) DELETE
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const idNum = Number(itemToDelete);
      if (Number.isNaN(idNum)) {
        alert('ID inválido para deletar.');
        return;
      }

      const json = await apiFetch<ApiResponse<any>>(
        `/api/Cacamba/${idNum}`,
        { method: "DELETE" }
      );

      // Alguns deletes podem devolver body, outros podem ser 204.
      // Se vier ApiResponse e status=false, respeita:
      if (json && typeof json === "object" && "status" in json && (json as any).status === false) {
        throw new Error((json as any).mensagem || "Falha ao deletar.");
      }

      setDumpsters((prev) => prev.filter((d) => d.id !== itemToDelete));
      closeModal();
      alert('Caçamba removida com sucesso.');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Erro ao deletar.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-10 min-h-0 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deletar Caçambas</h1>
            <p className="text-lg text-gray-500">Gerencie a remoção de caçambas do inventário.</p>
          </header>

          {isLoadingList && (
            <div className="text-gray-600">Carregando caçambas...</div>
          )}

          {!isLoadingList && listError && (
            <div className="text-red-600 font-medium">{listError}</div>
          )}

          {!isLoadingList && !listError && dumpsters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dumpsters.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.imagem}
                      alt={item.nome}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {item.tamanhoM3}m³
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.nome}</h3>
                        <p className="text-sm font-medium text-gray-500">{item.status ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Diária</p>
                        <p className="font-bold text-blue-600">{item.preco ? `R$ ${item.preco}` : '—'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="mt-auto w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar do Sistema
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!isLoadingList && !listError && dumpsters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Trash2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">Nenhuma caçamba encontrada.</p>
            </div>
          ) : null}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>

              <p className="text-gray-500 mb-8 leading-relaxed">
                Tem certeza que deseja deletar esta caçamba? <br />
                <span className="text-red-600 font-medium">Esta ação é irreversível</span>.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deletando...' : 'Sim, Deletar Caçamba'}
                </button>

                <button
                  onClick={closeModal}
                  disabled={isDeleting}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-4 rounded-xl transition-colors"
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
