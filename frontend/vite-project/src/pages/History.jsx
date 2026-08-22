import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Eye,
    Trash2,
    FileText,
    ShieldCheck,
    Calendar,
    ArrowLeft,
    Filter,
    Loader2,
    Inbox,
} from "lucide-react";
import API from "../services/api";

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await API.get("/history");

console.log(res.data);

setHistory(Array.isArray(res.data.history) ? res.data.history : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAnalysis = async (id) => {
        try {
            setDeletingId(id);
            await API.delete(`/history/${id}`);
            await fetchHistory();
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

  const filteredHistory = useMemo(() => {
    return (history || []).filter((item) => {
        const fileName = item.fileName || "";
        const documentType = item.documentType || "";

        return (
            fileName.toLowerCase().includes(search.toLowerCase()) ||
            documentType.toLowerCase().includes(search.toLowerCase())
        );
    });
}, [history, search]);

    const riskColor = (score) => {
        if (score >= 70) return "text-red-400";
        if (score >= 40) return "text-yellow-400";
        return "text-green-400";
    };

    const riskBarColor = (score) => {
        if (score >= 70) return "bg-red-500";
        if (score >= 40) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Analysis History</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                View all previously analyzed legal documents.
                            </p>
                        </div>
                    </div>

                    {!loading && history.length > 0 && (
                        <div className="hidden md:block text-right">
                            <p className="text-2xl font-bold">{history.length}</p>
                            <p className="text-slate-400 text-xs">Total analyses</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Section */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search by file name or document type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-purple-500 transition"
                        />
                    </div>

                    <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                {/* Table */}
                <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr className="text-left">
                                <th className="px-6 py-4 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <FileText size={18} />
                                        File Name
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold">Document Type</th>
                                <th className="px-6 py-4 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={18} />
                                        Risk Score
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
                                        Date
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={28} className="animate-spin text-purple-500" />
                                            Loading analysis history...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Inbox size={28} className="text-slate-600" />
                                            {history.length === 0
                                                ? "No documents analyzed yet."
                                                : "No results match your search."}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="border-t border-slate-800 hover:bg-slate-900/40 transition"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="font-medium">{item.fileName}</p>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-full text-sm bg-slate-800">
                                                {item.documentType}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold ${riskColor(item.riskScore)}`}>
                                                    {item.riskScore}/100
                                                </span>
                                                <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className={`h-full ${riskBarColor(item.riskScore)}`}
                                                        style={{ width: `${item.riskScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                                                    title="Open Analysis"
                                                   onClick={() =>
    navigate("/dashboard", {
        state: {
            analysis: item.analysis,
            file: {
                originalName: item.fileName,
            },
        },
    })
}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete"
                                                    disabled={deletingId === item._id}
                                                    onClick={() => deleteAnalysis(item._id)}
                                                >
                                                    {deletingId === item._id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;