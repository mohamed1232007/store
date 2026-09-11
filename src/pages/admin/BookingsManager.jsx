import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const BookingsManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast, showConfirm } = useNotification();

    const formatBookingDate = (value) => {
        if (!value) return "-";
        const datePart = String(value).split("T")[0];
        const parts = datePart.split("-");
        if (parts.length !== 3) return datePart;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    };

    const loadBookings = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/bookings");
            if (res.data.success) {
                setBookings(res.data.bookings);
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
        queueMicrotask(loadBookings);
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/admin/bookings/${id}/status`, {
                status: newStatus,
            });
            showToast("تم تحديث حالة الحجز بنجاح", "success");
            loadBookings();
        } catch (err) {
            console.error(err);
            showToast("فشل تحديث حالة الحجز", "error");
        }
    };

    const handleDeleteOne = async (id) => {
        const confirmed = await showConfirm({
            title: "حذف الحجز",
            message:
                "هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            isDanger: true,
        });

        if (!confirmed) return;

        try {
            await API.delete(`/admin/bookings/${id}`);
            showToast("تم حذف الحجز بنجاح", "success");
            loadBookings();
        } catch (err) {
            console.error(err);
            showToast("فشل حذف الحجز", "error");
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
                    {"جاري تحميل حجوزات الفحص..."}
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">{"حجوزات فحص الأجهزة"}</h3>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>{"رقم الحجز"}</th>
                            <th>{"العميل"}</th>
                            <th>{"الجهاز"}</th>
                            <th>{"وصف المشكلة"}</th>
                            <th>{"الموعد"}</th>
                            <th>{"الحالة"}</th>
                            <th>{"الإجراء"}</th>
                            <th>{"حذف"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? (
                            bookings.map((b) => (
                                <tr key={b.id}>
                                    <td>
                                        <strong>{b.booking_code}</strong>
                                    </td>
                                    <td>
                                        <div>{b.customer_name}</div>
                                        <small
                                            style={{
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {b.customer_phone}
                                        </small>
                                    </td>
                                    <td>{b.device_type}</td>
                                    <td>{b.issue_description}</td>
                                    <td>
                                        <div>
                                            {formatBookingDate(b.booking_date)}
                                        </div>
                                        <small
                                            style={{ color: "var(--accent)" }}
                                        >
                                            {b.time_slot}
                                        </small>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-${b.status}`}
                                        >
                                            {{
                                                scheduled: "معلق",
                                                attended: "تم الحضور",
                                                completed: "مكتمل",
                                                cancelled: "ملغى",
                                            }[b.status] || b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-control"
                                            style={{
                                                padding: "4px 8px",
                                                fontSize: "0.8rem",
                                            }}
                                            value={b.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    b.id,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="scheduled">
                                                {"معلق"}
                                            </option>
                                            <option value="attended">
                                                {"تم الحضور"}
                                            </option>
                                            <option value="completed">
                                                {"مكتمل"}
                                            </option>
                                            <option value="cancelled">
                                                {"ملغى"}
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                handleDeleteOne(b.id)
                                            }
                                        >
                                            {"حذف"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    style={{
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {"لا توجد حجوزات فحص معلقة حاليًا."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingsManager;
