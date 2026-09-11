export default function ProductCard({
    product,
    isInCart,
    onAddToCart,
    isFavorite = false,
    onToggleFavorite = () => {},
    onSelectProduct,
}) {
    const percent = product.old_price
        ? Math.floor(
              ((product.old_price - product.price) / product.old_price) * 100,
          )
        : null;

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

    const currencyText = "ج.م";

    const handleProductClick = (e) => {
        e.preventDefault();
        if (onSelectProduct) {
            onSelectProduct(product);
        }
    };

    return (
        <div className="product" key={product.id}>
            {percent && <span className="sale_present">%{percent}</span>}
            <div className="img_product">
                <a
                    href={`#product-${product.id}`}
                    onClick={handleProductClick}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={getImgSrc(product.img)}
                        alt={product.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/product/0.png";
                        }}
                    />
                </a>
            </div>
            <div className="stars">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
            </div>
            <p className="name_product">
                <a
                    href={`#product-${product.id}`}
                    onClick={handleProductClick}
                    style={{ cursor: "pointer" }}
                >
                    {product.name}
                </a>
            </p>
            <div className="price">
                <p>
                    <span>
                        {Number(product.price).toLocaleString()} {currencyText}
                    </span>
                </p>
                {product.old_price && (
                    <p className="old_price">
                        {Number(product.old_price).toLocaleString()}{" "}
                        {currencyText}
                    </p>
                )}
            </div>
            <div className="icons">
                <span
                    className={`btn_add_cart ${isInCart ? "active" : ""}`}
                    onClick={() => onAddToCart(product)}
                >
                    <i className="fa-solid fa-cart-shopping"></i>{" "}
                    {isInCart ? "أُضيف للسلة" : "أضف للسلة"}
                </span>
                <button
                    type="button"
                    className={`icon_product ${isFavorite ? "favorite-active" : ""}`}
                    onClick={() => onToggleFavorite(product)}
                    aria-label="إضافة إلى المفضلة"
                >
                    <i
                        className={
                            isFavorite
                                ? "fa-solid fa-heart"
                                : "fa-regular fa-heart"
                        }
                    ></i>
                </button>
            </div>
        </div>
    );
}
