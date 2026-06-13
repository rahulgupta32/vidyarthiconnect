"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, Phone, MapPin, Calendar, Globe } from "lucide-react";
import { Input, Label, Button, Card, FormError } from "@/components/ui/FormElements";

function InviteSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [checkingError, setCheckingError] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    nationality: "Nepali",
    currentAddress: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setCheckingError("Missing invitation token. Please use the complete link provided in your invite.");
      setLoadingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/auth/invite-details?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setCheckingError(data.error || "Failed to verify invitation token.");
        } else {
          setInviteDetails(data.invite);
        }
      } catch (err) {
        setCheckingError("An error occurred while validating the invitation. Please try again.");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (formData.password.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
          phone: formData.phone,
          dob: formData.dob,
          nationality: formData.nationality,
          currentAddress: formData.currentAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to complete account registration.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 3000);
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="text-center py-20 text-slate-600 dark:text-zinc-400">
        Verifying secure invitation token...
      </div>
    );
  }

  if (checkingError) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-sm text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Invitation Verification Failed</h2>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm rounded-xl p-4 mb-6 leading-relaxed">
          {checkingError}
        </div>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl transition text-sm shadow-xs"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-sm border border-slate-200 dark:border-zinc-800">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
          Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
        </Link>
        <h2 className="text-2xl font-extrabold mt-4 text-slate-800 dark:text-zinc-100">Accept Invitation</h2>
        <p className="text-sm text-slate-600 dark:text-zinc-300 mt-2">
          Set up credentials for your new <strong className="text-indigo-600 dark:text-indigo-400">{inviteDetails?.role}</strong> account
        </p>
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-xs text-slate-700 dark:text-zinc-300 mt-4 text-left">
          <strong>Invitee Name:</strong> {inviteDetails?.name} <br />
          <strong>Registered Email:</strong> {inviteDetails?.email}
        </div>
      </div>

      {submitError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm rounded-xl p-3 text-center mb-4 font-semibold">
          {submitError}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl p-3 text-center mb-4 font-semibold animate-pulse">
          Account created successfully! Redirecting you to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="+977-9841123456"
              />
            </div>
          </div>

          <div>
            <Label>Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nationality</Label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Nepali"
              />
            </div>
          </div>

          <div>
            <Label>Current Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Kathmandu, Nepal"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || success}
          className="w-full mt-6 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {submitting ? "Registering..." : "Complete Registration"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

export default function InviteSignupPage() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 flex justify-center items-center min-h-screen py-12 px-4">
      <Suspense fallback={<div className="text-slate-500">Loading form content...</div>}>
        <InviteSignupContent />
      </Suspense>
    </div>
  );
}
