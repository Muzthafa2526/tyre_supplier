import React, { useState, useEffect } from "react";
import api, { getMediaUrl } from "../api/axios";
import {
    FiImage,
    FiUploadCloud,
    FiCheckCircle,
    FiSearch,
    FiSliders,
    FiLayers,
    FiRefreshCw,
    FiTag,
    FiTrendingUp,
    FiBox,
    FiEdit3,
    FiCheck,
    FiEye,
    FiPlus,
    FiTrash2,
    FiX,
    FiAlertCircle,
    FiFolder,
    FiGrid
} from "react-icons/fi";
import { getTyreImageUrl, getDefaultTyreImage } from "../pages/products";

export default function AdminCategoryProductManager({ onProductUpdated }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active image management sub-tab: 'bulk_products' (Method 1) or 'category_only' (Method 2)
    const [imageTab, setImageTab] = useState("bulk_products");

    // Method 1: Bulk Products Image Upload State
    const [bulkImageFile, setBulkImageFile] = useState(null);
    const [bulkImagePreview, setBulkImagePreview] = useState(null);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [bulkMsg, setBulkMsg] = useState("");

    // Method 2: Category Image Only Upload State
    const [catImageFile, setCatImageFile] = useState(null);
    const [catImagePreview, setCatImagePreview] = useState(null);
    const [uploadingCatImage, setUploadingCatImage] = useState(false);
    const [catImageMsg, setCatImageMsg] = useState("");

    // Live Product Search & Filter inside Admin
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedPly, setSelectedPly] = useState("ALL");
    const [editingStockId, setEditingStockId] = useState(null);
    const [newStockVal, setNewStockVal] = useState("");

    // Single Product Add / Edit Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null); // null means adding new product
    const [productForm, setProductForm] = useState({
        category: "",
        material: "",
        material_code: "",
        rim_size: "",
        tyre_type: "TL",
        ply_rating: "",
        tread_pattern: "",
        invoice_price: "",
        top_price: "",
        ndp_price: "",
        stock_quantity: 50
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const [productModalError, setProductModalError] = useState("");
    const [actionFeedback, setActionFeedback] = useState("");

    // Fetch categories and products on mount
    const fetchCatalog = () => {
        setLoading(true);
        Promise.all([
            api.get("/api/categories/list/"),
            api.get("/api/products/")
        ])
            .then(([catRes, prodRes]) => {
                const cats = catRes.data || [];
                const prods = prodRes.data || [];
                setCategories(cats);
                setProducts(prods);

                // Default select first category if none selected
                if (!selectedCategory && cats.length > 0) {
                    setSelectedCategory(cats[0]);
                } else if (selectedCategory) {
                    const updatedSelected = cats.find(c => c.id === selectedCategory.id);
                    if (updatedSelected) setSelectedCategory(updatedSelected);
                }
            })
            .catch(err => console.error("Error fetching catalog:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCatalog();
    }, []);

    // ----------------------------------------------------
    // Method 1: Change all product images under a category
    // ----------------------------------------------------
    const handleBulkFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBulkImageFile(file);
            setBulkImagePreview(URL.createObjectURL(file));
            setBulkMsg("");
        }
    };

    const handleBulkImageSubmit = (e) => {
        e.preventDefault();
        if (!selectedCategory || !bulkImageFile) {
            setBulkMsg("Please select an image file first.");
            return;
        }

        setUploadingBulk(true);
        setBulkMsg("");

        const formData = new FormData();
        formData.append("image", bulkImageFile);

        api.post(`/api/categories/${selectedCategory.id}/update-products-image/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then(res => {
                setBulkMsg(res.data.message || "All product images updated successfully.");
                setBulkImageFile(null);
                setBulkImagePreview(null);
                setUploadingBulk(false);
                fetchCatalog();
                if (onProductUpdated) onProductUpdated();
            })
            .catch(err => {
                console.error("Bulk image update failed:", err);
                setBulkMsg("Failed to update product images under category.");
                setUploadingBulk(false);
            });
    };

    // ----------------------------------------------------
    // Method 2: Change category image only
    // ----------------------------------------------------
    const handleCatFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCatImageFile(file);
            setCatImagePreview(URL.createObjectURL(file));
            setCatImageMsg("");
        }
    };

    const handleCatImageSubmit = (e) => {
        e.preventDefault();
        if (!selectedCategory || !catImageFile) {
            setCatImageMsg("Please select an image file first.");
            return;
        }

        setUploadingCatImage(true);
        setCatImageMsg("");

        const formData = new FormData();
        formData.append("image", catImageFile);

        api.post(`/api/categories/${selectedCategory.id}/update-category-image/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then(res => {
                setCatImageMsg(res.data.message || "Category image updated successfully.");
                setCatImageFile(null);
                setCatImagePreview(null);
                setUploadingCatImage(false);
                fetchCatalog();
                if (onProductUpdated) onProductUpdated();
            })
            .catch(err => {
                console.error("Category image update failed:", err);
                setCatImageMsg("Failed to update category image.");
                setUploadingCatImage(false);
            });
    };

    // ----------------------------------------------------
    // Single Product: Open Add Modal
    // ----------------------------------------------------
    const handleOpenAddModal = () => {
        setEditingProductId(null);
        setProductForm({
            category: selectedCategory ? selectedCategory.id : (categories[0]?.id || ""),
            material: "",
            material_code: "",
            rim_size: "",
            tyre_type: "TL",
            ply_rating: "",
            tread_pattern: "",
            invoice_price: "",
            top_price: "",
            ndp_price: "",
            stock_quantity: 50
        });
        setProductImageFile(null);
        setProductImagePreview(null);
        setProductModalError("");
        setIsProductModalOpen(true);
    };

    // ----------------------------------------------------
    // Single Product: Open Edit Modal
    // ----------------------------------------------------
    const handleOpenEditModal = (product) => {
        setEditingProductId(product.id);
        setProductForm({
            category: product.category_id || product.category || (selectedCategory?.id || ""),
            material: product.material || "",
            material_code: product.material_code || "",
            rim_size: product.rim_size || "",
            tyre_type: product.tyre_type || "TL",
            ply_rating: product.ply_rating || "",
            tread_pattern: product.tread_pattern || "",
            invoice_price: product.invoice_price || "",
            top_price: product.top_price || "",
            ndp_price: product.ndp_price || "",
            stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : 50
        });
        setProductImageFile(null);
        setProductImagePreview(getTyreImageUrl(product));
        setProductModalError("");
        setIsProductModalOpen(true);
    };

    // ----------------------------------------------------
    // Single Product: Save (Add or Edit)
    // ----------------------------------------------------
    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (!productForm.material || !productForm.category) {
            setProductModalError("Product Name and Category are required.");
            return;
        }

        setSavingProduct(true);
        setProductModalError("");

        const formData = new FormData();
        formData.append("category", productForm.category);
        formData.append("material", productForm.material);
        if (productForm.material_code) formData.append("material_code", productForm.material_code);
        if (productForm.rim_size) formData.append("rim_size", productForm.rim_size);
        if (productForm.tyre_type) formData.append("tyre_type", productForm.tyre_type);
        if (productForm.ply_rating) formData.append("ply_rating", productForm.ply_rating);
        if (productForm.tread_pattern) formData.append("tread_pattern", productForm.tread_pattern);
        if (productForm.invoice_price !== "") formData.append("invoice_price", productForm.invoice_price);
        if (productForm.top_price !== "") formData.append("top_price", productForm.top_price);
        if (productForm.ndp_price !== "") formData.append("ndp_price", productForm.ndp_price);
        if (productForm.stock_quantity !== "") formData.append("stock_quantity", productForm.stock_quantity);

        if (productImageFile) {
            formData.append("image", productImageFile);
        }

        const request = editingProductId
            ? api.patch(`/api/products/update/${editingProductId}/`, formData, { headers: { "Content-Type": "multipart/form-data" } })
            : api.post("/api/products/create/", formData, { headers: { "Content-Type": "multipart/form-data" } });

        request
            .then(() => {
                setIsProductModalOpen(false);
                setSavingProduct(false);
                setActionFeedback(editingProductId ? "Product updated successfully." : "Product created successfully.");
                setTimeout(() => setActionFeedback(""), 4000);
                fetchCatalog();
                if (onProductUpdated) onProductUpdated();
            })
            .catch(err => {
                console.error("Save product failed:", err);
                const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to save product. Please check input values.";
                setProductModalError(typeof msg === "string" ? msg : JSON.stringify(msg));
                setSavingProduct(false);
            });
    };

    // ----------------------------------------------------
    // Single Product: Delete
    // ----------------------------------------------------
    const handleDeleteProduct = (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            return;
        }

        api.delete(`/api/products/delete/${productId}/`)
            .then(() => {
                setActionFeedback(`Product "${productName}" deleted successfully.`);
                setTimeout(() => setActionFeedback(""), 4000);
                setProducts(prev => prev.filter(p => p.id !== productId));
                if (onProductUpdated) onProductUpdated();
            })
            .catch(err => {
                console.error("Delete product failed:", err);
                alert("Failed to delete product.");
            });
    };

    // Inline Stock Save
    const handleStockSave = (prodId) => {
        if (newStockVal === "") return;
        api.post(`/api/products/${prodId}/stock/`, { stock_quantity: parseInt(newStockVal, 10) })
            .then(res => {
                setProducts(prev => prev.map(p => p.id === prodId ? { ...p, stock_quantity: res.data.product.stock_quantity } : p));
                setEditingStockId(null);
                setNewStockVal("");
            })
            .catch(() => alert("Failed to update stock quantity."));
    };

    // Filter products for the selected category
    const categoryProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory.id || p.category === selectedCategory.name || p.category_name === selectedCategory.name || p.category === selectedCategory.id)
        : products;

    // Apply search and sub-filters
    const filteredProducts = categoryProducts.filter(p => {
        const matchesSearch = !searchQuery ||
            (p.material && p.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.rim_size && p.rim_size.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.material_code && p.material_code.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = selectedType === "ALL" ||
            (selectedType === "TL" && p.tyre_type === "TL") ||
            (selectedType === "TT" && p.tyre_type === "TT") ||
            (selectedType === "TTF" && p.tyre_type === "TTF");

        const matchesPly = selectedPly === "ALL" || (p.ply_rating && p.ply_rating.toUpperCase() === selectedPly.toUpperCase());

        return matchesSearch && matchesType && matchesPly;
    });

    const availablePlys = Array.from(new Set(categoryProducts.map(p => p.ply_rating).filter(Boolean)));

    return (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Global Action Feedback Notification */}
            {actionFeedback && (
                <div style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid #10b981",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <FiCheckCircle size={18} />
                    <span>{actionFeedback}</span>
                </div>
            )}

            {/* ── 1. VISUAL CATEGORY SELECTOR CARDS ── */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                        <h3 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                            Categories & Product Catalog Management
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                            Select a category below to configure images or manage individual products.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                            onClick={fetchCatalog}
                            className="btn-secondary"
                            style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                            <FiRefreshCw className={loading ? "spin-icon" : ""} size={14} /> Refresh
                        </button>
                    </div>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: "16px"
                }}>
                    {categories.map(cat => {
                        const isSelected = selectedCategory?.id === cat.id;
                        const count = products.filter(p => p.category_id === cat.id || p.category === cat.name || p.category_name === cat.name || p.category === cat.id).length;
                        const catImg = cat.image
                            ? getMediaUrl(cat.image)
                            : null;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setBulkImageFile(null);
                                    setBulkImagePreview(null);
                                    setBulkMsg("");
                                    setCatImageFile(null);
                                    setCatImagePreview(null);
                                    setCatImageMsg("");
                                }}
                                style={{
                                    backgroundColor: isSelected ? "var(--bg-card-hover)" : "var(--bg-card)",
                                    border: isSelected ? "2.5px solid var(--accent-primary)" : "1px solid var(--border-card)",
                                    borderRadius: "16px",
                                    padding: "20px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "14px",
                                    boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-sm)",
                                    transform: isSelected ? "translateY(-3px)" : "translateY(0)",
                                    transition: "all 0.25s ease"
                                }}
                            >
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "12px",
                                    backgroundColor: "var(--bg-input)",
                                    border: "1.5px solid var(--border-color)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    flexShrink: 0
                                }}>
                                    {catImg ? (
                                        <img src={catImg} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    ) : (
                                        <FiLayers style={{ fontSize: "24px", color: "var(--accent-primary)" }} />
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: "800",
                                        fontSize: "15px",
                                        color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {cat.name}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                        {count} Tyres Mapped
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 2. DUAL METHOD IMAGE CONFIGURATION PANEL ── */}
            {selectedCategory && (
                <div style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "18px",
                    padding: "24px 28px",
                    boxShadow: "var(--shadow-sm)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                                Image Manager: <span style={{ color: "var(--accent-primary)" }}>{selectedCategory.name}</span>
                            </h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "4px 0 0 0" }}>
                                Choose whether to update all product images in bulk, or update only the category banner image.
                            </p>
                        </div>

                        {/* Switch Method Buttons */}
                        <div style={{
                            display: "flex",
                            backgroundColor: "var(--bg-input)",
                            borderRadius: "10px",
                            padding: "4px",
                            border: "1px solid var(--border-color)"
                        }}>
                            <button
                                onClick={() => setImageTab("bulk_products")}
                                style={{
                                    padding: "7px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    backgroundColor: imageTab === "bulk_products" ? "var(--accent-primary)" : "transparent",
                                    color: imageTab === "bulk_products" ? "#000" : "var(--text-secondary)",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Method 1: Change All Products Image
                            </button>
                            <button
                                onClick={() => setImageTab("category_only")}
                                style={{
                                    padding: "7px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    backgroundColor: imageTab === "category_only" ? "var(--accent-primary)" : "transparent",
                                    color: imageTab === "category_only" ? "#000" : "var(--text-secondary)",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Method 2: Change Category Image Only
                            </button>
                        </div>
                    </div>

                    {/* METHOD 1 VIEW: Bulk Products Image Upload */}
                    {imageTab === "bulk_products" && (
                        <div className="animate-fade-in">
                            <div style={{
                                backgroundColor: "var(--bg-input)",
                                borderRadius: "12px",
                                padding: "14px 18px",
                                marginBottom: "20px",
                                borderLeft: "4px solid var(--accent-primary)"
                            }}>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                                    Method 1: Change All Product Images Under Category
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    This action will apply the new tyre picture across all <strong>{categoryProducts.length} products</strong> in {selectedCategory.name}. The category thumbnail itself will not be changed.
                                </div>
                            </div>

                            <form onSubmit={handleBulkImageSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                    {bulkImagePreview ? (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", marginBottom: "6px" }}>
                                                New Common Product Preview
                                            </div>
                                            <div style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "12px",
                                                backgroundColor: "var(--bg-card)",
                                                border: "2px solid #10b981",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                <img src={bulkImagePreview} alt="Preview" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                                                Current Product Image
                                            </div>
                                            <div style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "12px",
                                                backgroundColor: "var(--bg-card)",
                                                border: "1px solid var(--border-color)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                {categoryProducts[0]?.image ? (
                                                    <img
                                                        src={getTyreImageUrl(categoryProducts[0])}
                                                        alt={selectedCategory.name}
                                                        style={{ width: "90%", height: "90%", objectFit: "contain" }}
                                                    />
                                                ) : (
                                                    <FiImage style={{ fontSize: "32px", color: "var(--text-muted)" }} />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px dashed var(--border-color)",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        cursor: "pointer",
                                        backgroundColor: "var(--bg-input)",
                                        transition: "all 0.2s ease"
                                    }}>
                                        <FiUploadCloud style={{ fontSize: "28px", color: "var(--accent-primary)", marginBottom: "6px" }} />
                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                                            {bulkImageFile ? bulkImageFile.name : `Select Common Tyre Image for ${selectedCategory.name}`}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                            PNG, JPG, WEBP (Max 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBulkFileChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!bulkImageFile || uploadingBulk}
                                        className="btn-primary"
                                        style={{
                                            width: "100%",
                                            marginTop: "12px",
                                            padding: "11px",
                                            fontSize: "14px",
                                            opacity: !bulkImageFile ? 0.6 : 1
                                        }}
                                    >
                                        {uploadingBulk ? "Updating Products..." : `Apply Image to All ${categoryProducts.length} Products`}
                                    </button>
                                </div>
                            </form>

                            {bulkMsg && (
                                <div style={{
                                    marginTop: "16px",
                                    padding: "12px 18px",
                                    borderRadius: "10px",
                                    backgroundColor: bulkMsg.toLowerCase().includes("success") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    border: `1px solid ${bulkMsg.toLowerCase().includes("success") ? "#10b981" : "#ef4444"}`,
                                    color: bulkMsg.toLowerCase().includes("success") ? "#10b981" : "#ef4444",
                                    fontSize: "13px",
                                    fontWeight: "700"
                                }}>
                                    {bulkMsg}
                                </div>
                            )}
                        </div>
                    )}

                    {/* METHOD 2 VIEW: Category Image Only Upload */}
                    {imageTab === "category_only" && (
                        <div className="animate-fade-in">
                            <div style={{
                                backgroundColor: "var(--bg-input)",
                                borderRadius: "12px",
                                padding: "14px 18px",
                                marginBottom: "20px",
                                borderLeft: "4px solid #3b82f6"
                            }}>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                                    Method 2: Change Category Image Only
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    This action will change only the category card icon / banner for <strong>{selectedCategory.name}</strong>. Products under this category will remain untouched.
                                </div>
                            </div>

                            <form onSubmit={handleCatImageSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                                            Current Category Icon
                                        </div>
                                        <div style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "12px",
                                            backgroundColor: "var(--bg-card)",
                                            border: "1px solid var(--border-color)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden"
                                        }}>
                                            {selectedCategory.image ? (
                                                <img
                                                    src={getMediaUrl(selectedCategory.image)}
                                                    alt={selectedCategory.name}
                                                    style={{ width: "90%", height: "90%", objectFit: "contain" }}
                                                />
                                            ) : (
                                                <FiFolder style={{ fontSize: "32px", color: "var(--accent-primary)" }} />
                                            )}
                                        </div>
                                    </div>

                                    {catImagePreview && (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#3b82f6", marginBottom: "6px" }}>
                                                New Category Icon
                                            </div>
                                            <div style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "12px",
                                                backgroundColor: "var(--bg-card)",
                                                border: "2px solid #3b82f6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                <img src={catImagePreview} alt="New Category" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px dashed var(--border-color)",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        cursor: "pointer",
                                        backgroundColor: "var(--bg-input)",
                                        transition: "all 0.2s ease"
                                    }}>
                                        <FiUploadCloud style={{ fontSize: "28px", color: "#3b82f6", marginBottom: "6px" }} />
                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                                            {catImageFile ? catImageFile.name : `Select New Icon for ${selectedCategory.name}`}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                            PNG, JPG, WEBP (Max 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCatFileChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!catImageFile || uploadingCatImage}
                                        className="btn-primary"
                                        style={{
                                            width: "100%",
                                            marginTop: "12px",
                                            padding: "11px",
                                            fontSize: "14px",
                                            backgroundColor: "#3b82f6",
                                            opacity: !catImageFile ? 0.6 : 1
                                        }}
                                    >
                                        {uploadingCatImage ? "Updating Category..." : `Update Category Image Only`}
                                    </button>
                                </div>
                            </form>

                            {catImageMsg && (
                                <div style={{
                                    marginTop: "16px",
                                    padding: "12px 18px",
                                    borderRadius: "10px",
                                    backgroundColor: catImageMsg.toLowerCase().includes("success") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    border: `1px solid ${catImageMsg.toLowerCase().includes("success") ? "#10b981" : "#ef4444"}`,
                                    color: catImageMsg.toLowerCase().includes("success") ? "#10b981" : "#ef4444",
                                    fontSize: "13px",
                                    fontWeight: "700"
                                }}>
                                    {catImageMsg}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── 3. LIVE CATALOGUE EXPLORER WITH SINGLE PRODUCT ADD/EDIT/DELETE ── */}
            <div style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "18px",
                padding: "26px 30px",
                boxShadow: "var(--shadow-sm)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiGrid style={{ color: "var(--accent-primary)", fontSize: "20px" }} />
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                                Product Inventory: <span style={{ color: "var(--accent-primary)" }}>{selectedCategory?.name || "All Tyres"}</span>
                            </h3>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "4px 0 0 0" }}>
                            Showing {filteredProducts.length} items. Add, edit, or delete single products below.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%", maxWidth: "460px" }}>
                        {/* Quick Search */}
                        <div style={{ position: "relative", flex: "1 1 180px" }}>
                            <FiSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                placeholder="Search size, pattern, SKU..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px 10px 38px",
                                    borderRadius: "10px",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-primary)",
                                    fontSize: "13px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <button
                            onClick={handleOpenAddModal}
                            className="btn-primary"
                            style={{ padding: "10px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
                        >
                            <FiPlus size={16} /> Add Tyre
                        </button>
                    </div>
                </div>

                {/* Construction & Ply Filter Chips */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Type:</span>
                    {["ALL", "TL", "TT", "TTF"].map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedType(t)}
                            style={{
                                padding: "5px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "700",
                                border: selectedType === t ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                backgroundColor: selectedType === t ? "var(--accent-primary)" : "var(--bg-input)",
                                color: selectedType === t ? "#000" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {t === "ALL" ? "All Types" : t}
                        </button>
                    ))}

                    {availablePlys.length > 0 && (
                        <>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginLeft: "12px" }}>Ply Rating:</span>
                            <button
                                onClick={() => setSelectedPly("ALL")}
                                style={{
                                    padding: "5px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    border: selectedPly === "ALL" ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                    backgroundColor: selectedPly === "ALL" ? "var(--accent-primary)" : "var(--bg-input)",
                                    color: selectedPly === "ALL" ? "#000" : "var(--text-secondary)",
                                    cursor: "pointer"
                                }}
                            >
                                All Ply
                            </button>
                            {availablePlys.slice(0, 6).map(ply => (
                                <button
                                    key={ply}
                                    onClick={() => setSelectedPly(ply)}
                                    style={{
                                        padding: "5px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        border: selectedPly === ply ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                        backgroundColor: selectedPly === ply ? "var(--accent-primary)" : "var(--bg-input)",
                                        color: selectedPly === ply ? "#000" : "var(--text-secondary)",
                                        cursor: "pointer"
                                    }}
                                >
                                    {ply}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>
                        No tyres found matching the selected filter criteria.
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px"
                    }}>
                        {filteredProducts.map(prod => {
                            const isTL = prod.tyre_type === "TL" || (prod.material && prod.material.toUpperCase().includes("TL"));
                            const isTTF = prod.tyre_type === "TTF" || (prod.material && prod.material.toUpperCase().includes("TTF"));
                            const offer = Number(prod.invoice_price);
                            const ndp = Number(prod.ndp_price);
                            const profit = offer > 0 && ndp > 0 ? (offer - ndp) : 0;
                            const marginPct = offer > 0 && profit > 0 ? Math.round((profit / offer) * 100) : 0;

                            return (
                                <div
                                    key={prod.id}
                                    style={{
                                        backgroundColor: "var(--bg-input)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "16px",
                                        padding: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        position: "relative",
                                        boxShadow: "var(--shadow-sm)",
                                        transition: "all 0.25s ease"
                                    }}
                                >
                                    <div>
                                        {/* Tyre Image Box */}
                                        <div style={{
                                            backgroundColor: "var(--bg-card)",
                                            borderRadius: "12px",
                                            height: "160px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "12px",
                                            border: "1px solid var(--border-color)",
                                            overflow: "hidden",
                                            position: "relative"
                                        }}>
                                            <img
                                                src={getTyreImageUrl(prod)}
                                                alt={prod.material}
                                                style={{ width: "85%", height: "85%", objectFit: "contain" }}
                                                onError={e => { e.target.src = getDefaultTyreImage(prod); }}
                                            />

                                            {/* Type Badge */}
                                            <span style={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                padding: "2px 7px",
                                                borderRadius: "4px",
                                                fontSize: "10px",
                                                fontWeight: "800",
                                                backgroundColor: isTL ? "rgba(16, 185, 129, 0.2)" : (isTTF ? "rgba(139, 92, 246, 0.2)" : "rgba(245, 158, 11, 0.2)"),
                                                color: isTL ? "#10b981" : (isTTF ? "#8b5cf6" : "#f59e0b"),
                                                border: `1px solid ${isTL ? "rgba(16,185,129,0.4)" : (isTTF ? "rgba(139,92,246,0.4)" : "rgba(245,158,11,0.4)")}`
                                            }}>
                                                {isTL ? "TL" : (isTTF ? "TTF" : "TT")}
                                            </span>
                                        </div>

                                        {/* Specs Tags */}
                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                                            {prod.rim_size && (
                                                <span style={{
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    backgroundColor: "var(--badge-bg)",
                                                    color: "var(--accent-primary)",
                                                    fontSize: "11px",
                                                    fontWeight: "700"
                                                }}>
                                                    Rim {prod.rim_size}
                                                </span>
                                            )}
                                            {prod.ply_rating && (
                                                <span style={{
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    backgroundColor: "var(--bg-glass)",
                                                    border: "1px solid var(--border-color)",
                                                    color: "var(--text-secondary)",
                                                    fontSize: "11px",
                                                    fontWeight: "600"
                                                }}>
                                                    {prod.ply_rating}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h4 style={{
                                            fontSize: "14px",
                                            fontWeight: "700",
                                            margin: "0 0 4px 0",
                                            color: "var(--text-primary)",
                                            lineHeight: "1.35",
                                            minHeight: "38px"
                                        }}>
                                            {prod.material}
                                        </h4>

                                        {/* SKU Code */}
                                        {prod.material_code && (
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", marginBottom: "8px" }}>
                                                SKU: {prod.material_code}
                                            </div>
                                        )}

                                        {/* Pricing Info */}
                                        <div style={{
                                            backgroundColor: "var(--bg-card)",
                                            padding: "10px 12px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            marginBottom: "12px"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Selling Price:</span>
                                                <span style={{ fontSize: "16px", fontWeight: "900", color: "var(--accent-primary)" }}>
                                                    ₹{offer.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)" }}>
                                                <span>NDP: ₹{ndp.toLocaleString("en-IN")}</span>
                                                <span style={{ color: "#10b981", fontWeight: "700" }}>+{marginPct}% Margin</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Edit, Delete, Stock */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                                        {/* Stock Row */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                Stock: <strong style={{ color: prod.stock_quantity < 15 ? "#ef4444" : "#10b981" }}>{prod.stock_quantity} units</strong>
                                            </div>

                                            {editingStockId === prod.id ? (
                                                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                                    <input
                                                        type="number"
                                                        value={newStockVal}
                                                        onChange={e => setNewStockVal(e.target.value)}
                                                        style={{
                                                            width: "55px",
                                                            padding: "4px",
                                                            borderRadius: "4px",
                                                            border: "1px solid var(--accent-primary)",
                                                            backgroundColor: "var(--bg-card)",
                                                            color: "var(--text-primary)",
                                                            fontSize: "12px",
                                                            textAlign: "center"
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleStockSave(prod.id)}
                                                        style={{
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            border: "none",
                                                            backgroundColor: "#10b981",
                                                            color: "#fff",
                                                            fontSize: "12px",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingStockId(prod.id);
                                                        setNewStockVal(prod.stock_quantity);
                                                    }}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        border: "1px solid var(--border-color)",
                                                        backgroundColor: "var(--bg-glass)",
                                                        color: "var(--text-primary)",
                                                        fontSize: "11px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <FiEdit3 size={11} /> Stock
                                                </button>
                                            )}
                                        </div>

                                        {/* Edit / Delete Product Buttons */}
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={() => handleOpenEditModal(prod)}
                                                style={{
                                                    flex: 1,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "6px",
                                                    padding: "8px",
                                                    borderRadius: "6px",
                                                    border: "1px solid var(--border-color)",
                                                    backgroundColor: "var(--bg-card)",
                                                    color: "var(--text-primary)",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiEdit3 size={13} /> Edit Tyre
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(prod.id, prod.material)}
                                                style={{
                                                    padding: "8px 12px",
                                                    borderRadius: "6px",
                                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                    color: "var(--danger)",
                                                    fontSize: "12px",
                                                    cursor: "pointer"
                                                }}
                                                title="Delete this tyre"
                                            >
                                                <FiTrash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── 4. SINGLE PRODUCT ADD / EDIT MODAL ── */}
            {isProductModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(4px)",
                    zIndex: 2000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "18px",
                        width: "100%",
                        maxWidth: "650px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        padding: "28px",
                        boxShadow: "var(--shadow-lg)"
                    }} className="animate-fade-in">
                        {/* Modal Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div>
                                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                                    {editingProductId ? "Edit Single Product" : "Add Single Product"}
                                </h3>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                    {editingProductId ? "Update tyre specifications, pricing, and individual image" : "Create a new product entry under a category"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-secondary)",
                                    fontSize: "20px",
                                    cursor: "pointer"
                                }}
                            >
                                <FiX />
                            </button>
                        </div>

                        {productModalError && (
                            <div style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid #ef4444",
                                color: "#ef4444",
                                fontSize: "13px",
                                marginBottom: "16px"
                            }}>
                                {productModalError}
                            </div>
                        )}

                        <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Category & Tyre Type */}
                            <div className="modal-grid-2">
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Category *
                                    </label>
                                    <select
                                        value={productForm.category}
                                        onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Construction Type
                                    </label>
                                    <select
                                        value={productForm.tyre_type}
                                        onChange={e => setProductForm({ ...productForm, tyre_type: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    >
                                        <option value="TL">TL</option>
                                        <option value="TT">TT</option>
                                        <option value="TTF">TTF</option>
                                    </select>
                                </div>
                            </div>

                            {/* Material / Model Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                    Product / Pattern Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 145/80 R12 AMAZER 4G LIFE"
                                    value={productForm.material}
                                    onChange={e => setProductForm({ ...productForm, material: e.target.value })}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        backgroundColor: "var(--bg-input)",
                                        color: "var(--text-primary)",
                                        fontSize: "13px"
                                    }}
                                />
                            </div>

                            {/* SKU Code, Rim Size, Ply Rating */}
                            <div className="modal-grid-3">
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Material Code / SKU
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10001872"
                                        value={productForm.material_code}
                                        onChange={e => setProductForm({ ...productForm, material_code: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Rim Size
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 12 or 15.5"
                                        value={productForm.rim_size}
                                        onChange={e => setProductForm({ ...productForm, rim_size: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Ply Rating
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 4PR or 8PR"
                                        value={productForm.ply_rating}
                                        onChange={e => setProductForm({ ...productForm, ply_rating: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="modal-grid-4">
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Selling Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={productForm.invoice_price}
                                        onChange={e => setProductForm({ ...productForm, invoice_price: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        MRP / Top (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={productForm.top_price}
                                        onChange={e => setProductForm({ ...productForm, top_price: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        NDP Buy (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={productForm.ndp_price}
                                        onChange={e => setProductForm({ ...productForm, ndp_price: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                        Stock Qty
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="50"
                                        value={productForm.stock_quantity}
                                        onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border-color)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Product Specific Image Upload */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                    Product Image (Optional - Overrides common category image)
                                </label>
                                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                    {productImagePreview && (
                                        <div style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "8px",
                                            backgroundColor: "var(--bg-input)",
                                            border: "1px solid var(--border-color)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden"
                                        }}>
                                            <img src={productImagePreview} alt="Preview" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                                        </div>
                                    )}
                                    <label style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px dashed var(--border-color)",
                                        backgroundColor: "var(--bg-input)",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        color: "var(--text-primary)"
                                    }}>
                                        <FiUploadCloud />
                                        <span>{productImageFile ? productImageFile.name : "Choose individual tyre picture"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const f = e.target.files[0];
                                                if (f) {
                                                    setProductImageFile(f);
                                                    setProductImagePreview(URL.createObjectURL(f));
                                                }
                                            }}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="btn-secondary"
                                    style={{ padding: "10px 18px", fontSize: "13px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProduct}
                                    className="btn-primary"
                                    style={{ padding: "10px 22px", fontSize: "13px" }}
                                >
                                    {savingProduct ? "Saving..." : (editingProductId ? "Update Product" : "Create Product")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
