"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "medium" : "strong";
  const strengthLabel = { weak: "Trop court", medium: "Correct", strong: "Fort" };
  const strengthColor = { weak: "bg-red-400", medium: "bg-amber-400", strong: "bg-emerald-500" };
  const strengthWidth = { weak: "w-1/3", medium: "w-2/3", strong: "w-full" };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await signUp.email({ name, email, password });
    if (err) {
      setError("Erreur lors de la création du compte. Cet email est peut-être déjà utilisé.");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const { error: err } = await signIn.social({ provider: "google", callbackURL: "/" });
    if (err) {
      setError("Erreur lors de la connexion avec Google.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Créer un compte"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-neutral-900 underline underline-offset-2"
          >
            Se connecter
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-60 mb-4"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
        Continuer avec Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <form onSubmit={handleSignUp} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Prénom</label>
          <input
            type="text"
            required
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marie"
            className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.fr"
            className="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
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

          {/* Jauge de force */}
          {passwordStrength && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthColor[passwordStrength]} ${strengthWidth[passwordStrength]}`}
                />
              </div>
              <p
                className={`text-[11px] font-medium ${
                  passwordStrength === "weak"
                    ? "text-red-500"
                    : passwordStrength === "medium"
                    ? "text-amber-500"
                    : "text-emerald-600"
                }`}
              >
                {passwordStrength === "strong" && (
                  <Check size={10} className="inline mr-0.5 -mt-0.5" />
                )}
                {strengthLabel[passwordStrength]}
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold py-3.5 mt-1 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Création…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
