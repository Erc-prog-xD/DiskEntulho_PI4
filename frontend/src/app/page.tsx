import { redirect } from "next/navigation";

export default function Home() {
  
  redirect("/auth/login");
  
  return (
    <div className="p-10">
      <h1>Bem-vindo ao Sistema (Dashboard)</h1>
    </div>
  );
}