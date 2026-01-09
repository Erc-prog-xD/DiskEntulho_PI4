"use client" // Necessário pois agora usamos useState

import { useState } from "react"
import { Home, Calendar, User, Settings, Trash2, ChevronDown, ChevronRight, Plus, RefreshCw, Trash, Banknote, Check, UserRoundX, UserRoundCheck, TextAlignStart, List } from "lucide-react"
import { cn } from "@/src/lib/utils"
import Image from "next/image"
import Link from "next/link" 

export function AdminDashboardSidebar() {
  const [isCacambasOpen, setIsCacambasOpen, ] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const menuItems = [
    { 
      icon: Home, 
      label: "Tela inicial", 
      href: "/admin/dashboard",
      active: true 
    },
    { 
      icon: Calendar, 
      label: "Agendamentos", 
      href: "/admin/agendamentos",
      active: false 
    },
    { 
      icon: Trash2, 
      label: "Caçambas", 
      active: false,
      isDropdown: true, 
      isOpen: isCacambasOpen,
      toggle: () => setIsCacambasOpen(!isCacambasOpen),
      subItems: [
        { label: "Cadastrar Caçamba", href: "/admin/cacambas/novo", icon: Plus },
        { label: "Atualizar Caçamba", href: "/admin/cacambas/editar", icon: RefreshCw },
        { label: "Deletar Caçamba", href: "/admin/cacambas/deletar", icon: Trash },
      ]
    },
    { 
      icon: List, 
      label: "Ações", 
      active: false,
      isDropdown: true, 
      isOpen: isActionsOpen,
      toggle: () => setIsActionsOpen(!isActionsOpen),
      subItems: [
        { label: "Listar Agendamentos em Espécie", href: "/admin/action/agendamentos-especie", icon: Banknote },
        { label: "Confirmar Agendamento", href: "/admin/action/confirmar-agendamentos", icon: Check },
        { label: "Deletar Cliente", href: "/admin/action/deletar-cliente", icon: UserRoundX },
        { label: "Reativar Cliente", href: "/admin/action/reativar-cliente", icon: UserRoundCheck },
        { label: "Listar Agendamentos", href: "/admin/action/agendamentos", icon: TextAlignStart },
      ]
    },
    { 
      icon: User, 
      label: "Perfil", 
      href: "/admin/perfil",
      active: false 
    },
    { 
      icon: Settings, 
      label: "Configurações", 
      href: "/admin/configuracoes",
      active: false 
    },
  ]

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="ml-8 p-8 pb-6">
        <Image 
          src="/assets/disk-entulho.png" 
          alt="Disk Entulho Logo" 
          width={133} 
          height={80} 
          className="object-contain"
        />
      </div>
      
      <nav className="flex-1 px-4 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon

          if (item.isDropdown) {
            return (
              <div key={index} className="mb-2">
                <button
                  onClick={item.toggle}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-lg transition-all duration-200",
                    item.active 
                      ? "text-blue-600 bg-blue-50 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-6 h-6" />
                    <span className="text-base font-medium">{item.label}</span>
                  </div>
                  {item.isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {item.isOpen && (
                  <div className="mt-1 ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
                    {item.subItems?.map((subItem, subIndex) => {
                       const SubIcon = subItem.icon
                       return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <SubIcon className="w-5 h-5" />
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={index}
              href={item.href || "#"}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-lg mb-2 transition-all duration-200",
                item.active 
                  ? "text-blue-600 bg-blue-50 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}