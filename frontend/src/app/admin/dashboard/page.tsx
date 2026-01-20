'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardSidebar } from '@/src/components/admin-dashboard-sidebar';
import { DashboardHeader } from '@/src/components/dashboard-header';
import {
  ArrowRight,
  CalendarCheck,
  Users,
  Trash2,
  Banknote,
  CreditCard,
  Settings,
  ShieldCheck,
  Activity,
  Clock3,
  CheckCircle2,
  Info,
  LayoutDashboard,
} from 'lucide-react';
import { getCookie } from 'cookies-next';

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: any;
  tone: 'primary' | 'neutral' | 'danger';
};

function tokenPreview(token: string) {
  if (!token) return '—';
  const clean = String(token).replace(/^Bearer\s+/i, '');
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 10)}…${clean.slice(-8)}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // ✅ evita mismatch: só renderiza coisas variáveis (cookie/data) depois do mount
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(''); // token "limpo"

  useEffect(() => {
    setMounted(true);
    const raw = String(getCookie('token') ?? '');
    setToken(raw.replace(/^Bearer\s+/i, '').trim());
  }, []);

  const dateLabel = useMemo(() => {
    if (!mounted) return '—';
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [mounted]);

  const authStatus = mounted ? (token ? 'Autenticado' : 'Não autenticado') : '—';

  const quickActions: QuickAction[] = [
    {
      title: 'Agendamentos',
      description: 'Listar e filtrar agendamentos do sistema',
      href: '/admin/acoes/agendamentos',
      icon: CalendarCheck,
      tone: 'primary',
    },
    {
      title: 'Pagamentos em espécie',
      description: 'Aprovar ou rejeitar agendamentos pagos em espécie',
      href: '/admin/acoes/agendamentos-especie',
      icon: Banknote,
      tone: 'neutral',
    },
    {
      title: 'Clientes',
      description: 'Deletar ou reativar clientes por ID',
      href: '/admin/acoes/clientes',
      icon: Users,
      tone: 'neutral',
    },
    {
      title: 'Caçambas',
      description: 'Listar, editar e remover caçambas do inventário',
      href: '/admin/cacambas/listar',
      icon: Trash2,
      tone: 'danger',
    },
  ];

  const routines = [
    {
      title: 'Verificar pagamentos pendentes',
      subtitle: 'Acesse “Agendamentos em espécie” e resolva pendências',
    },
    {
      title: 'Conferir agendamentos do dia',
      subtitle: 'Use filtros por data e status em “Agendamentos”',
    },
    {
      title: 'Checar caçambas disponíveis',
      subtitle: 'Atualize status das caçambas conforme inventário',
    },
    {
      title: 'Revisar clientes bloqueados',
      subtitle: 'Reativar clientes quando necessário',
    },
  ];

  const operationalTips = [
    {
      title: 'Fluxo recomendado (Pagamentos)',
      text: 'Pix: o cliente paga e o status deve refletir. Espécie: o Admin precisa aprovar.',
      icon: CreditCard,
    },
    {
      title: 'Caçambas',
      text: 'Mantenha “Disponível/Indisponível” atualizado pra evitar agendamento inválido.',
      icon: Trash2,
    },
    {
      title: 'Segurança',
      text: 'Se algo “parecer logado” e não deveria, limpe o cookie/token e teste o middleware.',
      icon: ShieldCheck,
    },
  ];

  const toneClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    neutral: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white',
  } as const;

  const toneIcon = {
    primary: 'bg-white/15 text-white',
    neutral: 'bg-white text-gray-700',
    danger: 'bg-red-100 text-red-700 group-hover:bg-white/15 group-hover:text-white',
  } as const;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminDashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6 md:p-10 space-y-8">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-900">
                <LayoutDashboard className="w-6 h-6" />
                <h1 className="text-3xl font-bold">Dashboard Admin</h1>
              </div>
              <p className="text-gray-600 mt-2 capitalize flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                {dateLabel}
              </p>
            </div>

            <button
              onClick={() => router.push('/admin/acoes/agendamentos')}
              className="h-12 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Ir para Agendamentos <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Status</div>

                  {/* ✅ sem mismatch: placeholder até montar */}
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-bold">
                    {authStatus}
                    {mounted && token ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Info className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-3">
                    Token (preview):{' '}
                    <span className="font-mono">{mounted ? tokenPreview(token) : '—'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">O que fazer primeiro</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Se tiver pagamento em espécie, aprove/rejeite antes de finalizar rotinas do dia.
                  </p>
                  <button
                    onClick={() => router.push('/admin/acoes/agendamentos-especie')}
                    className="mt-4 inline-flex items-center gap-2 font-bold text-amber-800 hover:text-amber-900 underline"
                  >
                    Abrir pagamentos em espécie <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Atalhos</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Use os botões abaixo para navegar rápido sem “caçar” no menu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Ações rápidas</h2>
            <p className="text-gray-600 mt-1">O essencial do Admin em 1 clique.</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.title}
                    onClick={() => router.push(a.href)}
                    className={`group text-left rounded-2xl p-5 transition ${toneClasses[a.tone]}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold">{a.title}</div>
                        <div className={`text-sm mt-2 ${a.tone === 'primary' ? 'text-white/90' : 'text-gray-700 group-hover:text-inherit'}`}>
                          {a.description}
                        </div>
                      </div>

                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneIcon[a.tone]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className={`mt-5 font-bold flex items-center gap-2 ${a.tone === 'primary' ? 'text-white' : ''}`}>
                      Acessar <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rotina + Dicas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Rotina do Admin</h2>
              <p className="text-gray-600 mt-1">Checklist rápido (sem depender de API).</p>

              <div className="mt-5 space-y-4">
                {routines.map((r) => (
                  <div key={r.title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{r.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Dicas operacionais</h2>
              <p className="text-gray-600 mt-1">Informações úteis sobre o fluxo do sistema.</p>

              <div className="mt-5 space-y-4">
                {operationalTips.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white text-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{t.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{t.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm">
                <b>Dica:</b> quando você quiser integrar, dá pra usar o <b>Total</b> das listagens e mostrar números reais aqui.
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            DiskEntulho • Painel Administrativo
          </div>
        </main>
      </div>
    </div>
  );
}
