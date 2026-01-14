'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import { getCookie } from 'cookies-next'; 
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Save, UploadCloud, Info, Loader2 } from "lucide-react"; 
import Image from 'next/image';
import { AdminDashboardSidebar } from '@/src/components/admin-dashboard-sidebar';

export default function CadastrarCacambaPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    tamanho: '5',
    descricao: '',
    imagemPreview: null as string | null,
    imagemArquivo: null as File | null 
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  // FUNÇÃO DE INTEGRAÇÃO 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); 

    if (!formData.nome || !formData.preco) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const token = getCookie('token'); 

      const data = new FormData();
      data.append('nome', formData.nome);
      data.append('preco', formData.preco.replace(',', '.')); 
      data.append('tamanho', formData.tamanho);
      data.append('descricao', formData.descricao);
      
      if (formData.imagemArquivo) {
        data.append('imagem', formData.imagemArquivo);
      }

      const API_URL = 'http://localhost:5000/api/cacambas'; 

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao cadastrar caçamba");
      }

      alert("Caçamba cadastrada com sucesso!");
      router.push('/admin/cacambas/lista'); 

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao tentar salvar.");
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
            <p className="text-lg text-gray-500">Preencha os dados abaixo para adicionar uma nova unidade ao inventário.</p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label htmlFor="nome" className="text-base font-semibold text-gray-700">Nome da Caçamba</label>
                      <input 
                        required
                        type="text" 
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Ex: Caçamba Padrão"
                        className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label htmlFor="preco" className="text-base font-semibold text-gray-700">Preço p/ dia</label>
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            id="preco"
                            name="preco"
                            value={formData.preco}
                            onChange={handleInputChange}
                            placeholder="100,00"
                            className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="tamanho" className="text-base font-semibold text-gray-700">Tamanho (m³)</label>
                        <select 
                          id="tamanho"
                          name="tamanho"
                          value={formData.tamanho}
                          onChange={handleInputChange}
                          className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        >
                          <option value="3">3m³</option>
                          <option value="5">5m³</option>
                          <option value="7">7m³</option>
                          <option value="10">10m³</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="descricao" className="text-base font-semibold text-gray-700">Descrição (Opcional)</label>
                      <textarea 
                        id="descricao"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Detalhes adicionais sobre a caçamba..."
                        className="text-gray-700 w-full rounded-lg border min-h-[180px] border-gray-300 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />  
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col">
                    <span className="text-base font-semibold text-gray-700">Foto da Caçamba</span>
                    <div className="flex-1">
                      <label 
                        htmlFor="foto-upload" 
                        className="group relative flex flex-col items-center justify-center w-full h-full min-h-[350px] border-3 border-dashed border-gray-200 rounded-3xl hover:border-blue-600 bg-gray-50 transition-all cursor-pointer overflow-hidden"
                      >
                        {formData.imagemPreview ? (
                          <img 
                            src={formData.imagemPreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <div className="mb-6 p-6 bg-white rounded-full shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-10 h-10" />
                            </div>
                            <p className="mb-3 text-lg text-gray-700 font-medium">
                              Clique para enviar ou arraste e solte
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG ou WEBP (Máx. 5MB)
                            </p>
                          </div>
                        )}
                        <input 
                          id="foto-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
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
            
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Prévia do Card</h3>
                
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden">
                  <div className="aspect-video bg-gray-100 rounded-2xl mb-6 overflow-hidden relative flex items-center justify-center">
                    {formData.imagemPreview ? (
                      <img 
                        src={formData.imagemPreview} 
                        alt="Exemplo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center">
                        <Image src="/assets/cacamba.png" width={120} height={120} alt="Placeholder" className="opacity-50 grayscale" />
                        <span className="text-sm mt-3 font-medium">Sem imagem</span>
                      </div>
                    )}
                    <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-2 rounded-lg uppercase shadow-sm">
                      {formData.tamanho}m³
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-bold text-gray-900 text-xl">
                      {formData.nome || "Nome da Caçamba"}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase font-bold tracking-tight">Preço</span>
                      <span className="font-bold text-gray-800 text-xl">
                        {formData.preco ? `R$ ${formData.preco}/dia` : "R$ 0,00/dia"}
                      </span>
                    </div>
                  </div>
                  
                  <button disabled className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg text-base font-bold opacity-60 cursor-not-allowed border border-blue-100">
                    Detalhes
                  </button>
                  
                  <div className="mt-6 flex gap-3 items-start bg-blue-50 p-4 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 leading-relaxed">
                        Esta é uma visualização de como o card aparecerá para os clientes na tela de locação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}