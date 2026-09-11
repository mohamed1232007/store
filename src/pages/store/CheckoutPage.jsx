import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/useLanguage";
import { useNotification } from "../../context/NotificationContext";
import "./StoreOriginal.css";
import StoreHeader from "./components/StoreHeader";
import CartDrawer from "./components/CartDrawer";
import TicketCard from "./components/TicketCard";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function CheckoutPage() {
    const { user, isExclusiveAdmin, logout } = useAuth();
    const { showToast } = useNotification();
    const navigate = useNavigate();

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        if (!saved) return [];

        try {
            return JSON.parse(saved);
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isArabic } = useLanguage();

    const [customerName, setCustomerName] = useState(user?.name || "");
    const [customerEmail, setCustomerEmail] = useState(user?.email || "");
    const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
    const [visitDate, setVisitDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("12:00 PM - 02:00 PM");
    const [inspectionNotes, setInspectionNotes] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [shippingAddress, setShippingAddress] = useState("");
    const [city, setCity] = useState("");

    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(null);

    const todayStr = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    })();

    useEffect(() => {
        document.body.classList.remove("dark-theme");
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

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

    const removeFromCart = (id) =>
        setCart((prev) => prev.filter((item) => item.id !== id));

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const DELIVERY_FEE = 50;
    const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
    const finalTotal = subtotal + deliveryFee;

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showToast("السلة فارغة! يرجى إضافة منتجات أولاً.", "warning");
            return;
        }

        if (
            deliveryMethod === "delivery" &&
            (!shippingAddress.trim() || !city.trim())
        ) {
            showToast("يرجى إدخال العنوان والمدينة للتوصيل", "warning");
            return;
        }

        setLoading(true);

        try {
            if (deliveryMethod === "delivery") {
                const res = await fetch(`${API_BASE}/store/orders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        user_id: user?.id,
                        customer_name: customerName,
                        customer_email: customerEmail,
                        customer_phone: customerPhone,
                        shipping_address: shippingAddress,
                        city,
                        items: cart.map((i) => ({
                            product_id: i.id,
                            id: i.id,
                            name: i.name,
                            price: i.price,
                            quantity: i.quantity,
                        })),
                        total_amount: finalTotal,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setOrderPlaced({
                        type: "delivery",
                        code: data.orderNumber,
                        total: finalTotal,
                        items: cart.map((i) => i.name).join(", "),
                    });
                    setCart([]);
                    localStorage.removeItem("cart");
                    showToast(
                        "تم تأكيد طلبك، سيتم التوصيل والدفع عند الاستلام!",
                        "success",
                    );
                } else {
                    showToast(data.message || "فشل إتمام الطلب", "error");
                }
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/store/store-pickup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: user?.id,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    items: cart.map((i) => ({
                        product_id: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                    total_quantity: cart.reduce(
                        (sum, i) => sum + i.quantity,
                        0,
                    ),
                    total_amount: finalTotal,
                    visit_date: visitDate,
                    time_slot: timeSlot,
                    notes: inspectionNotes || null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setOrderPlaced({
                    type: "store_pickup",
                    code: data.pickupCode,
                    total: finalTotal,
                    items: cart.map((i) => i.name).join(", "),
                });
                setCart([]);
                localStorage.removeItem("cart");
                showToast("تم تأكيد موعد المعاينة والاستلام بنجاح!", "success");
            } else {
                showToast(data.message || "فشل حجز موعد المعاينة", "error");
            }
        } catch (err) {
            console.error(err);
            showToast(
                "حدث خطأ أثناء إرسال الطلب، تأكد من تشغيل السيرفر.",
                "error",
            );
        } finally {
            setLoading(false);
        }
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
                onOpenAuth={() => navigate("/")}
                onLogout={logout}
                activeTab=""
                setActiveTab={() => navigate("/")}
            />

            <section className="checkout" style={{ minHeight: "70vh" }}>
                <div className="container">
                    {orderPlaced ? (
                        <TicketCard
                            ticketType="order"
                            ticketCode={orderPlaced.code}
                            customerName={customerName}
                            customerPhone={customerPhone}
                            customerEmail={customerEmail}
                            date={
                                orderPlaced.type === "delivery" ? "" : visitDate
                            }
                            timeSlot={
                                orderPlaced.type === "delivery" ? "" : timeSlot
                            }
                            deviceOrItems={
                                orderPlaced.items ||
                                cart.map((i) => i.name).join(", ")
                            }
                            notes={
                                orderPlaced.type === "delivery"
                                    ? `التوصيل إلى: ${shippingAddress}, ${city} - الدفع عند الاستلام`
                                    : ""
                            }
                            totalAmount={orderPlaced.total}
                            isArabic={isArabic}
                            isExclusiveAdmin={isExclusiveAdmin}
                            showLocationNotice={orderPlaced.type !== "delivery"}
                        />
                    ) : (
                        <>
                            <div className="ordersummary">
                                <h1>ملخص الطلب</h1>
                                <div className="items" id="checkout_items">
                                    {cart.length === 0 ? (
                                        <p
                                            style={{
                                                padding: "30px",
                                                textAlign: "center",
                                                color: "var(--p_color)",
                                            }}
                                        >
                                            السلة فارغة حالياً.{" "}
                                            <Link
                                                to="/"
                                                style={{
                                                    color: "var(--main_color)",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                تسوق الآن
                                            </Link>
                                        </p>
                                    ) : (
                                        cart.map((item) => (
                                            <div
                                                className="item_cart"
                                                key={item.id}
                                            >
                                                <div className="image_name">
                                                    <img
                                                        src={
                                                            item.img?.startsWith(
                                                                "http://",
                                                            ) ||
                                                            item.img?.startsWith(
                                                                "https://",
                                                            )
                                                                ? item.img
                                                                : `/${(item.img || "img/product/0.png").replace(/^\//, "")}`
                                                        }
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            e.target.onerror =
                                                                null;
                                                            e.target.src =
                                                                "/img/product/0.png";
                                                        }}
                                                    />
                                                    <div>
                                                        <h4>{item.name}</h4>
                                                        <p>
                                                            {Number(
                                                                item.price,
                                                            ).toLocaleString()}{" "}
                                                            ج.م
                                                        </p>
                                                        <div className="quantity_control">
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        -1,
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                            <span>
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        1,
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="delete_item"
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="bottom_summary">
                                    <div className="shop_table">
                                        <p>الإجمالي الفرعي:</p>
                                        <span className="subtotal_checkout">
                                            {subtotal.toLocaleString()} ج.م
                                        </span>
                                    </div>
                                    <div className="shop_table">
                                        <p>
                                            {deliveryMethod === "delivery"
                                                ? "رسوم التوصيل:"
                                                : "الاستلام:"}
                                        </p>
                                        <span>
                                            {deliveryMethod === "delivery"
                                                ? `${deliveryFee.toLocaleString()} ج.م`
                                                : "مجاني من المتجر"}
                                        </span>
                                    </div>
                                    <div className="shop_table">
                                        <p>الإجمالي:</p>
                                        <span className="total_checkout">
                                            {finalTotal.toLocaleString()} ج.م
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="input_info">
                                <div className="address">
                                    <h2>
                                        {deliveryMethod === "delivery"
                                            ? "التوصيل للمنزل"
                                            : "الاستلام من المتجر"}
                                    </h2>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginBottom: "18px",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeliveryMethod("pickup")
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border:
                                                    deliveryMethod === "pickup"
                                                        ? "2px solid var(--main_color)"
                                                        : "1px solid var(--border_color)",
                                                background:
                                                    deliveryMethod === "pickup"
                                                        ? "rgba(56, 189, 248, 0.08)"
                                                        : "var(--bg_color)",
                                                color: "var(--color_heading)",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="fa-solid fa-store"></i>{" "}
                                            الاستلام من المتجر
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeliveryMethod("delivery")
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border:
                                                    deliveryMethod ===
                                                    "delivery"
                                                        ? "2px solid var(--main_color)"
                                                        : "1px solid var(--border_color)",
                                                background:
                                                    deliveryMethod ===
                                                    "delivery"
                                                        ? "rgba(56, 189, 248, 0.08)"
                                                        : "var(--bg_color)",
                                                color: "var(--color_heading)",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="fa-solid fa-truck"></i>{" "}
                                            توصيل للمنزل (الدفع عند الاستلام)
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitOrder}>
                                        <div className="inputs">
                                            <label>البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                name="Email"
                                                placeholder="أدخل بريدك الإلكتروني"
                                                required
                                                value={customerEmail}
                                                onChange={(e) =>
                                                    setCustomerEmail(
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                            <label>الاسم بالكامل</label>
                                            <input
                                                type="text"
                                                name="Name"
                                                placeholder="أدخل اسمك بالكامل"
                                                required
                                                value={customerName}
                                                onChange={(e) =>
                                                    setCustomerName(
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                            <label>رقم الهاتف</label>
                                            <input
                                                type="tel"
                                                name="Phone"
                                                placeholder="أدخل رقم هاتفك"
                                                required
                                                value={customerPhone}
                                                onChange={(e) =>
                                                    setCustomerPhone(
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                            {deliveryMethod === "delivery" ? (
                                                <>
                                                    <div
                                                        style={{
                                                            background:
                                                                "rgba(56, 189, 248, 0.08)",
                                                            padding: "12px",
                                                            borderRadius:
                                                                "10px",
                                                            marginBottom:
                                                                "14px",
                                                            border: "1px solid var(--border_color)",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "0.85rem",
                                                                color: "var(--color_heading)",
                                                            }}
                                                        >
                                                            🚚 سيتم توصيل طلبك
                                                            إلى العنوان المحدد،
                                                            والدفع نقدًا عند
                                                            الاستلام.
                                                        </p>
                                                    </div>

                                                    <label>المدينة</label>
                                                    <input
                                                        type="text"
                                                        placeholder="أدخل مدينتك"
                                                        required
                                                        value={city}
                                                        onChange={(e) =>
                                                            setCity(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />

                                                    <label>
                                                        العنوان بالتفصيل
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="الحي، الشارع، رقم العقار..."
                                                        required
                                                        value={shippingAddress}
                                                        onChange={(e) =>
                                                            setShippingAddress(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        style={{
                                                            background:
                                                                "rgba(56, 189, 248, 0.08)",
                                                            padding: "12px",
                                                            borderRadius:
                                                                "10px",
                                                            marginBottom:
                                                                "14px",
                                                            border: "1px solid var(--border_color)",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "0.85rem",
                                                                color: "var(--color_heading)",
                                                            }}
                                                        >
                                                            📍 يمكنك الحضور
                                                            للمقر في مول البستان
                                                            / المحل لمعاينة وفحص
                                                            الجهاز وقطع الغيار
                                                            بنفسك قبل الدفع.
                                                        </p>
                                                    </div>

                                                    <label>
                                                        تاريخ الحضور للمحل
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={visitDate}
                                                        min={todayStr}
                                                        onChange={(e) =>
                                                            setVisitDate(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />

                                                    <label>
                                                        فترة الموعد المناسبة
                                                    </label>
                                                    <select
                                                        style={{
                                                            margin: "8px 0 22px",
                                                            padding:
                                                                "15px 10px",
                                                            borderRadius: "5px",
                                                            border: "1px solid var(--border_color)",
                                                            background:
                                                                "var(--bg_color)",
                                                            color: "var(--color_heading)",
                                                        }}
                                                        value={timeSlot}
                                                        onChange={(e) =>
                                                            setTimeSlot(
                                                                e.target.value,
                                                            )
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

                                                    <label>
                                                        ملاحظات خاصة بالفحص أو
                                                        المعاينة
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="مثال: تجربة الشاشة، فحص الرامات..."
                                                        value={inspectionNotes}
                                                        onChange={(e) =>
                                                            setInspectionNotes(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}

                                            <div className="button_div">
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        loading ||
                                                        cart.length === 0
                                                    }
                                                >
                                                    {loading
                                                        ? "جاري المعالجة..."
                                                        : deliveryMethod ===
                                                            "delivery"
                                                          ? "تأكيد الطلب (الدفع عند الاستلام)"
                                                          : "تأكيد موعد الاستلام من المتجر"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <footer>
                <div className="container">
                    <div className="big_row">
                        <div className="footer-brand">
                            <i className="fa-solid fa-microchip"></i>
                            <span>TechStore OS</span>
                        </div>
                        <p>
                            TechStore OS / BostanHub - أجهزة الكمبيوتر
                            واللابتوبات وقطع الغيار وخدمات الصيانة.
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
                </div>
                <div className="bottom_footer">
                    <div className="container">
                        <p>&copy; Store-tech جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
