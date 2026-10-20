import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import { Scale, Eye, EyeOff } from "lucide-react";

const AuthPage = () => {
    const navigate = useNavigate();

    const [mode, setMode]         = useState("login"); // "login" | "register"
    const [name, setName]         = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);

    const isLogin = mode === "login";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let data;

            if (isLogin) {
                data = await loginUser(email, password);
            } else {
                if (!name.trim()) {
                    setError("Name is required.");
                    setLoading(false);
                    return;
                }
                data = await registerUser(name, email, password);
            }

            // Persist token + user info
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-white flex items-center justify-center px-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap');
                .font-display { font-family: 'Fraunces', serif; }
                .font-body { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative font-body">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <Scale size={22} className="text-indigo-300" />
                    </div>
                    <span className="text-xl font-semibold font-display">LegalMind AI</span>
                </div>

                {/* Card */}
                <div className="bg-[#131b2e] border border-white/[0.06] rounded-2xl p-8">

                    {/* Toggle */}
                    <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6">
                        {["login", "register"].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                                    mode === m
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {m === "login" ? "Sign In" : "Register"}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-xl font-semibold mb-1">
                        {isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">
                        {isLogin
                            ? "Sign in to access your documents."
                            : "Start analyzing legal documents securely."}
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name (register only) */}
                        {!isLogin && (
                            <div>
                                <label className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 block">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    required={!isLogin}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 block">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-medium mt-2"
                        >
                            {loading
                                ? (isLogin ? "Signing in..." : "Creating account...")
                                : (isLogin ? "Sign In" : "Create Account")}
                        </button>

                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}
                        className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                        {isLogin ? "Register" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
