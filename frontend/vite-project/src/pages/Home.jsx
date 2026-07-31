

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UploadBox from "../upload/UploadBox";
import { ShieldCheck, Zap, FileSearch, Scale, FileText } from "lucide-react";

const Home = () => {
    const navigate = useNavigate();

    const [analysisData, setAnalysisData] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

   const riskScore = analysisData?.analysis?.riskScore;

    const riskMeta = (score) => {
        if (score >= 70)
            return { label: "High Risk", color: "#f87171", ring: "#f87171", soft: "rgba(248,113,113,0.12)" };
        if (score >= 40)
            return { label: "Moderate Risk", color: "#facc15", ring: "#facc15", soft: "rgba(250,204,21,0.12)" };
        return { label: "Low Risk", color: "#34d399", ring: "#34d399", soft: "rgba(52,211,153,0.12)" };
    };

    const meta = typeof riskScore === "number" ? riskMeta(riskScore) : null;
    const circumference = 2 * Math.PI * 54;
    const dash =
        typeof riskScore === "number"
            ? (riskScore / 100) * circumference
            : 0;

    return (
        <div className="min-h-screen bg-[#0b1120] text-white relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap');
                .font-display { font-family: 'Fraunces', serif; }
                .font-body { font-family: 'Inter', sans-serif; }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.6s ease both; }
            `}</style>

            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-16 relative font-body">
                {/* History button (top right) */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => navigate("/history")}
                        className="px-5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition"
                    >
                        📜 History
                    </button>
                </div>

                {/* Eyebrow */}
                <div
                    className={`flex justify-center mb-6 ${mounted ? "fade-up" : "opacity-0"}`}
                >
                    <span className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                        <Scale size={14} />
                        AI-Powered Contract Review
                    </span>
                </div>

                {/* Hero */}
                <h1
                    className={`font-display text-6xl md:text-7xl font-semibold text-center leading-[1.05] bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent ${
                        mounted ? "fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "0.05s" }}
                >
                    LegalMind AI
                    
                </h1>

                <p
                    className={`text-center text-slate-400 mt-5 max-w-xl mx-auto text-lg ${
                        mounted ? "fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "0.1s" }}
                >
                    Upload any contract or policy. Get the risk, the fine print,
                    and the plain-English summary in seconds.
                </p>

                {/* Trust chips */}
                <div
                    className={`flex flex-wrap justify-center gap-3 mt-8 ${
                        mounted ? "fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "0.15s" }}
                >
                    {[
                        { icon: Zap, label: "Instant analysis" },
                        { icon: ShieldCheck, label: "Risk detection" },
                        { icon: FileSearch, label: "Clause-level insight" },
                    ].map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 text-sm text-slate-300 bg-white/[0.03] border border-white/[0.06] px-4 py-2 rounded-full"
                        >
                            <Icon size={15} className="text-indigo-300" />
                            {label}
                        </div>
                    ))}
                </div>

                {/* Upload */}
                <div
                    className={`mt-14 ${mounted ? "fade-up" : "opacity-0"}`}
                    style={{ animationDelay: "0.2s" }}
                >
                    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-2">
                        <UploadBox onUploadSuccess={setAnalysisData} />
                    </div>
                </div>

                {/* Results */}
                {analysisData && (
                    <div className="mt-16 fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs uppercase tracking-widest text-slate-500">
                                Analysis Report
                            </span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Risk Score */}
                            <div className="bg-[#131b2e] border border-white/[0.06] rounded-2xl p-7 flex items-center gap-6">
                                <div className="relative w-32 h-32 shrink-0">
                                    <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="54"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="54"
                                            fill="none"
                                            stroke={meta?.color}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${dash} ${circumference}`}
                                            style={{ transition: "stroke-dasharray 1s ease" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">{riskScore}</span>
                                        <span className="text-xs text-slate-500">/ 100</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-sm uppercase tracking-wide text-slate-400 mb-1">
                                        Risk Score
                                    </h2>
                                    <p
                                        className="text-xl font-semibold"
                                        style={{ color: meta?.color }}
                                    >
                                        {meta?.label}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Based on clause language, obligations, and
                                        liability exposure detected in the document.
                                    </p>
                                </div>
                            </div>

                            {/* Document Type */}
                            <div className="bg-[#131b2e] border border-white/[0.06] rounded-2xl p-7 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <FileText size={20} className="text-indigo-300" />
                                    </div>
                                    <h2 className="text-sm uppercase tracking-wide text-slate-400">
                                        Document Type
                                    </h2>
                                </div>
                                <p className="text-2xl font-semibold font-display">
                                    {analysisData.analysis.documentType}
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="bg-[#131b2e] border border-white/[0.06] rounded-2xl p-7 md:col-span-2">
                                <h2 className="text-sm uppercase tracking-wide text-slate-400 mb-4">
                                    Summary
                                </h2>
                                <p className="text-slate-300 leading-relaxed text-[15px] border-l-2 border-indigo-500/30 pl-5">
                                    {analysisData.analysis.summary}
                                </p>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() =>
                                            navigate("/dashboard", {
                                                state: {
                                                    analysis: analysisData.analysis,
                                                    file: {
                                                        originalName:
                                                            analysisData.file?.originalName ||
                                                            analysisData.fileName ||
                                                            "Uploaded Document",
                                                    },
                                                },
                                            })
                                        }
                                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium"
                                    >
                                        View Full Analysis →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;