import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import trigoLogo from '@/assets/logo.png';

// Flag para controlar o texto do painel esquerdo
const SHOW_DASHBOARD_BRANDING = false;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Preencha o e-mail e a senha');
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      console.error('[Login] Erro:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          showToast('E-mail ou senha inválidos');
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          showToast('Tempo de conexão esgotado. Tente novamente.');
        } else {
          showToast('Erro ao conectar com a API');
        }
      } else {
        showToast('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const brandingText = SHOW_DASHBOARD_BRANDING
    ? {
        subtitle: 'Dashboard BI',
        title: 'Acompanhe sua\nperformance em\ntempo real',
        description: 'Dashboard completo para análise de originação e cobrança com visões personalizadas por cargo.',
      }
    : {
        subtitle: 'Portal do Parceiro',
        title: 'Acesse o\nPortal do\nParceiro',
        description: 'Gerencie suas cotações, contratos e pagamentos de forma simples e eficiente.',
      };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--background))] flex-col justify-between p-8 xl:p-12 2xl:p-16">
          <div className="flex items-center gap-3">
            <img
              src={trigoLogo}
              alt="Trigo Dourado"
              className="w-12 h-12 2xl:w-14 2xl:h-14 object-contain"
            />
            <div>
              <h1 className="text-xl 2xl:text-2xl font-bold text-[hsl(var(--foreground))]">Trigo Dourado</h1>
              <p className="text-sm 2xl:text-base text-[hsl(var(--muted-foreground))]">{brandingText.subtitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-extrabold leading-[1.1] tracking-tight whitespace-pre-line text-[hsl(var(--foreground))]">
              {brandingText.title}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-base xl:text-lg 2xl:text-xl max-w-md 2xl:max-w-lg leading-relaxed">
              {brandingText.description}
            </p>
          </div>

          <div className="text-[hsl(var(--muted-foreground))] text-sm">
            <p>© 2025 Trigo Dourado. Todos os direitos reservados.</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[hsl(var(--muted))]">
          <div className="w-full max-w-md xl:max-w-lg space-y-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <img
                src={trigoLogo}
                alt="Trigo Dourado"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Acesso</h1>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-2xl xl:text-3xl font-bold text-[hsl(var(--foreground))]">Entrar</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-2">Insira seu e-mail para acessar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
