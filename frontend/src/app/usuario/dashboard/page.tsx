'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/src/components/dashboard-header";
import { DashboardSidebar } from "@/src/components/dashboard-sidebar";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Info,
  CheckCircle2,
  Clock3,
  Activity,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Trash2,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { getCookie } from 'cookies-next';

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: any;
  tone: 'primary' | 'neutral';
};

function tokenPreview(token: string) {
  if (!token) return '—';
  const clean = String(token).replace(/^Bearer\s+/i, '');
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 10)}…${clean.slice(-8)}`;
}

export default function UsuarioDashboardPage() {
  const router = useRouter();

  // ✅ evita hydration mismatch (cookie/data)
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState('');

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

  const authStatus = mounted ? (token ? 'Sessão ativa' : 'Sessão ausente') : '—';

  const quickActions: QuickAction[] = [
    {
      title: 'Novo agendamento',
      description: 'Escolha data e solicite uma caçamba',
      href: '/agendamentos/novo',
      icon: CalendarDays,
      tone: 'primary',
    },
    {
      title: 'Meus agendamentos',
      description: 'Acompanhe status, datas e pagamentos',
      href: '/agendamentos',
      icon: ClipboardList,
      tone: 'neutral',
    },
    {
      title: 'Pagamentos',
      description: 'Pague por Pix / acompanhe pendências',
      href: '/agendamentos', // normalmente o pagamento nasce a partir do agendamento
      icon: CreditCard,
      tone: 'neutral',
    },
  ];

  const systemInfo = [
    { label: 'Ambiente', value: mounted ? (window.location.hostname.includes('localhost') ? 'Desenvolvimento (local)' : 'Produção') : '—' },
    { label: 'Rota atual', value: mounted ? window.location.pathname : '—' },
    { label: 'Navegador', value: mounted ? navigator.userAgent.split(')')[0] + ')' : '—' },
  ];

  const tips = [
    {
      title: 'Como funciona',
      text: 'Você escolhe o período, seleciona uma caçamba disponível e confirma o agendamento.',
      icon: Sparkles,
    },
    {
      title: 'Pagamentos',
      text: 'Pix costuma confirmar mais rápido. Em “espécie”, pode depender de aprovação do admin.',
      icon: CreditCard,
    },
    {
      title: 'Endereço de entrega',
      text: 'Mantenha seu endereço correto no momento do agendamento para evitar retrabalho.',
      icon: MapPin,
    },
    {
      title: 'Ajuda / Suporte',
      text: 'Se algo der errado (erro de sessão, pagamento travado), tente sair e entrar novamente.',
      icon: LifeBuoy,
    },
  ];

  const toneClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    neutral: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  } as const;

  const toneIcon = {
    primary: 'bg-white/15 text-white',
    neutral: 'bg-white text-gray-700',
  } as const;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6 md:p-10 space-y-8">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-900">
                <LayoutDashboard className="w-6 h-6" />
                <h1 className="text-3xl font-bold">Meu Painel</h1>
              </div>
              <p className="text-gray-600 mt-2 capitalize flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                {dateLabel}
              </p>
            </div>

            <button
              onClick={() => router.push('/agendamentos/novo')}
              className="h-12 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Novo agendamento <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Status / sistema (sem API, mas útil) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Status da sessão</div>

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
                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Caçambas</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Você agenda por período. O sistema mostra apenas caçambas disponíveis.
                  </p>
                  <button
                    onClick={() => router.push('/agendamentos/novo')}
                    className="mt-4 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-800 underline"
                  >
                    Ver disponibilidade <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Boas práticas</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Evite recarregar várias vezes no pagamento Pix. Se travar, volte e tente de novo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Ações rápidas</h2>
            <p className="text-gray-600 mt-1">O essencial para você acompanhar tudo.</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

          {/* Info do sistema + Dicas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Informações do sistema</h2>
              <p className="text-gray-600 mt-1">Dados úteis para diagnóstico (sem integração).</p>

              <div className="mt-5 space-y-3">
                {systemInfo.map((i) => (
                  <div
                    key={i.label}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="text-sm font-bold text-gray-700">{i.label}</div>
                    <div className="text-sm text-gray-600 text-right break-all">{i.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm">
                <b>Dica:</b> Se você reportar um problema, essas infos ajudam a identificar mais rápido.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Dicas rápidas</h2>
              <p className="text-gray-600 mt-1">Como usar o sistema sem dor de cabeça.</p>

              <div className="mt-5 space-y-4">
                {tips.map((t) => {
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

              <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm">
                <b>Objetivo:</b> acompanhar agendamentos e concluir pagamentos sem fricção.
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            DiskEntulho • Painel do Cliente
          </div>
        </main>
      </div>
    </div>
  );
}
