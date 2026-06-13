import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 p-2 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </span>
        </div>

        <h1 className="text-3xl font-extrabold mb-4">Terms of Service</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-xs mb-8">Last Updated: June 13, 2026</p>

        <div className="space-y-6 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">1. Acceptable Use</h2>
            <p>
              VidyarthiiConnect is a study abroad discovery and document management tool. You agree to provide true, accurate, and complete information, and you understand that falsifying transcripts, English proficiency scores, or passports is a violation of these terms and will result in immediate termination of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">2. Service Packages & Payments</h2>
            <p>
              Users can purchase counseling, application preparation, and visa verification service packages. Payments are currently processed under mock-checkout operations for evaluation. In production, payments are non-refundable once counselor review or university filing has commenced.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">3. Admission & Visa Disclaimer</h2>
            <p>
              <strong>AI recommendations and counseling resources are for guidance only.</strong> Admission and visa decisions are exclusively made by the respective universities, embassies, and government immigration departments. VidyarthiiConnect does not guarantee admission or visa approval, and cannot be held liable for visa rejections.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">4. NOC Prep future readiness</h2>
            <p>
              チェックlists regarding the No Objection Certificate (NOC) of Nepal are based on requirements set by the Ministry of Education, Science and Technology (MoEST) of Nepal. It is the student’s responsibility to check the latest government directives before submission.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
