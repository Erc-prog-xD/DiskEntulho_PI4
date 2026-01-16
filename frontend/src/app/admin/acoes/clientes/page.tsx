'use client';

import { useState } from 'react';
import { getCookie } from 'cookies-next';
import { AdminDashboardSidebar } from '@/src/components/admin-dashboard-sidebar';
import { DashboardHeader } from '@/src/components/dashboard-header';
import { Loader2, UserRoundX, UserRoundCheck, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8080';

type ActionMode = 'deletar' | 'reativar';

export default function GerenciarClientePage() {
  const [clientId, setClientId] = useState('');
  const [mode, setMode] = useState<ActionMode>('deletar');
  const [isLoading, setIsLoading] = useState(false);

  const executar = async () => {
    const id = clientId.trim();
    if (!id) {
      alert('Informe o ID do cliente.');
      return;
    }

    const ok = confirm(
      mode === 'deletar'
        ? `Tem certeza que deseja DELETAR o cliente ID ${id}?`
        : `Tem certeza que deseja REATIVAR o cliente ID ${id}?`
    );
    if (!ok) return;

    setIsLoading(true);
    try {
      const token = getCookie('token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const url =
        mode === 'deletar'
          ? `${API_BASE}/api/Admin/DeletarCliente/${id}` // :contentReference[oaicite:15]{index=15}
          : `${API_BASE}/api/Admin/ReativarCliente/${id}`; // :contentReference[oaicite:16]{index=16}

      const method = mode === 'deletar' ? 'DELETE' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.mensagem || body?.message || `Erro HTTP ${res.status}`);
      }

      alert(body?.mensagem || (mode === 'deletar' ? 'Cliente deletado!' : 'Cliente reativado!'));
      setClientId('');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Erro ao executar ação.');
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

        <main className="flex-1 flex flex-col p-6 md:p-10 min-h-0 overflow-hidden">
          <header className="mb-8 flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Cliente</h1>
            <p className="text-lg text-gray-500">
              Deletar ou reativar cliente usando as rotas do Admin.
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <p className="text-sm leading-relaxed">
                No backend atual, as ações de cliente são por <b>ID</b>. Se você quiser “listar clientes” aqui,
                é necessário criar um endpoint de listagem no backend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  ID do Cliente
                </label>
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Ex: 12"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Ação
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ActionMode)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                >
                  <option value="deletar">Deletar</option>
                  <option value="reativar">Reativar</option>
                </select>
              </div>
            </div>

            <button
              onClick={executar}
              disabled={isLoading}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-70 ${
                mode === 'deletar' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : mode === 'deletar' ? (
                <>
                  <UserRoundX className="w-5 h-5" />
                  Deletar Cliente
                </>
              ) : (
                <>
                  <UserRoundCheck className="w-5 h-5" />
                  Reativar Cliente
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
