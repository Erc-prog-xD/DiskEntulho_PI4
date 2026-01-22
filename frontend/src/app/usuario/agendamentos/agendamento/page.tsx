'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

export default function NovoAgendamentoDatasPage() {
  const router = useRouter();

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const avancar = () => {
    if (!inicio || !fim) {
      alert("Preencha a data inicial e final.");
      return;
    }
    if (inicio >= fim) {
      alert("A data inicial precisa ser menor que a data final.");
      return;
    }

    router.push(`/usuario/agendamentos/cacambas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="max-w-xl bg-white border border-gray-100 rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900">Novo agendamento</h1>
            <p className="text-gray-600 mt-2">Escolha o intervalo de datas para ver caçambas disponíveis.</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data inicial</label>
                <input
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data final</label>
                <input
                  type="date"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={avancar}
                className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Ver caçambas disponíveis
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
