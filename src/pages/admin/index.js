import React, { useState, useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import AcessoNegadoPage from "@/pages/auth/acesso-negado";

export default function AdminPage() {
    const { isDenied, loading } = useProtectedRoute(["ADMIN"]);
    const [count, setCount] = useState(0);
    const [actions, setActions] = useState([]);

    useEffect(() => {
        const mock = [
            { id: 1, text: "Usuário criado", time: "2m" },
            { id: 2, text: "Configuração atualizada", time: "10m" },
            { id: 3, text: "Backup concluído", time: "1h" },
        ];
        const timer = setTimeout(() => setActions(mock), 300);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <div>Carregando...</div>;
    if (isDenied) return <AcessoNegadoPage />;

    return (
        <main style={styles.container}>
            <section style={styles.card}>
                <h1 style={styles.title}>Admin — Teste</h1>
                <div style={styles.row}>
                    <div>
                        <p>Contador de teste:</p>
                        <div style={styles.counterRow}>
                            <button onClick={() => setCount((c) => c - 1)} style={styles.btn}>
                                −
                            </button>
                            <div style={styles.count}>{count}</div>
                            <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
                                +
                            </button>
                        </div>
                    </div>
                    <div>
                        <p>Últimas ações:</p>
                        <ul style={styles.list}>
                            {actions.length === 0 ? (
                                <li style={styles.listItem}>Carregando...</li>
                            ) : (
                                actions.map((a) => (
                                    <li key={a.id} style={styles.listItem}>
                                        <strong>{a.text}</strong> <span style={styles.time}>{a.time}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    );
}

const styles = {
    container: {
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#222",
    },
    card: {
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        background: "#fff",
    },
    title: {
        margin: "0 0 16px 0",
        fontSize: 20,
    },
    row: {
        display: "flex",
        gap: 40,
        alignItems: "flex-start",
    },
    counterRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    btn: {
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#f6f6f6",
        cursor: "pointer",
        fontSize: 16,
    },
    count: {
        minWidth: 40,
        textAlign: "center",
        fontWeight: 600,
    },
    list: {
        marginTop: 8,
        paddingLeft: 16,
    },
    listItem: {
        marginBottom: 8,
    },
    time: {
        marginLeft: 8,
        color: "#666",
        fontSize: 12,
    },
};