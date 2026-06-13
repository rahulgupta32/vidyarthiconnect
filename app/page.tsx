"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Brain, 
  Layers, 
  MessageSquare, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Globe2, 
  Sparkles,
  Lock,
  Search,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the AI recommendation engine work?",
      a: "Our smart matching engine evaluates your academic records, English proficiency test scores (IELTS/PTE/TOEFL), preferred study location, and budget constraints to calculate compatibility scores and flag risk levels (Safe, Moderate, Ambitious) for over 500+ courses."
    },
    {
      q: "Is my personal document data secure?",
      a: "Yes. VidyarthiiConnect does not store actual file binaries directly in our database. We use secure metadata records connected to a protected, private-by-default storage system. You retain full consent control over who (e.g. specific counselors or universities) can view or download your documents."
    },
    {
      q: "How do you handle Nepal Ministry of Education NOC applications?",
      a: "We have an integrated visa and NOC prep portal. We provide a step-by-step checklist of all required documents and templates, helping you organize the paperwork digitally so you can submit your NOC request with zero omissions."
    },
    {
      q: "Can I connect with a human counselor?",
      a: "Absolutely! VidyarthiiConnect combines AI recommendations with human expertise. Once you complete your profile, you are assigned a certified counselor for one-on-one document verification, application reviews, and mock visa interviews through our secure communication hub."
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#problem" className="hover:text-indigo-600 transition">Why Us</a>
              <a href="#how" className="hover:text-indigo-600 transition">How It Works</a>
              <a href="#benefits" className="hover:text-indigo-600 transition">Benefits</a>
              <a href="#packages" className="hover:text-indigo-600 transition">Pricing</a>
              <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold hover:text-indigo-600 transition">
                Sign In
              </Link>
              <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center gap-1">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-zinc-900/20 dark:via-zinc-950 dark:to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> AI-Powered Study Abroad Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
            Your Secure Path from <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Nepal</span> to the <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">World</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Digitize your study-abroad journey with absolute transparency. Discover top global universities, get smart recommendations, securely manage your documents, and complete applications.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-indigo-200 dark:shadow-none transition">
              Create Free Student Profile
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold px-8 py-3.5 rounded-full transition flex items-center justify-center gap-2">
              Book counseling
            </Link>
          </div>
          
          {/* Security Banner Badge */}
          <div className="mt-12 flex justify-center items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> OWASP Security Certified Architecture • Passkey Ready • GDPR/Data Consent Compliant
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="problem" className="py-20 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Consultancies shouldn't be a black box</h2>
            <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Traditional study-abroad workflows are plagued with hidden commissions, document vulnerabilities, and lack of clarity. We are here to fix that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Traditional Consultancy Card */}
            <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-rose-500 mb-6 flex items-center gap-2">
                ⚠️ Traditional Consultancies
              </h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Hidden commissions and steering students to partner colleges.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Hard-copy document losses, identity theft, or unsecured file transfers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Lack of application status tracking; student relies on constant follow-ups.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Opaque fees and unverified course requirements.
                </li>
              </ul>
            </div>

            {/* VidyarthiiConnect Card */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2">
                🛡️ VidyarthiiConnect Solution
              </h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /> Open commission analytics visible to admins; AI recommendations are unbiased.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /> Secure Document Vault storing only encrypted metadata, with user-controlled consent.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /> Interactive visual application tracker showing exactly where your admission stands.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /> Dynamic tuition fee estimates and scholarship verification checklists.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Stepper) */}
      <section id="how" className="py-20 bg-slate-50 dark:bg-zinc-900/10 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Your digital journey in 5 steps</h2>
            <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
              From creating a profile to booking visa slots, everything is handled transparently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { step: "01", title: "Build Profile", desc: "Input GPA, English scores, and budget." },
              { step: "02", title: "Get recommendations", desc: "Smart AI algorithm suggests ideal courses." },
              { step: "03", title: "Upload Files", desc: "Store files securely in the Document Vault." },
              { step: "04", title: "Track applications", desc: "View real-time status and timeline updates." },
              { step: "05", title: "Visa/NOC prep", desc: "Generate government checklists for Nepal." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-xl relative shadow-sm hover:translate-y-[-2px] transition">
                <div className="text-3xl font-extrabold text-indigo-600/30 dark:text-indigo-400/30 mb-4">{item.step}</div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Empowering Nepali students to succeed</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Brain,
                    title: "AI University Matchmaker",
                    desc: "Find universities based on budget levels and intake calendars. No more guesswork or biased suggestions."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Encrypted Document Locker",
                    desc: "Upload transcripts, passport copies, and bank letters safely. You explicitly approve when counselors can share them."
                  },
                  {
                    icon: MessageSquare,
                    title: "Direct Counselor Chat",
                    desc: "Instant message with certified experts who guide you on visa filing and mock interview sessions."
                  }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Designed for university partners too</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Users,
                    title: "Verified Student Profiles",
                    desc: "Review filtered leads matching exact admission criteria. GPA, transcripts, and credentials are pre-verified."
                  },
                  {
                    icon: Globe2,
                    title: "Secure Document Sharing",
                    desc: "Access student applications securely only after explicit student-consent, protecting GDPR requirements."
                  },
                  {
                    icon: Layers,
                    title: "Consolidated Pipeline",
                    desc: "Manage offers, request document revisions, and view conversion ratios inside a clean partner dashboard."
                  }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="bg-sky-50 dark:bg-sky-950 p-3 rounded-lg text-sky-600 dark:text-sky-400 flex-shrink-0">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex bg-slate-800 p-3 rounded-full mb-6">
            <Lock className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Enterprise-grade security by default</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            VidyarthiiConnect prioritizes data confidentiality. We build on top of modern security standards to protect your academic records.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "OWASP Top 10", desc: "Guards against cross-site scripting (XSS), request forgery (CSRF), and injection flaws." },
              { title: "No DB Binaries", desc: "No file binaries or base64 data are stored inside Neon PostgreSQL. We isolate files securely." },
              { title: "Access Consent", desc: "Student retains absolute control and permissions log auditing for every doc action." },
              { title: "Device Management", desc: "View and revoke active sessions to protect your account from suspicious logins." }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl text-left">
                <h3 className="font-bold text-lg text-indigo-400 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Packages */}
      <section id="packages" className="py-20 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose the right package for your goals</h2>
            <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Start searching for free and upgrade as your application progress requires advanced assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Free Plan", price: "NPR 0", desc: "University discovery and secure document metadata organizer.", features: ["University Search", "Document Vault Storage", "AI recommendations summary"] },
              { name: "Premium App", price: "NPR 15,000", desc: "Direct counseling and support for up to 3 university submissions.", features: ["Everything in Free", "Dedicated Counselor Assignment", "3 University Applications", "SOP AI Assistant"] },
              { name: "Visa Guidance", price: "NPR 10,000", desc: "Visa checklists, financial audit, and mock interviews.", features: ["Visa Checklist Builder", "Financial Verification", "2 Mock Visa Interviews", "NOC Checklist Prep"] },
              { name: "End-to-End Package", price: "NPR 25,000", desc: "Complete support from university selection to visa approval.", features: ["Unlimited Applications", "Personal Counselor", "Unlimited Mock Interviews", "Priority NOC Processing"] }
            ].map((pkg, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">{pkg.price}</div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">{pkg.desc}</p>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-400 mb-8">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="w-full bg-white dark:bg-zinc-800 border border-indigo-600 dark:border-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold py-2 rounded-full hover:bg-indigo-600 hover:text-white transition text-xs text-center">
                  Select Package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-zinc-900/10 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-zinc-400">Everything you need to know about the digital platform</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-base hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-indigo-600" /> : <ChevronDown className="h-5 w-5 text-indigo-600" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Ready to apply to your dream university?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Create your secure student account and start receiving matches within minutes.
          </p>
          <Link href="/signup" className="inline-block bg-white text-indigo-700 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-slate-100 transition ring-2 ring-white/40 focus:outline-none focus:ring-4 focus:ring-white/50">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
            VidyarthiiConnect
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <a href="#how" className="hover:text-white transition">How It Works</a>
          </div>
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} VidyarthiiConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
