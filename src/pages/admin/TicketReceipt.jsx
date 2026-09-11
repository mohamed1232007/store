import { useRef } from "react";

const statusLabels = {
    received: "استُلم",
    diagnosing: "قيد الفحص",
    waiting_parts: "انتظار قطع",
    in_progress: "جاري الإصلاح",
    ready_for_pickup: "جاهز للاستلام",
    delivered: "تم التسليم",
    cancelled: "ملغي",
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

function Row({ label, value, mono }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "5px 0",
                borderBottom: "1px dotted #e0e0e0",
                fontSize: "13px",
                gap: "10px",
            }}
        >
            <span style={{ color: "#888", fontSize: "12px", flexShrink: 0 }}>
                {label}
            </span>
            <span
                style={{
                    fontWeight: "600",
                    textAlign: "left",
                    fontFamily: mono ? "monospace" : "inherit",
                    wordBreak: "break-all",
                }}
            >
                {value}
            </span>
        </div>
    );
}

export default function TicketReceipt({ ticket, onClose }) {
    const printRef = useRef();

    if (!ticket) return null;

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "_blank", "width=600,height=850");
        win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>إيصال صيانة - ${ticket.ticket_number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;background:#fff;padding:24px;color:#111;}
</style>
</head>
<body>${content}</body>
</html>`);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 400);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4000,
                padding: "20px",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    maxWidth: "460px",
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderBottom: "1px solid #eee",
                        background: "#fafafa",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <span
                        style={{
                            fontWeight: "bold",
                            fontSize: "0.95rem",
                            color: "#333",
                        }}
                    >
                        إيصال الصيانة
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                background: "#111",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "7px 16px",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            طباعة
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: "#e2e8f0",
                                color: "#333",
                                border: "none",
                                borderRadius: "8px",
                                padding: "7px 14px",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                            }}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>

                <div
                    ref={printRef}
                    style={{ padding: "24px", direction: "rtl" }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            borderBottom: "2px dashed #000",
                            paddingBottom: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "20px",
                                fontWeight: "900",
                                letterSpacing: "1px",
                            }}
                        >
                            ⚡ TechStore OS
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#666",
                                marginTop: "3px",
                            }}
                        >
                            إيصال استلام جهاز للصيانة
                        </div>
                        <div
                            style={{
                                fontSize: "26px",
                                fontWeight: "900",
                                letterSpacing: "3px",
                                marginTop: "10px",
                                fontFamily: "monospace",
                                color: "#000",
                            }}
                        >
                            {ticket.ticket_number}
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#888",
                                marginTop: "4px",
                            }}
                        >
                            تاريخ الاستلام: {formatDate(ticket.created_at)}
                        </div>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                        <div
                            style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                color: "#aaa",
                                letterSpacing: "1px",
                                marginBottom: "6px",
                            }}
                        >
                            بيانات العميل
                        </div>
                        <Row label="الاسم" value={ticket.customer_name} />
                        <Row label="الهاتف" value={ticket.customer_phone} />
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                        <div
                            style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                color: "#aaa",
                                letterSpacing: "1px",
                                marginBottom: "6px",
                            }}
                        >
                            بيانات الجهاز
                        </div>
                        <Row label="الجهاز" value={ticket.device_name} />
                        {ticket.device_serial && (
                            <Row
                                label="السيريال"
                                value={ticket.device_serial}
                                mono
                            />
                        )}
                        <Row label="المشكلة" value={ticket.reported_issue} />
                    </div>

                    <div
                        style={{
                            background: "#f8f8f8",
                            borderRadius: "10px",
                            padding: "12px 16px",
                            margin: "14px 0",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#888",
                                marginBottom: "4px",
                            }}
                        >
                            التكلفة التقديرية
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "900",
                                color: "#111",
                            }}
                        >
                            EGP{" "}
                            {Number(
                                ticket.estimated_cost || 0,
                            ).toLocaleString()}
                        </div>
                    </div>

                    {ticket.expected_delivery_date && (
                        <div
                            style={{
                                background: "#111",
                                color: "#fff",
                                borderRadius: "10px",
                                padding: "10px 16px",
                                margin: "10px 0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "12px",
                                    color: "#ffffff",
                                    opacity: 0.8,
                                }}
                            >
                                📅 معاد التسليم المتوقع
                            </span>
                            <span
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    color: "#ffffff",
                                }}
                            >
                                {formatDate(ticket.expected_delivery_date)}
                            </span>
                        </div>
                    )}

                    <Row
                        label="الحالة"
                        value={
                            <span
                                style={{
                                    background: "#111",
                                    color: "#fff",
                                    padding: "2px 12px",
                                    borderRadius: "20px",
                                    fontSize: "11px",
                                }}
                            >
                                {statusLabels[ticket.status] || ticket.status}
                            </span>
                        }
                    />

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            borderTop: "2px dashed #ccc",
                            paddingTop: "14px",
                            fontSize: "11px",
                            color: "#888",
                            lineHeight: "1.9",
                        }}
                    >
                        <div>شكراً لثقتك في TechStore OS </div>
                        <div>يرجى الاحتفاظ بهذا الإيصال حتى استلام الجهاز</div>
                        <div
                            style={{
                                marginTop: "6px",
                                fontFamily: "monospace",
                                fontSize: "10px",
                                letterSpacing: "1px",
                                color: "#bbb",
                            }}
                        >
                            {ticket.ticket_number}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
