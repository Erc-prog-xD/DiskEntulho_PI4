'use client';

import Image from "next/image";
import { useState } from "react";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";

export default function EditarPerfilPage() {
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log({
      email,
      telefone,
      endereco,
    });

    alert("Dados salvos com sucesso!");
  }

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

          <div className="bg-white rounded-xl shadow-sm p-10 max-w-5xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start"
            >
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço de e-mail
                  </label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu número de telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu endereço"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Image
                    src="/images/user-avatar.jpg"
                    alt="Foto do usuário"
                    width={180}
                    height={180}
                    className="rounded-full object-cover"
                  />

                  <button
                    type="button"
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                    title="Alterar foto"
                  >
                    ✎
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
