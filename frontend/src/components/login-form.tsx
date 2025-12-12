'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

interface FormErrors {
  cpf?: string;
  password?: string;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  
  const [errors, setErrors] = useState<FormErrors>({});

  const isValidCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    
    setCpf(value);
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!password.trim()) {
      newErrors.password = "A senha é obrigatória.";
      isValid = false;
    }

    if (!cpf.trim()) {
      newErrors.cpf = "O CPF é obrigatório.";
      isValid = false;
    } else if (!isValidCPF(cpf)) {
      newErrors.cpf = "CPF inválido.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const cleanCpf = cpf.replace(/\D/g, ''); 

    try {
      const response = await fetch(`${apiUrl}/api/Auth/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cleanCpf, 
          password: password,
        }),
      });

      if (!response.ok) {
        alert("Usuário ou senha incorretos"); 
        return;
      }

      const data = await response.json();
      console.log("Login OK:", data);

      localStorage.setItem("token", data.token);

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-[535px]">
          
          <div className="mb-10">
            <Image
              src="/assets/disk-entulho.png" 
              alt="Logo Disk Entulho"
              width={193}
              height={193}
              className="object-contain w-[150px] h-auto" 
            />
          </div>

          <div className="flex flex-col gap-4 mb-16">
            <h1 className="text-4xl font-semibold text-black tracking-normal leading-normal">
              Entre com sua conta
            </h1>
            <p className="text-2xl font-light text-black tracking-normal leading-normal">
              Insira os dados cadastrados para acessar o sistema.
            </p>
          </div>

          <form className="flex flex-col gap-8" onSubmit={handleLogin} noValidate>
            <div className="flex flex-col gap-2">
              <label htmlFor="Cpf" className="text-xl font-semibold text-black">
                CPF
              </label>
              <input
                id="Cpf"
                type="text"
                placeholder="Digite seu CPF"
                value={cpf}
                onChange={handleCpfChange}
                className="h-[65px] w-full rounded-lg border border-[#b1b1b1] px-7 text-xl text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:border-[#0023C4] focus:outline-none focus:ring-1 focus:ring-[#0023C4]"
                />
                 {errors.cpf && (
                  <span className="text-red-500 text-sm font-medium ml-1">{errors.cpf}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xl font-semibold text-black">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={handlePasswordChange}
                  className="h-[65px] w-full rounded-lg border border-[#b1b1b1] px-7 pr-14 text-xl text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:border-[#0023C4] focus:outline-none focus:ring-1 focus:ring-[#0023C4]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.password}</span>
              )}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="flex h-[65px] w-full items-center justify-center rounded-lg bg-[#0023C4] text-2xl font-semibold text-white transition-colors hover:bg-blue-800"
              >
                Login
              </button>
            </div>

          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-[#0023C4] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
              <Image 
                src="/assets/bg-image.png" 
                alt="Background details"
                fill
                className="object-cover opacity-50 mix-blend-overlay"
              />
        </div>

        <div className="relative w-full max-w-[633px] aspect-square p-10 z-10">
          <Image
            src="/assets/form-image.svg" 
            alt="Ilustração login"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}