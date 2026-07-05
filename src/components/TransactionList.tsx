import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  Edit2, 
  Calendar, 
  Tag, 
  Inbox, 
  MoreVertical,
  Filter
} from 'lucide-react';
import { Transaction, ALL_CATEGORIES } from '../types';
import CategoryIcon from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function TransactionList({ 
  transactions, 
  selectedMonth, 
  onEdit, 
  onDelete 
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Filter transactions of the selected month by category and search query
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .filter(t => {
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        const matchesSearch = 
          t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.amount.toString().includes(searchQuery);
        return matchesCategory && matchesSearch;
      });
  }, [transactions, selectedMonth, selectedCategory, searchQuery]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { txs: Transaction[]; dailyTotal: number } } = {};
    
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = { txs: [], dailyTotal: 0 };
      }
      groups[t.date].txs.push(t);
      
      const val = Number(t.amount);
      if (t.type === 'income') {
        groups[t.date].dailyTotal += val;
      } else {
        groups[t.date].dailyTotal -= val;
      }
    });

    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        txs: groups[date].txs,
        dailyTotal: groups[date].dailyTotal
      }));
  }, [filteredTransactions]);

  // Format date headers beautifully in Thai
  const formatThaiDayHeader = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return 'วันนี้ (Today)';
    } else if (dateStr === yesterdayStr) {
      return 'เมื่อวาน (Yesterday)';
    }

    const [year, month, day] = dateStr.split('-');
    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const thaiYearShort = (parseInt(year) + 543).toString().substring(2, 4);
    return `วันที่ ${parseInt(day)} ${thaiMonthsShort[parseInt(month) - 1]} ${thaiYearShort}`;
  };

  // Predefined filter categories present in this month's transactions to avoid clutter
  const categoriesPresent = useMemo(() => {
    const set = new Set<string>();
    transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .forEach(t => set.add(t.category));
    return Array.from(set);
  }, [transactions, selectedMonth]);

  const handleDeleteClick = async (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      await onDelete(id);
      setActionMenuId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5" id="transaction_list_section">
      {/* Header and Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 font-display">
            ประวัติรายการบันทึก
          </h3>
          <span className="text-xs font-bold font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
            พบ {filteredTransactions.length} รายการ
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาบันทึก หรือยอดเงิน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* Horizontal Category Pill Filter */}
        {categoriesPresent.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            {categoriesPresent.map(catName => {
              const catConfig = ALL_CATEGORIES.find(c => c.name === catName);
              const isSelected = selectedCategory === catName;
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {catConfig && <CategoryIcon name={catConfig.icon} size={12} />}
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grouped Lists */}
      {groupedTransactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center">
          <Inbox className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-500">ไม่มีรายการบันทึกในหมวดหมู่นี้</p>
          <p className="text-xs text-slate-400 mt-1">คุณสามารถจดบันทึกรายรับ-รายจ่ายโดยกดปุ่มบวก</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-2.5">
              {/* Daily Header */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-slate-400 font-sans">
                  {formatThaiDayHeader(group.date)}
                </span>
                <span className={`font-mono font-bold ${
                  group.dailyTotal >= 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {group.dailyTotal >= 0 ? '+' : ''}{group.dailyTotal.toLocaleString()} ฿
                </span>
              </div>

              {/* Transactions List Under This Day */}
              <div className="space-y-2">
                {group.txs.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const catConfig = ALL_CATEGORIES.find(c => c.name === tx.category) || {
                    color: 'bg-slate-50 text-slate-600 border-slate-100',
                    icon: 'MoreHorizontal'
                  };

                  const isMenuOpen = actionMenuId === tx.id;

                  return (
                    <div
                      key={tx.id}
                      className="group relative bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between transition-all"
                    >
                      {/* Left: icon & text */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${catConfig.color}`}>
                          <CategoryIcon name={catConfig.icon} size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-700 truncate">
                            {tx.category}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[160px] md:max-w-xs">
                            {tx.note || <span className="italic text-slate-300">ไม่มีบันทึก</span>}
                          </p>
                        </div>
                      </div>

                      {/* Right: money amount and action options */}
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold font-mono tracking-tight whitespace-nowrap ${
                          isIncome ? 'text-emerald-500' : 'text-slate-800'
                        }`}>
                          {isIncome ? '+' : '-'}{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                        </span>

                        {/* Dropdown Menu Trigger */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setActionMenuId(isMenuOpen ? null : tx.id)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
                          >
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>

                          {/* Float Dropdown Options */}
                          <AnimatePresence>
                            {isMenuOpen && (
                              <>
                                {/* Overlay to close */}
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActionMenuId(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  className="absolute right-0 top-9 w-28 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-20"
                                >
                                  <button
                                    onClick={() => {
                                      onEdit(tx);
                                      setActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                    <span>แก้ไข</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(tx.id)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>ลบออก</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
