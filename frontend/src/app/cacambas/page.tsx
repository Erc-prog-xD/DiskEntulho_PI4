import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardSidebar } from "@/src/components/dashboard-sidebar"
import { CacambaCard } from "@/src/components/caçamba-card"

export default function Cacambas() {
  const cacambas = [
    {
      id: 1,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
    {
      id: 2,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
    {
      id: 3,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
    {
      id: 4,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
    {
      id: 5,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
    {
      id: 6,
      name: "Caçamba",
      volume: "5m³",
      price: "R$ 100,00/dia",
      image: "/assets/cacamba.png",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Caçambas disponíveis</h1>
            <p className="text-lg text-gray-600 mb-10">
              Lista das caçambas de entulho disponíveis para aluguel de acordo com o filtro selecionado
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cacambas.map((cacambas) => (
              <CacambaCard key={cacambas.id} {...cacambas} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
