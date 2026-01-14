import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Edit2,
  FileText,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getTodayDate = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const calculateDueDate = (invoiceDate, paymentTerms) => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + paymentTerms);
  return date.toISOString().split('T')[0];
};

const calculateDaysDisplay = (invoice) => {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (invoice.status === 'paid') return '✓ Paid';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  return `${diffDays} days left`;
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

const calculateTotalOutstanding = (invoices) =>
  invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);

const calculateTotalOverdue = (invoices) =>
  invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.amount || 0), 0);

const calculateTotalPaid = (invoices) =>
  invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);

// ============================================
// CUSTOM HOOK FOR INVOICES
// ============================================

const useInvoices = () => {
  const [invoices, setInvoices] = useState([
    { 
      id: 'INV-001', 
      customerName: 'Acme Corporation', 
      amount: 50000, 
      invoiceDate: '2024-01-15', 
      paymentTerms: 30, 
      status: 'paid' 
    },
    { 
      id: 'INV-002', 
      customerName: 'Tech Solutions Inc', 
      amount: 75000, 
      invoiceDate: '2024-01-20', 
      paymentTerms: 30, 
      status: 'pending' 
    },
    { 
      id: 'INV-003', 
      customerName: 'Global Industries Ltd', 
      amount: 120000, 
      invoiceDate: '2023-12-10', 
      paymentTerms: 45, 
      status: 'overdue' 
    },
    { 
      id: 'INV-004', 
      customerName: 'Digital Marketing Pro', 
      amount: 35000, 
      invoiceDate: '2024-01-18', 
      paymentTerms: 15, 
      status: 'pending' 
    },
    { 
      id: 'INV-005', 
      customerName: 'Cloud Services Ltd', 
      amount: 95000, 
      invoiceDate: '2024-01-12', 
      paymentTerms: 30, 
      status: 'paid' 
    },
    { 
      id: 'INV-006', 
      customerName: 'Software Development Co', 
      amount: 150000, 
      invoiceDate: '2024-01-08', 
      paymentTerms: 45, 
      status: 'overdue' 
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSorted = useMemo(() => {
    return invoices
      .map(inv => ({ 
        ...inv, 
        dueDate: calculateDueDate(inv.invoiceDate, inv.paymentTerms) 
      }))
      .filter(inv => 
        (filterStatus === 'all' || inv.status === filterStatus) &&
        (inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         inv.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [invoices, filterStatus, searchTerm]);

  const addInvoice = useCallback((formData) => {
    const newId = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    setInvoices(prev => [...prev, { 
      id: newId, 
      ...formData, 
      status: 'pending' 
    }]);
  }, [invoices.length]);

  const updateInvoice = useCallback((id, data) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...data } : inv
    ));
  }, []);

  const deleteInvoice = useCallback((id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const markAsPaid = useCallback((id) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'paid' } : inv
    ));
  }, []);

  return {
    invoices,
    filteredAndSorted,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid
  };
};

// ============================================
// ADD/EDIT INVOICE MODAL COMPONENT
// ============================================

const AddInvoiceModal = ({ isOpen, onClose, onAdd, onEdit, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || { 
      customerName: '', 
      amount: '', 
      invoiceDate: getTodayDate(), 
      paymentTerms: 30 
    }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (initialData) {
      onEdit(initialData.id, formData);
    } else {
      onAdd(formData);
    }
    
    setFormData({ 
      customerName: '', 
      amount: '', 
      invoiceDate: getTodayDate(), 
      paymentTerms: 30 
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/90 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {initialData ? 'Edit Invoice' : 'New Invoice'}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {initialData ? 'Update invoice details' : 'Create a new invoice'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={22} />
                </motion.button>
              </div>

              {/* Form */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto">
                {/* Customer Details */}
                <div className="bg-slate-700/50 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} />
                    Customer Details
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-800 text-white ${
                        errors.customerName
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/30'
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.customerName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-semibold mt-2 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.customerName}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-slate-700/50 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} />
                    Invoice Amount
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Amount (₹) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-800 text-white ${
                          errors.amount
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/30'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-semibold mt-2 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.amount}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-slate-700/50 border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} />
                    Payment Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Invoice Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) => handleChange('invoiceDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-800 text-white ${
                          errors.invoiceDate
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/30'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Payment Terms
                      </label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => handleChange('paymentTerms', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-800 text-white border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/30 cursor-pointer"
                      >
                        <option value={7}>7 days</option>
                        <option value={15}>15 days</option>
                        <option value={30}>30 days</option>
                        <option value={45}>45 days</option>
                        <option value={60}>60 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-white/10 bg-slate-800/90 backdrop-blur-md sticky bottom-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className={`flex-1 flex items-center justify-center gap-2 text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-lg ${
                    initialData
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'
                  }`}
                >
                  {initialData ? <Edit2 size={18} /> : <Plus size={18} />}
                  {initialData ? 'Update Invoice' : 'Create Invoice'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3.5 px-4 rounded-xl font-bold transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// CHART SECTION COMPONENT
// ============================================

const ChartSection = ({ invoices }) => {
  const statusData = [
    {
      name: 'Paid',
      value: invoices.filter(i => i.status === 'paid').length,
      color: '#10b981'
    },
    {
      name: 'Pending',
      value: invoices.filter(i => i.status === 'pending').length,
      color: '#f59e0b'
    },
    {
      name: 'Overdue',
      value: invoices.filter(i => i.status === 'overdue').length,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const amountData = [
    {
      name: 'Paid',
      value: invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0),
      color: '#10b981'
    },
    {
      name: 'Pending',
      value: invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0),
      color: '#f59e0b'
    },
    {
      name: 'Overdue',
      value: invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0),
      color: '#ef4444'
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-gray-800 text-sm">{payload[0].name}</p>
          <p className="text-gray-600 text-sm">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Invoice Status Distribution
        </h3>
        {statusData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-gray-700 font-semibold text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </motion.div>

      {/* Amount Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Amount Distribution
        </h3>
        {amountData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={amountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {amountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-gray-700 font-semibold text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  const {
    invoices,
    filteredAndSorted,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid
  } = useInvoices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const handleExportCSV = useCallback(() => {
    const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Amount', 'Status'];
    const rows = filteredAndSorted.map(i => [
      i.id,
      i.customerName,
      i.invoiceDate,
      i.dueDate,
      i.amount,
      i.status
    ].join(','));

    const csv = headers.join(',') + '\n' + rows.join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `invoices-${getTodayDate()}.csv`;
    link.click();
  }, [filteredAndSorted]);

  const outstanding = calculateTotalOutstanding(filteredAndSorted);
  const overdue = calculateTotalOverdue(filteredAndSorted);
  const paid = calculateTotalPaid(filteredAndSorted);

  const summaryCards = [
    { 
      label: 'Outstanding', 
      value: outstanding, 
      color: 'blue', 
      icon: TrendingUp,
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700'
    },
    { 
      label: 'Overdue', 
      value: overdue, 
      color: 'red', 
      icon: AlertCircle,
      bgGradient: 'from-red-50 to-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-700'
    },
    { 
      label: 'Paid', 
      value: paid, 
      color: 'green', 
      icon: CheckCircle,
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    { 
      label: 'Total Invoices', 
      value: filteredAndSorted.length, 
      color: 'purple', 
      icon: FileText,
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
      isCount: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-black text-gray-900">Invoice Manager</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage all your invoices
              </p>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingInvoice(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Invoice</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200"
        >
          <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name or invoice number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800 transition-all"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-3 flex-wrap">
              {['all', 'paid', 'pending', 'overdue'].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All Invoices' : status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${card.bgGradient} rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${card.iconBg} p-3 rounded-lg`}>
                    <Icon size={24} className={card.iconColor} />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  {card.label}
                </h3>
                <p className={`text-3xl font-black ${card.textColor}`}>
                  {card.isCount ? card.value : `₹${card.value.toLocaleString('en-IN')}`}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <ChartSection invoices={filteredAndSorted} />

        {/* Invoice Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Invoice List</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredAndSorted.length} invoice{filteredAndSorted.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {paginatedInvoices.length === 0 ? (
            <div className="text-center py-16 px-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <FileText size={64} className="text-gray-300" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first invoice to get started'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingInvoice(null);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Invoice
              </motion.button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Invoice Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedInvoices.map((invoice, idx) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">{invoice.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700 font-medium">{invoice.customerName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">
                            ₹{invoice.amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-block ${
                              invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-700'
                                : invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {calculateDaysDisplay(invoice)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {invoice.status !== 'paid' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsPaid(invoice.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                title="Mark as Paid"
                              >
                                <CheckCircle size={16} />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setIsModalOpen(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="Edit Invoice"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (window.confirm(`Delete invoice ${invoice.id}?`)) {
                                  deleteInvoice(invoice.id);
                                  if (paginatedInvoices.length === 1 && currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                  }
                                }
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-semibold text-gray-900">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900">
                      {filteredAndSorted.length}
                    </span>{' '}
                    results
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </motion.button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <motion.button
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentPage === page
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {page}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                    >
                      Next
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AddInvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onAdd={addInvoice}
        onEdit={updateInvoice}
        initialData={editingInvoice}
      />
    </div>
  );
}