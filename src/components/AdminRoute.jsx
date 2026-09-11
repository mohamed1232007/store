import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import { HashLoader } from "react-spinners";

const AdminRoute = () => {
    const { user, loading, isExclusiveAdmin } = useAuth();

    if (loading) {
        return (
            <div
                className="admin-loading-screen"
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f3f4f6",
                    color: "#111827",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    gap: "20px",
                    zIndex: 999999,
                }}
            >
                <div
                    style={{
                        background: "#ffffff",
                        padding: "36px 48px",
                        borderRadius: "16px",
                        boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <HashLoader color="#000000" size={50} />
                    <div style={{ textAlign: "center" }}>
                        <h3
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "4px",
                            }}
                        >
                            TechStore OS
                        </h3>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                margin: 0,
                            }}
                        >
                            جاري التحقق من صلاحيات لوحة التحكم...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !isExclusiveAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
