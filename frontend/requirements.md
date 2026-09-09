# Frontend Requirements & Setup Guide

This document details the frontend architecture, dependencies, setup instructions, and design system tokens for the **APPOLO TYRES Storefront & Admin ERP**.

---

## 💻 Tech Stack
- **Framework**: React 19.x with functional components & hooks
- **Bundler & Build Tool**: Vite 8.x
- **Routing**: React Router DOM 7.x
- **Icons**: React Icons (Feather Icons `fi`, FontAwesome `fa`, GameIcons `gi`)
- **Visuals & Charts**: Recharts 3.x
- **Styling**: Vanilla CSS Design System with theme variables (Light & Dark modes)

---

## 📦 Package Dependencies (`package.json`)

### Production Dependencies
```json
{
  "axios": "^1.20.0",
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-icons": "^5.7.0",
  "react-router-dom": "^7.18.3",
  "recharts": "^3.10.1"
}
```

### Dev Dependencies
```json
{
  "@types/react": "^19.2.17",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.4",
  "oxlint": "^1.75.0",
  "vite": "^8.2.0"
}
```

---

## 🚀 Getting Started

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Development Server
```bash
npm run dev
```
Accessible at: `http://localhost:5173/`

### 3. Production Build
```bash
npm run build
```
Build output is generated into the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🧭 Application Routes

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `Hero.jsx` | Storefront landing page & category showcase |
| `/categories` | `CategoryList.jsx` | 5 Core Category Explorer with dynamic cards |
| `/products` | `products.jsx` | Tyre catalogue with tube-type filters & customer pricing visibility toggle |
| `/admin-erp` | `AdminERP.jsx` | Full Admin ERP Master Console (Drawer Sidebar Navigation) |
