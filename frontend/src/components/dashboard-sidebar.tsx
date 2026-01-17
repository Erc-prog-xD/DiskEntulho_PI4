'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Home, Calendar, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

type ChildItem = { label: string; href: string; exact?: boolean };
type MenuItem =
  | { icon: any; label: string; href: string }
  | { icon: any; label: string; children: ChildItem[] };

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openAgendamentos, setOpenAgendamentos] = useState(false);

  const isActiveExact = (href: string) => pathname === href;
  const isActiveWithChildren = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const isInAgendamentos = pathname === "/agendamentos" || pathname.startsWith("/agendamentos/");

  useEffect(() => {
    if (isInAgendamentos) setOpenAgendamentos(true);
  }, [isInAgendamentos]);

  const menuItems: MenuItem[] = useMemo(() => ([
    { icon: Home, label: "Tela inicial", href: "/usuario/dashboard" },

    {
      icon: Calendar,
      label: "Agendamentos",
      children: [
        { label: "Ver meus agendamentos", href: "/agendamentos", exact: true },
        { label: "Novo agendamento", href: "/agendamentos/novo" },
      ],
    },

    { icon: User, label: "Perfil", href: "/perfil" },
  ]), []);

  function handleLogout() {
  // remove token do localStorage
  localStorage.removeItem("token");

  // remove cookie do token
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // redireciona para login
  window.location.href = "/auth/login";
}

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
        {menuItems.map((item) => {
          const Icon = item.icon;

          // ITEM NORMAL (igual baseItems)
          if ("href" in item) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-lg mb-2 transition-all duration-200",
                  isActiveWithChildren(item.href)
                    ? "text-blue-600 bg-blue-50 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          }

          // ITEM COM DROPDOWN (Agendamentos)
          const parentActive = isInAgendamentos;

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpenAgendamentos((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 rounded-lg mb-2 transition-all duration-200",
                  parentActive
                    ? "text-blue-600 bg-blue-50 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-6 h-6" />
                  <span className="text-base font-medium">{item.label}</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 transition-transform", openAgendamentos ? "rotate-180" : "")} />
                
              </button>
             
              {openAgendamentos && (
                <div className="ml-6 mb-2">
                  {item.children.map((child) => {
                    const active = child.exact
                      ? isActiveExact(child.href)
                      : isActiveWithChildren(child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block w-full px-5 py-3 rounded-lg mb-1 transition-all duration-200 text-sm",
                          active
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-lg
                    text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-base font-medium">Sair</span>
        </button>
      </nav>
    </aside>
  );
}
