import primeirosPassosHtml from "./primeiros-passos.html?raw";

/**
 * Manual "Primeiros Passos no Portal". Antes era um arquivo estático público
 * (public/ajuda); agora vive dentro do app, atrás do login (ProtectedRoute).
 * O HTML é auto-contido (sem scripts nem links externos) e roda isolado num
 * iframe, para o CSS dele não vazar para o app.
 */
export function PrimeirosPassosPage() {
  return (
    <iframe
      title="Primeiros Passos no Portal"
      srcDoc={primeirosPassosHtml}
      className="block h-dvh w-full border-0"
    />
  );
}
