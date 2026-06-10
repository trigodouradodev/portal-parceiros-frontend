import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h2 className="text-3xl font-bold">404</h2>
      <p className="text-gray-600">Página não encontrada.</p>
      <Link to="/" className="text-blue-600 underline">
        Voltar ao início
      </Link>
    </div>
  );
}
