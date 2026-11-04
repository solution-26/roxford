"use client";

import { Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* ----------------------------------------------------------------
   Briques d'interface de l'administration.
   Volontairement sobres : l'admin doit être lisible, pas spectaculaire.
   ---------------------------------------------------------------- */

export function Card({
  title,
  description,
  children,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_18px_44px_-38px_rgba(32,25,20,0.8)] sm:p-8">
      {(title || actions) && (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-xl font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const control =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[15px] text-ink outline-none transition-all placeholder:text-muted/70 focus:border-aqua focus:bg-surface focus:ring-4 focus:ring-aqua/15 disabled:opacity-55";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${control} resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${control} ${props.className ?? ""}`} />
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const styles = {
    primary: "bg-walnut text-cream hover:bg-walnut-deep",
    ghost: "border border-line bg-surface text-ink hover:bg-cream",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  }[variant];

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-55 ${styles} ${className ?? ""}`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm font-medium text-ink"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-aqua" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export function Banner({
  tone,
  children,
}: {
  tone: "info" | "ok" | "warn" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "border-aqua/30 bg-aqua/8 text-aqua-deep",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}
