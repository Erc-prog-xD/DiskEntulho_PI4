import { Home, Calendar, User, Settings } from "lucide-react"
import { cn } from "@/src/lib/utils"
import Image from "next/image"

export function DashboardSidebar() {
  const menuItems = [
    { icon: Home, label: "Tela inicial", active: true },
    { icon: Calendar, label: "Agendamentos", active: false },
    { icon: User, label: "Perfil", active: false },
    { icon: Settings, label: "Configurações", active: false },
  ]

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="ml-8 p-8 pb-6">
        <Image 
          src="/assets/disk-entulho.png" 
          alt="Disk Entulho Logo" 
          width={133} 
          height={80} 
          className="object-contain"
        />
      </div>
      <nav className="flex-1 px-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-lg mb-2 transition-all duration-200",
                item.active 
                  ? "text-blue-600 bg-blue-50 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-base font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}