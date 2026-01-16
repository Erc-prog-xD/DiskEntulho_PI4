'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { AdminDashboardSidebar } from "@/src/components/admin-dashboard-sidebar";

export default function ConfirmarAgendamentoPage() {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  function handleConfirm() {
    if (!paymentMethod) {
      alert("Selecione uma forma de pagamento.");
      return;
    }
    router.push("/admin/agendamentos");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminDashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Confirmar agendamento
            </h1>
            <p className="text-lg text-gray-600">
              Revise as informações e selecione a forma de pagamento.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              <div className="w-full lg:w-1/3 flex justify-center">
                <Image
                  src="/images/cacamba.png"
                  alt="Caçamba"
                  width={280}
                  height={180}
                  className="object-contain"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Caçamba 5m³
                </h2>

                <div className="space-y-2 text-gray-700">
                  <p><strong>Data inicial:</strong> 10/04/2025</p>
                  <p><strong>Data final:</strong> 12/04/2025</p>
                  <p><strong>Endereço:</strong> Rua X, Nº Y, Bairro Z, CEP 00000-000</p>
                  <p><strong>Telefone:</strong> (00) 00000-0000</p>
                  <p><strong>Observações:</strong> —</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do agendamento
              </h3>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Caçamba 5m³</span>
                  <span>R$100,00 / dia</span>
                </div>

                <div className="flex justify-between">
                  <span>Entrega</span>
                  <span>R$10,00</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>R$110,00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Forma de pagamento:
              </h3>

              <div className="space-y-4">
                {["Pix", "Cartão", "Dinheiro"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 cursor-pointer text-gray-800"
                  >
                    <input
                      type="radio"
                      name="pagamento"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleConfirm}
              disabled={!paymentMethod}
              className={`h-14 px-10 rounded-lg font-semibold transition
                ${
                  paymentMethod
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              Confirmar agendamento
            </button>

            <p className="text-sm text-blue-600 text-center">
              Ao confirmar, você receberá o status do agendamento por WhatsApp.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
