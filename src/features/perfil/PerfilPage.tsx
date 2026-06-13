import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/user-display";
import { useAuth } from "@/contexts/auth/auth-context";

export function PerfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <PageContainer withBottomNav>
      <PageHeader subtitle="Suas informações de acesso" />
      <div className="px-5 md:px-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-brand-navy">
              {getInitials(user?.full_name ?? "Parceiro")}
            </div>
            <div className="text-center">
              <p className="font-fraunces text-xl font-semibold text-foreground">
                {user?.full_name ?? "Parceiro"}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                {user?.role}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
