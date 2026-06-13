import { useState } from "react";
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
import { useToast } from "@/contexts/toast/toast-context";

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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        showToast("E-mail ou senha inválidos", { variant: "destructive" });
        return;
      }

      showToast("Erro inesperado. Tente novamente em alguns instantes.", {
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

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

              <Button
                type="submit"
                variant="default"
                className="mt-1 h-10 w-full text-sm font-semibold"
                disabled={isSubmitting}
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
