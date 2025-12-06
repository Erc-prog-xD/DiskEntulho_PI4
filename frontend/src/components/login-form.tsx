'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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

          <form className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <label htmlFor="username" className="text-xl font-semibold text-black">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                className="h-[65px] w-full rounded-lg border border-[#b1b1b1] px-7 text-xl text-[#2d2d2d] placeholder:text-[#2d2d2d] focus:border-[#0023C4] focus:outline-none focus:ring-1 focus:ring-[#0023C4]"
              />
            </div>

            <div className="flex flex-col gap-5">
              <label htmlFor="password" className="text-xl font-semibold text-black">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
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
            src="\assets\form-image.svg" 
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