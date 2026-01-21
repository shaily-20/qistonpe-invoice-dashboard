# 📊 Invoice Manager Dashboard

A modern, responsive **Invoice Management Dashboard** built with **React**, featuring invoice tracking, filtering, analytics, and smooth animations.  
This project was developed as part of the **QistonPe Frontend Intern Assignment**.

---

## 🌐 Live Demo

🔗 **Vercel Deployment**  
https://qistonpe-invoice-dashboard-one.vercel.app/

---

## 🚀 Features

- 📋 Create, edit, delete invoices
- ✅ Mark invoices as paid
- 🔍 Search invoices by customer name or invoice number
- 🎯 Filter invoices by status (All, Paid, Pending, Overdue)
- 📊 Visual analytics using pie charts
- 📈 Summary cards (Outstanding, Paid, Overdue, Total Invoices)
- 📤 Export invoices as CSV
- 📄 Pagination for large datasets
- 🎨 Smooth UI animations with Framer Motion
- 📱 Fully responsive design

---

## ⚙️ Setup & Run

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/shaily-20/qistonpe-invoice-dashboard.git
   ```

2. Navigate to the project folder:

   ```bash
   cd qistonpe-invoice-dashboard
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Run Locally

```bash
npm run dev
```

The application will run at:

```
http://localhost:5173
```

---

## 🧠 Approach

### Component Structure

* **Dashboard** – Main container handling layout and state
* **AddInvoiceModal** – Slide-in modal for adding/editing invoices
* **ChartSection** – Displays invoice status and amount distribution
* **Custom Hook (`useInvoices`)**

  * Centralized invoice state management
  * Handles CRUD operations
  * Filtering and searching logic

### Data Flow

* Invoices are managed via a custom hook using `useState`
* Derived data (filtered invoices, totals, pagination) is memoized
* UI components consume only the data they need

---

## ⚡ Performance Optimizations

### Optimizations Implemented

* `useMemo`

  * Filtered & searched invoice list
  * Summary calculations (paid, overdue, outstanding)
  * Pagination slicing
* `useCallback`

  * Stable handlers for add, update, delete, export, and status updates
* Pagination to avoid rendering large lists at once

### Why These Were Chosen

* Reduces unnecessary re-renders
* Keeps the dashboard responsive with growing data
* Demonstrates understanding of React performance best practices

---

## 📊 Analytics & Visualization

* **Recharts**

  * Invoice Status Distribution (Paid / Pending / Overdue)
  * Amount Distribution by status
* Custom tooltips and legends
* Responsive charts using `ResponsiveContainer`

---

## 🎨 UI & UX Enhancements

* **Framer Motion**

  * Modal slide-in animations
  * Button hover & tap effects
  * Table row animations
* **Lucide Icons** for consistent iconography
* Clean, accessible UI with clear visual hierarchy

---

## ⏱ Time Breakdown

* **Design & Planning:** 2 hours
* **Development:** 10 hours
* **Testing & Debugging:** 3 hours

**Total:** 15 hours

---

## 🛠 Tech Stack

* **React**
* **Vite**
* **Tailwind CSS**



