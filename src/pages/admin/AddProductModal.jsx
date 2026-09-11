import { useState } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

export default function AddProductModal({ isOpen, onClose, onProductAdded }) {
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({
        name: "",
        category: "electronics",
        brand: "",
        price: "",
        old_price: "",
        stock_quantity: 10,
        image_url: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let finalImageUrl = formData.image_url || "img/product/0.png";

            if (imageFile) {
                setUploadingImage(true);
                const imgData = new FormData();
                imgData.append("image", imageFile);

                const uploadRes = await API.post(
                    "/admin/upload-image",
                    imgData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );

                if (uploadRes.data.success) {
                    finalImageUrl = uploadRes.data.imageUrl;
                }
                setUploadingImage(false);
            }

            const res = await API.post("/admin/products", {
                name: formData.name,
                category: formData.category,
                brand: formData.brand || null,
                price: parseFloat(formData.price),
                old_price: formData.old_price
                    ? parseFloat(formData.old_price)
                    : null,
                stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
                image_url: finalImageUrl,
                description: formData.description || null,
            });

            if (res.data.success) {
                showToast(
                    "تمت إضافة المنتج بنجاح وحفظه في قاعدة البيانات!",
                    "success",
                );
                onProductAdded();
                onClose();
            } else {
                setError(res.data.message || "فشل إضافة المنتج");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "حدث خطأ في السيرفر",
            );
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    return (
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
        >
            <div
                style={{
                    background: "var(--white_color, #fff)",
                    borderRadius: "20px",
                    maxWidth: "580px",
                    width: "100%",
                    padding: "30px",
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
                        marginBottom: "18px",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.3rem",
                            color: "var(--color_heading, #111)",
                        }}
                    >
                        ⚡ إضافة منتج جديد إلى المتجر (MySQL)
                    </h3>
                    <span
                        onClick={onClose}
                        style={{
                            cursor: "pointer",
                            fontSize: "1.4rem",
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
                            (e.currentTarget.style.background = "transparent")
                        }
                        title="إغلاق"
                    >
                        <svg
                            width="20"
                            height="20"
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

                {error && (
                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            marginBottom: "16px",
                            fontSize: "0.9rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
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
                                fontWeight: "bold",
                            }}
                        >
                            اسم المنتج *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="مثال: Lenovo Legion 5 Pro RTX 4060"
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                            }}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    marginBottom: "4px",
                                    fontWeight: "bold",
                                }}
                            >
                                القسم *
                            </label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                }}
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                    })
                                }
                            >
                                <option value="electronics">
                                    Electronics (إلكترونيات ولابتوبات)
                                </option>
                                <option value="mobiles">
                                    Mobiles (هواتف وتابلت)
                                </option>
                                <option value="appliances">
                                    Appliances (أجهزة وشاشات)
                                </option>
                                <option value="spare_part">
                                    Spare Parts (قطع غيار)
                                </option>
                                <option value="accessory">
                                    Accessories (إكسسوارات)
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    marginBottom: "4px",
                                    fontWeight: "bold",
                                }}
                            >
                                البراند (الماركة)
                            </label>
                            <input
                                type="text"
                                placeholder="مثال: Apple، Dell، Samsung..."
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                }}
                                value={formData.brand}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        brand: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    marginBottom: "4px",
                                    fontWeight: "bold",
                                }}
                            >
                                السعر الحالي (ج.م) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="250"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                }}
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: e.target.value,
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
                                    fontWeight: "bold",
                                }}
                            >
                                السعر قبل الخصم (اختياري)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="300 (لعرضه في Hot Deals)"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                }}
                                value={formData.old_price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        old_price: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            border: "2px dashed #cbd5e1",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "rgba(0,0,0,0.01)",
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                marginBottom: "8px",
                                fontWeight: "bold",
                            }}
                        >
                            🖼️ صورة المنتج (رفع من جهازك أو رابط)
                        </label>

                        <div
                            style={{
                                display: "flex",
                                gap: "16px",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ fontSize: "0.85rem" }}
                            />

                            {previewUrl && (
                                <div style={{ position: "relative" }}>
                                    <img
                                        src={previewUrl}
                                        alt="معاينة"
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            objectFit: "contain",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: "10px" }}>
                            <span
                                style={{ fontSize: "0.8rem", color: "#64748b" }}
                            >
                                أو ادخل مسار/رابط الصورة يدوياً:
                            </span>
                            <input
                                type="text"
                                placeholder="img/product/0.png"
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                    marginTop: "4px",
                                    fontSize: "0.85rem",
                                }}
                                value={formData.image_url}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        image_url: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    marginBottom: "4px",
                                    fontWeight: "bold",
                                }}
                            >
                                الكمية في المخزن
                            </label>
                            <input
                                type="number"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                }}
                                value={formData.stock_quantity}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stock_quantity: e.target.value,
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
                                    fontWeight: "bold",
                                }}
                            >
                                وصف سريع للمنتج
                            </label>
                            <textarea
                                placeholder="اكتب كل مواصفة في سطر منفصل، مثال:&#10;Core i7&#10;رام 16 جيجا&#10;تخزين 512 جيجا SSD"
                                rows={4}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                }}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            marginTop: "10px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            style={{ background: "#e2e8f0", color: "#334155" }}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{
                                background: "#10b981",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                minWidth: "160px",
                                justifyContent: "center",
                            }}
                        >
                            {loading ? (
                                <>
                                    <HashLoader color="#ffffff" size={20} />
                                    <span>
                                        {uploadingImage
                                            ? "جاري رفع الصورة..."
                                            : "جاري الحفظ..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                        <polyline points="7 3 7 8 15 8"></polyline>
                                    </svg>
                                    <span>حفظ ونشر في المتجر</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
