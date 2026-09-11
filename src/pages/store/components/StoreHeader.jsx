import { Link } from "react-router-dom";

export default function StoreHeader({
    user,
    isExclusiveAdmin,
    totalCount,
    isMenuOpen,
    setIsMenuOpen,
    onOpenCart,
    searchQuery = "",
    setSearchQuery = () => {},
    selectedCategory = "all",
    setSelectedCategory = () => {},
    onSearch = () => {},
    onOpenAuth,
    onLogout,
    onOpenAddProduct = () => {},
    activeTab,
    setActiveTab,
}) {
    return (
        <header>
            <div className="top_header">
                <div className="container">
                    <Link
                        to="/"
                        onClick={() => setActiveTab("home")}
                        className="logo"
                    >
                        <span className="brand-logo">
                            <i className="fa-solid fa-microchip"></i>
                            <span>TechStore OS</span>
                        </span>
                    </Link>
                    <div className="search_area">
                        <form
                            action=""
                            className="search_box"
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSearch();
                            }}
                        >
                            <div className="select_box">
                                <select
                                    id="category"
                                    name="category"
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                >
                                    <option value="all">{"كل الأقسام"}</option>
                                    <option value="electronics">
                                        {"إلكترونيات"}
                                    </option>
                                    <option value="mobiles">
                                        {"موبايلات"}
                                    </option>
                                    <option value="appliances">
                                        {"أجهزة منزلية"}
                                    </option>
                                </select>
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                placeholder={"ابحث عن منتج"}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </form>
                    </div>
                    <div className="header_icons">
                        {user && (
                            <div className="header-account">
                                <i className="fa-solid fa-user"></i>
                                <span>{user.name}</span>
                            </div>
                        )}
                        <div onClick={onOpenCart} className="icon">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <span className="count count_item_header">
                                {totalCount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom_header">
                <div className="container">
                    <nav className="nav">
                        <span
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="open_menu"
                        >
                            <i className="fa-solid fa-bars"></i>
                        </span>
                        <ul
                            className={`nav_links ${isMenuOpen ? "active" : ""}`}
                        >
                            <span
                                onClick={() => setIsMenuOpen(false)}
                                className="close_menu"
                            >
                                <i className="fa-regular fa-circle-xmark"></i>
                            </span>
                            <li
                                className={activeTab === "home" ? "active" : ""}
                            >
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab("home");
                                    }}
                                >
                                    {"الرئيسية"}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#Hot_Deals"
                                    onClick={() => setActiveTab("home")}
                                >
                                    {"العروض"}
                                </a>
                            </li>
                            <li
                                className={
                                    activeTab === "booking" ? "active" : ""
                                }
                            >
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab("booking");
                                    }}
                                >
                                    {"حجز موعد"}
                                </a>
                            </li>
                            <li
                                className={
                                    activeTab === "tracking" ? "active" : ""
                                }
                            >
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab("tracking");
                                    }}
                                >
                                    {"تتبع الحالة"}
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="login_signup btns">
                        {user ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                {isExclusiveAdmin && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={onOpenAddProduct}
                                            className="btn"
                                            style={{
                                                background: "#10b981",
                                                color: "#fff",
                                                padding: "8px 14px",
                                                fontWeight: "bold",
                                            }}
                                            title="إضافة منتج جديد يظهر في المتجر فوراً"
                                        >
                                            <i className="fa-solid fa-plus"></i>{" "}
                                            {"إضافة منتج"}
                                        </button>

                                        <Link
                                            to="/admin"
                                            className="btn"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #2563eb, #38bdf8)",
                                                color: "#fff",
                                                padding: "8px 16px",
                                                fontWeight: "bold",
                                                boxShadow:
                                                    "0 0 10px rgba(56,189,248,0.5)",
                                            }}
                                        >
                                            {"لوحة التحكم"}{" "}
                                            <i className="fa-solid fa-gauge-high"></i>
                                        </Link>
                                    </>
                                )}

                                <button
                                    onClick={onLogout}
                                    className="btn"
                                    style={{
                                        background: "transparent",
                                        color: "#ef4444",
                                        border: "1px solid #ef4444",
                                        padding: "6px 12px",
                                    }}
                                >
                                    {"تسجيل الخروج"}
                                </button>
                            </div>
                        ) : (
                            <>
                                <a
                                    href="#"
                                    className="btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onOpenAuth(false);
                                    }}
                                >
                                    {"تسجيل الدخول"}{" "}
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                </a>
                                <a
                                    href="#"
                                    className="btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onOpenAuth(true);
                                    }}
                                >
                                    {"إنشاء حساب"}{" "}
                                    <i className="fa-solid fa-user-plus"></i>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
