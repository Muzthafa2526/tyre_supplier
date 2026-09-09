import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Categories from "./pages/categories";
import Products from "./pages/products";
import AdminERP from "./pages/AdminERP";

function Layout() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin-erp");

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            {!isAdmin && <Navbar />}
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/categories" replace />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/admin-erp" element={<AdminERP />} />
                </Routes>
            </main>
            {!isAdmin && <Footer />}
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;