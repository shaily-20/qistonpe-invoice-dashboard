

# QistonPe Invoice Management Dashboard

A **React + Tailwind CSS** based MSME Invoice Management Dashboard built as part of the **Front-End Intern Assignment for QistonPe**.



## ⚙️ Setup & Run

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/shaily-20/qistonpe-invoice-dashboard.git
   ```

2. Navigate to the project directory:

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

The application will be available at:

```
http://localhost:5173
```

---

## 🧠 Approach

### Component Structure

* Broke the UI into reusable components:

  * `Dashboard`
  * `InvoiceTable`
  * `InvoiceRow`
  * `SummaryCard`
  * `AddInvoiceModal`
* Used **custom hooks** to manage invoice state and business logic
* Ensured clear separation between **data logic** and **presentation**

### Optimization Techniques Used

* Used `useMemo` for:

  * Filtering invoices
  * Calculating totals (outstanding, overdue, paid)
* Used `useCallback` for event handlers passed to child components
* Implemented pagination to avoid rendering large lists at once

### Challenges Faced

* Handling invoice status calculation dynamically based on dates
* Keeping summary metrics updated in real-time with filters applied
* Maintaining clean UI alignment while keeping the dashboard responsive

---

## ⚡ Performance Optimizations

### Optimizations Implemented

* Memoized filtered and sorted invoice lists
* Memoized summary calculations
* Prevented unnecessary re-renders using stable callbacks
* Used pagination instead of rendering full datasets

### Why These Were Chosen

* Improves performance with large datasets (500+ invoices)
* Ensures smooth UI updates
* Demonstrates understanding of React render cycles

---

## ⏱ Time Breakdown

* **Design & Planning:** 2 hours
* **Development:** 10 hours
* **Testing & Debugging:** 3 hours

**Total:** 15 hours

```

