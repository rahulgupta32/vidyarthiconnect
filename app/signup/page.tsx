"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Mail, Lock, User, Phone, MapPin, Calendar, Globe } from "lucide-react";

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
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
          </Link>
          <h2 className="text-2xl font-bold mt-4">Create Student Profile</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Start your transparent study-abroad journey</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm rounded-lg p-3 text-center mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg p-3 text-center mb-4">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                placeholder="Rohan Shrestha"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="rohan@example.com"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="+977-9841123456"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Nationality</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="Nepali"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Current Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="Kathmandu, Nepal"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" required className="rounded accent-indigo-600 h-4 w-4" />
            <span className="text-xs text-slate-500">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
