import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Wallet, 
  BarChart3, 
  User, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';
import { useTransactions } from './lib/useTransactions';
import { Transaction } from './types';
import AuthScreen from './components/AuthScreen';
import TransactionForm from './components/TransactionForm';
import MonthlySummary from './components/MonthlySummary';
import TransactionList from './components/TransactionList';
import DataAnalysis from './components/DataAnalysis';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const {
    user,
    loading,
    transactions,
    isDemoMode,
    isFirebaseConfigured,
    loginWithGoogle,
    loginAsDemo,
    logout,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  // Active view tab state: 'transactions' | 'analysis' | 'settings'
  const [activeTab, setActiveTab] = useState<'transactions' | 'analysis' | 'settings'>('transactions');
  
  // Selected month filter (YYYY-MM format, e.g. "2026-07")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7);
  });

  // Edit / Add Modal visibility
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Handles starting a transaction edit
  const handleStartEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // Handle backup import
  const handleImportBackup = async (importedList: Transaction[]) => {
    // Merge or completely overwrite the list
    // In our simplified hook, let's replace/batch-save them.
    // For demo mode, it will just overwrite. For Firebase, we can add them.
    if (isDemoMode) {
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(importedList));
      // Triggers reload of transactions through hook
      window.location.reload();
    } else {
      // Overwrite / add transactions to Firebase
      // For simplicity, add them one by one
      for (const item of importedList) {
        try {
          await addTransaction({
            type: item.type,
            amount: item.amount,
            category: item.category,
            date: item.date,
            note: item.note
          });
        } catch (e) {
          console.error("Failed to import individual item", e);
        }
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setEditingTransaction(null);
  };

  // If initial load is true, show a clean, gorgeous loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          <Coins className="w-5 h-5 text-emerald-500 absolute" />
        </div>
        <p className="text-slate-400 text-xs font-semibold mt-4 tracking-wider uppercase font-display animate-pulse">
          กำลังโหลดข้อมูลบัญชี...
        </p>
      </div>
    );
  }

  // If user is not logged in, display the auth selector
  if (!user) {
    return (
      <AuthScreen
        onLoginGoogle={loginWithGoogle}
        onLoginDemo={loginAsDemo}
        isFirebaseConfigured={isFirebaseConfigured}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col pb-28 md:pb-6 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100/80 z-40 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-800 text-base leading-none">
                FinTrack <span className="text-emerald-500">Gay-67</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                {isDemoMode ? 'โหมดบัญชีทดลอง (LOCAL)' : 'ระบบบันทึกคลาวด์เรียบร้อย'}
              </span>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="flex items-center gap-2">
            {isDemoMode && (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>บัญชีทดลอง</span>
              </span>
            )}
            
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/15"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Monthly totals summary section */}
              <MonthlySummary
                transactions={transactions}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />

              {/* Transactions list details */}
              <TransactionList
                transactions={transactions}
                selectedMonth={selectedMonth}
                onEdit={handleStartEdit}
                onDelete={deleteTransaction}
              />
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Analysis component */}
              <DataAnalysis
                transactions={transactions}
                selectedMonth={selectedMonth}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Configuration panel */}
              <SettingsPanel
                user={user}
                isFirebaseConfigured={isFirebaseConfigured}
                isDemoMode={isDemoMode}
                transactions={transactions}
                onLogout={logout}
                onImportBackup={handleImportBackup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-8px_24px_rgba(15,23,42,0.03)] p-4 z-40 md:max-w-md md:mx-auto md:bottom-4 md:rounded-2xl md:border">
        <div className="flex items-center justify-between px-4 max-w-lg mx-auto relative">
          
          {/* Left Tab: Transactions list */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 transition-all relative z-10 ${
              activeTab === 'transactions' ? 'text-emerald-500 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab_transactions_btn"
          >
            <Wallet className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold">รายการบัญชี</span>
          </button>

          {/* Spacer for center Float button */}
          <div className="w-14" />

          {/* Central Floating PLUS Button */}
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            className="absolute left-1/2 -translate-x-1/2 -top-10 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-90 transition-all z-20"
            id="add_new_floating_btn"
          >
            <Plus className="w-7 h-7" />
          </button>

          {/* Right Tab 1: Data Analytics */}
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex flex-col items-center gap-1 transition-all relative z-10 ${
              activeTab === 'analysis' ? 'text-emerald-500 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab_analysis_btn"
          >
            <BarChart3 className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold">วิเคราะห์สถิติ</span>
          </button>

          {/* Right Tab 2: Settings Profile */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-all relative z-10 ${
              activeTab === 'settings' ? 'text-emerald-500 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
            id="tab_settings_btn"
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] font-bold">ข้อมูลบัญชี</span>
          </button>
          
        </div>
      </nav>

      {/* Collapsible sheet for transaction add/edit form */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
