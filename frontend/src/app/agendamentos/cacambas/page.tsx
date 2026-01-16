import { Suspense } from "react";
import CacambasDisponiveisClient from "./CacambasDisponiveisClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Carregando caçambas...</div>}>
      <CacambasDisponiveisClient />
    </Suspense>
  );
}
