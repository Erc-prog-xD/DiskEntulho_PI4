'use client';

import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { CheckCircle, XCircle, Clock, Loader2, PlayCircle } from "lucide-react";

// --- TIPAGEM ---
interface AgendamentoListItem {
  id: number;
  status: 'Criado' | 'Processando' | 'Rejeitado' | 'Confirmado' | 'Finalizado';
  enderecoEntrega: string;
  bairroCidade: string;
  cacambaId: number;
  clienteNome: string;
  clienteInicial: string;
  dataInicial: string;
  dataFinal: string;
  valor: string;
}

// --- DADOS MOCKADOS ---
const MOCK_AGENDAMENTOS_ESPECIE: AgendamentoListItem[] = [
  {
    id: 4092,
    status: 'Confirmado',
    enderecoEntrega: 'Rua das Flores, 123',
    bairroCidade: 'Centro, São Paulo - SP',
    cacambaId: 4092,
    clienteNome: 'João Silva',
    clienteInicial: 'JS',
    dataInicial: '12/10/2023',
    dataFinal: '19/10/2023',
    valor: 'R$ 150,00'
  },
  {
    id: 3021,
    status: 'Finalizado',
    enderecoEntrega: 'Av. Paulista, 900',
    bairroCidade: 'Bela Vista, São Paulo - SP',
    cacambaId: 3021,
    clienteNome: 'Maria Oliveira',
    clienteInicial: 'MO',
    dataInicial: '01/10/2023',
    dataFinal: '05/10/2023',
    valor: 'R$ 120,00'
  },
  {
    id: 5011,
    status: 'Rejeitado',
    enderecoEntrega: 'Rua Augusta, 500',
    bairroCidade: 'Consolação, São Paulo - SP',
    cacambaId: 5011,
    clienteNome: 'Carlos Souza',
    clienteInicial: 'CS',
    dataInicial: '10/10/2023',
    dataFinal: '15/10/2023',
    valor: 'R$ 180,00'
  },
  {
    id: 4100,
    status: 'Processando',
    enderecoEntrega: 'Al. Santos, 45',
    bairroCidade: 'Jardins, São Paulo - SP',
    cacambaId: 4100,
    clienteNome: 'Ana Costa',
    clienteInicial: 'AC',
    dataInicial: '25/10/2023',
    dataFinal: '30/10/2023',
    valor: 'R$ 150,00'
  },
  {
    id: 4101,
    status: 'Criado',
    enderecoEntrega: 'Rua Vergueiro, 1000',
    bairroCidade: 'Liberdade, São Paulo - SP',
    cacambaId: 4101,
    clienteNome: 'Roberto Santos',
    clienteInicial: 'RS',
    dataInicial: '26/10/2023',
    dataFinal: '31/10/2023',
    valor: 'R$ 150,00'
  },
  {
    id: 4102,
    status: 'Criado',
    enderecoEntrega: 'Av. Brasil, 500',
    bairroCidade: 'Jardins, São Paulo - SP',
    cacambaId: 4102,
    clienteNome: 'Fernanda Lima',
    clienteInicial: 'FL',
    dataInicial: '27/10/2023',
    dataFinal: '01/11/2023',
    valor: 'R$ 160,00'
  },
];

// Componente Badge de Status (Texto: text-sm)
const StatusBadge = ({ status }: { status: AgendamentoListItem['status'] }) => {
  const statusConfig = {
    'Criado': { 
      style: 'bg-blue-50 text-blue-700 border border-blue-100', 
      icon: Clock 
    },
    'Processando': { 
      style: 'bg-yellow-50 text-yellow-700 border border-yellow-100', 
      icon: Loader2 
    },
    'Confirmado': { 
      style: 'bg-green-50 text-green-700 border border-green-100', 
      icon: CheckCircle 
    },
    'Finalizado': { 
      style: 'bg-gray-100 text-gray-600 border border-gray-200', 
      icon: PlayCircle 
    },
    'Rejeitado': { 
      style: 'bg-red-50 text-red-700 border border-red-100', 
      icon: XCircle 
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.style}`}>
      <Icon className={`w-4 h-4 ${status === 'Processando' ? 'animate-spin' : ''}`} />
      {status}
    </span>
  );
};

export default function AgendamentosEspeciePage() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminDashboardSidebar />

      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <main className="flex-1 flex flex-col p-6 md:p-10 min-h-0 overflow-hidden">
          
          <header className="mb-8 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendamentos em Espécie</h1>
              <p className="text-lg text-gray-500">Gerencie locações com pagamento pendente ou realizado em dinheiro.</p>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
            
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Endereço de Entrega
                    </th>
                     <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Valor (Espécie)
                    </th>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Caçamba ID
                    </th>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Data Inicial
                    </th>
                    <th scope="col" className="px-6 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Data Final
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {MOCK_AGENDAMENTOS_ESPECIE.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-base font-medium text-gray-900">{item.enderecoEntrega}</div>
                        <div className="text-sm text-gray-500">{item.bairroCidade}</div>
                      </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-base font-bold text-gray-900">{item.valor}</div>
                        <div className="text-sm text-gray-500">Pagamento na entrega</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                        #{item.cacambaId}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-base">
                            {item.clienteInicial}
                          </div>
                          <div className="ml-3">
                            <div className="text-base font-medium text-gray-900">{item.clienteNome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                        {item.dataInicial}
                      </td>
                       <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500">
                        {item.dataFinal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}