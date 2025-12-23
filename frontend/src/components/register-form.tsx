'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { Eye, EyeOff } from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  password?: string;
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      } else {
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
      }
    }
    
    setPhone(value);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = "O nome é obrigatório.";
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "O nome deve ter no mínimo 3 caracteres.";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Formato de e-mail inválido.";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "O telefone é obrigatório.";
      isValid = false;
    }

    if (!cpf.trim()) {
      newErrors.cpf = "O CPF é obrigatório.";
      isValid = false;
    } else if (!isValidCPF(cpf)) {
      newErrors.cpf = "CPF inválido.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "A senha é obrigatória.";
      isValid = false;
    } else if (password.length < 6) {
        newErrors.password = "A senha deve ter no mínimo 6 caracteres.";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    const apiUrl = "http://localhost:8080";
    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanTelefone = phone.replace(/\D/g, '');

    try {
      const response = await fetch(`${apiUrl}/api/Auth/Register`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: cleanTelefone,
          cpf: cleanCpf, 
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Erro ao criar conta.");
        return;
      }

      const data = await response.json();
      console.log("Registro OK:", data);

      alert("Conta criada com sucesso!");

    } catch (error) {
      console.error("Erro ao registrar:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      <div className="flex flex-1 flex-col justify-center px-8 py-8 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-[520px]">
          
          <div className="mb-2">
            <Image
              src="/assets/disk-entulho.png" 
              alt="Logo Disk Entulho"
              width={193}
              height={193}
              className="object-contain w-[135px] h-auto" 
            />
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <h1 className="text-[2.5rem] font-semibold text-black tracking-normal leading-tight">
              Crie sua conta
            </h1>
            <p className="text-xl font-light text-black tracking-normal leading-normal">
              Preencha os campos abaixo para começar.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleRegister} noValidate>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="nome" className="text-lg font-semibold text-black">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={handleNameChange}
                className={`h-[56px] w-full rounded-lg border px-6 text-lg text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:outline-none focus:ring-1 transition-colors
                  ${errors.name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#b1b1b1] focus:border-[#0023C4] focus:ring-[#0023C4]'
                  }`}
              />
              {errors.name && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.name}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-lg font-semibold text-black">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={handleEmailChange}
                className={`h-[56px] w-full rounded-lg border px-6 text-lg text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:outline-none focus:ring-1 transition-colors
                  ${errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#b1b1b1] focus:border-[#0023C4] focus:ring-[#0023C4]'
                  }`}
              />
              {errors.email && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="telefone" className="text-lg font-semibold text-black">
                Telefone
              </label>
              <input
                id="telefone"
                type="text"
                placeholder="(00) 00000-0000"
                maxLength={15}
                value={phone}
                onChange={handlePhoneChange}
                className={`h-[56px] w-full rounded-lg border px-6 text-lg text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:outline-none focus:ring-1 transition-colors
                  ${errors.phone 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#b1b1b1] focus:border-[#0023C4] focus:ring-[#0023C4]'
                  }`}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.phone}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="cpf" className="text-lg font-semibold text-black">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={cpf}
                onChange={handleCpfChange}
                className={`h-[56px] w-full rounded-lg border px-6 text-lg text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:outline-none focus:ring-1 transition-colors
                  ${errors.cpf 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#b1b1b1] focus:border-[#0023C4] focus:ring-[#0023C4]'
                  }`}
              />
              {errors.cpf && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.cpf}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-lg font-semibold text-black">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`h-[56px] w-full rounded-lg border px-6 pr-14 text-lg text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:outline-none focus:ring-1 transition-colors
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-[#b1b1b1] focus:border-[#0023C4] focus:ring-[#0023C4]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm font-medium ml-1">{errors.password}</span>
              )}
            </div>

            <div className="mt-3">
              <button
                type="submit"
                className="flex h-[56px] w-full items-center justify-center rounded-lg bg-[#0023C4] text-xl font-semibold text-white transition-colors hover:bg-blue-800"
              >
                Cadastrar
              </button>
            </div>

            <div className="text-center mt-1">
              <p className="text-base text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/?login" className="font-semibold text-[#0023C4] hover:underline">
                  Faça login
                </Link>
              </p>
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
            alt="Ilustração registro"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}