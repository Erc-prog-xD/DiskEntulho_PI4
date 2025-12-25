'use client';

import Image from "next/image";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

export default function PerfilPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
            <p className="text-gray-600">
              Gerencie suas informações pessoais
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <Image
                src="/images/user-avatar.jpg"
                alt="Foto do usuário"
                width={140}
                height={140}
                className="rounded-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold text-blue-700">
              Maria Eduarda
            </h2>

            <p className="text-blue-600 mb-6">@mariaeduarda</p>

            <div className="space-y-2 text-gray-700 text-sm mb-8">
              <p>
                <strong>Nome:</strong> Maria Eduarda da Silva
              </p>
              <p>
                <strong>Usuário:</strong> @mariaeduarda
              </p>
              <p>
                <strong>Telefone:</strong> (00) 0000-0000
              </p>
              <p>
                <strong>Endereço padrão:</strong> Rua X, Nº Y, Bairro Z
              </p>
            </div>

            <div className="flex gap-4">
              <button
                className="h-12 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Editar conta
              </button>

              <button
                className="h-12 px-6 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
