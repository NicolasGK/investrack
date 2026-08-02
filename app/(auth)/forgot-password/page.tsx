"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (err) {
      setError("Une erreur est survenue. Vérifiez votre adresse email.");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Email envoyé"
        footer={
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 hover:underline underline-offset-2"
          >
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Mail size={26} className="text-emerald-600" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-medium text-neutral-900">
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-sm font-bold text-neutral-900 break-all">{email}</p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Vérifiez vos spams si vous ne le trouvez pas. Le lien expire dans 1 heure.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors underline underline-offset-2"
          >
            Renvoyer un email
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
      footer={
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 hover:underline underline-offset-2"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.fr"
            className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold py-3.5 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Envoi en cours…
            </>
          ) : (
            "Envoyer le lien"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
