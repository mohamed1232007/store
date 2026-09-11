import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const StorePickupsManager = () => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast, showConfirm } = useNotification();

    const formatDate = (value) => {
        if (!value) return "-";
        const datePart = String(value).split("T")[0];
        const parts = datePart.split("-");
        if (parts.length !== 3) return datePart;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    };

    const parseItems = (items) => {
        if (!items) return [];
        try {
            return typeof items === "string" ? JSON.parse(items) : items;
        } catch {
            return [];
        }
    };

    const loadPickups = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/store-pickups");
            if (res.data.success) {
                setPickups(res.data.pickups);
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
        queueMicrotask(loadPickups);
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/admin/store-pickups/${id}/status`, {
                status: newStatus,
            });
            showToast("تم تحديث حالة الطلب بنجاح", "success");
            loadPickups();
        } catch (err) {
            console.error(err);
            showToast("فشل تحديث حالة الطلب", "error");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm({
            title: "حذف طلب الاستلام",
            message:
                "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            isDanger: true,
        });

        if (!confirmed) return;

        try {
            await API.delete(`/admin/store-pickups/${id}`);
            showToast("تم حذف الطلب بنجاح", "success");
            loadPickups();
        } catch (err) {
            console.error(err);
            showToast("فشل حذف الطلب", "error");
        }
    };

    const statusLabel = {
        pending: "قيد الانتظار",
        confirmed: "مؤكد",
        completed: "مكتمل",
        cancelled: "ملغى",
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
                    {"جاري تحميل طلبات الاستلام..."}
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">
                    {"طلبات المعاينة والاستلام بالمحل"}
                </h3>
                <span
                    style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        background: "var(--bg-secondary)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                    }}
                >
                    {pickups.length} طلب
                </span>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>{"رقم الطلب"}</th>
                            <th>{"العميل"}</th>
                            <th>{"المنتجات"}</th>
                            <th>{"الكمية"}</th>
                            <th>{"السعر النهائي"}</th>
                            <th>{"موعد الزيارة"}</th>
                            <th>{"الحالة"}</th>
                            <th>{"تغيير الحالة"}</th>
                            <th>{"حذف"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pickups.length > 0 ? (
                            pickups.map((p) => {
                                const items = parseItems(p.items);
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <strong
                                                style={{
                                                    color: "var(--accent)",
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {p.pickup_code}
                                            </strong>
                                        </td>
                                        <td>
                                            <div>{p.customer_name}</div>
                                            <small
                                                style={{
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {p.customer_phone}
                                            </small>
                                            {p.customer_email && (
                                                <small
                                                    style={{
                                                        display: "block",
                                                        color: "var(--text-muted)",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {p.customer_email}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <ul
                                                style={{
                                                    margin: 0,
                                                    padding: "0 16px",
                                                    fontSize: "0.82rem",
                                                    lineHeight: "1.6",
                                                }}
                                            >
                                                {items.length > 0 ? (
                                                    items.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.name}
                                                            {item.quantity > 1
                                                                ? ` x${item.quantity}`
                                                                : ""}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li
                                                        style={{
                                                            color: "var(--text-muted)",
                                                        }}
                                                    >
                                                        -
                                                    </li>
                                                )}
                                            </ul>
                                        </td>
                                        <td>
                                            <strong
                                                style={{ fontSize: "1.05rem" }}
                                            >
                                                {p.total_quantity}
                                            </strong>
                                            <small
                                                style={{
                                                    display: "block",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                قطعة
                                            </small>
                                        </td>
                                        <td>
                                            <strong
                                                style={{
                                                    color: "var(--success, #22c55e)",
                                                    fontSize: "1rem",
                                                }}
                                            >
                                                {Number(
                                                    p.total_amount,
                                                ).toLocaleString("ar-EG")}{" "}
                                                ج.م
                                            </strong>
                                        </td>
                                        <td>
                                            <div>
                                                {formatDate(p.visit_date)}
                                            </div>
                                            <small
                                                style={{
                                                    color: "var(--accent)",
                                                }}
                                            >
                                                {p.time_slot}
                                            </small>
                                            {p.notes && (
                                                <small
                                                    style={{
                                                        display: "block",
                                                        color: "var(--text-muted)",
                                                        fontSize: "0.75rem",
                                                        marginTop: "2px",
                                                    }}
                                                >
                                                    {p.notes}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-${p.status}`}
                                            >
                                                {statusLabel[p.status] ||
                                                    p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="form-control"
                                                style={{
                                                    padding: "4px 8px",
                                                    fontSize: "0.8rem",
                                                }}
                                                value={p.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        p.id,
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="pending">
                                                    {"قيد الانتظار"}
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
                                                    handleDelete(p.id)
                                                }
                                            >
                                                {"حذف"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
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
                                    {"لا توجد طلبات استلام بالمحل حتى الآن."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StorePickupsManager;
