import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./AdminLayout.css";

const AdminLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="admin-container" dir={"rtl"}>
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span>TechStore OS</span>
                    <span className="sidebar-badge">إدارة</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"نظرة عامة"}
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"المنتجات وقطع الغيار"}
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"طلبات التوصيل"}
                    </NavLink>
                    <NavLink
                        to="/admin/bookings"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"حجوزات المتجر"}
                    </NavLink>
                    <NavLink
                        to="/admin/store-pickups"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"طلبات الاستلام "}
                    </NavLink>
                    <NavLink
                        to="/admin/tickets"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {"تذاكر الصيانة"}
                    </NavLink>
                </nav>

                <div className="sidebar-user">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.name || "مسؤول النظام"}
                        </span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <button
                        className="btn-logout"
                        onClick={logout}
                        title="تسجيل الخروج"
                    >
                        Exit
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <h2>{"لوحة تحكم الإدارة"}</h2>
                    <span
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        {"   "} <strong>{user?.name}</strong>
                    </span>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
