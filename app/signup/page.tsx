"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Phone, MapPin, Calendar, Globe } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    nationality: "Nepali",
    currentAddress: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 flex justify-center items-center min-h-screen py-12 px-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl w-full max-w-lg shadow-sm">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
          </Link>
          <h2 className="text-2xl font-extrabold mt-4 text-slate-800 dark:text-zinc-100">Create your student account</h2>
          <p className="text-sm text-slate-650 dark:text-zinc-400 mt-2">
            Start your study-abroad journey with secure profile building, verified university discovery, document checklists, and AI-powered guidance.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 mt-4 text-left leading-normal">
            <strong>Notice:</strong> Counselor, University Partner, Admin, and SuperAdmin accounts are invitation-only and managed by VidyarthiiConnect.
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-450 text-sm font-semibold rounded-lg p-3 text-center mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-lg p-3 text-center mb-4">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-450 dark:text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Rohan Shrestha"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-450 dark:text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="rohan@example.com"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="+977-9841123456"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Nationality</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-400" />
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Nepali"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1.5 block">Current Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-455 dark:text-slate-400" />
                <input
                  type="text"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Kathmandu, Nepal"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" required className="rounded accent-indigo-600 h-4 w-4 cursor-pointer" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-650 hover:underline font-semibold">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-650 hover:underline font-semibold">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 mt-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/40 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-650 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
