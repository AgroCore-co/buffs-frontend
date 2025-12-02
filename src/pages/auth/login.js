import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Importação do Contexto
import styles from '@/styles/Login.module.css';
import Button from '@/components/ui/Button';

export default function Login() {
  // Adicionamos user, isAuthenticated, loading e getRedirectRoute ao destructuring
  const { login, user, isAuthenticated, loading, getRedirectRoute } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Renomeei para evitar conflito com 'loading' do contexto

  // 1. Efeito para verificar sessão ativa e redirecionar automaticamente
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const destination = getRedirectRoute(user.cargo);
      router.replace(destination); // 'replace' evita que o usuário volte ao login pelo botão Voltar
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
      // Chama a função login do AuthContext
      // O redirecionamento para /dashboard acontece dentro do Context em caso de sucesso
      await login({ email, password });
    } catch (err) {
      // Captura o erro vindo do api.js ou auth.service.js
      setErrors({
        general:
          err.message || 'Falha ao realizar login. Verifique suas credenciais.',
      });
      setIsSubmitting(false);
    }
  };

  // 2. Se estiver carregando a sessão ou já estiver redirecionando, não mostra o form
  if (loading || (isAuthenticated && user)) {
    return (
      <div className={`${styles.container} ${styles.loginPage}`}>
        {/* Você pode colocar um Spinner aqui se tiver um componente de Loader */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
          }}
        >
          <p style={{ color: '#666' }}>Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.loginPage}`}>
      <div className={styles.formSection}>
        <div className={styles.formBox}>
          {/* Logo adicionado aqui */}
          <div className={styles.logoContainer}>
            <Image
              src="/images/Logo-buffs.svg"
              alt="Logo Buff's"
              width={150}
              height={70}
              priority
            />
          </div>

          <h1 className={styles.title}>Bem-Vindo!</h1>
          <p className={styles.description}>
            Faça login com os dados inseridos durante seu cadastro.
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div
                className={styles.error}
                style={{ marginBottom: 12, textAlign: 'center' }}
              >
                {errors.general}
              </div>
            )}

            <div className={styles.inputGroup}>
              <input
                type="email"
                id="email"
                name="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder=" "
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
                disabled={isSubmitting}
              />
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <span className={styles.icon} aria-hidden="true">
                <Image
                  src="/images/icon_email.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </span>
              {errors.email && (
                <span id="email-error" className={styles.error}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder=" "
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
                disabled={isSubmitting}
              />
              <label htmlFor="password" className={styles.label}>
                Senha
              </label>
              <button
                type="button"
                className={styles.icon}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                tabIndex={0}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={
                    showPassword
                      ? '/images/not-view-password.svg'
                      : '/images/not-view-password-bloqued.svg'
                  }
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
              {errors.password && (
                <span id="password-error" className={styles.error}>
                  {errors.password}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="full"
              className={styles.loginButton}
              aria-busy={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Log in'}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            className={styles.googleCircleButton}
            disabled={isSubmitting}
            aria-label="Entrar com Google"
            style={{
              borderRadius: '50%',
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/images/google-icon.svg"
              alt="Google"
              className={styles.googleIcon}
              width={24}
              height={24}
            />
          </Button>

          <Link href="/auth/forgot-password" className={styles.forgotPassword}>
            Esqueci minha senha
          </Link>

          <p className={styles.signupLink}>
            Não tem uma conta?
            <Link href="/auth/register" className={styles.link}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      {/* SEÇÃO DA IMAGEM (AGORA NA DIREITA) */}
      <div className={styles.imageSection}></div>
    </div>
  );
}
