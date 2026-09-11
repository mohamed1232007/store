import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const OrdersManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast, showConfirm } = useNotification();

    const loadOrders = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/orders");
            if (res.data.success) {
                setOrders(res.data.orders);
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
        queueMicrotask(loadOrders);
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await API.put(`/admin/orders/${orderId}/status`, {
                order_status: newStatus,
            });
            showToast("تم تحديث حالة الطلب بنجاح", "success");
            loadOrders();
        } catch (err) {
            console.error(err);
            showToast("فشل تحديث حالة الطلب", "error");
        }
    };

    const handleDeleteOne = async (orderId) => {
        const confirmed = await showConfirm({
            title: "حذف الطلب",
            message:
                "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            isDanger: true,
        });

        if (!confirmed) return;

        try {
            await API.delete(`/admin/orders/${orderId}`);
            showToast("تم حذف الطلب بنجاح", "success");
            loadOrders();
        } catch (err) {
            console.error(err);
            showToast("فشل حذف الطلب", "error");
        }
    };

    const statusLabels = {
        pending: "معلق",
        confirmed: "مؤكد",
        processing: "قيد التجهيز",
        shipped: "تم الشحن",
        delivered: "تم التوصيل",
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
                    {"جاري تحميل طلبات التوصيل..."}
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">{"طلبات التوصيل "}</h3>
            </div>

            <div className="table-responsive">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>{"رقم الطلب"}</th>
                            <th>{"العميل"}</th>
                            <th>{"الهاتف"}</th>
                            <th>{"الوجهة"}</th>
                            <th>{"الإجمالي"}</th>
                            <th>{"الحالة"}</th>
                            <th>{"تحديث الحالة"}</th>
                            <th>{"حذف"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((ord) => (
                                <tr key={ord.id}>
                                    <td>
                                        <strong>{ord.order_number}</strong>
                                    </td>
                                    <td>{ord.customer_name}</td>
                                    <td>{ord.customer_phone}</td>
                                    <td>
                                        {ord.city} - {ord.shipping_address}
                                    </td>
                                    <td>EGP {ord.total_amount}</td>
                                    <td>
                                        <span
                                            className={`badge badge-${ord.order_status}`}
                                        >
                                            {statusLabels[ord.order_status] ||
                                                ord.order_status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-control"
                                            style={{
                                                padding: "4px 8px",
                                                fontSize: "0.8rem",
                                            }}
                                            value={ord.order_status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    ord.id,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="pending">
                                                {"معلق"}
                                            </option>
                                            <option value="processing">
                                                {"قيد التجهيز"}
                                            </option>
                                            <option value="shipped">
                                                {"تم الشحن"}
                                            </option>
                                            <option value="delivered">
                                                {"تم التوصيل"}
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
                                                handleDeleteOne(ord.id)
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
                                    No shipping orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersManager;
