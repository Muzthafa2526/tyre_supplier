import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api, { getMediaUrl } from "../api/axios";
import { FiArrowLeft, FiSearch, FiX, FiCheck, FiShoppingBag, FiLayers, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";

// Smart category-based tyre image resolver with studio assets
export function getDefaultTyreImage(product) {
    if (!product) return "/images/tyres/car_suv_van.jpg";
    const cat = (product.category_name || (typeof product.category === "string" ? product.category : "") || "").toLowerCase();
    const rim = (product.rim_size || "").toLowerCase();
    const material = (product.material || "").toLowerCase();

    // 1. Bike & Scooter
    if (cat.includes("bike") || cat.includes("scooter") || cat.includes("2w") || rim.includes("scooter") || rim.includes("motorcycle") || material.includes("activa") || material.includes("splendor") || material.includes("pulsar") || material.includes("fz") || material.includes("jupiter")) {
        return "/images/tyres/bike_scooter.jpg";
    }

    // 2. Truck & Bus / Commercial
    if (cat.includes("truck") || cat.includes("bus") || cat.includes("tbr") || cat.includes("tbb") || cat.includes("scv") || cat.includes("ltr") || cat.includes("ltb") || rim.includes("truck") || rim.includes("bus") || material.includes("endurace") || material.includes("amar") || material.includes("miler") || material.includes("super miler")) {
        return "/images/tyres/truck_bus.jpg";
    }

    // 3. Agricultural & Tractor
    if (cat.includes("agri") || cat.includes("farm") || cat.includes("tractor") || rim.includes("tractor") || rim.includes("agri") || material.includes("virat") || material.includes("dhruv") || material.includes("azoom") || material.includes("fx 515") || material.includes("kisan") || material.includes("krishak")) {
        return "/images/tyres/agricultural.jpg";
    }

    // 4. Industrial & Earthmover
    if (cat.includes("industrial") || cat.includes("ind") || cat.includes("otr") || rim.includes("loader") || rim.includes("backhoe") || rim.includes("crane") || rim.includes("grader") || rim.includes("otr") || material.includes("loader") || material.includes("earthmover") || material.includes("jcb") || material.includes("tipper")) {
        return "/images/tyres/industrial.jpg";
    }

    // 5. Car, SUV & Van (Passenger)
    return "/images/tyres/car_suv_van.jpg";
}

export function getTyreImageUrl(prod) {
    if (!prod) return "/images/tyres/car_suv_van.jpg";
    if (prod.image) {
        return getMediaUrl(prod.image);
    }
    return getDefaultTyreImage(prod);
}

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryId = searchParams.get("category");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [selectedType, setSelectedType] = useState("ALL"); // ALL, TL, TT, TTF
    const [selectedPly, setSelectedPly] = useState("ALL"); // ALL, 6PR, 8PR, 12PR, 14PR, 16PR, 18PR, 20PR

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({ customer_name: "", customer_phone: "", quantity: 1, notes: "" });
    const [showPrices, setShowPrices] = useState(true);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/api/products/").then(res => setProducts(res.data || [])).catch(() => { }),
            api.get("/api/categories/list/").then(res => setCategories(res.data || [])).catch(() => { }),
            api.get("/api/products/settings/").then(res => setShowPrices(res.data.show_prices)).catch(() => { })
        ]).finally(() => setLoading(false));
    }, []);

    const handleCategoryFilter = (catId) => {
        if (!catId) {
            searchParams.delete("category");
            setSearchParams(searchParams);
        } else {
            setSearchParams({ category: catId });
        }
    };

    const handleOrderSubmit = (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const name = (formData.customer_name || "").trim();
        const phoneDigits = (formData.customer_phone || "").replace(/\D/g, "");
        const qty = parseInt(formData.quantity, 10);

        if (!name || name.length < 2) {
            alert("Please enter a valid full name (at least 2 characters).");
            return;
        }

        if (!phoneDigits || phoneDigits.length < 10) {
            alert("Please enter a valid 10-digit WhatsApp/mobile number.");
            return;
        }

        if (!qty || qty < 1) {
            alert("Please specify a quantity of at least 1 unit.");
            return;
        }

        setSubmitting(true);

        const payload = {
            customer_name: name,
            customer_phone: phoneDigits,
            notes: `${formData.notes ? formData.notes + ' | ' : ''}SKU: ${selectedProduct.material_code || 'N/A'} [Type: ${selectedProduct.tyre_type || 'TL'}]`,
            items: [
                {
                    product_id: selectedProduct.id,
                    quantity: qty
                }
            ]
        };

        api.post("/api/orders/create/", payload)
            .then(res => {
                const whatsappUrl = res.data?.order?.whatsapp_url || res.data?.whatsapp_url;
                if (whatsappUrl) {
                    window.open(whatsappUrl, "_blank");
                } else {
                    alert("Order inquiry submitted successfully! Our dispatch team will contact you shortly.");
                }
                setSelectedProduct(null);
                setFormData({ customer_name: "", customer_phone: "", quantity: 1, notes: "" });
            })
            .catch(err => {
                console.error("Error placing order:", err);
                alert("Failed to place order. Please try contacting us on WhatsApp directly.");
            })
            .finally(() => setSubmitting(false));
    };

    // Filter products
    const filteredProducts = products.filter(prod => {
        // Category filter
        if (categoryId && String(prod.category_id) !== String(categoryId)) {
            return false;
        }

        // Tyre Type filter
        if (selectedType !== "ALL") {
            const t = (prod.tyre_type || "").toUpperCase();
            if (selectedType === "TL" && !t.includes("TL")) return false;
            if (selectedType === "TT" && (t !== "TT" && !t.includes("TT "))) return false;
            if (selectedType === "TTF" && !t.includes("TTF")) return false;
        }

        // Ply Rating filter
        if (selectedPly !== "ALL") {
            if ((prod.ply_rating || "").toUpperCase() !== selectedPly.toUpperCase()) {
                return false;
            }
        }

        // Search query filter
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            const productString = [
                prod.material || "",
                prod.material_code || "",
                prod.rim_size || "",
                prod.category || "",
                prod.tread_pattern || "",
                prod.ply_rating || ""
            ].join(" ").toLowerCase();

            const searchWords = query.split(/\s+/);
            return searchWords.some(word => word.length > 0 && productString.includes(word));
        }

        return true;
    });

    const activeCategoryName = categories.find(c => String(c.id) === String(categoryId))?.name || "All Tyre Specifications";

    // Available ply ratings in current category
    const availablePlys = Array.from(new Set(
        products
            .filter(p => !categoryId || String(p.category_id) === String(categoryId))
            .map(p => p.ply_rating)
            .filter(Boolean)
    )).sort();

    return (
        <div className="products-page">
            <div className="storefront-inner">

                {/* ── TOP BAR: BACK + SEARCH ── */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "22px"
                }}>
                    <button
                        onClick={() => navigate("/categories")}
                        className="btn-secondary"
                        style={{ padding: "9px 16px", fontSize: "13px" }}
                    >
                        <FiArrowLeft /> Back to Categories
                    </button>

                    <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "460px" }}>
                        <FiSearch style={{
                            position: "absolute", left: "12px", top: "50%",
                            transform: "translateY(-50%)", color: "var(--text-muted)",
                            fontSize: "15px", pointerEvents: "none"
                        }} />
                        <input
                            type="text"
                            placeholder="Search size, SKU, pattern..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%", padding: "10px 36px 10px 36px",
                                borderRadius: "9px", border: "1px solid var(--border-color)",
                                backgroundColor: "var(--bg-input)", color: "var(--text-primary)",
                                outline: "none", fontSize: "13px"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                            onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                style={{
                                    position: "absolute", right: "10px", top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", color: "var(--text-muted)", cursor: "pointer",
                                    display: "flex", padding: "2px"
                                }}
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── PAGE TITLE + COUNT ── */}
                <div style={{ marginBottom: "14px" }}>
                    <h1 style={{
                        fontSize: "clamp(20px, 3.5vw, 28px)",
                        fontWeight: "900", margin: "0 0 4px 0",
                        color: "var(--text-primary)"
                    }}>
                        {activeCategoryName}
                    </h1>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "13px" }}>
                        <strong style={{ color: "var(--text-primary)" }}>{filteredProducts.length}</strong> genuine Apollo tyre{filteredProducts.length === 1 ? "" : "s"} ready for dispatch
                    </p>
                </div>

                {/* ── CATEGORY FILTER CHIPS ── */}
                <div className="filter-chips-row" style={{ marginBottom: "10px" }}>
                    <button
                        onClick={() => handleCategoryFilter(null)}
                        className={`filter-chip${!categoryId ? " active" : ""}`}
                    >
                        All ({products.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryFilter(cat.id)}
                            className={`filter-chip${String(cat.id) === String(categoryId) ? " active" : ""}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* ── SUB-FILTERS: TYPE + PLY ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    marginBottom: "22px", padding: "10px 14px",
                    borderRadius: "10px", backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-card)", flexWrap: "wrap"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Type:
                        </span>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {[
                                { id: "ALL", label: "All" },
                                { id: "TL", label: "TL" },
                                { id: "TT", label: "TT" },
                                { id: "TTF", label: "TTF" }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedType(t.id)}
                                    style={{
                                        padding: "4px 10px", borderRadius: "6px",
                                        border: selectedType === t.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                        backgroundColor: selectedType === t.id ? "var(--badge-bg)" : "transparent",
                                        color: selectedType === t.id ? "var(--accent-primary)" : "var(--text-secondary)",
                                        fontSize: "12px", fontWeight: selectedType === t.id ? "700" : "500", cursor: "pointer"
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {availablePlys.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Ply:
                            </span>
                            <select
                                value={selectedPly}
                                onChange={e => setSelectedPly(e.target.value)}
                                style={{
                                    padding: "4px 10px", borderRadius: "6px",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)", color: "var(--text-primary)",
                                    fontSize: "12px", cursor: "pointer", outline: "none"
                                }}
                            >
                                <option value="ALL">All</option>
                                {availablePlys.map(ply => (
                                    <option key={ply} value={ply}>{ply}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(selectedType !== "ALL" || selectedPly !== "ALL" || searchQuery) && (
                        <button
                            onClick={() => { setSelectedType("ALL"); setSelectedPly("ALL"); setSearchQuery(""); }}
                            style={{
                                marginLeft: "auto", background: "none", border: "none",
                                color: "var(--accent-primary)", fontSize: "12px",
                                fontWeight: "700", cursor: "pointer", padding: "2px 0"
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* ── PRODUCT GRID ── */}
                {loading ? (
                    <div className="loading-state">
                        <div className="icon">🛞</div>
                        <p>Loading Apollo tyre catalogue...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                        <h3>No matching tyres found</h3>
                        <p>
                            Try adjusting your rim size, construction type, or contact us on WhatsApp for custom fleet orders.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedType("ALL"); setSelectedPly("ALL"); handleCategoryFilter(null); }}
                            className="btn-primary"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(prod => {
                            const mrp = Number(prod.top_price || 0);
                            const offer = Number(prod.invoice_price || 0);
                            const discPct = mrp > offer && offer > 0 ? Math.round(((mrp - offer) / mrp) * 100) : 0;
                            const isTL = (prod.tyre_type || "").toUpperCase().includes("TL") && !(prod.tyre_type || "").toUpperCase().includes("TTF");
                            const isTTF = (prod.tyre_type || "").toUpperCase().includes("TTF");
                            const stock = prod.stock_quantity != null ? Number(prod.stock_quantity) : -1;
                            const stockClass = stock < 0 ? "" : stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock";
                            const stockLabel = stock < 0 ? null : stock === 0 ? "Out of Stock" : stock <= 5 ? `Only ${stock} left` : "In Stock";

                            return (
                                <div key={prod.id} className="product-card">
                                    {/* Tyre Image */}
                                    <div style={{
                                        width: "100%", height: "155px", borderRadius: "10px",
                                        marginBottom: "12px", backgroundColor: "var(--bg-input)",
                                        border: "1px solid var(--border-color)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        position: "relative", overflow: "hidden"
                                    }}>
                                        <img
                                            src={getTyreImageUrl(prod)}
                                            alt={prod.material}
                                            style={{ width: "76%", height: "76%", objectFit: "contain" }}
                                            onError={e => { e.target.src = getDefaultTyreImage(prod); }}
                                        />
                                        <span className={`tyre-type-badge ${isTTF ? "kit" : isTL ? "tubeless" : "tube"}`}
                                            style={{ position: "absolute", top: "8px", right: "8px" }}>
                                            {isTTF ? "TTF" : isTL ? "TL" : "TT"}
                                        </span>
                                    </div>

                                    {/* Spec Row */}
                                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px", alignItems: "center" }}>
                                        <span className="spec-tag accent">
                                            <FiLayers size={10} /> {prod.rim_size || "Universal"}
                                        </span>
                                        {prod.ply_rating && (
                                            <span className="spec-tag neutral">{prod.ply_rating}</span>
                                        )}
                                        {prod.material_code && (
                                            <span className="spec-tag mono">{prod.material_code}</span>
                                        )}
                                        {stockLabel && (
                                            <span className={`stock-badge ${stockClass}`} style={{ marginLeft: "auto" }}>
                                                {stock === 0 ? <FiX size={9} /> : <FiCheck size={9} />}
                                                {stockLabel}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 style={{
                                        fontSize: "14px", margin: "0 0 10px 0",
                                        color: "var(--text-primary)", lineHeight: "1.4",
                                        fontWeight: "700", flex: 1
                                    }}>
                                        {prod.material}
                                    </h3>

                                    {/* Price */}
                                    <div style={{ marginBottom: "12px" }}>
                                        {showPrices ? (
                                            <>
                                                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                                    {offer > 0 ? (
                                                        <>
                                                            <span style={{ fontSize: "18px", fontWeight: "900", color: "var(--accent-primary)" }}>
                                                                &#8377;{offer.toLocaleString("en-IN")}
                                                            </span>
                                                            {discPct > 0 && (
                                                                <>
                                                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                                                        &#8377;{mrp.toLocaleString("en-IN")}
                                                                    </span>
                                                                    <span style={{ fontSize: "10.5px", fontWeight: "800", color: "var(--danger)", backgroundColor: "rgba(239,68,68,0.1)", padding: "1px 5px", borderRadius: "4px" }}>
                                                                        {discPct}% OFF
                                                                    </span>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : mrp > 0 ? (
                                                        <span style={{ fontSize: "18px", fontWeight: "900", color: "var(--accent-primary)" }}>
                                                            &#8377;{mrp.toLocaleString("en-IN")}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-primary)" }}>
                                                            Price on Request
                                                        </span>
                                                    )}
                                                </div>
                                                {prod.pair_price && Number(prod.pair_price) > 0 && (
                                                    <div style={{ fontSize: "11.5px", color: "#10b981", marginTop: "3px", fontWeight: "600" }}>
                                                        Pair (2 tyres): &#8377;{Number(prod.pair_price).toLocaleString("en-IN")}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span style={{
                                                display: "inline-block",
                                                fontSize: "13px", fontWeight: "700",
                                                color: "var(--accent-primary)"
                                            }}>
                                                Price on Request
                                            </span>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => setSelectedProduct(prod)}
                                        disabled={stock === 0}
                                        className="btn-primary"
                                        style={{
                                            width: "100%", padding: "10px", fontSize: "13px",
                                            opacity: stock === 0 ? 0.55 : 1,
                                            cursor: stock === 0 ? "not-allowed" : "pointer",
                                            marginTop: "auto"
                                        }}
                                    >
                                        <FiShoppingBag size={14} /> {stock === 0 ? "Out of Stock" : "Order Now"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── ORDER MODAL ── */}
                {selectedProduct && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 2000, padding: "16px"
                    }} className="animate-fade-in">
                        <div style={{
                            backgroundColor: "var(--bg-modal)", border: "1px solid var(--border-card)",
                            padding: "26px", borderRadius: "16px", width: "100%",
                            maxWidth: "440px", maxHeight: "92vh", overflowY: "auto",
                            color: "var(--text-primary)", boxShadow: "var(--shadow-lg)", position: "relative"
                        }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{
                                    position: "absolute", top: "14px", right: "14px",
                                    background: "none", border: "none", color: "var(--text-muted)",
                                    cursor: "pointer", fontSize: "20px", display: "flex"
                                }}
                            >
                                <FiX />
                            </button>

                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "9px",
                                    backgroundColor: "var(--badge-bg)", color: "var(--accent-primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px"
                                }}>
                                    <FiShoppingBag />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "17px", fontWeight: "800", margin: 0 }}>Confirm Order</h2>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Apollo Authorized Direct Dispatch</span>
                                </div>
                            </div>

                            {/* Product Summary */}
                            <div style={{
                                backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)",
                                borderRadius: "10px", padding: "12px", marginBottom: "16px",
                                display: "flex", gap: "12px", alignItems: "center"
                            }}>
                                <div style={{
                                    width: "52px", height: "52px", borderRadius: "8px",
                                    backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", flexShrink: 0
                                }}>
                                    <img
                                        src={getTyreImageUrl(selectedProduct)}
                                        alt={selectedProduct.material}
                                        style={{ width: "88%", height: "88%", objectFit: "contain" }}
                                        onError={e => { e.target.src = getDefaultTyreImage(selectedProduct); }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: "800", fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {selectedProduct.material}
                                    </div>
                                    <div style={{ display: "flex", gap: "6px", fontSize: "11px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                                        <span>{selectedProduct.rim_size || "Standard"}</span>
                                        {selectedProduct.ply_rating && <span>· {selectedProduct.ply_rating}</span>}
                                        {selectedProduct.tyre_type && <span>· {selectedProduct.tyre_type}</span>}
                                    </div>
                                    {showPrices && Number(selectedProduct.invoice_price || selectedProduct.top_price) > 0 && (
                                        <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-primary)", marginTop: "2px" }}>
                                            &#8377;{Number(selectedProduct.invoice_price || selectedProduct.top_price).toLocaleString("en-IN")} / tyre
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleOrderSubmit}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", color: "var(--text-secondary)", fontSize: "12.5px", fontWeight: "600" }}>Full Name *</label>
                                    <input
                                        type="text" required placeholder="e.g. Rajesh Sharma"
                                        style={{
                                            width: "100%", padding: "10px 12px", borderRadius: "8px",
                                            border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)", fontSize: "13px", outline: "none"
                                        }}
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", color: "var(--text-secondary)", fontSize: "12.5px", fontWeight: "600" }}>WhatsApp Number *</label>
                                    <input
                                        type="tel" required placeholder="e.g. 9876543210"
                                        style={{
                                            width: "100%", padding: "10px 12px", borderRadius: "8px",
                                            border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)", fontSize: "13px", outline: "none"
                                        }}
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", color: "var(--text-secondary)", fontSize: "12.5px", fontWeight: "600" }}>Quantity *</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                            style={{
                                                width: "34px", height: "34px", borderRadius: "8px",
                                                border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)", fontSize: "18px", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>-</button>
                                        <input type="number" min="1" required
                                            style={{
                                                flex: 1, padding: "8px", borderRadius: "8px",
                                                border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)", textAlign: "center",
                                                fontWeight: "700", fontSize: "15px", outline: "none"
                                            }}
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                        />
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                            style={{
                                                width: "34px", height: "34px", borderRadius: "8px",
                                                border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)", fontSize: "18px", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>+</button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "14px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", color: "var(--text-secondary)", fontSize: "12.5px", fontWeight: "600" }}>
                                        Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        rows="2"
                                        placeholder="e.g. Mumbai Workshop, need GST invoice"
                                        style={{
                                            width: "100%", padding: "9px 12px", borderRadius: "8px",
                                            border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)", fontSize: "13px",
                                            outline: "none", resize: "none"
                                        }}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                {/* Order Summary */}
                                <div style={{
                                    padding: "11px 13px", borderRadius: "9px",
                                    backgroundColor: "var(--badge-bg)", border: "1px solid var(--border-highlight)",
                                    marginBottom: "16px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                                        <span style={{ color: "var(--text-secondary)" }}>Quantity:</span>
                                        <span style={{ fontWeight: "700" }}>{formData.quantity} unit{formData.quantity > 1 ? "s" : ""}</span>
                                    </div>
                                    {showPrices && Number(selectedProduct.invoice_price || selectedProduct.top_price) > 0 ? (
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "7px", borderTop: "1px solid var(--border-highlight)" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "700" }}>Total:</span>
                                            <span style={{ fontSize: "17px", fontWeight: "900", color: "var(--accent-primary)" }}>
                                                &#8377;{(Number(selectedProduct.invoice_price || selectedProduct.top_price) * formData.quantity).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", paddingTop: "6px", borderTop: "1px solid var(--border-highlight)", lineHeight: "1.4" }}>
                                            Our team will confirm live wholesale pricing on WhatsApp.
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="button" onClick={() => setSelectedProduct(null)}
                                        className="btn-secondary"
                                        style={{ padding: "10px 16px", fontSize: "13px" }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="btn-whatsapp"
                                        style={{ padding: "10px 18px", fontSize: "13px", flex: 1 }}>
                                        <FaWhatsapp size={15} /> {submitting ? "Placing..." : "Confirm & Order"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 640px) {
                    .products-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px !important;
                    }
                    .product-card {
                        padding: 12px 10px !important;
                    }
                    .product-card img {
                        width: 85% !important;
                        height: 85% !important;
                    }
                    .product-card h3 {
                        font-size: 12.5px !important;
                        line-height: 1.3 !important;
                        margin-bottom: 6px !important;
                    }
                    .spec-tag {
                        font-size: 10.5px !important;
                        padding: 2px 6px !important;
                    }
                    .stock-badge {
                        font-size: 10px !important;
                        padding: 1px 5px !important;
                    }
                }
                @media (max-width: 360px) {
                    .products-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Products;
