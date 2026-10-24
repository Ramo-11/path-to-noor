"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { adminCall } from "./api";
import type { EditableUser } from "./types";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

interface Props {
  open: boolean;
  user: EditableUser | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function UserFormDialog({ open, user, onClose, onSaved }: Props) {
  if (!open) return null;
  return <UserForm key={user?._id ?? "new"} user={user} onClose={onClose} onSaved={onSaved} />;
}

function UserForm({ user, onClose, onSaved }: Omit<Props, "open">) {
  const editing = user !== null;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [userType, setUserType] = useState(user?.userType ?? "");
  const [track, setTrack] = useState(user?.track ?? "");
  const [language, setLanguage] = useState(user?.preferredLanguage ?? "en");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [verified, setVerified] = useState(user?.verified ?? false);
  const [mode, setMode] = useState<"invite" | "password">("invite");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailChanged = editing && email.trim().toLowerCase() !== user.email;

  function onEmailChange(value: string) {
    setEmail(value);
    if (editing && value.trim().toLowerCase() !== user!.email) setVerified(false);
    else if (editing) setVerified(user!.verified);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const common = {
      name,
      email,
      userType: userType || null,
      track: track || null,
      preferredLanguage: language,
    };
    const result = editing
      ? await adminCall(`/api/admin/users/${user._id}`, "PATCH", { ...common, isActive, emailVerified: verified })
      : await adminCall("/api/admin/users", "POST", {
          ...common,
          mode,
          password: mode === "password" ? password : undefined,
        });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (editing) {
      onSaved("User saved.");
    } else if (mode === "invite") {
      onSaved(
        result.data?.emailSent === false
          ? "Account created, but the invitation email could not be sent. Use Send password reset to try again."
          : `Invitation sent to ${email.trim().toLowerCase()}.`
      );
    } else {
      onSaved("User created.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 id="user-form-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {editing ? "Edit user" : "Add user"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="p-5 space-y-4">
          {error ? (
            <div role="alert" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="uf-name" className={labelClass}>Name</label>
            <input id="uf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="uf-email" className={labelClass}>Email</label>
            <input id="uf-email" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="uf-type" className={labelClass}>Type</label>
              <select id="uf-type" value={userType} onChange={(e) => setUserType(e.target.value)} className={inputClass}>
                <option value="">None</option>
                <option value="revert">New Muslim</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
            <div>
              <label htmlFor="uf-track" className={labelClass}>Track</label>
              <select id="uf-track" value={track} onChange={(e) => setTrack(e.target.value)} className={inputClass}>
                <option value="">None</option>
                <option value="curious">Curious</option>
                <option value="new">New to Islam</option>
                <option value="muslim">Muslim</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="uf-language" className={labelClass}>Language</label>
            <select id="uf-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          {editing ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                Active (can sign in)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                {emailChanged ? "Mark the new email as verified" : "Email verified"}
              </label>
              {emailChanged && !verified ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Changing the email clears verification unless you tick this box.
                </p>
              ) : null}
            </div>
          ) : (
            <fieldset className="space-y-3">
              <legend className={labelClass}>How should they get in?</legend>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="radio" name="uf-mode" checked={mode === "invite"} onChange={() => setMode("invite")} className="mt-0.5" />
                <span>Send an invitation email. They choose their own password and the email counts as verified once they do.</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="radio" name="uf-mode" checked={mode === "password"} onChange={() => setMode("password")} className="mt-0.5" />
                <span>Set a temporary password now. The email counts as verified.</span>
              </label>
              {mode === "password" ? (
                <div className="relative">
                  <input
                    id="uf-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="8+ characters, upper, lower, number"
                    aria-label="Temporary password"
                    className={`${inputClass} pe-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              ) : null}
            </fieldset>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : mode === "invite" ? "Send invitation" : "Create user"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
