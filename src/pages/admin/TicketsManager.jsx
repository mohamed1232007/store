import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import TicketReceipt from "./TicketReceipt";

const TicketsManager = () => {
    const [tickets, setTickets] = useState([]);
    const { showToast, showConfirm } = useNotification();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [receiptTicket, setReceiptTicket] = useState(null);
    const [newTicket, setNewTicket] = useState({
        customer_name: "",
        customer_phone: "",
        device_name: "",
        device_serial: "",
        reported_issue: "",
        estimated_cost: 0,
        expected_delivery_date: "",
    });

    const loadTickets = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/tickets");
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (err) {
            console.error(err);
        } finally {
            const elapsed = Date.now() - start;
            const minDelay = 3000;
            if (elapsed < minDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minDelay - elapsed),
                );
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(loadTickets);
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/admin/tickets", newTicket);
            setShowModal(false);
            setNewTicket({
                customer_name: "",
                customer_phone: "",
                device_name: "",
                device_serial: "",
                reported_issue: "",
                estimated_cost: 0,
                expected_delivery_date: "",
            });
            showToast("تم إنشاء تذكرة الصيانة بنجاح", "success");
            loadTickets();
            if (res.data.ticket) {
                setReceiptTicket(res.data.ticket);
            }
        } catch (err) {
            console.error(err);
            showToast("فشل إنشاء تذكرة الصيانة", "error");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm({
            title: "تأكيد حذف التذكرة",
            message:
                "هل أنت متأكد من رغبتك في حذف هذه التذكرة؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            isDanger: true,
        });
        if (!confirmed) return;
        try {
            await API.delete(`/admin/tickets/${id}`);
            showToast("تم حذف التذكرة بنجاح", "success");
            queueMicrotask(loadTickets);
        } catch (err) {
            console.error(err);
            showToast("فشل حذف التذكرة", "error");
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "350px",
                    gap: "16px",
                }}
            >
                <HashLoader color="#000000" size={45} />
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.95rem",
                    }}
                >
                    {"جاري تحميل تذاكر الصيانة..."}
                </p>
            </div>
        );
    }

    const handleStatusChange = async (id, status) => {
        try {
            await API.put(`/admin/tickets/${id}`, { status });
            showToast("تم تحديث حالة تذكرة الصيانة", "success");
            queueMicrotask(loadTickets);
        } catch (err) {
            console.error(err);
            showToast("فشل تحديث حالة التذكرة", "error");
        }
    };

    const statusLabels = {
        received: "تم الاستلام",
        diagnosing: "جاري الفحص",
        waiting_parts: "في انتظار القطع",
        in_progress: "جاري الإصلاح",
        ready_for_pickup: "جاهز للاستلام",
        delivered: "مكتمل",
        cancelled: "ملغي",
    };

    const formatDeliveryDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">{"تذاكر صيانة"}</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    {"+ تسجيل جهاز جديد"}
                </button>
            </div>

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(5px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3000,
                        padding: "20px",
                    }}
                    onClick={(e) =>
                        e.target === e.currentTarget && setShowModal(false)
                    }
                >
                    <div
                        style={{
                            background: "var(--white_color, #fff)",
                            borderRadius: "20px",
                            maxWidth: "600px",
                            width: "100%",
                            padding: "28px",
                            boxShadow: "0 25px 35px -5px rgba(0,0,0,0.3)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: "1.2rem",
                                    color: "var(--color_heading, #111)",
                                }}
                            >
                                🔧 تسجيل جهاز جديد للصيانة
                            </h4>
                            <span
                                onClick={() => setShowModal(false)}
                                style={{
                                    cursor: "pointer",
                                    color: "#666",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "rgba(0,0,0,0.08)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "transparent")
                                }
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </span>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "14px",
                                }}
                            >
                                <div className="form-group">
                                    <label className="form-label">
                                        اسم العميل *
                                    </label>
                                    <input
                                        className="form-control"
                                        required
                                        placeholder="مثال: محمد أحمد"
                                        value={newTicket.customer_name}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                customer_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        رقم الهاتف *
                                    </label>
                                    <input
                                        className="form-control"
                                        required
                                        placeholder="01xxxxxxxxx"
                                        value={newTicket.customer_phone}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                customer_phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        موديل الجهاز *
                                    </label>
                                    <input
                                        className="form-control"
                                        placeholder="مثال: Dell XPS 15 9520"
                                        required
                                        value={newTicket.device_name}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                device_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        رقم السيريال
                                    </label>
                                    <input
                                        className="form-control"
                                        placeholder="اختياري"
                                        value={newTicket.device_serial}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                device_serial: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        التكلفة التقديرية (ج.م)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        value={newTicket.estimated_cost}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                estimated_cost: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        📅 معاد التسليم المتوقع
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newTicket.expected_delivery_date}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                expected_delivery_date:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div
                                    className="form-group"
                                    style={{ gridColumn: "1 / -1" }}
                                >
                                    <label className="form-label">
                                        المشكلة / العطل *
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        required
                                        placeholder="اوصف المشكلة بالتفصيل..."
                                        value={newTicket.reported_issue}
                                        onChange={(e) =>
                                            setNewTicket({
                                                ...newTicket,
                                                reported_issue: e.target.value,
                                            })
                                        }
                                    ></textarea>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "18px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        background: "#e2e8f0",
                                        color: "#334155",
                                    }}
                                    onClick={() => setShowModal(false)}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    ✅ إنشاء التذكرة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {receiptTicket && (
                <TicketReceipt
                    ticket={receiptTicket}
                    onClose={() => setReceiptTicket(null)}
                />
            )}

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>رقم التذكرة</th>
                            <th>العميل</th>
                            <th>الجهاز</th>
                            <th>المشكلة</th>
                            <th>التكلفة التقديرية</th>
                            <th>معاد التسليم</th>
                            <th>الحالة</th>
                            <th>تحديث المرحلة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? (
                            tickets.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        <strong>{t.ticket_number}</strong>
                                    </td>
                                    <td>
                                        <div>{t.customer_name}</div>
                                        <small
                                            style={{
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {t.customer_phone}
                                        </small>
                                    </td>
                                    <td>
                                        <div>{t.device_name}</div>
                                        <small
                                            style={{ color: "var(--accent)" }}
                                        >
                                            {t.device_serial || "No S/N"}
                                        </small>
                                    </td>
                                    <td
                                        style={{
                                            maxWidth: "160px",
                                            whiteSpace: "normal",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        {t.reported_issue}
                                    </td>
                                    <td>
                                        EGP{" "}
                                        {Number(
                                            t.estimated_cost || 0,
                                        ).toLocaleString()}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: "0.85rem",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatDeliveryDate(
                                            t.expected_delivery_date,
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-${t.status}`}
                                        >
                                            {statusLabels[t.status] ||
                                                t.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-control"
                                            style={{
                                                padding: "4px 8px",
                                                fontSize: "0.8rem",
                                            }}
                                            value={t.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    t.id,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="diagnosing">
                                                {statusLabels.diagnosing}
                                            </option>
                                            <option value="in_progress">
                                                {statusLabels.in_progress}
                                            </option>
                                            <option value="ready_for_pickup">
                                                {statusLabels.ready_for_pickup}
                                            </option>
                                            <option value="delivered">
                                                {statusLabels.delivered}
                                            </option>
                                            <option value="cancelled">
                                                {statusLabels.cancelled}
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "6px",
                                                alignItems: "center",
                                            }}
                                        >
                                            <button
                                                className="btn btn-sm"
                                                title="عرض الإيصال"
                                                onClick={() =>
                                                    setReceiptTicket(t)
                                                }
                                                style={{
                                                    background: "#1e293b",
                                                    color: "#fff",
                                                    padding: "5px 9px",
                                                    borderRadius: "7px",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                🧾
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                title="حذف التذكرة"
                                                onClick={() =>
                                                    handleDelete(t.id)
                                                }
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                                    <path d="M10 11v6"></path>
                                                    <path d="M14 11v6"></path>
                                                    <path d="M9 6V4h6v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="9"
                                    style={{
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                        padding: "40px",
                                    }}
                                >
                                    لا توجد تذاكر صيانة حتى الآن.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketsManager;
