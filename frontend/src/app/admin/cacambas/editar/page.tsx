'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Save, UploadCloud, Search, Edit3 } from "lucide-react"; // Removidos ícones de estatísticas
import Image from 'next/image';

const MOCK_DB = [
  { id: '1', nome: 'Caçamba Residencial Padrão', tamanho: '5', preco: '100,00', imagem: '/assets/cacamba.png' },
  { id: '2', nome: 'Caçamba Pequena Entulho', tamanho: '3', preco: '80,00', imagem: '/assets/cacamba.png' },
  { id: '3', nome: 'Caçamba Grande Obra', tamanho: '7', preco: '150,00', imagem: '/assets/cacamba.png' },
];

export default function AtualizarCacambaPage() {
  const [selectedId, setSelectedId] = useState('1');
  
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    tamanho: '5',
    imagemPreview: null as string | null
  });

  useEffect(() => {
    const item = MOCK_DB.find(db => db.id === selectedId);
    if (item) {
      setFormData({
        nome: item.nome,
        preco: item.preco,
        tamanho: item.tamanho,
        imagemPreview: item.imagem
      });
    }
  }, [selectedId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imagemPreview: url }));
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
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-700 font-medium appearance-none cursor-pointer"
              >
                {MOCK_DB.map(item => (
                  <option key={item.id} value={item.id}>
                    Caçamba {item.tamanho}m³ - {item.nome} (R$ {item.preco}/dia)
                  </option>
                ))}
              </select>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
            
            {/* COLUNA ESQUERDA (FORMULÁRIO) - Mantém scroll interno se necessário */}
            <div className="xl:col-span-2 h-full min-h-0">
              <form className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col border border-gray-100 overflow-hidden">
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-base font-semibold text-gray-700">Nome da Caçamba</label>
                        <input 
                          type="text" 
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Tamanho (m³)</label>
                        <select 
                          name="tamanho"
                          value={formData.tamanho}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900"
                        >
                          <option value="3">3m³</option>
                          <option value="5">5m³</option>
                          <option value="7">7m³</option>
                          <option value="10">10m³</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">Preço por Dia (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                          <input 
                            type="text" 
                            name="preco"
                            value={formData.preco}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 flex gap-4 border-t border-gray-100 flex-shrink-0">
                  <button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 px-6 rounded-xl transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>

            {/* COLUNA DIREITA - Sem Scroll, Sem Estatísticas */}
            <div className="xl:col-span-1">
              {/* Removido h-full e overflow para deixar o card do tamanho do conteúdo */}
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
                        Alterar
                      </label>
                      <input id="foto-upload-update" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>
                  
                  <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Atual: {formData.tamanho}m³
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="foto-upload-btn" className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                    <UploadCloud className="w-5 h-5" />
                    <span className="font-semibold">Upload de nova foto</span>
                  </label>
                  <input id="foto-upload-btn" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  <p className="text-xs text-center text-gray-400">Recomendado: 800x600px, máx 2MB (JPG ou PNG)</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}