'use client';

import { useState } from 'react';
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { Trash2, AlertTriangle, X } from "lucide-react"; 
import Image from 'next/image';
import { getCookie } from 'cookies-next'; 

const MOCK_CACAMBAS = [
  { id: '1', nome: 'Caçamba Residencial', tamanho: '5', preco: '100,00', status: 'Disponível', imagem: '/assets/cacamba.png' },
  { id: '2', nome: 'Caçamba Grande Obra', tamanho: '7', preco: '150,00', status: 'Alugada', imagem: '/assets/cacamba.png' },
  { id: '3', nome: 'Caçamba Pequena', tamanho: '3', preco: '80,00', status: 'Manutenção', imagem: '/assets/cacamba.png' },
  { id: '4', nome: 'Caçamba Média', tamanho: '5', preco: '110,00', status: 'Disponível', imagem: '/assets/cacamba.png' },
];

export default function DeletarCacambaPage() {
  const [dumpsters, setDumpsters] = useState(MOCK_CACAMBAS);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      // INTEGRAÇÃO COM A API 
      // const token = getCookie('token');
      // await fetch(`http://localhost:5000/api/cacambas/${itemToDelete}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDumpsters(prev => prev.filter(item => item.id !== itemToDelete));
      
      closeModal();
      alert('Caçamba removida com sucesso.');

    } catch (error) {
      console.error(error);
      alert('Erro ao deletar.');
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
            <p className="text-lg text-gray-500">Gerencie a remoção de caçambas do inventário de Disk Entulho.</p>
          </header>

          {dumpsters.length > 0 ? (
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
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {item.tamanho}m³
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.nome}</h3>
                        <p className={`text-sm font-medium ${
                          item.status === 'Disponível' ? 'text-green-600' : 
                          item.status === 'Manutenção' ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {item.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Diária</p>
                        <p className="font-bold text-blue-600">R$ {item.preco}</p>
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Trash2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">Nenhuma caçamba encontrada.</p>
            </div>
          )}
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
                Tem certeza que deseja deletar esta caçamba? <br/>
                <span className="text-red-600 font-medium">Esta ação é irreversível</span> e removerá todos os registros associados.
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