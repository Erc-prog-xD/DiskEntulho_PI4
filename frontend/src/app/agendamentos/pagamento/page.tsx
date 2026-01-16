import { Suspense } from "react";
import PagamentoAgendamentoClient from "./PagamentoAgendamentoClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Carregando pagamento...</div>}>
      <PagamentoAgendamentoClient />
    </Suspense>
  );
}
