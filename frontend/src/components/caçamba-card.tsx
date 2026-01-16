'use client';

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { useRouter, usePathname } from "next/navigation"; 

interface DumpsterCardProps {
  name: string
  volume: string
  price: string
  image: string
}

export function CacambaCard({ name, volume, price, image }: DumpsterCardProps) {
  const router = useRouter();
  const pathname = usePathname(); 

  const handleNavigation = () => {
    if (pathname?.startsWith('/admin')) {
      router.push('/admin/cacambas/confirmar');
    } else {
      router.push('/cacambas/confirmar');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg p-2 aspect-video flex items-center justify-center">
          <Image 
            src={image || "/placeholder.svg"} 
            alt={name} 
            width={220} 
            height={160} 
            className="w-full h-full object-contain" 
          />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
            <span className="bg-amber-400 text-amber-900 text-sm font-bold px-3 py-1.5 rounded-md">
              {volume}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-0.5">Preço</span>
              <span className="text-base font-bold text-gray-900">{price}</span>
            </div>
          </div>
        
        <button
          onClick={handleNavigation}
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Detalhes
        </button>
        </div>
      </CardContent>
    </Card>
  )
}