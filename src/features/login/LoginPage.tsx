import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/auth/auth-context';
import { useToast } from '@/contexts/toast/toast-context';
import trigoLogo from '@/assets/logo.png';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const branding = {
  subtitle: 'Portal do Parceiro',
  title: 'Acesse o\nPortal do\nParceiro',
  description:
    'Gerencie suas cotações, contratos e pagamentos de forma simples e eficiente.',
};

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        showToast('E-mail ou senha inválidos', { variant: 'destructive' });
        return;
      }

      showToast('Erro inesperado. Tente novamente em alguns instantes.', {
        variant: 'destructive',
      });
    }
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
              <p className="text-sm 2xl:text-base text-[hsl(var(--muted-foreground))]">{branding.subtitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-extrabold leading-[1.1] tracking-tight whitespace-pre-line text-[hsl(var(--foreground))]">
              {branding.title}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-base xl:text-lg 2xl:text-xl max-w-md 2xl:max-w-lg leading-relaxed">
              {branding.description}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-[hsl(var(--destructive))]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-[hsl(var(--destructive))]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
