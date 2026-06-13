"use client";

import { useState } from "react";
import { 
  CreditCard, 
  CheckCircle, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  FileText
} from "lucide-react";

export default function StudentPayments() {
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("eSewa");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const packages = [
    {
      id: "pkg-premium-app",
      name: "Premium Application Package",
      price: 15000,
      desc: "Dedicated counselor assignment and up to 3 university submissions.",
      features: [
        "Personal counselor assignment",
        "Document vault verification",
        "Up to 3 university application drafts",
        "AI SOP reviewer assistance"
      ]
    },
    {
      id: "pkg-visa-guidance",
      name: "Visa Guidance Package",
      price: 10000,
      desc: "Comprehensive visa interview preparation and checklists.",
      features: [
        "Visa checklist builder access",
        "Financial document reviews",
        "2 Mock Visa interview sessions",
        "NOC checklist templates"
      ]
    },
    {
      id: "pkg-end-to-end",
      name: "Complete End-to-End Package",
      price: 25000,
      desc: "Full assistance from course selection to visa approval.",
      features: [
        "Unlimited university applications",
        "Personal counselor support",
        "Unlimited mock interview attempts",
        "NOC MoEST portal guide support"
      ]
    }
  ];

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessReceipt(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          method: paymentMethod,
          transactionId: transactionId || `TXN-MOCK-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Checkout transaction failed.");
      } else {
        setSuccessReceipt({
          package: selectedPackage.name,
          amount: selectedPackage.price,
          vat: selectedPackage.price * 0.13,
          total: selectedPackage.price * 1.13,
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          method: paymentMethod,
          txnId: data.payment.transactionId,
          date: new Date().toLocaleDateString()
        });
        setSelectedPackage(null);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred during payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Service Packages & Invoices</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Enroll in our verified service packages and verify payment receipts digitally.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400 text-sm rounded-xl p-4 text-center font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Payment Receipt Voucher */}
      {successReceipt && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500/25 max-w-xl mx-auto rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Payment Verified Successfully!</h2>
            <p className="text-xs text-slate-400">Your digital receipt voucher</p>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-850 pt-4 divide-y divide-slate-150 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Service Package</span>
              <span className="font-bold">{successReceipt.package}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Invoice Number</span>
              <span className="font-bold text-indigo-600">{successReceipt.invoiceNumber}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Payment Method</span>
              <span className="font-bold uppercase">{successReceipt.method}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Transaction ID</span>
              <span className="font-mono text-slate-600 dark:text-zinc-350">{successReceipt.txnId}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Base Price</span>
              <span>NPR {successReceipt.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 font-semibold">Nepal VAT (13%)</span>
              <span>NPR {successReceipt.vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2.5 border-t-2 border-slate-200/50 pt-3">
              <span className="text-slate-800 dark:text-zinc-200 font-extrabold text-sm">Grand Total Paid</span>
              <span className="font-extrabold text-sm text-emerald-600">NPR {successReceipt.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-lg text-xxs text-slate-500 leading-normal text-center">
            Invoice generated automatically. A confirmation SMS was sent to your phone.
          </div>
        </div>
      )}

      {/* Package List Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-zinc-200 mb-2">{pkg.name}</h3>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-3">NPR {pkg.price.toLocaleString()}</div>
              <p className="text-xxs text-slate-400 leading-normal mb-5">{pkg.desc}</p>
              
              <ul className="space-y-2.5 text-xxs text-slate-600 dark:text-zinc-400 mb-6 border-t border-slate-50 dark:border-zinc-850 pt-4">
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => setSelectedPackage(pkg)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              Enroll Package <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Modal Form */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-850 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-650" /> Checkout Package
            </h2>
            <p className="text-xs text-slate-700 dark:text-zinc-300 mb-6">
              You are purchasing <strong className="text-slate-900 dark:text-white">{selectedPackage.name}</strong> for <strong className="text-slate-900 dark:text-white">NPR {selectedPackage.price.toLocaleString()}</strong>.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-xs text-slate-700 dark:text-zinc-300 mb-1.5 block">Payment Gateway (Mocked)</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-900 dark:text-zinc-100 cursor-pointer"
                >
                  <option value="eSewa" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">eSewa Mobile Wallet</option>
                  <option value="Khalti" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Khalti Wallet</option>
                  <option value="Stripe" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Stripe Credit Card</option>
                  <option value="Manual" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Manual Bank Deposit</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-700 dark:text-zinc-300 mb-1.5 block">Transaction ID / Reference Number</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-881023 (leave empty to autogenerate)"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-650 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                />
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl text-xxs text-slate-650 dark:text-zinc-400 leading-normal flex gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span>
                  Payments are secure and logged. Your counselor will be notified as soon as transaction validation completes.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-805 text-slate-700 dark:text-zinc-200 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-750 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {submitting ? "Verifying Transaction..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
