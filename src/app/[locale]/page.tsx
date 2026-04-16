import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona a raiz do locale para o login
  // Como estamos dentro de [locale], o caminho já terá o prefixo do locale
  redirect('./auth/login');
}
