import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function TicketCard({
    ticketType = "order",
    ticketCode = "",
    customerName = "",
    customerPhone = "",
    customerEmail = "",
    date = "",
    timeSlot = "",
    deviceOrItems = "",
    notes = "",
    totalAmount = null,
    onClose = null,
    isExclusiveAdmin = false,
    showLocationNotice = true,
}) {
    const ticketRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(ticketCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    const renderField = (label, value) =>
        value && (
            <div
                style={{
                    background: "#f8fafc",
                    padding: "8px 10px",
                    borderRadius: 8,
                }}
            >
                <span
                    style={{
                        color: "#64748b",
                        display: "block",
                        fontSize: "0.7rem",
                    }}
                >
                    {label}
                </span>
                <strong style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                    {value}
                </strong>
            </div>
        );

    const dir = "rtl";

    const formattedDate = (() => {
        if (!date) return "";
        const datePart = String(date).split("T")[0];
        const parts = datePart.split("-");
        if (parts.length !== 3) return datePart;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    })();

    return (
        <div
            className="ticket-receipt-overlay"
            style={{
                width: "100%",
                maxWidth: 460,
                margin: "15px auto",
                padding: "0 8px",
            }}
            dir={dir}
        >
            <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-ticket, .printable-ticket * { visibility: visible !important; }
          .printable-ticket { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 16px !important; box-shadow: none !important; border: 2px solid #000 !important; background: #fff !important; }
          .no-print { display: none !important; }
        }
        @media (max-width: 480px) {
          .ticket-receipt-overlay { padding: 0 4px !important; }
          .printable-ticket { padding: 16px 12px !important; }
          .ticket-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
            <div
                ref={ticketRef}
                className="printable-ticket"
                style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "2px dashed #0284c7",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    padding: "20px 16px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                            "linear-gradient(90deg, #0284c7, #38bdf8, #0ea5e9)",
                    }}
                />

                <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.3rem",
                            margin: "0 auto 8px",
                        }}
                    >
                        <i className="fa-solid fa-check" />
                    </div>
                    <span
                        style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            borderRadius: 14,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            marginBottom: 5,
                        }}
                    >
                        {ticketType === "order"
                            ? "تأكيد طلب الشراء والمعاينة"
                            : "تذكرة حجز موعد فحص وصيانة"}
                    </span>
                    <h2
                        style={{
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: "3px 0",
                        }}
                    >
                        {"تم تأكيد طلبك بنجاح!"}
                    </h2>
                    <p
                        style={{
                            fontSize: "0.72rem",
                            color: "#64748b",
                            margin: 0,
                            lineHeight: 1.4,
                        }}
                    >
                        {
                            "يرجى الاحتفاظ برقم التذكرة أو أخذ لقطة شاشة أو طباعتها"
                        }
                    </p>
                </div>

                <div
                    style={{
                        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                        border: "2px solid #cbd5e1",
                        borderRadius: 12,
                        padding: "10px 14px",
                        margin: "10px 0",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "#64748b",
                            letterSpacing: "0.5px",
                        }}
                    >
                        {"رقم التذكرة / كود المتابعة"}
                    </span>
                    <div
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 900,
                            letterSpacing: 2,
                            color: "#0284c7",
                            fontFamily: "monospace",
                        }}
                    >
                        {ticketCode}
                    </div>
                    <button
                        type="button"
                        className="no-print"
                        onClick={handleCopy}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 12px",
                            background: copied ? "#10b981" : "#ffffff",
                            color: copied ? "#ffffff" : "#0284c7",
                            border: "1px solid #0284c7",
                            borderRadius: 14,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            marginTop: 2,
                        }}
                    >
                        <i
                            className={
                                copied
                                    ? "fa-solid fa-check"
                                    : "fa-regular fa-copy"
                            }
                        />
                        {copied ? "تم النسخ!" : "نسخ الكود"}
                    </button>
                </div>

                <div
                    className="ticket-details-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        margin: "10px 0",
                    }}
                >
                    {renderField("اسم العميل:", customerName)}
                    {renderField("رقم الهاتف:", customerPhone)}
                    {renderField("البريد الإلكتروني:", customerEmail)}
                    {renderField("تاريخ الموعد:", formattedDate)}
                    {renderField("الفترة الزمنية:", timeSlot)}
                </div>

                {deviceOrItems && (
                    <div
                        style={{
                            background: "#f8fafc",
                            padding: "8px 10px",
                            borderRadius: 8,
                            marginBottom: 8,
                            fontSize: "0.75rem",
                        }}
                    >
                        <span
                            style={{
                                color: "#64748b",
                                display: "block",
                                fontSize: "0.65rem",
                                marginBottom: 2,
                            }}
                        >
                            {ticketType === "order"
                                ? "المنتجات المطلوبة:"
                                : "نوع الجهاز:"}
                        </span>
                        <strong style={{ color: "#1e293b", lineHeight: 1.4 }}>
                            {deviceOrItems}
                        </strong>
                    </div>
                )}

                {notes && (
                    <div
                        style={{
                            background: "#f8fafc",
                            padding: "8px 10px",
                            borderRadius: 8,
                            marginBottom: 8,
                            fontSize: "0.75rem",
                        }}
                    >
                        <span
                            style={{
                                color: "#64748b",
                                display: "block",
                                fontSize: "0.65rem",
                                marginBottom: 2,
                            }}
                        >
                            {"ملاحظات:"}
                        </span>
                        <strong style={{ color: "#1e293b", lineHeight: 1.4 }}>
                            {notes}
                        </strong>
                    </div>
                )}

                {totalAmount != null && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#ecfeff",
                            border: "1px solid #a5f3fc",
                            padding: "8px 12px",
                            borderRadius: 8,
                            marginBottom: 10,
                        }}
                    >
                        <span
                            style={{
                                color: "#0e7490",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                            }}
                        >
                            {"الإجمالي:"}
                        </span>
                        <strong
                            style={{ color: "#0891b2", fontSize: "0.95rem" }}
                        >
                            {Number(totalAmount).toLocaleString()} {"ج.م"}
                        </strong>
                    </div>
                )}

                {showLocationNotice && (
                    <div
                        style={{
                            background: "#fffbeb",
                            border: "1px solid #fde68a",
                            padding: "7px 10px",
                            borderRadius: 8,
                            fontSize: "0.68rem",
                            color: "#92400e",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 12,
                        }}
                    >
                        <i
                            className="fa-solid fa-location-dot"
                            style={{ fontSize: "0.85rem" }}
                        />
                        <span>
                            {
                                "مقر الاستلام: TechStore OS / BostanHub - مول البستان، التحرير."
                            }
                        </span>
                    </div>
                )}

                <div
                    className="no-print"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        justifyContent: "center",
                        marginTop: 8,
                    }}
                >
                    <button
                        type="button"
                        onClick={handlePrint}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            background: "#0284c7",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#0369a1")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#0284c7")
                        }
                    >
                        <i className="fa-solid fa-print" />
                        {"طباعة / PDF"}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                background: "#f1f5f9",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: "0.75rem",
                            }}
                        >
                            <i className="fa-solid fa-rotate-left" />
                            {"حجز جديد"}
                        </button>
                    )}
                    <Link
                        to="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            background: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: "none",
                            fontSize: "0.75rem",
                        }}
                    >
                        <i className="fa-solid fa-store" />
                        {"العودة للمتجر"}
                    </Link>
                    {isExclusiveAdmin && (
                        <Link
                            to="/admin"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 14px",
                                background:
                                    "linear-gradient(135deg, #2563eb, #38bdf8)",
                                color: "#ffffff",
                                borderRadius: 8,
                                fontWeight: 600,
                                textDecoration: "none",
                                fontSize: "0.75rem",
                            }}
                        >
                            <i className="fa-solid fa-gauge" />
                            {"لوحة الإدارة"}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
