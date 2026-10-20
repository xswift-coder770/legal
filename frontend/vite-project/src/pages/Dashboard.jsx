 
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { askQuestion } from "../services/api.js";
import {
    FileText,
    ShieldCheck,
    AlertTriangle,
    Database,
    Globe,
    Users,
    ArrowLeft,
    Sparkles,
    History as HistoryIcon,
} from "lucide-react";

const Dashboard = () => {

    const location = useLocation();

    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isAsking, setIsAsking] = useState(false);

    // Persist active document to localStorage so logout/refresh retains the document
    useEffect(() => {
        if (location.state?.analysis) {
            localStorage.setItem("activeAnalysis", JSON.stringify(location.state.analysis));
        }
        if (location.state?.file) {
            localStorage.setItem("activeFile", JSON.stringify(location.state.file));
        }
        if (location.state?.docId) {
            localStorage.setItem("activeDocId", location.state.docId);
        }
    }, [location.state]);

    const activeDocId = location.state?.docId || localStorage.getItem("activeDocId") || "";

    const data = location.state?.analysis || (() => {
        try {
            return JSON.parse(localStorage.getItem("activeAnalysis"));
        } catch {
            return null;
        }
    })();

    const file = location.state?.file || (() => {
        try {
            return JSON.parse(localStorage.getItem("activeFile"));
        } catch {
            return null;
        }
    })();

    const handleAskAI = async () => {
        if (!question.trim()) return;
        setIsAsking(true);
        setAnswer("");
        try {
            const res = await askQuestion(question, activeDocId);
            setAnswer(res.answer || "No response found.");
        } catch (error) {
            console.error("Ask AI Error:", error);
            setAnswer("Failed to get response from AI. Please try again.");
        } finally {
            setIsAsking(false);
        }
    };

    if (!data) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-body px-4">

                <div className="text-center max-w-md bg-[#131b2e] border border-white/[0.06] p-8 rounded-2xl">

                    <h1 className="text-2xl font-bold mb-2">
                        No Active Document Selected
                    </h1>

                    <p className="text-slate-400 text-sm mb-6">
                        Open a previously analyzed policy from History or upload a new one.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate("/history")}
                            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                            <HistoryIcon size={18} />
                            Open History
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl font-medium transition"
                        >
                            Upload New PDF
                        </button>
                    </div>

                </div>

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-slate-950 text-white">

            <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6">

                <h1 className="text-3xl font-bold text-purple-400">

                    LegalMind AI

                </h1>

                <p className="text-slate-400 mt-2">

                    AI Legal Assistant

                </p>
 
                <nav className="mt-10 space-y-4">

                    <div className="flex items-center gap-3 text-purple-400">

                        <FileText size={20} />

                        <span>Dashboard</span>

                    </div>

                    <div className="flex items-center gap-3 text-slate-400">

                        <ShieldCheck size={20} />

                        <span>Privacy Analysis</span>

                    </div>

                    <div className="flex items-center gap-3 text-slate-400">

                        <Database size={20} />

                        <span>Data Collection</span>

                    </div>

                    <div className="flex items-center gap-3 text-slate-400">

                        <Users size={20} />

                        <span>User Rights</span>

                    </div>

                    <div className="flex items-center gap-3 text-slate-400">

                        <AlertTriangle size={20} />

                        <span>Risk Report</span>

                    </div>

                </nav>

            </aside>

            <main className="ml-64 p-8">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-4xl font-bold">

                            Analysis Dashboard

                        </h2>

                        <p className="text-slate-400 mt-2">

                            AI Generated Legal Report

                        </p>

                    </div>
 
 <button

                        onClick={() => navigate("/")}

                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl transition"

                    >

                        <ArrowLeft size={18} />

                        Analyze Another PDF

                    </button>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

                        <div className="flex items-center justify-between">

                            <h3 className="text-xl font-semibold">

                                Risk Score

                            </h3>

                            <AlertTriangle className="text-red-400" />

                        </div>

                        <h1 className="text-6xl font-bold mt-8 text-purple-400">

                            {data.riskScore}/100

                        </h1>

                        <p className="mt-4 text-slate-400">

                            Overall AI calculated legal risk.

                        </p>

                    </div>
                    
                    <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">

                        <div className="flex items-center gap-3">

                            <Sparkles className="text-yellow-400" />

                            <h3 className="text-2xl font-semibold">

                                AI Summary

                            </h3>

                        </div>

                        <p className="mt-6 leading-8 text-slate-300">

                            {data.summary}

                        </p>

                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <FileText className="text-blue-400" />

                            <h3 className="text-xl font-semibold">

                                Document Information

                            </h3>

                        </div>

                        <div className="mt-6 space-y-4">

                            <div>

                                <p className="text-slate-400">

                                    Document Type

                                </p>

                                <h4 className="text-lg font-semibold mt-1">

                                    {data.documentType}

                                </h4>

                            </div>

 <div>

                                <p className="text-slate-400">

                                    File Name

                                </p>

                                <h4 className="text-lg font-semibold mt-1 break-all">

                                    {file?.originalName || "Unknown"}

                                </h4>

                            </div>

                            <div>

                                <p className="text-slate-400">

                                    File Size

                                </p>

                                <h4 className="text-lg font-semibold mt-1">

                                    {file
                                        ? `${(file.size / 1024).toFixed(2)} KB`
                                        : "N/A"}

                                </h4>

                            </div>

                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <Database className="text-green-400" />

                            <h3 className="text-xl font-semibold">

                                Data Collected

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                            {data.dataCollected?.length > 0 ? (
                                 <ul className="space-y-2">

                                    {data.dataCollected.map(

                                        (item, index) => (

                                            <li

                                                key={index}

                                                className="bg-slate-800 rounded-lg px-4 py-2"

                                            >

                                                • {item}

                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No Data Found

                                </p>

                            )}

                        </div>

                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <ShieldCheck className="text-cyan-400" />

                            <h3 className="text-xl font-semibold">

                                Sensitive Data

                            </h3>

                        </div>


                        <div className="mt-6 space-y-3">

                            {data.sensitiveData?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.sensitiveData.map(

                                        (item, index) => (

                                            <li

                                                key={index}

                                                className="bg-slate-800 rounded-lg px-4 py-2"

                                            >

                                                • {item}

                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No Sensitive Data Detected

                                </p>

                            )}

                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <Globe className="text-orange-400" />

                            <h3 className="text-xl font-semibold">

                                Purpose of Collection

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                            {data.purposeOfCollection?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.purposeOfCollection.map(

                                        (item, index) => (

                                            <li

                                                key={index}

                                                className="bg-slate-800 rounded-lg px-4 py-2"

                                            >

                                                • {item}

                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No Purpose Mentioned

                                </p>

                            )}

                        </div>

                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <Users className="text-pink-400" />

                            <h3 className="text-xl font-semibold">

                                Third Party Sharing

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                           {Array.isArray(data.thirdPartySharing) ? (
    <ul className="space-y-2">
        {data.thirdPartySharing.map((item, index) => (
            <li key={index} className="bg-slate-800 rounded-lg px-4 py-2">
                • {item}
            </li>
        ))}
    </ul>
) : (
    <p className="text-slate-400">
        {data.thirdPartySharing || "No Third Party Sharing Mentioned"}
    </p>
)}
                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <Globe className="text-emerald-400" />

                            <h3 className="text-xl font-semibold">

                                International Transfer

                            </h3>

                        </div>

                        <div className="mt-6">

                            <p className="text-lg font-semibold text-purple-400">

                                {data.internationalTransfer || "Not Specified"}

                            </p>

                        </div>

                    </div>

                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <ShieldCheck className="text-green-400" />

                            <h3 className="text-xl font-semibold">

                                User Rights

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                            {data.userRights?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.userRights.map(

                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="bg-slate-800 rounded-lg px-4 py-2"
                                            >
                                                • {item}
                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No User Rights Mentioned

                                </p>

                            )}

                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <Database className="text-yellow-400" />

                            <h3 className="text-xl font-semibold">

                                Legal Basis

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                            {data.legalBasis?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.legalBasis.map(

                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="bg-slate-800 rounded-lg px-4 py-2"
                                            >
                                                • {item}
                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No Legal Basis Specified

                                </p>

                            )}

                        </div>

                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <ShieldCheck className="text-cyan-400" />

                            <h3 className="text-xl font-semibold">

                                Security Measures

                            </h3>

                        </div>


                                                <div className="mt-6 space-y-3">

                            {data.securityMeasures?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.securityMeasures.map(

                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="bg-slate-800 rounded-lg px-4 py-2"
                                            >
                                                • {item}
                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-slate-400">

                                    No Security Measures Mentioned

                                </p>

                            )}

                        </div>

                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

                        <div className="flex items-center gap-3">

                            <AlertTriangle className="text-red-400" />

                            <h3 className="text-xl font-semibold">

                                Red Flags

                            </h3>

                        </div>

                        <div className="mt-6 space-y-3">

                            {data.redFlags?.length > 0 ? (

                                <ul className="space-y-2">

                                    {data.redFlags.map(

                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-2 text-red-300"
                                            >
                                                ⚠ {item}
                                            </li>

                                        )

                                    )}

                                </ul>

                            ) : (

                                <p className="text-green-400">

                                    🎉 No Critical Red Flags Found

                                </p>

                            )}

                        </div>

                    </div>

                </div>

                <div className="mt-8 bg-slate-900 rounded-2xl p-6 border border-slate-800">

                    <div className="flex items-center gap-3">

                        <Sparkles className="text-yellow-400" />

                        <h3 className="text-2xl font-semibold">

                            AI Recommendations

                        </h3>

                    </div>
                                        <div className="mt-6">

                        {data.recommendations?.length > 0 ? (

                            <ul className="space-y-3">

                                {data.recommendations.map(

                                    (item, index) => (

                                        <li
                                            key={index}
                                            className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
                                        >
                                            ✅ {item}
                                        </li>

                                    )

                                )}

                            </ul>

                        ) : (

                            <div className="bg-slate-800 rounded-xl p-5 text-slate-400">

                                No AI Recommendations Available.

                            </div>

                        )}

                    </div>

                </div>

                <div className="mt-10 bg-slate-900 rounded-2xl border border-slate-800 p-6">

                    <div className="flex items-center gap-3">

                        <Sparkles className="text-purple-400" />

                        <h2 className="text-2xl font-bold">

                            Chat With Policy (RAG)

                        </h2>

                    </div>

                    <p className="text-slate-400 mt-2">

                        Ask questions related to the uploaded legal document.

                    </p>

                    <div className="mt-6 flex flex-col lg:flex-row gap-4">

                        <input

                            type="text"

                            placeholder="Ask anything about this policy..."
                            
                            value={question}
                            
                            onChange={(e) => setQuestion(e.target.value)}
                            
                            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}

                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-purple-500"

                        />

                        <button
                            
                            onClick={handleAskAI}
                            
                            disabled={isAsking}

                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-xl px-8 py-4 font-semibold transition flex items-center justify-center min-w-[120px]"

                        >

                            {isAsking ? "Asking..." : "Ask AI"}

                        </button>

                    </div>

                    <div className="mt-8 bg-slate-800 rounded-xl p-5 min-h-[140px]">

                        {isAsking ? (
                            <p className="text-purple-400 animate-pulse">
                                AI is analyzing the document...
                            </p>
                        ) : answer ? (
                            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {answer}
                            </div>
                        ) : (
                            <p className="text-slate-400">
                                AI response will appear here...
                            </p>
                        )}

                    </div>

                </div>

                <footer className="mt-12 text-center text-slate-500 text-sm">

                    Powered by LegalMind AI • Groq • RAG • React • TailwindCSS

                </footer>

            </main>

        </div>

    );

};

export default Dashboard;