import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
            <Shield className="h-6 w-6" />
          </span>
        </div>

        <h1 className="text-3xl font-extrabold mb-4">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-xs mb-8">Last Updated: June 13, 2026</p>

        <div className="space-y-6 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">1. Information We Collect</h2>
            <p>
              VidyarthiiConnect collects academic transcripts, identity documents (Passport, Citizenship certificate), test scores (IELTS/TOEFL/PTE), and personal information like email, phone, name, nationality, and DOB to process your study abroad applications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">2. Secure Storage and Consent</h2>
            <p>
              To maintain transparency and security, actual document files uploaded to your Document Vault are stored using protected cloud storage abstractions. Only document metadata is recorded in our database. We do not share your documents or data with our partner universities without your explicit consent, which is recorded and auditable at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">3. Data Subject Rights</h2>
            <p>
              You have the right to request deletion or export of your personal data at any time under privacy guidelines. Data removal requests can be raised through the Student Privacy Settings dashboard and will be processed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">4. Under-18 Students</h2>
            <p>
              If you are under the age of 18, we require explicit guardian consent. By signing up, you verify that you have obtained authorization from your parent or legal guardian to share academic and identity details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">5. Security Audit Logging</h2>
            <p>
              For security and safety, every action related to your account (logins, session creations, document uploads, document views/downloads, shares) is logged. These audit trails help prevent identity theft and secure your educational path.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
