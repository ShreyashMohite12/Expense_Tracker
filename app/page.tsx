'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Search, DollarSign, Tag, Calendar, Receipt, TrendingUp, Layers, LogOut, User } from 'lucide-react';

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', expenseDate: new Date().toISOString().split('T')[0] });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const router = useRouter();

  const categories = ['All', 'Food', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Other'];

  // Check authentication session and fetch expenses
  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) {
      router.push('/auth');
    } else {
      setCurrentUsername(user);
      fetchExpenses();
    }
  }, [router]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses`);
      const data: Expense[] = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        setForm({ title: '', amount: '', category: 'Food', expenseDate: new Date().toISOString().split('T')[0] });
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/auth');
  };

  // Calculations for KPI Cards
  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCount = expenses.length;
  const avgSpend = totalCount > 0 ? totalSpend / totalCount : 0;

  // Filter logic
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Receipt className="w-7 h-7" />
              </span>
              Expense<span className="text-indigo-400">Tracker</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time financial tracking and analytics dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 px-4 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">{currentUsername}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Spend</p>
            <h3 className="text-3xl font-bold text-white mt-2">${totalSpend.toFixed(2)}</h3>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tracked across all categories
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Transactions</p>
            <h3 className="text-3xl font-bold text-white mt-2">{totalCount}</h3>
            <p className="mt-2 text-xs text-slate-400">Logged items in database</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">Average Transaction</p>
            <h3 className="text-3xl font-bold text-white mt-2">${avgSpend.toFixed(2)}</h3>
            <p className="mt-2 text-xs text-slate-400">Mean cost per entry</p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Add Form */}
          <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" /> New Expense
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Grocery run"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 mt-2"
              >
                <PlusCircle className="w-5 h-5" /> {loading ? 'Saving...' : 'Add Expense'}
              </button>
            </form>
          </div>

          {/* Right Column: Search, Filter & Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses Table Card */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-700/30 transition">
                          <td className="p-4 font-medium text-white">{exp.title}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <Tag className="w-3 h-3" /> {exp.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{exp.expenseDate}</td>
                          <td className="p-4 font-bold text-emerald-400">${exp.amount.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}