import { Search, Settings, Bell } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por algo..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 ml-8">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="/assets/woman-profile.png" alt="User" />
            <AvatarFallback >U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
