import React from 'react';
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import AcessoNegadoPage from "@/pages/auth/acesso-negado";

export default function FuncionarioPage() {
    const { isDenied, loading } = useProtectedRoute(["FUNCIONARIO"]);

    const handleClick = () => {
        console.log('Teste button clicked');
        alert('Teste');
    };

    if (loading) return <div>Carregando...</div>;
    if (isDenied) return <AcessoNegadoPage />;

    return (
        <main style={{ padding: 20, fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
            <h1>Teste</h1>
            <p>Esta é a página de funcionário.</p>
            <button onClick={handleClick}>Clique</button>
        </main>
    );
}