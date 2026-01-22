'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/src/components/dashboard-header';
import { DashboardSidebar } from '@/src/components/dashboard-sidebar';
import { apiFetch } from '@/src/lib/api';
import {
  Loader2,
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  Save,
  RefreshCw,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';

type ApiResponse<T> = {
  status: boolean;
  mensagem: string;
  dados: T | null;
};

type UsuarioResponseDTO = {
  id: number;
  Id?: number;

  name: string;
  Name?: string;

  cpf: string;
  Cpf?: string;

  email: string;
  Email?: string;

  phone: string;
  Phone?: string;

  isAdmin: boolean;
  IsAdmin?: boolean;
};

type UsuarioUpdateDTO = {
  Name?: string | null;
  Email?: string | null;
  Phone?: string | null;
  NewPassword?: string | null;
};

function pickString(obj: any, camel: string, pascal: string) {
  return (obj?.[camel] ?? obj?.[pascal] ?? '') as string;
}
function pickBool(obj: any, camel: string, pascal: string) {
  const v = obj?.[camel] ?? obj?.[pascal];
  return Boolean(v);
}
function pickNumber(obj: any, camel: string, pascal: string) {
  const v = obj?.[camel] ?? obj?.[pascal];
  return typeof v === 'number' ? v : Number(v ?? 0);
}

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dados originais (pra comparar mudanças)
  const [original, setOriginal] = useState<UsuarioResponseDTO | null>(null);

  // form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const cpf = useMemo(() => {
    if (!original) return '—';
    return pickString(original, 'cpf', 'Cpf') || '—';
  }, [original]);

  const isAdmin = useMemo(() => {
    if (!original) return false;
    return pickBool(original, 'isAdmin', 'IsAdmin');
  }, [original]);

  const loadPerfil = async () => {
    setLoading(true);
    setError(null);

    try {
      const json = await apiFetch<ApiResponse<UsuarioResponseDTO>>(
        '/api/Usuario/VisualizarPerfil',
        { method: 'GET', cache: 'no-store' }
      );

      if (!json.status || !json.dados) {
        throw new Error(json.mensagem || 'Falha ao carregar perfil.');
      }

      const dados = json.dados;

      setOriginal(dados);

      setName(pickString(dados, 'name', 'Name'));
      setEmail(pickString(dados, 'email', 'Email'));
      setPhone(pickString(dados, 'phone', 'Phone'));

      // senha sempre vazia
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Erro ao carregar perfil.');
      setOriginal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salvar = async () => {
    if (!original) return;

    // validação de senha (backend exige min 6) :contentReference[oaicite:4]{index=4}
    if (newPassword) {
      if (newPassword.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('As senhas não conferem.');
        return;
      }
    }

    // monta DTO somente com campos preenchidos e (opcional) alterados
    const originalName = pickString(original, 'name', 'Name');
    const originalEmail = pickString(original, 'email', 'Email');
    const originalPhone = pickString(original, 'phone', 'Phone');

    const dto: UsuarioUpdateDTO = {};

    if (name.trim() && name.trim() !== originalName) dto.Name = name.trim();
    if (email.trim() && email.trim() !== originalEmail) dto.Email = email.trim();
    if (phone.trim() && phone.trim() !== originalPhone) dto.Phone = phone.trim();
    if (newPassword) dto.NewPassword = newPassword;

    const hasAnyChange =
      dto.Name !== undefined ||
      dto.Email !== undefined ||
      dto.Phone !== undefined ||
      dto.NewPassword !== undefined;

    if (!hasAnyChange) {
      alert('Nada para atualizar.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const json = await apiFetch<ApiResponse<UsuarioResponseDTO>>(
        '/api/Usuario/AtualizarPerfil',
        {
          method: 'PUT',
          body: JSON.stringify(dto),
        }
      );

      if (!json.status || !json.dados) {
        throw new Error(json.mensagem || 'Falha ao atualizar perfil.');
      }

      alert(json.mensagem || 'Perfil atualizado com sucesso!');

      // atualiza tela com o retorno do backend
      const dados = json.dados;
      setOriginal(dados);

      setName(pickString(dados, 'name', 'Name'));
      setEmail(pickString(dados, 'email', 'Email'));
      setPhone(pickString(dados, 'phone', 'Phone'));

      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Erro ao salvar perfil.');
      alert(e?.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-600 mt-2">
                Visualize e atualize seus dados básicos (nome, email, telefone e senha).
              </p>
            </div>

            <button
              onClick={loadPerfil}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
          </div>

          <div className="max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <b>Problema:</b> {error}
                </div>
              </div>
            )}

            {/* Header do cartão */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>

                <div>
                  <div className="text-lg font-extrabold text-gray-900">
                    {loading ? 'Carregando…' : (name || '—')}
                  </div>
                  <div className="text-sm text-gray-600">
                    CPF: <span className="font-mono">{cpf}</span>
                  </div>
                </div>
              </div>

              {original && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-bold">
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  {isAdmin ? 'Admin' : 'Cliente'}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-gray-600 py-10">
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando perfil...
              </div>
            ) : (
              <>
                {/* Campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(xx) xxxxx-xxxx"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Permissão
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={isAdmin ? 'Admin' : 'Cliente'}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Alterar senha */}
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-extrabold text-gray-900">Alterar senha</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Nova senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="mínimo 6 caracteres"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Confirmar senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="repita a nova senha"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Se você não preencher senha, ela não será alterada.
                  </p>
                </div>

                {/* Ações */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={salvar}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar alterações
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
