'use client';

import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/src/components/dashboard-header";
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";
import { useState } from 'react';

export default function DashboardPage() {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [currentMonth, setCurrentMonth] = useState(3); // Abril (0 = Janeiro)
    const [currentYear, setCurrentYear] = useState(2021);
    const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function prevMonth() {
    if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(y => y - 1);
    } else {
        setCurrentMonth(m => m - 1);
    }
    }

    function nextMonth() {
    if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(y => y + 1);
    } else {
        setCurrentMonth(m => m + 1);
    }
    }
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminDashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buscar caçambas
            </h1>
            <p className="text-lg text-gray-600">
              Preencha os dados abaixo para realizar a busca de caçambas de entulho que estejam disponíveis
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu número de telefone"
                    className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o endereço de entrega"
                    className="text-gray-700 w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    placeholder="Digite alguma observação que deseja fazer"
                    className="text-gray-700 w-full min-h-[120px] rounded-lg border border-gray-300 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
                <div className="flex flex-col items-center justify-between bg-gray-50 rounded-xl p-6">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="text-gray-500 hover:text-gray-700">
                        ◀
                    </button>

                    <span className="font-semibold text-gray-800">
                        {months[currentMonth]}, {currentYear}
                    </span>

                    <button onClick={nextMonth} className="text-gray-500 hover:text-gray-700">
                        ▶
                    </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(day => (
                        <span key={day} className="text-gray-500 font-medium">
                        {day}
                        </span>
                    ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const isSelected = selectedDay === day;

                        return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center
                            ${isSelected
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {day}
                        </button>
                        );
                    })}
                    </div>
                </div>

                <button
                    disabled={!selectedDay}
                    onClick={() => router.push('/cacambas')}
                    className={`mt-6 w-full h-12 rounded-lg font-semibold transition
                    ${selectedDay
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Selecionar data
                </button>
                </div>
                
                <button
                  onClick={() => router.push('/cacambas')}
                  className="mt-6 w-full lg:col-span-2 h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Escolher caçamba
                </button>
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
