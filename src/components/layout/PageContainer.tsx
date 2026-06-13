import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export function PageContainer({
  children,
  className,
  withBottomNav = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 flex-1 flex-col max-w-md md:mx-0 md:max-w-full",
        withBottomNav && "pb-24 md:pb-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
