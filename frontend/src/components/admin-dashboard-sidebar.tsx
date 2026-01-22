"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  User,
  Trash2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Plus,
  RefreshCw,
  Trash,
  Banknote,
  UserRound,
  TextAlignStart,
  ChartColumnBig,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function AdminDashboardSidebar() {
  const pathname = usePathname();

  const [isCacambasOpen, setIsCacambasOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // ============================
  // DETECÇÃO DE ROTAS
  // ============================
  const isDashboard = pathname === "/admin/dashboard";
  const isPerfil = pathname === "/admin/perfil";

  const isInCacambas = pathname.startsWith("/admin/cacambas");
  const isInActions = pathname.startsWith("/admin/acoes");

  // ============================
  // ABRE DROPDOWN AUTOMATICAMENTE
  // ============================
  useEffect(() => {
    if (isInCacambas) setIsCacambasOpen(true);
    if (isInActions) setIsActionsOpen(true);
  }, [isInCacambas, isInActions]);

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/auth/login";
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* LOGO */}
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
        {/* ============================
            DASHBOARD
        ============================ */}
        <Link
          href="/admin/dashboard"
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-lg mb-2 transition-all",
            isDashboard
              ? "text-blue-600 bg-blue-50 shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-base font-medium">Tela inicial</span>
        </Link>

        {/* ============================
            CAÇAMBAS
        ============================ */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => {
              if (!isInCacambas) {
                setIsCacambasOpen((v) => !v);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-5 py-4 rounded-lg transition-all",
              isInCacambas
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-4">
              <Trash2 className="w-6 h-6" />
              <span className="text-base font-medium">Caçambas</span>
            </div>
            {isCacambasOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {isCacambasOpen && (
            <div className="mt-1 ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
              {[
                { label: "Listar Caçambas", href: "/admin/cacambas/listar", icon: ClipboardList },
                { label: "Cadastrar Caçamba", href: "/admin/cacambas/cadastrar", icon: Plus },
                { label: "Atualizar Caçamba", href: "/admin/cacambas/editar", icon: RefreshCw },
                { label: "Deletar Caçamba", href: "/admin/cacambas/deletar", icon: Trash },
              ].map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      active
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================
            AÇÕES
        ============================ */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => {
              if (!isInActions) {
                setIsActionsOpen((v) => !v);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-5 py-4 rounded-lg transition-all",
              isInActions
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-4">
              <ChartColumnBig className="w-6 h-6" />
              <span className="text-base font-medium">Ações</span>
            </div>
            {isActionsOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {isActionsOpen && (
            <div className="mt-1 ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
              {[
                {
                  label: "Confirmar agendamentos",
                  href: "/admin/acoes/agendamentos-especie",
                  icon: Banknote,
                },
                {
                  label: "Gerenciar clientes",
                  href: "/admin/acoes/clientes",
                  icon: UserRound,
                },
                {
                  label: "Listar agendamentos",
                  href: "/admin/acoes/agendamentos",
                  icon: TextAlignStart,
                },
              ].map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      active
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================
            PERFIL
        ============================ */}
        <Link
          href="/admin/perfil"
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-lg mb-2 transition-all",
            isPerfil
              ? "text-blue-600 bg-blue-50 shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-base font-medium">Perfil</span>
        </Link>

        {/* ============================
            LOGOUT
        ============================ */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-base font-medium">Sair</span>
        </button>
      </nav>
    </aside>
  );
}
