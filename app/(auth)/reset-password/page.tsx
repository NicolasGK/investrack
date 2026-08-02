"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Token manquant = lien invalide ou expiré
  if (!token) {
    return (
      <AuthShell
        title="Lien invalide"
        footer={
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 hover:underline underline-offset-2"
          >
            <ArrowLeft size={14} />
            Demander un nouveau lien
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <ShieldAlert size={26} className="text-amber-500" />
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Ce lien de réinitialisation est invalide ou a expiré.
            <br />
            Faites une nouvelle demande.
          </p>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Mot de passe modifié"
        footer={null}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Check size={26} className="text-emerald-600" />
          </div>
          <p className="text-sm text-center text-neutral-600">
            Votre mot de passe a été mis à jour avec succès.
          </p>
          <button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-xl bg-neutral-900 text-white font-semibold py-3.5 hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            Se connecter
          </button>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (err) {
      setError("Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré.");
    } else {
      setDone(true);
    }
  };

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe solide d'au moins 8 caractères."
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
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 pr-11 text-sm font-medium text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl bg-neutral-100 px-3.5 py-3 pr-11 text-sm font-medium text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 transition-colors ${
                confirm && confirm !== password
                  ? "ring-2 ring-red-300 bg-red-50 focus:ring-red-400"
                  : "focus:ring-neutral-900/20 focus:bg-white"
              }`}
            />
            {confirm && confirm === password && (
              <Check
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold py-3.5 mt-1 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mise à jour…
            </>
          ) : (
            "Mettre à jour le mot de passe"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
