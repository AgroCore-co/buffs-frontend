import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { login, user, isAuthenticated, loading, getRedirectRoute } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para verificar sessão ativa e redirecionar automaticamente
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const destination = getRedirectRoute(user.cargo);
      router.replace(destination);
    }
  }, [loading, isAuthenticated, user, router, getRedirectRoute]);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email é obrigatório.';
    if (!password) newErrors.password = 'Senha é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email, password });
    } catch (err) {
      setErrors({
        general:
          err.message || 'Falha ao realizar login. Verifique suas credenciais.',
      });
      setIsSubmitting(false);
    }
  };

  // Se estiver carregando a sessão ou já estiver redirecionando, não mostra o form
  if (loading || (isAuthenticated && user)) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white">
        <p className="text-[#666]">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-[#404040]">
      {/* SEÇÃO DO FORMULÁRIO (ESQUERDA) */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col justify-center items-center px-8 sm:px-12 relative z-10 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[300px] flex flex-col items-center">
          <div className="mb-6 flex items-center justify-center">
            <Logo style={{ width: 90, height: 32 }} />
          </div>

          <h1 className="text-2xl font-bold text-[#43310b] mb-1.5">
            Bem-Vindo!
          </h1>
          <p className="text-xs text-[#838181] text-center mb-6 leading-relaxed">
            Faça login com os dados inseridos
            <br />
            durante seu cadastro.
          </p>

          {/* Alerta de Erro Geral */}
          {errors.general && (
            <div className="w-full bg-[#fff5f5] text-[#e90000] text-[11px] font-medium py-2.5 px-4 rounded border border-[#ffe0e0] mb-5 text-center animate-in fade-in duration-300">
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-5"
            noValidate
          >
            {/* Input de Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                disabled={isSubmitting}
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`peer w-full border ${errors.email ? 'border-red-500' : 'border-[#b0b0b0]'} rounded-md py-2.5 px-3 pr-10 text-sm bg-white text-[#43310b] focus:outline-none focus:border-[#ffcf78] focus:ring-1 focus:ring-[#ffcf78] transition-colors`}
              />
              <label
                htmlFor="email"
                className="absolute left-3 bg-white px-1 font-medium z-10 transition-all duration-200 pointer-events-none
                           -top-[7px] translate-y-0 text-[10px] text-[#404040]
                           peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#838181]
                           peer-focus:-top-[7px] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#404040]"
              >
                Email
              </label>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838181] pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-500 absolute -bottom-4 left-1">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Input de Senha */}
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                disabled={isSubmitting}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`peer w-full border ${errors.password ? 'border-red-500' : 'border-[#b0b0b0]'} rounded-md py-2.5 px-3 pr-10 text-sm bg-white text-[#43310b] focus:outline-none focus:border-[#ffcf78] focus:ring-1 focus:ring-[#ffcf78] transition-colors`}
              />
              <label
                htmlFor="password"
                className="absolute left-3 bg-white px-1 font-medium z-10 transition-all duration-200 pointer-events-none
                           -top-[7px] translate-y-0 text-[10px] text-[#404040]
                           peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#838181]
                           peer-focus:-top-[7px] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#404040]"
              >
                Senha
              </label>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838181] hover:text-[#404040] focus:outline-none z-20"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <span className="text-[10px] text-red-500 absolute -bottom-4 left-1">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#ffcf78] hover:bg-[#f2b84d] text-[#43310b] font-bold py-2.5 rounded text-sm transition-colors mt-2 flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#43310b]/30 border-t-[#43310b] rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Divisor do Google */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[#f0f0f0]"></div>
            <span className="text-[11px] text-[#838181]">ou</span>
            <div className="h-px flex-1 bg-[#f0f0f0]"></div>
          </div>

          {/* Botão Google adaptado pro Tailwind */}
          <button
            type="button"
            disabled={isSubmitting}
            className="w-11 h-11 rounded-full border border-[#e5e5e5] flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Entrar com Google"
          >
            <Image
              src="/images/google-icon.svg"
              alt="Google"
              width={22}
              height={22}
            />
          </button>

          <div className="flex flex-col items-center gap-2 mt-8">
            <Link
              href="/auth/forgot-password"
              className="text-[11px] text-[#838181] hover:text-[#43310b] transition-colors"
            >
              Esqueci minha senha
            </Link>

            <p className="text-[11px] text-[#838181]">
              Não tem uma conta?{' '}
              <Link
                href="/auth/register"
                className="text-[#404040] hover:text-[#43310b] font-medium transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO DA IMAGEM (DIREITA) */}
      <div className="hidden md:block flex-1 bg-[#2c2621] relative overflow-hidden">
        <Image
          src="/images/login-bg.jpg"
          alt="Rebanho de Búfalos"
          fill
          priority
          sizes="(max-width: 768px) 0px, 100vw"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
