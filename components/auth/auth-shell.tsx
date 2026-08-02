import { TrendingUp } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <div className="h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-900/20">
              <TrendingUp size={30} className="text-emerald-400" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-emerald-400/10 -z-10 blur-sm" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Investrack</h1>
          <p className="text-sm text-neutral-500 mt-1">Suivez votre patrimoine</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl px-6 py-7 shadow-sm shadow-neutral-200/80 ring-1 ring-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900 mb-5">{title}</h2>
          {subtitle && (
            <p className="text-sm text-neutral-500 -mt-3 mb-5">{subtitle}</p>
          )}
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-sm text-neutral-500">{footer}</div>
        )}
      </div>
    </div>
  );
}
