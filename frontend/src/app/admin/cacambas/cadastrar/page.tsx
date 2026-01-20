'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Save, Loader2 } from "lucide-react";
import { AdminDashboardSidebar } from '@/src/components/admin-dashboard-sidebar';
import { apiFetch } from "@/src/lib/api";

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T;
};

type CadastrarCacambaPayload = {
  codigo: string;
  tamanho: number; // 0/1/2
};

export default function CadastrarCacambaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    tamanho: '0', // default Pequeno
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.codigo.trim()) {
        alert("Informe o código da caçamba.");
        return;
      }

      const payload: CadastrarCacambaPayload = {
        codigo: formData.codigo.trim(),
        tamanho: Number(formData.tamanho), // 0/1/2 (enum do backend)
      };

      const json = await apiFetch<ApiResponse<any>>(
        "/api/Cacamba/CadastrarCacamba",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!json.status) {
        throw new Error(json.mensagem || "Erro ao cadastrar caçamba");
      }

      alert("Caçamba cadastrada com sucesso!");
      router.push('/admin/cacambas/cadastrar');
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Ocorreu um erro ao tentar salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-10">
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Nova Caçamba</h2>
            <p className="text-lg text-gray-500">
              Preencha os dados abaixo para adicionar uma nova unidade ao inventário.
            </p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label htmlFor="codigo" className="text-base font-semibold text-gray-700">
                        Código da Caçamba
                      </label>
                      <input
                        required
                        type="text"
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        placeholder="Ex: CAC-001"
                        className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="tamanho" className="text-base font-semibold text-gray-700">
                          Tamanho (m³)
                        </label>
                        <select
                          id="tamanho"
                          name="tamanho"
                          value={formData.tamanho}
                          onChange={handleInputChange}
                          className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        >
                          {/* Enum do backend: 0=Pequeno, 1=Medio, 2=Grande */}
                          <option value="0">Pequeno (3m³)</option>
                          <option value="1">Médio (5m³)</option>
                          <option value="2">Grande (7m³)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 pt-8 border-gray-100">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-13 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-base font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        Cadastrar Caçamba
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
