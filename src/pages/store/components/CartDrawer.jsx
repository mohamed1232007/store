import { Link } from "react-router-dom";

export default function CartDrawer({
    isOpen,
    onClose,
    cart,
    totalCount,
    subtotal,
    updateQuantity,
    removeFromCart,
}) {
    return (
        <div className={`cart ${isOpen ? "active" : ""}`}>
            <div className="top_cart">
                <h3>
                    عناصر السلة:{" "}
                    <span className="Count_item_cart">{totalCount}</span>
                </h3>
                <span
                    onClick={onClose}
                    className="close_cart"
                    style={{ cursor: "pointer" }}
                >
                    <i className="fa-regular fa-circle-xmark"></i>
                </span>
            </div>
            <div className="items_in_cart" id="cart_items">
                {cart.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            marginTop: "40px",
                            color: "#9ca3af",
                        }}
                    >
                        السلة فارغة.
                    </p>
                ) : (
                    cart.map((item) => (
                        <div className="item_cart" key={item.id}>
                            <img
                                src={
                                    item.img?.startsWith("http://") ||
                                    item.img?.startsWith("https://")
                                        ? item.img
                                        : `/${(item.img || "img/product/0.png").replace(/^\//, "")}`
                                }
                                alt={item.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/img/product/0.png";
                                }}
                            />
                            <div className="content">
                                <h4>{item.name}</h4>
                                <p className="price_cart">
                                    {(
                                        item.price * item.quantity
                                    ).toLocaleString()}{" "}
                                    ج.م
                                </p>
                                <div className="quantity_control">
                                    <button
                                        className="decrease_quantity"
                                        onClick={() =>
                                            updateQuantity(item.id, -1)
                                        }
                                    >
                                        -
                                    </button>
                                    <span className="quantity">
                                        {item.quantity}
                                    </span>
                                    <button
                                        className="increase_quantity"
                                        onClick={() =>
                                            updateQuantity(item.id, 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                className="delete_item"
                                onClick={() => removeFromCart(item.id)}
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="bottom_cart">
                <div className="total">
                    <p>الإجمالي الفرعي</p>
                    <p className="price_cart_toral">
                        {subtotal.toLocaleString()} ج.م
                    </p>
                </div>
                <div className="button_cart">
                    <Link
                        to="/checkout"
                        className="btn_cart btn"
                        onClick={onClose}
                        style={{
                            textAlign: "center",
                            display: "block",
                            textDecoration: "none",
                        }}
                    >
                        إتمام الطلب
                    </Link>
                    <span
                        onClick={onClose}
                        className="btn_cart trans_bg btn"
                        style={{ cursor: "pointer" }}
                    >
                        متابعة التسوق
                    </span>
                </div>
            </div>
        </div>
    );
}
