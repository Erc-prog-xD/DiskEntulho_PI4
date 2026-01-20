'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Save, UploadCloud, Search, Edit3, Loader2 } from "lucide-react";
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
  tamanho: number; // 0/1/2
  statusCacamba: number; // 0/1
};

type CacambaUpdatePayload = {
  codigo?: string | null;
  tamanho?: number | null;
  statusCacamba?: number | null;
};

export default function AtualizarCacambaPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cacambas, setCacambas] = useState<CacambaApi[]>([]);
  const [selectedId, setSelectedId] = useState<string>(''); // string pro <select>

  const [formData, setFormData] = useState({
    codigo: '',
    tamanho: '0', // 0/1/2
    statusCacamba: '1', // 0/1 (default Disponível)
    imagemPreview: '/assets/cacamba.png' as string,
    imagemArquivo: null as File | null, // (não envia p/ API)
  });

  // 1) Carrega lista para o select (GET ListarTodasCacambas)
  useEffect(() => {
    const loadList = async () => {
      setIsLoadingList(true);
      setError(null);

      try {
        const json = await apiFetch<ApiResponse<CacambaApi[]>>(
          "/api/Cacamba/ListarTodasCacambas",
          { method: 'GET' }
        );

        if (!json.status) {
          throw new Error(json.mensagem || 'Falha ao listar caçambas.');
        }

        const list = json.dados ?? [];
        setCacambas(list);

        // Seleciona a primeira automaticamente
        if (list.length > 0) {
          setSelectedId(String(list[0].id));
        } else {
          setSelectedId('');
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? 'Erro ao carregar lista de caçambas.');
      } finally {
        setIsLoadingList(false);
      }
    };

    loadList();
  }, []);

  // 2) Ao trocar selectedId, carrega dados da caçamba (GET /api/Cacamba/{id})
  useEffect(() => {
    const loadItem = async () => {
      if (!selectedId) return;

      setIsLoadingItem(true);
      setError(null);

      try {
        const json = await apiFetch<ApiResponse<CacambaApi>>(
          `/api/Cacamba/${Number(selectedId)}`,
          { method: 'GET' }
        );

        if (!json.status) {
          throw new Error(json.mensagem || 'Falha ao buscar caçamba.');
        }

        const c = json.dados;

        setFormData(prev => ({
          ...prev,
          codigo: c?.codigo ?? '',
          tamanho: String(c?.tamanho ?? 0),
          statusCacamba: String(c?.statusCacamba ?? 1),
          // imagemPreview fica como placeholder (API não tem imagem)
          imagemArquivo: null,
        }));
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? 'Erro ao carregar caçamba selecionada.');
      } finally {
        setIsLoadingItem(false);
      }
    };

    loadItem();
  }, [selectedId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // (UI apenas) — backend não recebe imagem
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imagemPreview: url,
        imagemArquivo: file
      }));
    }
  };

  // 3) PUT AtualizarCacamba/{id} com JSON (CacambaUpdateDTO)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload: CacambaUpdatePayload = {
        codigo: formData.codigo.trim() || null,
        tamanho: Number.isNaN(Number(formData.tamanho)) ? null : Number(formData.tamanho),
        statusCacamba: Number.isNaN(Number(formData.statusCacamba)) ? null : Number(formData.statusCacamba),
      };

      // Pode ser que o backend retorne 204 (sem JSON). Por isso o patch do apiFetch no final.
      const json = await apiFetch<ApiResponse<any>>(
        `/api/Cacamba/AtualizarCacamba/${Number(selectedId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      // Se vier JSON padrão:
      if (json && typeof json === "object" && "status" in json) {
        if (!(json as any).status) {
          throw new Error((json as any).mensagem || 'Falha ao atualizar caçamba.');
        }
      }

      alert('Caçamba atualizada com sucesso!');
      window.location.reload();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Erro ao salvar alterações.');
      alert(e?.message ?? 'Erro ao salvar alterações.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-10 min-h-0 overflow-hidden">
          <header className="mb-8 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Atualizar Caçamba</h2>
              <p className="text-lg text-gray-500">Edite as informações da caçamba selecionada abaixo.</p>
            </div>
          </header>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex-shrink-0">
            <label htmlFor="select-cacamba" className="block text-sm font-semibold text-gray-700 mb-2">
              Selecione a caçamba para editar
            </label>

            <div className="relative">
              <select
                id="select-cacamba"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isLoadingList || cacambas.length === 0}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-700 font-medium appearance-none cursor-pointer disabled:opacity-70"
              >
                {cacambas.map(item => (
                  <option key={item.id} value={String(item.id)}>
                    #{item.id} - Código: {item.codigo} | Tam: {item.tamanho} | Status: {item.statusCacamba}
                  </option>
                ))}
              </select>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {isLoadingList && <p className="mt-3 text-sm text-gray-500">Carregando lista...</p>}
            {isLoadingItem && <p className="mt-3 text-sm text-gray-500">Carregando caçamba...</p>}
            {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
            <div className="xl:col-span-2 h-full min-h-0">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm flex flex-col border border-gray-100 overflow-hidden">
                <div className="overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-base font-semibold text-gray-700">Código da Caçamba</label>
                        <input
                          type="text"
                          name="codigo"
                          value={formData.codigo}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Tamanho</label>
                        <select
                          name="tamanho"
                          value={formData.tamanho}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900"
                        >
                          {/* Enum do backend: 0=Pequeno, 1=Medio, 2=Grande */}
                          <option value="0">Pequeno (3m³)</option>
                          <option value="1">Médio (5m³)</option>
                          <option value="2">Grande (7m³)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Status</label>
                        <select
                          name="statusCacamba"
                          value={formData.statusCacamba}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900"
                        >
                          {/* Enum do backend: 0=Indisponivel, 1=Disponivel */}
                          <option value="1">Disponível</option>
                          <option value="0">Indisponível</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400">
                      * A API de caçambas atualiza apenas Código, Tamanho e Status.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 flex gap-4 border-t border-gray-100 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 px-6 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !selectedId}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* UI de imagem mantida, mas não integra com backend */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Foto da Caçamba</h3>

                <div className="relative group mb-6">
                  <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative">
                    {formData.imagemPreview ? (
                      <img
                        src={formData.imagemPreview}
                        alt="Foto da caçamba"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image src="/assets/cacamba.png" width={100} height={100} alt="Placeholder" className="opacity-40" />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label htmlFor="foto-upload-update" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <Edit3 className="w-4 h-4" />
                        Alterar (não salva na API)
                      </label>
                      <input id="foto-upload-update" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>

                  <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Atual: {formData.tamanho} (enum)
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="foto-upload-btn" className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                    <UploadCloud className="w-5 h-5" />
                    <span className="font-semibold">Upload nova foto (UI)</span>
                  </label>
                  <input id="foto-upload-btn" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  <p className="text-xs text-center text-gray-400">
                    A API atual não persiste imagem para caçambas.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
