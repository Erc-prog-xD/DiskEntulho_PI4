import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; 

export function useAuth() {
  const router = useRouter();

  const logout = () => {
    Cookies.remove("token"); 

    router.push("/auth/login");
    
    router.refresh(); 
  };

  const getToken = () => {
    return Cookies.get("token");
  };

  const isAuthenticated = !!Cookies.get("token");

  return { logout, getToken, isAuthenticated };
}