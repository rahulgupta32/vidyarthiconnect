"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Fingerprint, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);

  // Check search query parameters
  useEffect(() => {
    if (searchParams.get("registered")) {
      setError("Registration successful! Please sign in.");
    } else if (searchParams.get("expired")) {
      setError("Your session has expired. Please sign in again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      // Check if MFA is required (for Counselor, Admin, SuperAdmin, Partner)
      if (data.role !== "STUDENT") {
        setMfaRequired(true);
        setTempUser(data);
        setLoading(false);
        return;
      }

      // If Student, redirect immediately
      router.push("/student/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please check your connection.");
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulated MFA Verification code
    if (mfaCode === "123456" || mfaCode.length === 6) {
      // Complete login redirect
      const role = tempUser.role;
      if (role === "COUNSELOR") router.push("/counselor/dashboard");
      else if (role === "PARTNER") router.push("/partner/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "SUPERADMIN") router.push("/superadmin/dashboard");
      else router.push("/student/dashboard");
    } else {
      setError("Invalid 6-digit verification code. Try '123456' for testing.");
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!email) {
      setError("Please enter your email first to authenticate with passkeys");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Fetch passkey options from API
      const optionsRes = await fetch(`/api/auth/webauthn?action=authenticate&email=${encodeURIComponent(email)}`);
      const options = await optionsRes.json();

      if (!optionsRes.ok) {
        setError(options.error || "Failed to fetch passkey details");
        setLoading(false);
        return;
      }

      // 2. Simulate user device touch/credential verification
      // Real WebAuthn uses navigator.credentials.get({ publicKey: options })
      console.log("[PASSKEY] Requesting biometric assertion for credential ID:", options.allowCredentials[0].id);
      
      // Delay to simulate device touch
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Post assertion verification back to API
      const verifyRes = await fetch("/api/auth/webauthn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "authenticate",
          email,
          credential: {
            id: options.allowCredentials[0].id,
            rawId: "raw-id-data",
            type: "public-key",
          },
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "Biometric validation failed");
        setLoading(false);
        return;
      }

      // 4. Role based redirect
      const role = verifyData.role;
      if (role === "COUNSELOR") router.push("/counselor/dashboard");
      else if (role === "PARTNER") router.push("/partner/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "SUPERADMIN") router.push("/superadmin/dashboard");
      else router.push("/student/dashboard");
    } catch (err) {
      setError("Biometric login failed or was cancelled by user.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-sm">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
          Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
        </Link>
        <h2 className="text-2xl font-bold mt-4">Welcome Back</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Sign in to resume your application path</p>
      </div>

      {error && (
        <div className={`border text-sm rounded-lg p-3 text-center mb-4 ${
          error.includes("successful")
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400"
        }`}>
          {error}
        </div>
      )}

      {!mfaRequired ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-500 mb-1.5 block flex justify-between">
              Password
              <span className="text-indigo-600 hover:underline cursor-pointer text-xs">Forgot?</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Verifying..." : "Sign In with Credentials"} <ArrowRight className="h-4 w-4" />
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white dark:bg-zinc-900 px-4 text-xs text-slate-400 uppercase">
              Or Biometric
            </span>
          </div>

          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={loading}
            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <Fingerprint className="h-5 w-5 text-indigo-600" /> Sign In with Passkey
          </button>
        </form>
      ) : (
        /* Multi-Factor Authentication Code Verification Block */
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl text-center mb-6">
            <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm">Multi-Factor Authentication</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              For administrative roles, please input the 6-digit OTP code sent to your registered device.
            </p>
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-500 mb-1.5 block">MFA Code</label>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-indigo-600 focus:bg-white"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Verifying..." : "Verify Code"} <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMfaRequired(false)}
            className="w-full text-xs text-slate-500 hover:underline text-center block mt-2"
          >
            Back to Password Sign In
          </button>
        </form>
      )}

      <div className="text-center mt-6 text-xs text-slate-500">
        Don't have an account?{" "}
        <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 flex justify-center items-center min-h-screen py-12 px-4">
      <Suspense fallback={<div>Loading login page...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
