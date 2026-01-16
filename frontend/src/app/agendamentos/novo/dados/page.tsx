import { Suspense } from "react";
import NovoAgendamentoDadosClient from "./NovoAgendamentoDadosClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <NovoAgendamentoDadosClient />
    </Suspense>
  );
}
