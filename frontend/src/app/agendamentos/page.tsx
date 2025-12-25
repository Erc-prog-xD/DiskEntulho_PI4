'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

interface Agendamento {
  id: number;
  status: string;
}

export default function AgendamentosPage() {
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);
    
    <Image
  src="/assets/empty-box.png"
  alt="Nenhum agendamento"
  width={220}
  height={220}
    />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Agendamentos
            </h1>
            <p className="text-gray-600">
              Acompanhe o status de todos os seus agendamentos.
            </p>
          </div>
          <div className="flex gap-2 mb-10 flex-wrap">
            {["Todos", "Processando", "Rejeitado", "Confirmado", "Concluído"].map(
              (status, index) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                    ${
                      index === 0
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
          {agendamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <Image
                src="/assets/empty-box.png"
                alt="Nenhum agendamento"
                width={220}
                height={220}
              />

              <h2 className="text-xl font-semibold text-gray-900 mt-6">
                Você ainda não possui agendamentos.
              </h2>

              <p className="text-gray-600 mt-2 mb-6">
                Clique em “Agendar caçamba” para começar.
              </p>

              <button
                onClick={() => router.push("/dashboard")}
                className="h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Agendar caçamba
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  Agendamento #{item.id}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
