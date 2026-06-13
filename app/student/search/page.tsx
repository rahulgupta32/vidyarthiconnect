"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  GitCompare, 
  Plus, 
  ArrowRight,
  Info
} from "lucide-react";

function getCourseCostDetails(course: any) {
  const cost = course?.courseCost;
  const tuition = cost?.tuitionFeePerYear ?? course?.tuitionFee ?? 0;
  const appFee = cost?.applicationFee ?? course?.applicationFee ?? 0;
  const deposit = cost?.depositAmount ?? 0;
  const living = cost?.livingCostEstimate ?? 12000;
  const insurance = cost?.insuranceEstimate ?? 2000;
  const visa = cost?.visaFeeEstimate ?? 500;
  const travel = cost?.travelCostEstimate ?? 1500;
  
  const total = tuition + appFee + living + insurance + visa + travel;
  const scholarship = course?.scholarships && course.scholarships.length > 0 ? (course.scholarships[0]?.amount ?? 0) : 0;
  const selfFinance = Math.max(0, total - scholarship);
  const currency = cost?.currency ?? "USD";

  return {
    tuition,
    appFee,
    deposit,
    living,
    insurance,
    visa,
    travel,
    total,
    scholarship,
    selfFinance,
    currency
  };
}

export default function UniversitySearch() {
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedFee, setSelectedFee] = useState("all");
  const [onlyPartnered, setOnlyPartnered] = useState(false);

  // Comparison State
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const details0 = compareList[0] ? getCourseCostDetails(compareList[0]) : null;
  const details1 = compareList[1] ? getCourseCostDetails(compareList[1]) : null;

  // Load Search Data
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, rRes] = await Promise.all([
          fetch("/api/student/search"),
          fetch("/api/student/recommendations")
        ]);

        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(cData);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          setRecommendations(rData);
        }
      } catch (err) {
        console.error("Load search data error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApply = async (course: any) => {
    setApplyingId(course.id);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: course.universityId,
          courseId: course.id,
          intake: course.intakeDates.split(",")[0].trim() || "Fall 2026",
          notes: `Applied through AI recommended university search.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create application draft.");
      } else {
        setSuccessMsg(`Draft created successfully for ${course.title}!`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleToggleCompare = (course: any) => {
    const exists = compareList.find((c) => c.id === course.id);
    if (exists) {
      setCompareList(compareList.filter((c) => c.id !== course.id));
    } else {
      if (compareList.length >= 2) {
        alert("You can compare a maximum of 2 courses side-by-side.");
        return;
      }
      setCompareList([...compareList, course]);
    }
  };

  // Filter Logic
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.university.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = selectedCountry === "all" || c.university.country.name === selectedCountry;

    let matchesFee = true;
    if (selectedFee === "under-40k") {
      matchesFee = c.tuitionFee <= 40000;
    } else if (selectedFee === "above-40k") {
      matchesFee = c.tuitionFee > 40000;
    }

    const matchesPartner = !onlyPartnered || c.university.partnerStatus === "PARTNERED";

    return matchesSearch && matchesCountry && matchesFee && matchesPartner;
  });

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading university finder database...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">University & Program Finder</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Discover verified university courses, compare tuition rates, and review tailored AI recommendations.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 text-sm rounded-xl p-4 text-center font-semibold">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400 text-sm rounded-xl p-4 text-center font-semibold">
          {errorMsg}
        </div>
      )}

      {/* AI Recommendations Panel */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 shadow-xs relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Your AI Recommended Matches</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-full ${
                      rec.riskLevel === "SAFE" 
                        ? "bg-emerald-55 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                        : rec.riskLevel === "MODERATE"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        : "bg-rose-55 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                    }`}>
                      {rec.riskLevel} MATCH
                    </span>
                    <span className="text-xs font-bold text-indigo-600">{rec.score}% Match</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 mb-1">{rec.course.title}</h3>
                  <p className="text-xxs text-slate-400 mb-3">{rec.course.university.name} ({rec.course.university.country.name})</p>
                  
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg text-xxs leading-relaxed mb-4 text-slate-650 dark:text-zinc-355">
                    <strong>Why recommended:</strong> {rec.reason}
                  </div>
                  {rec.missingRequirements !== "None" && (
                    <div className="text-xxs text-rose-600 mb-3">
                      <strong>Missing:</strong> {rec.missingRequirements}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleApply(rec.course)}
                  disabled={applyingId === rec.course.id}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 rounded-lg text-xxs transition"
                >
                  {applyingId === rec.course.id ? "Applying..." : "Apply Directly"}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 items-start text-slate-400 text-xxs border-t border-slate-100 dark:border-zinc-850 pt-4 leading-relaxed">
            <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> {recommendations[0]?.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Main Search and Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-350 dark:border-slate-700 rounded-xl py-2.5 px-9 text-sm focus:outline-none focus:border-indigo-550 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white dark:bg-slate-955 text-slate-900 dark:text-white border border-slate-350 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Countries</option>
              <option value="United States">United States</option>
              <option value="Australia">Australia</option>
            </select>

            <select
              value={selectedFee}
              onChange={(e) => setSelectedFee(e.target.value)}
              className="bg-white dark:bg-slate-955 text-slate-900 dark:text-white border border-slate-350 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Any Tuition Fee</option>
              <option value="under-40k">Under $40,000/year</option>
              <option value="above-40k">Above $40,000/year</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer text-slate-700 dark:text-slate-205">
              <input
                type="checkbox"
                checked={onlyPartnered}
                onChange={(e) => setOnlyPartnered(e.target.checked)}
                className="rounded accent-indigo-600 cursor-pointer"
              />
              Partnered Universities
            </label>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No matching courses found. Try adjusting your search query or filters.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const isCompared = compareList.some((c) => c.id === course.id);
                
                // Cost calculations
                const {
                  tuition,
                  appFee,
                  deposit,
                  living,
                  insurance,
                  visa,
                  travel,
                  total: totalEstimatedCost,
                  scholarship: scholarshipAmount,
                  selfFinance: finalSelfFinance,
                  currency
                } = getCourseCostDetails(course);

                return (
                  <div key={course.id} className="border border-slate-150 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-200">{course.title}</h3>
                          <p className="text-xs text-slate-500">{course.university.name}</p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {course.university.partnerStatus === "PARTNERED" && (
                            <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Partnered
                            </span>
                          )}
                          {course.dataStatus === "VERIFIED" ? (
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Verified Data
                            </span>
                          ) : course.dataStatus === "OUTDATED" ? (
                            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              ⚠️ Outdated Data
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Unverified Data
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xxs text-slate-650 dark:text-zinc-350 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl mb-4">
                        <div>📍 Country: <strong>{course.university.country.name}</strong></div>
                        <div>⏱️ Duration: <strong>{course.duration}</strong></div>
                        <div>💰 Tuition Fee: <strong>{currency} {tuition.toLocaleString()}/yr</strong></div>
                        <div>📅 Intakes: <strong>{course.intakeDates}</strong></div>
                        <div>🎓 World Ranking: <strong>#{course.university.rankingWorld || 'N/A'}</strong></div>
                        <div>💵 Application Fee: <strong>{currency} {appFee}</strong></div>
                        <div>🏦 Deposit Required: <strong>{currency} {deposit.toLocaleString()}</strong></div>
                        <div>🛡️ Self-Finance Accepted: <strong>{course.selfFinanceAccepted ? "Yes" : "No"}</strong></div>
                      </div>

                      <div className="bg-slate-100/50 dark:bg-zinc-800/20 p-3 rounded-xl mb-4 space-y-1.5 text-xxs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estimated Total Cost:</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{currency} {totalEstimatedCost.toLocaleString()}</span>
                        </div>
                        {scholarshipAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>Scholarship Applied:</span>
                            <span>- {currency} {scholarshipAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-slate-200 dark:border-zinc-800 pt-1.5 font-extrabold text-indigo-600 dark:text-indigo-400">
                          <span>Final Self-Finance:</span>
                          <span>{currency} {finalSelfFinance.toLocaleString()}</span>
                        </div>
                      </div>

                      {course.scholarships && course.scholarships.length > 0 && (
                        <div className="border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/20 p-2.5 rounded-lg mb-4 text-xxs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                          <strong>Scholarship Available:</strong> {course.scholarships[0].name} (Value: {currency} {course.scholarships[0].amount.toLocaleString()})
                          {course.scholarships[0].deadline && (
                            <div className="text-slate-400 mt-0.5">Deadline: {new Date(course.scholarships[0].deadline).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}

                      <div className="text-xxs text-slate-450 space-y-1 border-t border-slate-100 dark:border-zinc-800 pt-2.5 mb-4">
                        <div>Last verified: {course.lastVerifiedAt ? new Date(course.lastVerifiedAt).toLocaleDateString() : "Pending"}</div>
                        {course.lastSyncedAt && <div>Last synced: {new Date(course.lastSyncedAt).toLocaleDateString()}</div>}
                        <div>Source: {course.sourceUrl ? <a href={course.sourceUrl} target="_blank" className="underline text-indigo-500 hover:text-indigo-600">Public Link</a> : course.sourceNote || "Manual Entry"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleToggleCompare(course)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xxs font-semibold border transition ${
                          isCompared 
                            ? "bg-indigo-65 text-indigo-600 border-indigo-600 dark:bg-indigo-950/20" 
                            : "bg-white border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-slate-50"
                        }`}
                      >
                        <GitCompare className="h-3.5 w-3.5" />
                        {isCompared ? "Remove Compare" : "Compare"}
                      </button>

                      <button
                        onClick={() => handleApply(course)}
                        disabled={applyingId === course.id}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 rounded-xl text-xxs transition flex items-center justify-center gap-1.5"
                      >
                        {applyingId === course.id ? "Applying..." : "Apply Now"} <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Bottom Bar Drawer */}
      {compareList.length > 0 && (
        <div className="sticky bottom-6 z-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 max-w-xl mx-auto shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-55 text-indigo-700 text-xxs font-extrabold px-2 py-1 rounded-md">
              {compareList.length}/2 Selected
            </span>
            <div className="text-xxs leading-none text-slate-500">
              {compareList.map((c) => c.title.substring(0, 25) + "...").join(" vs ")}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareList([])}
              className="text-slate-400 hover:text-slate-600 text-xxs font-bold px-2.5 py-1.5"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparison(true)}
              disabled={compareList.length < 2}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xxs font-bold px-4 py-1.5 rounded-lg transition"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {showComparison && compareList.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-850 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-indigo-600" /> Side-by-Side Comparison
            </h2>

            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div>Metric</div>
              <div>{compareList[0].title}</div>
              <div>{compareList[1].title}</div>
            </div>

            <div className="divide-y divide-slate-150 text-xs">
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">University</div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">{compareList[0].university.name}</div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">{compareList[1].university.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">World Ranking</div>
                <div className="font-bold text-indigo-600">#{compareList[0].university.rankingWorld || "N/A"}</div>
                <div className="font-bold text-indigo-600">#{compareList[1].university.rankingWorld || "N/A"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Tuition Fee</div>
                <div className="font-bold text-slate-700 dark:text-zinc-355">{details0?.currency} {details0?.tuition.toLocaleString()}/yr</div>
                <div className="font-bold text-slate-700 dark:text-zinc-355">{details1?.currency} {details1?.tuition.toLocaleString()}/yr</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Estimated Total Cost</div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">
                  {details0?.currency} {details0?.total.toLocaleString()}/yr
                </div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">
                  {details1?.currency} {details1?.total.toLocaleString()}/yr
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Scholarship Value</div>
                <div className="font-bold text-emerald-600">
                  {details0?.currency} {details0?.scholarship.toLocaleString()}
                </div>
                <div className="font-bold text-emerald-600">
                  {details1?.currency} {details1?.scholarship.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Self-Finance Estimate</div>
                <div className="font-extrabold text-indigo-600">
                  {details0?.currency} {details0?.selfFinance.toLocaleString()}
                </div>
                <div className="font-extrabold text-indigo-600">
                  {details1?.currency} {details1?.selfFinance.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Requirements</div>
                <div className="text-xxs">GPA: {compareList[0].minimumGpa || "N/A"}, English: {compareList[0].englishRequirement || "N/A"}</div>
                <div className="text-xxs">GPA: {compareList[1].minimumGpa || "N/A"}, English: {compareList[1].englishRequirement || "N/A"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Data Status</div>
                <div className="uppercase font-semibold text-xxs">{compareList[0].dataStatus || "VERIFIED"}</div>
                <div className="uppercase font-semibold text-xxs">{compareList[1].dataStatus || "VERIFIED"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Duration</div>
                <div>{compareList[0].duration}</div>
                <div>{compareList[1].duration}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Intake Terms</div>
                <div>{compareList[0].intakeDates}</div>
                <div>{compareList[1].intakeDates}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-3.5">
                <div className="font-semibold text-slate-400">Partner Status</div>
                <div className="uppercase font-semibold text-xxs">{compareList[0].university.partnerStatus}</div>
                <div className="uppercase font-semibold text-xxs">{compareList[1].university.partnerStatus}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowComparison(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-semibold px-5 py-2 rounded-xl text-xs border border-slate-250"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
