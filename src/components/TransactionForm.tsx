import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  FileText, 
  Coins, 
  Plus, 
  Check, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES 
} from '../types';
import CategoryIcon from './CategoryIcon';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingTransaction?: Transaction | null;
}

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTransaction 
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize values
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]); // Default to today
      setNote('');
    }
    setError(null);
  }, [editingTransaction, isOpen]);

  // Handle category default when type changes
  useEffect(() => {
    if (!editingTransaction && isOpen) {
      const defaultCat = type === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
      setCategory(defaultCat);
    }
  }, [type, editingTransaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: numericAmount,
        category,
        date,
        note: note.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-50 transition-opacity"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col overflow-hidden md:max-w-lg md:mx-auto md:bottom-6 md:rounded-3xl md:max-h-[85vh]"
            id="transaction_form_sheet"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 font-display">
                {editingTransaction ? '✏️ แก้ไขรายการ' : '➕ บันทึกรายการใหม่'}
              </h2>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Type Toggle Slider */}
              <div className="relative flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative z-10 ${
                    type === 'expense' ? 'text-rose-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>รายจ่าย (Expense)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative z-10 ${
                    type === 'income' ? 'text-emerald-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>รายรับ (Income)</span>
                </button>
              </div>

              {/* Amount Display with Mono Font */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  จำนวนเงิน (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl font-bold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-10 pr-4 py-4 bg-slate-50 border rounded-2xl text-2xl font-mono font-bold focus:outline-none focus:ring-4 transition-all ${
                      type === 'expense' 
                        ? 'text-rose-600 border-rose-100 focus:border-rose-400 focus:ring-rose-100' 
                        : 'text-emerald-600 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                    required
                    autoFocus={!editingTransaction}
                  />
                </div>
              </div>

              {/* Grid of Categories (Touch-optimized) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  เลือกหมวดหมู่
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {currentCategories.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
                          isSelected
                            ? type === 'expense'
                              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.color} ${isSelected ? 'scale-110' : ''} transition-transform`}>
                          <CategoryIcon name={cat.icon} size={18} />
                        </div>
                        <span className="text-[11px] font-semibold tracking-tight truncate w-full leading-none">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white ${
                            type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Note Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    วันที่ทำรายการ
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    บันทึกเพิ่มเติม
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="เช่น ค่ารถ, โบนัสพิเศษ"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Error Warning */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              {/* Action Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                    submitting 
                      ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                      : type === 'expense'
                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 active:scale-98' 
                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100 active:scale-98'
                  }`}
                  id="save_transaction_btn"
                >
                  <Check className="w-5 h-5" />
                  <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
