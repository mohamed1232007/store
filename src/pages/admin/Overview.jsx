import { useState, useEffect, useMemo } from "react";
import { HashLoader } from "react-spinners";
import API from "../../services/api";

const toLocalISODate = (d) => {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const parseServerDate = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
};

const RevenueCard = ({ totalRevenue, completedOrders, timeline = [] }) => {
    const daysNames = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
    ];

    const last7Days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (6 - i));
            const dateStr = toLocalISODate(d);
            const dayName = i === 6 ? "اليوم" : daysNames[d.getDay()];

            const match = timeline.find((t) => {
                const tDate = parseServerDate(t?.date_val);
                return tDate && toLocalISODate(tDate) === dateStr;
            });

            const rev = match ? Number(match.daily_revenue || 0) : 0;

            return {
                time: dayName,
                date: dateStr,
                label: "إيرادات " + dayName,
                amount: Number.isFinite(rev) ? rev : 0,
            };
        });
    }, [timeline]);

    const hasData = last7Days.some((d) => d.amount > 0);
    const safeTotal = Number.isFinite(Number(totalRevenue))
        ? Number(totalRevenue)
        : 0;

    const chartPoints = hasData
        ? last7Days
        : last7Days.map((d, i) => {
              const ratios = [0.1, 0.25, 0.45, 0.3, 0.7, 0.55, 1];
              return {
                  ...d,
                  amount: Math.round(safeTotal * ratios[i]),
              };
          });

    const [activeIndex, setActiveIndex] = useState(chartPoints.length - 1);

    useEffect(() => {
        setActiveIndex((prev) =>
            Math.min(prev, chartPoints.length - 1) < 0
                ? 0
                : Math.min(prev, chartPoints.length - 1),
        );
    }, [chartPoints.length]);

    const activePoint =
        chartPoints[activeIndex] || chartPoints[chartPoints.length - 1];

    const width = 300;
    const height = 120;
    const paddingX = 20;
    const paddingY = 20;

    const maxVal = Math.max(...chartPoints.map((p) => p.amount), 1);

    const coords = chartPoints.map((p, i) => {
        const x =
            (i / Math.max(chartPoints.length - 1, 1)) * (width - paddingX * 2) +
            paddingX;
        const y =
            height - paddingY - (p.amount / maxVal) * (height - paddingY * 2);
        return { x, y, ...p };
    });

    const activeCoord = coords[activeIndex] || coords[coords.length - 1];

    const linePath = coords.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return `M ${curr.x},${curr.y}`;
        const prev = arr[idx - 1];
        const cx1 = prev.x + (curr.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (curr.x - prev.x) / 2;
        const cy2 = curr.y;
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${curr.x},${curr.y}`;
    }, "");

    const areaPath = coords.length
        ? `${linePath} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`
        : "";

    const gridLines = [0.25, 0.5, 0.75, 1].map((f) => {
        const y = height - paddingY - f * (height - paddingY * 2);
        return { y, value: Math.round(maxVal * f) };
    });

    const fmt = (n) =>
        Number.isFinite(Number(n)) ? Number(n).toLocaleString("ar-EG") : "0";

    const handlePointer = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX =
            e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
        const mouseX = clientX - rect.left;
        const pct = Math.max(0, Math.min(1, mouseX / rect.width));
        const targetIdx = Math.round(pct * (coords.length - 1));
        setActiveIndex(targetIdx);
    };

    return (
        <div
            style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "16px",
                background: "#0a0a0a",
                padding: "28px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                marginBottom: "24px",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "-50%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "260px",
                    height: "260px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    filter: "blur(40px)",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        paddingBottom: "18px",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.07)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="#ffffff"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M4 20l14 0" />
                            </svg>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontWeight: "600",
                                    color: "#e5e7eb",
                                    fontSize: "0.95rem",
                                    margin: 0,
                                }}
                            >
                                ملخص الإيرادات 
                            </p>
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    margin: 0,
                                }}
                            >
                                يشمل التوصيل، استلام المحل، وخدمات الصيانة
                            </p>
                        </div>
                    </div>
                    <span
                        style={{
                            fontSize: "0.72rem",
                            background: "rgba(255,255,255,0.06)",
                            color: "#9ca3af",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: hasData ? "#10b981" : "#f59e0b",
                                animation: "pulse 1.5s infinite",
                            }}
                        />
                        {hasData ? "مباشر " : "مباشر "}
                    </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0 0 4px",
                            }}
                        >
                            إجمالي الإيرادات
                        </p>
                        <p
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: "700",
                                color: "#f9fafb",
                                margin: 0,
                            }}
                        >
                            {fmt(safeTotal)}{" "}
                            <span
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: "400",
                                }}
                            >
                                ج.م
                            </span>
                        </p>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#10b981",
                                marginTop: "4px",
                            }}
                        >
                            ✦ إجمالي المبيعات المكتملة
                        </p>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            minWidth: "150px",
                            borderRight: "1px solid rgba(255,255,255,0.08)",
                            paddingRight: "16px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0 0 4px",
                            }}
                        >
                            الطلبات المكتملة
                        </p>
                        <p
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: "700",
                                color: "#f9fafb",
                                margin: 0,
                            }}
                        >
                            {Number.isFinite(Number(completedOrders))
                                ? completedOrders
                                : 0}
                        </p>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#10b981",
                                marginTop: "4px",
                            }}
                        >
                            مكتمل بنجاح
                        </p>
                    </div>

                    <div
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            minWidth: "180px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#9ca3af",
                                }}
                            >
                                🕒 {activePoint?.time || "—"}
                            </span>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "#10b981",
                                    background: "rgba(16,185,129,0.1)",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                }}
                            >
                                {activePoint?.label || ""}
                            </span>
                        </div>
                        <span
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: "700",
                                color: "#ffffff",
                            }}
                        >
                            {fmt(activePoint?.amount)} ج.م
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        position: "relative",
                        height: "140px",
                        width: "100%",
                        cursor: "pointer",
                        userSelect: "none",
                        direction: "ltr",
                    }}
                    onClick={handlePointer}
                    onMouseMove={handlePointer}
                    onTouchStart={handlePointer}
                    onTouchMove={handlePointer}
                >
                    <svg
                        style={{ width: "100%", height: "100%" }}
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient
                                id="rev-grad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#ffffff"
                                    stopOpacity="0.22"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#ffffff"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>

                        {gridLines.map((g, idx) => (
                            <line
                                key={idx}
                                x1={0}
                                y1={g.y}
                                x2={width}
                                y2={g.y}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="1"
                                strokeDasharray="2,3"
                            />
                        ))}

                        {areaPath && (
                            <path d={areaPath} fill="url(#rev-grad)" />
                        )}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {coords.map((c, idx) => (
                            <circle
                                key={idx}
                                cx={c.x}
                                cy={c.y}
                                r={idx === activeIndex ? 0 : 2.5}
                                fill="rgba(255,255,255,0.5)"
                            />
                        ))}

                        {activeCoord && (
                            <line
                                x1={activeCoord.x}
                                y1={0}
                                x2={activeCoord.x}
                                y2={height}
                                stroke="rgba(255,255,255,0.4)"
                                strokeDasharray="3,3"
                                strokeWidth="1.5"
                            />
                        )}
                    </svg>

                    {activeCoord && (
                        <div
                            style={{
                                position: "absolute",
                                left: `${(activeCoord.x / width) * 100}%`,
                                top: `${(activeCoord.y / height) * 100}%`,
                                transform: "translate(-50%, -50%)",
                                transition: "all 0.05s ease-out",
                                pointerEvents: "none",
                            }}
                        >
                            <div
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    borderRadius: "50%",
                                    background: "#ffffff",
                                    boxShadow:
                                        "0 0 14px 5px rgba(255,255,255,0.65)",
                                    border: "2px solid #0a0a0a",
                                }}
                            />
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed rgba(255,255,255,0.1)",
                        paddingTop: "12px",
                        paddingLeft: `${(paddingX / width) * 100}%`,
                        paddingRight: `${(paddingX / width) * 100}%`,
                        gap: "6px",
                        direction: "ltr",
                    }}
                >
                    {coords.map((c, idx) => {
                        const isSelected = idx === activeIndex;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveIndex(idx)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                style={{
                                    background: isSelected
                                        ? "rgba(255,255,255,0.18)"
                                        : "transparent",
                                    border: isSelected
                                        ? "1px solid rgba(255,255,255,0.4)"
                                        : "1px solid transparent",
                                    color: isSelected ? "#ffffff" : "#6b7280",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    fontSize: "0.75rem",
                                    fontWeight: isSelected ? "700" : "500",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {c.time}
                            </button>
                        );
                    })}
                </div>

                <div
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        paddingTop: "18px",
                    }}
                >
                    <a
                        href="/admin/orders"
                        style={{
                            display: "block",
                            width: "100%",
                            textAlign: "center",
                            padding: "9px 16px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "transparent",
                            color: "#e5e7eb",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.color = "#0a0a0a";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#e5e7eb";
                        }}
                    >
                        عرض كل الطلبات
                    </a>
                </div>
            </div>
        </div>
    );
};

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/admin/stats");
            if (res.data.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error("فشل تحميل إحصائيات لوحة التحكم", err);
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
        queueMicrotask(fetchStats);
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
                    {"جاري تحميل إحصائيات لوحة التحكم..."}
                </p>
            </div>
        );
    }

    const s = stats?.stats || {};

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card primary">
                    <span className="stat-title">{"المنتجات المتاحة"}</span>
                    <span className="stat-value">{s.totalProducts || 0}</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-title">{"إجمالي الإيرادات"}</span>
                    <span className="stat-value">
                        {Number(s.totalRevenue || 0).toLocaleString("ar-EG")}{" "}
                        ج.م
                    </span>
                </div>
                <div className="stat-card warning">
                    <span className="stat-title">{"الطلبات المعلقة"}</span>
                    <span className="stat-value">{s.pendingOrders || 0}</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-title">{"الطلبات المكتملة"}</span>
                    <span className="stat-value">{s.completedOrders || 0}</span>
                </div>
                <div className="stat-card primary">
                    <span className="stat-title">{"تذاكر الصيانة"}</span>
                    <span className="stat-value">{s.activeTickets || 0}</span>
                </div>
            </div>

            <RevenueCard
                totalRevenue={Number(s.totalRevenue || 0)}
                completedOrders={Number(s.completedOrders || 0)}
                timeline={stats?.chartData?.timeline || []}
            />
        </div>
    );
};

export default Overview;
