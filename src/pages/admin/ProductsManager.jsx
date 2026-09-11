import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import AddProductModal from "./AddProductModal";

const ProductsManager = () => {
    const [products, setProducts] = useState([]);
    const { showToast, showConfirm } = useNotification();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadProducts = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/products");
            if (res.data.success) {
                setProducts(res.data.products);
            }
        } catch (err) {
            console.error(err);
        } finally {
            const elapsed = Date.now() - start;
            const minDelay = 3000; // 3 seconds
            if (elapsed < minDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minDelay - elapsed),
                );
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(loadProducts);
    }, []);

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
                    {"جاري تحميل المنتجات..."}
                </p>
            </div>
        );
    }

    const handleDelete = async (id) => {
        const confirmed = await showConfirm({
            title: "تأكيد حذف المنتج",
            message:
                "هل أنت متأكد من رغبتك في حذف هذا المنتج من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmText: "نعم، احذف",
            cancelText: "إلغاء",
            isDanger: true,
        });

        if (!confirmed) return;

        try {
            await API.delete(`/admin/products/${id}`);
            showToast("تم حذف المنتج بنجاح", "success");
            queueMicrotask(loadProducts);
        } catch (err) {
            console.error(err);
            showToast("فشل حذف المنتج", "error");
        }
    };

    const getImgSrc = (path) => {
        if (!path) return "/img/product/0.png";
        if (
            path.startsWith("http://") ||
            path.startsWith("https://") ||
            path.startsWith("data:")
        ) {
            return path;
        }
        return `/${path.replace(/^\//, "")}`;
    };

    return (
        <div>
            <div className="dashboard-card">
                <div className="card-header">
                    <h3 className="card-title">
                        {"مخزون المنتجات وقطع الغيار"}
                    </h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + {"إضافة منتج جديد"}
                    </button>
                </div>

                <AddProductModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onProductAdded={loadProducts}
                />

                <div className="table-responsive">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>{"الصورة"}</th>
                                <th>{"اسم المنتج"}</th>
                                <th>{"القسم"}</th>
                                <th>{"الماركة"}</th>
                                <th>{"السعر"}</th>
                                <th>{"المخزون"}</th>
                                <th>{"إجراءات"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <img
                                            src={getImgSrc(p.image_url)}
                                            alt={p.name}
                                            style={{
                                                width: "42px",
                                                height: "42px",
                                                objectFit: "contain",
                                                borderRadius: "6px",
                                                border: "1px solid var(--border-color)",
                                                background: "#fff",
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "/img/product/0.png";
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <strong>{p.name}</strong>
                                    </td>
                                    <td>
                                        <span className="badge badge-confirmed">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td>{p.brand || "N/A"}</td>
                                    <td>
                                        EGP {Number(p.price).toLocaleString()}
                                    </td>
                                    <td>
                                        {p.stock_quantity > 0 ? (
                                            p.stock_quantity
                                        ) : (
                                            <span
                                                style={{
                                                    color: "var(--danger)",
                                                }}
                                            >
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsManager;
