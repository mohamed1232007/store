import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/useLanguage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { HashLoader } from "react-spinners";
import { useNotification } from "../../context/NotificationContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./StoreOriginal.css";

import StoreHeader from "./components/StoreHeader";
import CartDrawer from "./components/CartDrawer";
import ProductCard from "./components/ProductCard";
import AddProductModal from "../admin/AddProductModal";
import TicketCard from "./components/TicketCard";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function StorePage() {
    const { user, isExclusiveAdmin, logout, login, register } = useAuth();
    const { showToast, showConfirm } = useNotification();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        if (!savedCart) return [];

        try {
            return JSON.parse(savedCart);
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isArabic } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [favoriteIds, setFavoriteIds] = useState(() =>
        JSON.parse(localStorage.getItem("favorites") || "[]"),
    );
    const [showFavorites, setShowFavorites] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [authName, setAuthName] = useState("");
    const [authPhone, setAuthPhone] = useState("");
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("home");
    const [bookingForm, setBookingForm] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        device_type: "",
        issue_description: "",
        booking_date: "",
        time_slot: "12:00 PM - 02:00 PM",
    });
    const [bookingSuccess, setBookingSuccess] = useState("");
    const [bookingTicket, setBookingTicket] = useState(null);
    const [trackQuery, setTrackQuery] = useState("");
    const [trackResult, setTrackResult] = useState(null);

    const [showAddProductModal, setShowAddProductModal] = useState(false);

    const todayStr = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    })();

    const [productsLoading, setProductsLoading] = useState(true);

    const loadProductsFromDB = async () => {
        setProductsLoading(true);
        const start = Date.now();
        try {
            const res = await fetch(`${API_BASE}/store/products`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
                const normalized = data.products.map((p) => ({
                    ...p,
                    img: p.image_url || "img/product/0.png",
                    catetory: p.category,
                }));
                setProducts(normalized);
            }
        } catch (err) {
            console.error("Failed to load products from MySQL:", err);
        } finally {
            const elapsed = Date.now() - start;
            const minDelay = 3000;
            if (elapsed < minDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minDelay - elapsed),
                );
            }
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(loadProductsFromDB);
        document.body.classList.remove("dark-theme");
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const getStatusLabel = (status, recordType) => {
        if (!isArabic) return status;

        const labels =
            recordType === "booking"
                ? {
                      scheduled: "معلق",
                      attended: "تم الحضور",
                      completed: "مكتمل",
                      cancelled: "ملغى",
                  }
                : recordType === "order"
                  ? {
                        pending: "قيد المراجعة",
                        confirmed: "تم التأكيد",
                        processing: "قيد التجهيز",
                        shipped: "تم الشحن",
                        delivered: "تم التوصيل",
                        cancelled: "ملغى",
                    }
                  : recordType === "pickup"
                    ? {
                          pending: "قيد الانتظار",
                          confirmed: "مؤكد",
                          completed: "مكتمل",
                          cancelled: "ملغى",
                      }
                    : {
                        received: "تم الاستلام",
                        diagnosing: "جاري الفحص",
                        waiting_parts: "في انتظار قطع الغيار",
                        in_progress: "قيد التنفيذ",
                        ready_for_pickup: "جاهز للاستلام",
                        delivered: "مكتمل",
                        cancelled: "ملغى",
                    };

        return labels[status] || status;
    };

    const formatBookingDate = (value) => {
        if (!value) return "";
        const datePart = String(value).split("T")[0];
        const parts = datePart.split("-");
        if (parts.length !== 3) return datePart;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    };

    const handleCancelBooking = async (booking) => {
        const confirmed = await showConfirm({
            title: "إلغاء الحجز",
            message: `هل أنت متأكد من إلغاء حجز الموعد رقم ${booking.ticket_number}؟`,
            confirmText: "نعم، ألغِ الحجز",
            cancelText: "تراجع",
            isDanger: true,
        });

        if (!confirmed) return;

        try {
            const res = await fetch(
                `${API_BASE}/store/cancel-booking/${encodeURIComponent(booking.ticket_number)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ phone: booking.customer_phone }),
                },
            );
            const data = await res.json();
            if (data.success) {
                showToast("تم إلغاء الحجز بنجاح", "success");
                setTrackResult((prev) =>
                    prev.map((t) =>
                        t.ticket_number === booking.ticket_number
                            ? { ...t, status: "cancelled" }
                            : t,
                    ),
                );
            } else {
                showToast(data.message || "فشل إلغاء الحجز", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("حدث خطأ أثناء إلغاء الحجز", "error");
        }
    };

    const addToCart = (product, openDrawer = true) => {
        setCart((prev) => {
            const exist = prev.find((item) => item.id === product.id);
            if (exist) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        if (openDrawer) {
            setIsCartOpen(true);
        }
    };

    const handleQuickCheckout = (product) => {
        addToCart(product, false);
        setSelectedProduct(null);
        navigate("/checkout");
    };

    const toggleFavorite = (product) => {
        setFavoriteIds((current) => {
            const next = current.includes(product.id)
                ? current.filter((id) => id !== product.id)
                : [...current, product.id];
            localStorage.setItem("favorites", JSON.stringify(next));
            return next;
        });
    };

    const [scrollToken, setScrollToken] = useState(0);

    useEffect(() => {
        if (scrollToken === 0) return;
        const el = document.getElementById("all-products");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [scrollToken]);

    const goToResults = () => {
        setShowFavorites(false);
        setActiveTab("home");
        setScrollToken((t) => t + 1);
    };

    const handleSearch = () => {
        goToResults();
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        goToResults();
    };

    const visibleProducts = products.filter(
        (product) =>
            (selectedCategory === "all" ||
                product.catetory === selectedCategory) &&
            product.name
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase()),
    );
    const displayedProducts = showFavorites
        ? products.filter((product) => favoriteIds.includes(product.id))
        : visibleProducts;

    const removeFromCart = (id) =>
        setCart((prev) => prev.filter((item) => item.id !== id));

    const updateQuantity = (id, delta) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const q = item.quantity + delta;
                    return q > 0 ? { ...item, quantity: q } : item;
                }
                return item;
            }),
        );
    };

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);

        try {
            let data;
            if (isRegisterMode) {
                data = await register({
                    name: authName,
                    email: authEmail,
                    password: authPassword,
                    phone: authPhone,
                });
            } else {
                data = await login(authEmail, authPassword);
            }

            setShowAuthModal(false);

            if (
                data.user?.email?.toLowerCase() === "mohamed@gmail.com" &&
                data.user?.role === "admin"
            ) {
                navigate("/admin");
            }
        } catch (err) {
            setAuthError(
                err.response?.data?.message || err.message || "حدث خطأ",
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/store/book-visit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...bookingForm, user_id: user?.id }),
            });
            const data = await res.json();
            if (data.success) {
                setBookingSuccess(
                    `تم تأكيد الحجز بنجاح. رقم الحجز: ${data.bookingCode}`,
                );
                setBookingTicket({
                    code: data.bookingCode,
                    customer_name: bookingForm.customer_name,
                    customer_email: bookingForm.customer_email,
                    customer_phone: bookingForm.customer_phone,
                    device_type: bookingForm.device_type,
                    issue_description: bookingForm.issue_description,
                    booking_date: bookingForm.booking_date,
                    time_slot: bookingForm.time_slot,
                });
                showToast("تم تأكيد موعد فحص الجهاز بنجاح!", "success");
                setBookingForm({
                    customer_name: "",
                    customer_email: "",
                    customer_phone: "",
                    device_type: "",
                    issue_description: "",
                    booking_date: "",
                    time_slot: "12:00 PM - 02:00 PM",
                });
            } else {
                showToast(
                    data.message || "فشل تأكيد الحجز، حاول مرة أخرى",
                    "error",
                );
            }
        } catch (err) {
            console.error(err);
            showToast("حدث خطأ أثناء حجز الموعد", "error");
        }
    };

    const handleTrackSubmit = async (e) => {
        e.preventDefault();
        const query = trackQuery.trim();
        if (!query) return;

        try {
            const res = await fetch(
                `${API_BASE}/store/track-ticket/${encodeURIComponent(query)}`,
                { credentials: "include" },
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "فشل البحث عن التذكرة");
            }

            if (data.tickets?.length > 0) {
                setTrackResult(data.tickets);
            } else {
                setTrackResult([]);
            }
        } catch (err) {
            console.error(err);
            showToast(
                err.message || "حدث خطأ أثناء البحث عن تذكرة الصيانة",
                "error",
            );
        }
    };

    const saleProducts = products.filter((p) => p.old_price);
    const electronicProducts = products.filter(
        (p) => p.catetory === "electronics",
    );
    const applianceProducts = products.filter(
        (p) => p.catetory === "appliances",
    );
    const mobileProducts = products.filter((p) => p.catetory === "mobiles");

    const heroSlides = [
        {
            id: "watches",
            image: "/img/banner_home1.png",
            eyebrow_ar: "وصل حديثًا",
            title_ar: "ساعات ذكية بمواصفات جديدة",
            desc_ar: "تابع يومك ومكالماتك وصحتك من معصمك.",
            price: "180.99",
            badge_ar: "خصم حتى 70%",
        },
        {
            id: "earbuds",
            image: "/img/banner_home2.png",
            eyebrow_ar: "صوت لاسلكي",
            title_ar: "سماعات لاسلكية بريميوم",
            desc_ar: "صوت نقي وبطارية تدوم طوال اليوم.",
            price: "49.99",
            badge_ar: "خصم 30%",
        },
    ];

    const swiperBreakpoints = {
        1200: { slidesPerView: 5, spaceBetween: 20 },
        1000: { slidesPerView: 4, spaceBetween: 20 },
        700: { slidesPerView: 3, spaceBetween: 15 },
        0: { slidesPerView: 2, spaceBetween: 10 },
    };

    return (
        <>
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                totalCount={totalCount}
                subtotal={subtotal}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
            />

            <StoreHeader
                user={user}
                isExclusiveAdmin={isExclusiveAdmin}
                totalCount={totalCount}
                isArabic={isArabic}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                onOpenCart={() => setIsCartOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={handleCategoryChange}
                onSearch={handleSearch}
                onOpenAuth={(registerMode) => {
                    setIsRegisterMode(registerMode);
                    setShowAuthModal(true);
                }}
                onLogout={logout}
                onOpenAddProduct={() => setShowAddProductModal(true)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {activeTab === "home" && (
                <>
                    <div className="slider">
                        <div className="container">
                            <div className="slide-swp mySwiper">
                                <Swiper
                                    key={`hero-${"ar"}`}
                                    modules={[Pagination, Autoplay]}
                                    pagination={{
                                        clickable: true,
                                        dynamicBullets: true,
                                    }}
                                    autoplay={{ delay: 4000 }}
                                    loop={true}
                                    dir={"rtl"}
                                >
                                    {heroSlides.map((slide) => (
                                        <SwiperSlide key={slide.id}>
                                            <div
                                                className="hero-slide"
                                                style={{
                                                    backgroundImage: `url(${slide.image})`,
                                                }}
                                                dir={"rtl"}
                                            >
                                                <div className="hero-content">
                                                    <span className="hero-eyebrow">
                                                        {slide.eyebrow_ar}
                                                    </span>
                                                    <h1 className="hero-title">
                                                        {slide.title_ar}
                                                    </h1>
                                                    <p className="hero-desc">
                                                        {slide.desc_ar}
                                                    </p>
                                                    <div className="hero-price">
                                                        <span>{"يبدأ من"}</span>
                                                        <strong>
                                                            {Number(
                                                                slide.price,
                                                            ).toLocaleString()}{" "}
                                                            {"ج.م"}
                                                        </strong>
                                                    </div>
                                                    <button
                                                        className="btn hero-cta"
                                                        onClick={handleSearch}
                                                    >
                                                        {"تسوق الآن"}
                                                        <i
                                                            className={`fa-solid ${"fa-arrow-left"}`}
                                                        ></i>
                                                    </button>
                                                </div>
                                                {slide.badge && (
                                                    <span className="hero-badge">
                                                        {slide.badge_ar}
                                                    </span>
                                                )}
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>

                    {productsLoading ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: "260px",
                                margin: "40px auto",
                                maxWidth: "500px",
                                background: "#ffffff",
                                borderRadius: "16px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                                padding: "36px 24px",
                                gap: "18px",
                            }}
                        >
                            <HashLoader color="#111827" size={48} />
                            <div style={{ textAlign: "center" }}>
                                <h4
                                    style={{
                                        fontSize: "1.05rem",
                                        fontWeight: "600",
                                        color: "#111827",
                                        marginBottom: "6px",
                                    }}
                                >
                                    {"تحميل المنتجات"}
                                </h4>
                                <p
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "0.875rem",
                                        margin: 0,
                                    }}
                                >
                                    {
                                        "جاري مزامنة المنتجات من قاعدة البيانات..."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="slider_products slide">
                                <div className="container">
                                    <div className="slide_product mySwiper">
                                        <div
                                            className="top_slide"
                                            id="Hot_Deals"
                                        >
                                            <h2>
                                                <i className="fa-solid fa-tags"></i>{" "}
                                                {"أقوى العروض"}
                                            </h2>
                                        </div>
                                        <Swiper
                                            key={`sale-${"ar"}`}
                                            modules={[Navigation, Autoplay]}
                                            navigation={true}
                                            autoplay={{ delay: 2800 }}
                                            loop={saleProducts.length > 5}
                                            breakpoints={swiperBreakpoints}
                                            className="products"
                                        >
                                            {saleProducts.map((p) => (
                                                <SwiperSlide key={p.id}>
                                                    <ProductCard
                                                        product={p}
                                                        isInCart={cart.some(
                                                            (c) =>
                                                                c.id === p.id,
                                                        )}
                                                        onAddToCart={addToCart}
                                                        isFavorite={favoriteIds.includes(
                                                            p.id,
                                                        )}
                                                        onToggleFavorite={
                                                            toggleFavorite
                                                        }
                                                        onSelectProduct={(
                                                            prod,
                                                        ) =>
                                                            setSelectedProduct(
                                                                prod,
                                                            )
                                                        }
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            <div className="slider_products slide">
                                <div className="container">
                                    <div className="slide_product mySwiper">
                                        <div
                                            className="top_slide"
                                            id="Electronics"
                                        >
                                            <h2>
                                                <i className="fa-solid fa-tags"></i>{" "}
                                                {"إلكترونيات"}
                                            </h2>
                                        </div>
                                        <Swiper
                                            key={`electronics-${"ar"}`}
                                            modules={[Navigation, Autoplay]}
                                            navigation={true}
                                            autoplay={{ delay: 3000 }}
                                            loop={electronicProducts.length > 5}
                                            breakpoints={swiperBreakpoints}
                                            className="products"
                                        >
                                            {electronicProducts.map((p) => (
                                                <SwiperSlide key={p.id}>
                                                    <ProductCard
                                                        product={p}
                                                        isInCart={cart.some(
                                                            (c) =>
                                                                c.id === p.id,
                                                        )}
                                                        onAddToCart={addToCart}
                                                        isFavorite={favoriteIds.includes(
                                                            p.id,
                                                        )}
                                                        onToggleFavorite={
                                                            toggleFavorite
                                                        }
                                                        onSelectProduct={(
                                                            prod,
                                                        ) =>
                                                            setSelectedProduct(
                                                                prod,
                                                            )
                                                        }
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            <div className="slider_products slide">
                                <div className="container">
                                    <div className="slide_product mySwiper">
                                        <div
                                            className="top_slide"
                                            id="Appliances"
                                        >
                                            <h2>
                                                <i className="fa-solid fa-tags"></i>{" "}
                                                {"أجهزة منزلية"}
                                            </h2>
                                        </div>
                                        <Swiper
                                            key={`appliances-${"ar"}`}
                                            modules={[Navigation, Autoplay]}
                                            navigation={true}
                                            autoplay={{ delay: 3200 }}
                                            loop={applianceProducts.length > 5}
                                            breakpoints={swiperBreakpoints}
                                            className="products"
                                        >
                                            {applianceProducts.map((p) => (
                                                <SwiperSlide key={p.id}>
                                                    <ProductCard
                                                        product={p}
                                                        isInCart={cart.some(
                                                            (c) =>
                                                                c.id === p.id,
                                                        )}
                                                        onAddToCart={addToCart}
                                                        isFavorite={favoriteIds.includes(
                                                            p.id,
                                                        )}
                                                        onToggleFavorite={
                                                            toggleFavorite
                                                        }
                                                        onSelectProduct={(
                                                            prod,
                                                        ) =>
                                                            setSelectedProduct(
                                                                prod,
                                                            )
                                                        }
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            <div className="slider_products slide">
                                <div className="container">
                                    <div className="slide_product mySwiper">
                                        <div className="top_slide" id="Mobiles">
                                            <h2>
                                                <i className="fa-solid fa-tags"></i>{" "}
                                                {"موبايلات"}
                                            </h2>
                                        </div>
                                        <Swiper
                                            key={`mobiles-${"ar"}`}
                                            modules={[Navigation, Autoplay]}
                                            navigation={true}
                                            autoplay={{ delay: 2900 }}
                                            loop={mobileProducts.length > 5}
                                            breakpoints={swiperBreakpoints}
                                            className="products"
                                        >
                                            {mobileProducts.map((p) => (
                                                <SwiperSlide key={p.id}>
                                                    <ProductCard
                                                        product={p}
                                                        isInCart={cart.some(
                                                            (c) =>
                                                                c.id === p.id,
                                                        )}
                                                        onAddToCart={addToCart}
                                                        isFavorite={favoriteIds.includes(
                                                            p.id,
                                                        )}
                                                        onToggleFavorite={
                                                            toggleFavorite
                                                        }
                                                        onSelectProduct={(
                                                            prod,
                                                        ) =>
                                                            setSelectedProduct(
                                                                prod,
                                                            )
                                                        }
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>

                            <section
                                id="all-products"
                                className="all-products-section"
                                dir={"rtl"}
                            >
                                <div className="container">
                                    <div className="top_slide">
                                        <h2>
                                            <i className="fa-solid fa-boxes-stacked"></i>{" "}
                                            {"كل المنتجات"}
                                        </h2>
                                    </div>
                                    {(searchQuery.trim() ||
                                        selectedCategory !== "all") &&
                                        !showFavorites && (
                                            <p className="search-results-hint">
                                                {`${displayedProducts.length} نتيجة${
                                                    searchQuery.trim()
                                                        ? ` عن "${searchQuery.trim()}"`
                                                        : ""
                                                }`}
                                                <button
                                                    type="button"
                                                    className="clear-search-btn"
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setSelectedCategory(
                                                            "all",
                                                        );
                                                    }}
                                                >
                                                    {"مسح الفلتر"}
                                                </button>
                                            </p>
                                        )}
                                    <div className="all-products-grid">
                                        {displayedProducts.length === 0 && (
                                            <p className="empty-products">
                                                {"لا توجد منتجات مطابقة للبحث."}
                                            </p>
                                        )}
                                        {displayedProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                isInCart={cart.some(
                                                    (item) =>
                                                        item.id === product.id,
                                                )}
                                                onAddToCart={addToCart}
                                                isFavorite={favoriteIds.includes(
                                                    product.id,
                                                )}
                                                onToggleFavorite={
                                                    toggleFavorite
                                                }
                                                onSelectProduct={(prod) =>
                                                    setSelectedProduct(prod)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </>
            )}

            {activeTab === "booking" && (
                <div
                    className="container booking-page"
                    dir={"rtl"}
                    style={{
                        maxWidth: "650px",
                        margin: "40px auto",
                        padding: "30px",
                        background: "var(--bg_color)",
                        borderRadius: "15px",
                    }}
                >
                    {bookingTicket ? (
                        <TicketCard
                            ticketType="booking"
                            ticketCode={bookingTicket.code}
                            customerName={bookingTicket.customer_name}
                            customerPhone={bookingTicket.customer_phone}
                            customerEmail={bookingTicket.customer_email}
                            date={bookingTicket.booking_date}
                            timeSlot={bookingTicket.time_slot}
                            deviceOrItems={bookingTicket.device_type}
                            notes={bookingTicket.issue_description}
                            isArabic={true}
                            isExclusiveAdmin={isExclusiveAdmin}
                            onClose={() => {
                                setBookingTicket(null);
                                setBookingSuccess("");
                            }}
                        />
                    ) : (
                        <>
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: "8px",
                                }}
                            >
                                {"حجز موعد فحص الجهاز"}
                            </h2>
                            <p
                                style={{
                                    textAlign: "center",
                                    color: "var(--p_color)",
                                    marginBottom: "24px",
                                }}
                            >
                                {
                                    "احجز موعدًا لفحص جهازك مع فريق الصيانة المتخصص في المتجر."
                                }
                            </p>

                            <form
                                onSubmit={handleBookingSubmit}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "14px",
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"الاسم بالكامل"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.customer_name}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                customer_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"البريد الإلكتروني"}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.customer_email}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                customer_email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"رقم الهاتف"}
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.customer_phone}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                customer_phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"نوع الجهاز ومواصفاته"}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={
                                            "مثال: Dell G15 أو iPhone 14 أو كمبيوتر مجمع"
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.device_type}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                device_type: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"تاريخ الموعد"}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.booking_date}
                                        min={todayStr}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                booking_date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"الفترة الزمنية"}
                                    </label>
                                    <select
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.time_slot}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                time_slot: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="12:00 PM - 02:00 PM">
                                            02:00 PM - 12:00 PM
                                        </option>
                                        <option value="02:00 PM - 04:00 PM">
                                            04:00 PM - 02:00 PM
                                        </option>
                                        <option value="04:00 PM - 06:00 PM">
                                            06:00 PM - 02:00 PM
                                        </option>
                                        <option value="06:00 PM - 08:00 PM">
                                            08:00 PM - 06:00 PM
                                        </option>
                                        <option value="08:00 PM - 10:00 PM">
                                            10:00 PM - 08:00 PM
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.85rem",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {"وصف المشكلة"}
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder={
                                            "اكتب وصف المشكلة بالتفصيل..."
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border_color)",
                                        }}
                                        value={bookingForm.issue_description}
                                        onChange={(e) =>
                                            setBookingForm({
                                                ...bookingForm,
                                                issue_description:
                                                    e.target.value,
                                            })
                                        }
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{
                                        justifyContent: "center",
                                        marginTop: "10px",
                                    }}
                                >
                                    {"تأكيد "}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {activeTab === "tracking" && (
                <div
                    className="container tracking-page"
                    dir={"rtl"}
                    style={{
                        maxWidth: "650px",
                        margin: "40px auto",
                        padding: "30px",
                        background: "var(--bg_color)",
                        borderRadius: "15px",
                    }}
                >
                    <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
                        {"تتبع حالة"}
                    </h2>
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--p_color)",
                            marginBottom: "24px",
                        }}
                    >
                        {
                            "أدخل رقم التذكرة أو الطلب أو الحجز أو رقم هاتفك لمعرفة الحالة في الوقت الفعلي."
                        }
                    </p>

                    <form
                        onSubmit={handleTrackSubmit}
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "24px",
                        }}
                    >
                        <input
                            type="text"
                            required
                            placeholder={"مثال: TICK-123456 أو 010xxxxxxxx"}
                            style={{
                                flex: 1,
                                padding: "12px",
                                border: "1px solid var(--border_color)",
                                borderRadius: "8px",
                            }}
                            value={trackQuery}
                            onChange={(e) => setTrackQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn"
                            style={{ padding: "0 24px" }}
                        >
                            {"بحث"}
                        </button>
                    </form>

                    {trackResult && (
                        <div>
                            {trackResult.length === 0 ? (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: "var(--Sale_color)",
                                    }}
                                >
                                    {
                                        "لم يتم العثور على أي تذكرة صيانة أو حجز أو طلب بهذه البيانات."
                                    }
                                </p>
                            ) : (
                                trackResult.map((t, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            border: "1px solid var(--border_color)",
                                            borderRadius: "10px",
                                            padding: "16px",
                                            marginBottom: "14px",
                                            background: "var(--white_color)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <h4
                                                style={{
                                                    color: "var(--main_color)",
                                                }}
                                            >
                                                {t.record_type === "booking"
                                                    ? `حجز موعد: ${t.ticket_number}`
                                                    : t.record_type === "order"
                                                      ? `طلب توصيل: ${t.ticket_number}`
                                                      : t.record_type === "pickup"
                                                        ? `استلام بالمحل: ${t.ticket_number}`
                                                        : `تذكرة صيانة: ${t.ticket_number}`}
                                            </h4>
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    fontSize: "0.8rem",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {getStatusLabel(
                                                    t.status,
                                                    t.record_type,
                                                )}
                                            </span>
                                        </div>
                                        <p style={{ marginTop: "8px" }}>
                                            <strong>
                                                {t.record_type === "order"
                                                    ? "عنوان التوصيل:"
                                                    : t.record_type === "pickup"
                                                      ? "موعد الاستلام:"
                                                      : "الجهاز:"}
                                            </strong>{" "}
                                            {t.device_name}
                                        </p>
                                        <p>
                                            <strong>
                                                {t.record_type === "booking"
                                                    ? "تفاصيل الحجز:"
                                                    : t.record_type === "order"
                                                      ? "تفاصيل الطلب:"
                                                      : t.record_type === "pickup"
                                                        ? "تفاصيل الطلب:"
                                                        : "المشكلة:"}
                                            </strong>{" "}
                                            {t.reported_issue}
                                        </p>
                                        {(t.record_type === "booking" ||
                                            t.record_type === "pickup") && (
                                            <p>
                                                <strong>{"الموعد:"}</strong>{" "}
                                                {formatBookingDate(
                                                    t.booking_date,
                                                )}{" "}
                                                - {t.time_slot}
                                            </p>
                                        )}
                                        {t.inspection_findings && (
                                            <p>
                                                <strong>{"ملاحظات:"}</strong>{" "}
                                                {t.inspection_findings}
                                            </p>
                                        )}
                                        {t.record_type === "ticket" && (
                                            <p
                                                style={{
                                                    marginTop: "8px",
                                                    color: "#16a34a",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {"التكلفة التقديرية:"}{" "}
                                                {`${t.estimated_cost} جنيه`}
                                            </p>
                                        )}
                                        {(t.record_type === "order" ||
                                            t.record_type === "pickup") && (
                                            <p
                                                style={{
                                                    marginTop: "8px",
                                                    color: "#16a34a",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {"إجمالي الطلب:"}{" "}
                                                {`${t.final_cost} جنيه`}
                                            </p>
                                        )}
                                        {t.record_type === "booking" &&
                                            t.status === "scheduled" && (
                                                <div
                                                    style={{
                                                        marginTop: "10px",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCancelBooking(
                                                                t,
                                                            )
                                                        }
                                                        style={{
                                                            padding: "6px 14px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #dc2626",
                                                            background:
                                                                "transparent",
                                                            color: "#dc2626",
                                                            fontWeight: 600,
                                                            fontSize: "0.8rem",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {"إلغاء الحجز"}
                                                    </button>
                                                </div>
                                            )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            <footer>
                <div className="container">
                    <div className="big_row">
                        <div className="footer-brand">
                            <i className="fa-solid fa-microchip"></i>
                            <span className="logo-footer">TechStore OS</span>
                        </div>
                        <p>
                            {
                                "TechStore OS / BostanHub - أجهزة الكمبيوتر واللابتوبات وقطع الغيار وخدمات الصيانة."
                            }
                        </p>
                        <div className="icons_footer">
                            <a href="#">
                                <i className="fa-solid fa-phone"></i>
                            </a>
                            <a href="#">
                                <i className="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="#">
                                <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="#">
                                <i className="fa-brands fa-x-twitter"></i>
                            </a>
                        </div>
                    </div>
                    <div className="row">
                        <h4>{"الوصول السريع"}</h4>
                        <div className="links">
                            <a
                                href="#Electronics"
                                onClick={() => setActiveTab("home")}
                            >
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"اللابتوبات وأجهزة الكمبيوتر"}
                            </a>
                            <a
                                href="#Mobiles"
                                onClick={() => setActiveTab("home")}
                            >
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"الهواتف والأجهزة اللوحية"}
                            </a>
                            <a
                                href="#Appliances"
                                onClick={() => setActiveTab("home")}
                            >
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"الأجهزة المنزلية"}
                            </a>
                        </div>
                    </div>
                    <div className="row">
                        <h4>{"روابط سريعة"}</h4>
                        <div className="links">
                            <a href="#" onClick={() => setActiveTab("home")}>
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"الصفحة الرئيسية"}
                            </a>
                            <a href="#" onClick={() => setActiveTab("booking")}>
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"حجز موعد"}
                            </a>
                            <a
                                href="#"
                                onClick={() => setActiveTab("tracking")}
                            >
                                <i className="fa-solid fa-caret-right"></i>{" "}
                                {"تتبع الحالة"}
                            </a>
                        </div>
                    </div>
                </div>
                <div className="bottom_footer">
                    <div className="container">
                        <p>&copy; Store-tech {"جميع الحقوق محفوظة."}</p>
                    </div>
                </div>
            </footer>

            {showAuthModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(3px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            background: "var(--white_color)",
                            borderRadius: "15px",
                            width: "90%",
                            maxWidth: "400px",
                            padding: "30px",
                            position: "relative",
                            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                        }}
                    >
                        <span
                            onClick={() => setShowAuthModal(false)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                cursor: "pointer",
                                fontSize: "1.2rem",
                                color: "#6b7280",
                            }}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </span>

                        <h3
                            style={{ textAlign: "center", marginBottom: "8px" }}
                        >
                            {isRegisterMode ? "إنشاء حساب" : "تسجيل الدخول"}
                        </h3>

                        {authError && (
                            <div
                                style={{
                                    background: "#fee2e2",
                                    border: "1px solid #ef4444",
                                    color: "#b91c1c",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    fontSize: "0.85rem",
                                    marginBottom: "14px",
                                }}
                            >
                                {authError}
                            </div>
                        )}

                        <form
                            onSubmit={handleAuthSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            {isRegisterMode && (
                                <>
                                    <input
                                        type="text"
                                        required
                                        placeholder="الاسم بالكامل"
                                        value={authName}
                                        onChange={(e) =>
                                            setAuthName(e.target.value)
                                        }
                                        style={{
                                            padding: "10px",
                                            border: "1px solid var(--border_color)",
                                            borderRadius: "8px",
                                            background: "var(--bg_color)",
                                        }}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="رقم الهاتف"
                                        value={authPhone}
                                        onChange={(e) =>
                                            setAuthPhone(e.target.value)
                                        }
                                        style={{
                                            padding: "10px",
                                            border: "1px solid var(--border_color)",
                                            borderRadius: "8px",
                                            background: "var(--bg_color)",
                                        }}
                                    />
                                </>
                            )}
                            <input
                                type="email"
                                required
                                placeholder="البريد الإلكتروني"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                style={{
                                    padding: "10px",
                                    border: "1px solid var(--border_color)",
                                    borderRadius: "8px",
                                    background: "var(--bg_color)",
                                }}
                            />
                            <input
                                type="password"
                                required
                                placeholder="كلمة المرور"
                                value={authPassword}
                                onChange={(e) =>
                                    setAuthPassword(e.target.value)
                                }
                                style={{
                                    padding: "10px",
                                    border: "1px solid var(--border_color)",
                                    borderRadius: "8px",
                                    background: "var(--bg_color)",
                                }}
                            />
                            <button
                                type="submit"
                                className="btn"
                                style={{
                                    justifyContent: "center",
                                    marginTop: "8px",
                                }}
                                disabled={authLoading}
                            >
                                {authLoading
                                    ? "جاري التحميل..."
                                    : isRegisterMode
                                      ? "إنشاء حساب"
                                      : "تسجيل الدخول"}
                            </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegisterMode(!isRegisterMode);
                                    setAuthError("");
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--main_color)",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    textDecoration: "underline",
                                }}
                            >
                                {isRegisterMode
                                    ? "لديك حساب بالفعل؟ سجّل الدخول"
                                    : "ليس لديك حساب؟ أنشئ حسابًا"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isExclusiveAdmin && (
                <AddProductModal
                    isOpen={showAddProductModal}
                    onClose={() => setShowAddProductModal(false)}
                    onProductAdded={() => {
                        loadProductsFromDB();
                    }}
                />
            )}

            {selectedProduct && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(5px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2500,
                        padding: "16px",
                    }}
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        dir={"rtl"}
                        style={{
                            background: "#ffffff",
                            borderRadius: "20px",
                            maxWidth: "640px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "relative",
                            padding: "32px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            border: "1px solid #e5e7eb",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedProduct(null)}
                            style={{
                                position: "absolute",
                                top: "18px",
                                left: "18px",
                                right: "auto",
                                background: "#f3f4f6",
                                border: "none",
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#4b5563",
                                fontSize: "1.1rem",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#e5e7eb";
                                e.currentTarget.style.color = "#111827";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f3f4f6";
                                e.currentTarget.style.color = "#4b5563";
                            }}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: "24px",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        width: "160px",
                                        height: "160px",
                                        borderRadius: "16px",
                                        background: "#f9fafb",
                                        border: "1px solid #e5e7eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "10px",
                                        flexShrink: 0,
                                        margin: "0 auto",
                                    }}
                                >
                                    <img
                                        src={
                                            selectedProduct.img &&
                                            (selectedProduct.img.startsWith(
                                                "http://",
                                            ) ||
                                                selectedProduct.img.startsWith(
                                                    "https://",
                                                ) ||
                                                selectedProduct.img.startsWith(
                                                    "data:",
                                                ))
                                                ? selectedProduct.img
                                                : `/${(selectedProduct.img || "img/product/0.png").replace(/^\//, "")}`
                                        }
                                        alt={selectedProduct.name}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/img/product/0.png";
                                        }}
                                    />
                                </div>

                                <div style={{ flex: 1, minWidth: "240px" }}>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            background: "#f3f4f6",
                                            color: "#374151",
                                            fontSize: "0.75rem",
                                            fontWeight: "600",
                                            borderRadius: "6px",
                                            marginBottom: "8px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {selectedProduct.category ||
                                            selectedProduct.catetory ||
                                            "منتج"}
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: "1.3rem",
                                            fontWeight: "700",
                                            color: "#111827",
                                            marginBottom: "10px",
                                            lineHeight: "1.4",
                                        }}
                                    >
                                        {selectedProduct.name}
                                    </h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "1.4rem",
                                                fontWeight: "800",
                                                color: "#111827",
                                            }}
                                        >
                                            {Number(
                                                selectedProduct.price,
                                            ).toLocaleString()}{" "}
                                            {"ج.م"}
                                        </span>
                                        {selectedProduct.old_price && (
                                            <span
                                                style={{
                                                    fontSize: "1rem",
                                                    color: "#9ca3af",
                                                    textDecoration:
                                                        "line-through",
                                                }}
                                            >
                                                {Number(
                                                    selectedProduct.old_price,
                                                ).toLocaleString()}{" "}
                                                {"ج.م"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr
                                style={{
                                    borderColor: "#f3f4f6",
                                    margin: "4px 0",
                                }}
                            />

                            <div>
                                <h4
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "700",
                                        color: "#374151",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {"وصف ومواصفات المنتج:"}
                                </h4>
                                <div
                                    style={{
                                        color: "#4b5563",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.7",
                                        background: "#f9fafb",
                                        padding: "14px 18px",
                                        borderRadius: "12px",
                                        border: "1px solid #f3f4f6",
                                        maxHeight: "160px",
                                        overflowY: "auto",
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {selectedProduct.description ||
                                        "منتج أصلي عالي الجودة مع ضمان المتجر الرسمي، متاح للمعاينة والتسليم الفوري."}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px",
                                    marginTop: "10px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        addToCart(selectedProduct, true);
                                        setSelectedProduct(null);
                                        showToast(
                                            "تمت إضافة المنتج إلى السلة",
                                            "success",
                                        );
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: "#f3f4f6",
                                        color: "#111827",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "10px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "#e5e7eb";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "#f3f4f6";
                                    }}
                                >
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    {"إضافة إلى السلة"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickCheckout(selectedProduct)
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: "#111827",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "#000000";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "#111827";
                                    }}
                                >
                                    <i className="fa-solid fa-calendar-check"></i>
                                    {"حجز موعد معاينة / شراء"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
