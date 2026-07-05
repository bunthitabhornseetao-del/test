import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  Percent
} from 'lucide-react';
import { Transaction } from '../types';

interface MonthlySummaryProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

export default function MonthlySummary({ 
  transactions, 
  selectedMonth, 
  onMonthChange 
}: MonthlySummaryProps) {
  // Extract all unique months from transactions to build the month-select list
  // If transactions are empty, default to current month
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    monthsSet.add(currentMonthStr);
    
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7));
      }
    });

    // Sort descending
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Translate month string (YYYY-MM) to Thai name
  const formatThaiMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = parseInt(year) + 543; // Buddhist Era
    return `${monthNames[parseInt(month) - 1]} ${thaiYear}`;
  };

  // Switch month helper
  const handlePrevMonth = () => {
    const currentIndex = uniqueMonths.indexOf(selectedMonth);
    if (currentIndex < uniqueMonths.length - 1) {
      onMonthChange(uniqueMonths[currentIndex + 1]);
    } else {
      // Create previous month mathematically
      const [year, month] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1);
      const prevStr = prevDate.toISOString().substring(0, 7);
      onMonthChange(prevStr);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = uniqueMonths.indexOf(selectedMonth);
    if (currentIndex > 0) {
      onMonthChange(uniqueMonths[currentIndex - 1]);
    } else {
      // Create next month mathematically
      const [year, month] = selectedMonth.split('-').map(Number);
      const nextDate = new Date(year, month, 1);
      const nextStr = nextDate.toISOString().substring(0, 7);
      onMonthChange(nextStr);
    }
  };

  // Filter and calculate totals
  const monthlyMetrics = useMemo(() => {
    const monthlyTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
    let income = 0;
    let expense = 0;

    monthlyTxs.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const balance = income - expense;
    // Calculate saving rate
    const savingRate = income > 0 ? Math.max(0, Math.min(100, Math.round((balance / income) * 100))) : 0;

    return {
      income,
      expense,
      balance,
      savingRate,
      txCount: monthlyTxs.length
    };
  }, [transactions, selectedMonth]);

  const { income, expense, balance, savingRate } = monthlyMetrics;

  return (
    <div className="space-y-5" id="monthly_summary_section">
      {/* Horizontal Month Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-0.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>ยอดใช้จ่ายประจำเดือน</span>
          </div>
          <span className="text-base font-bold text-slate-800 font-sans tracking-tight">
            {formatThaiMonth(selectedMonth)}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl ${
            balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />

          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ยอดเงินคงเหลือสุทธิ
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl font-bold font-mono tracking-tight ${
              balance >= 0 ? 'text-slate-800' : 'text-rose-600'
            }`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
            </div>
            <p className="text-xs text-slate-400">
              {balance >= 0 ? '👍 แผนการเงินของคุณเป็นบวก' : '⚠️ รายจ่ายของคุณมากกว่ารายรับ'}
            </p>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              รายรับทั้งหมด
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
              {income.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: income > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              รายจ่ายทั้งหมด
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-rose-600">
              {expense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
            </div>
            {/* Expense vs Income ratio progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : (expense > 0 ? 100 : 0)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Savings rate Indicator */}
      {income > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                อัตราการออมเงิน (Savings Rate)
              </h4>
              <p className="text-xs text-emerald-600 font-medium">
                คุณประหยัดเงินได้ <span className="font-bold text-sm">{savingRate}%</span> จากรายรับทั้งหมดในเดือนนี้
              </p>
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Dynamic circle progress */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" className="stroke-emerald-100 fill-none" strokeWidth="4" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                className="stroke-emerald-500 fill-none transition-all duration-700" 
                strokeWidth="4" 
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * savingRate) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-emerald-700">{savingRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
