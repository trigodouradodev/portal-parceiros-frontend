import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AureaLogo } from "@/components/brand/AureaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth/auth-context";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const email = form.watch("email");
  const password = form.watch("password");
  const isSubmitting = form.formState.isSubmitting;
  const canSubmit =
    email.trim() !== "" && password.trim() !== "" && !isSubmitting;

  useEffect(() => {
    if (formError) {
      setFormError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear server error when user edits credentials
  }, [email, password]);

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      await login(values);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setFormError("E-mail ou senha incorretos. Tente novamente.");
          return;
        }
        if (!err.response) {
          setFormError(
            "Sem conexão. Verifique sua internet e tente novamente.",
          );
          return;
        }
      }

      setFormError("Erro inesperado. Tente novamente em alguns instantes.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-yellow px-4">
      <div className="mb-8 flex flex-col items-center">
        <AureaLogo />
        <p className="mt-2 font-sans text-sm text-brand-navy/60">
          Portal do Parceiro
        </p>
      </div>

      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="pb-6 pt-6">
          <h1 className="mb-1 font-fraunces text-xl font-semibold text-brand-navy">
            Bem-vindo de volta
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Acesse sua conta para continuar
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPwd ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          className="pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
                          aria-label={
                            showPwd ? "Ocultar senha" : "Mostrar senha"
                          }
                        >
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                variant="default"
                className="mt-1 h-10 w-full text-sm font-semibold"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Entrando…
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>

          <button
            type="button"
            className="mt-4 w-full text-center text-xs text-brand-navy/60 underline transition-colors hover:text-brand-navy"
          >
            Esqueci minha senha
          </button>
        </CardContent>
      </Card>

      <p className="mt-8 font-sans text-xs text-brand-navy/40">
        © 2026 Aurea · Todos os direitos reservados
      </p>
    </div>
  );
}
