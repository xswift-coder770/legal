import { Routes, Route, Navigate } from "react-router-dom";
import Home      from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import History   from "./pages/History";
import AuthPage  from "./pages/AuthPage";

// ============================================
// Protected Route — redirects to /login if not authenticated
// ============================================

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<AuthPage />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;