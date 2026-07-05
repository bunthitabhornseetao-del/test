import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import CategoryIcon from './CategoryIcon';

interface DataAnalysisProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

export default function DataAnalysis({ transactions, selectedMonth }: DataAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'expense-cats' | 'income-cats' | 'daily-trends'>('expense-cats');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);

  // Filter transactions of the selected month
  const monthlyTxs = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 1. Calculate category summary (for income or expense depending on the toggle)
  const categorySummary = useMemo(() => {
    const expenseMap = new Map<string, number>();
    const incomeMap = new Map<string, number>();
    let totalExpense = 0;
    let totalIncome = 0;

    monthlyTxs.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'expense') {
        expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + amount);
        totalExpense += amount;
      } else {
        incomeMap.set(t.category, (incomeMap.get(t.category) || 0) + amount);
        totalIncome += amount;
      }
    });

    const formatDataList = (map: Map<string, number>, total: number, categoriesList: any[]) => {
      const list = Array.from(map.entries()).map(([name, amount]) => {
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        const config = categoriesList.find(c => c.name === name) || {
          color: 'bg-slate-50 text-slate-600 border-slate-100',
          icon: 'MoreHorizontal'
        };
        return {
          name,
          amount,
          percentage,
          icon: config.icon,
          colorClass: config.color,
          rawColor: config.color.includes('rose') ? '#f43f5e' : config.color.includes('emerald') ? '#10b981' : '#3b82f6'
        };
      });

      // Sort by amount descending
      return list.sort((a, b) => b.amount - a.amount);
    };

    return {
      expenses: formatDataList(expenseMap, totalExpense, EXPENSE_CATEGORIES),
      incomes: formatDataList(incomeMap, totalIncome, INCOME_CATEGORIES),
      totalExpense,
      totalIncome
    };
  }, [monthlyTxs]);

  // 2. Generate daily spending data for line/bar chart
  // Group transactions by date day
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).getDate();

    const expenseDailyArray = Array(daysInMonth).fill(0);
    const incomeDailyArray = Array(daysInMonth).fill(0);

    monthlyTxs.forEach(t => {
      const day = parseInt(t.date.split('-')[2]);
      if (day >= 1 && day <= daysInMonth) {
        if (t.type === 'expense') {
          expenseDailyArray[day - 1] += Number(t.amount);
        } else {
          incomeDailyArray[day - 1] += Number(t.amount);
        }
      }
    });

    // Create list of { day, expense, income }
    const list = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expense: expenseDailyArray[i],
      income: incomeDailyArray[i]
    }));

    // Find max spending day for scaling SVG coordinates
    const maxExpense = Math.max(...expenseDailyArray, 100);
    const maxIncome = Math.max(...incomeDailyArray, 100);
    const globalMax = Math.max(maxExpense, maxIncome);

    return {
      list,
      maxExpense,
      maxIncome,
      globalMax,
      daysInMonth
    };
  }, [monthlyTxs, selectedMonth]);

  // UI calculations
  const activeCategories = activeTab === 'expense-cats' ? categorySummary.expenses : categorySummary.incomes;
  const activeTotal = activeTab === 'expense-cats' ? categorySummary.totalExpense : categorySummary.totalIncome;
  const isExpenseActive = activeTab === 'expense-cats';

  // Format Thai month
  const getThaiMonthShort = (monthStr: string) => {
    const [, m] = monthStr.split('-');
    const names = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return names[parseInt(m) - 1];
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="analysis_section">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <span>การวิเคราะห์สัดส่วนและการใช้จ่าย</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            สถิติเชิงลึกประจำรอบบิล {getThaiMonthShort(selectedMonth)}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('expense-cats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'expense-cats' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setActiveTab('income-cats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'income-cats' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายรับ
          </button>
          <button
            onClick={() => setActiveTab('daily-trends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'daily-trends' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            แนวโน้มรายวัน
          </button>
        </div>
      </div>

      {/* Main Analysis Panels */}
      {activeTab === 'daily-trends' ? (
        /* ---------------- DAILY TREND CHART (SVG) ---------------- */
        <div className="space-y-4">
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                กราฟแสดงการสั่นไหวของกระแสเงินรายวัน (฿)
              </span>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> รายรับ
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" /> รายจ่าย
                </span>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative pt-6 h-56 w-full">
              {/* Tooltip display */}
              {hoveredDay && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg px-3 py-1 text-[11px] font-bold shadow-lg flex items-center gap-1.5 z-10 transition-all">
                  <span>วันที่ {hoveredDay.day}:</span>
                  <span className="font-mono text-emerald-400">{hoveredDay.amount.toLocaleString()} ฿</span>
                </div>
              )}

              {/* Draw responsive SVG lines & columns */}
              <svg 
                viewBox={`0 0 400 160`} 
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Horizontal grid guide lines */}
                <line x1="0" y1="140" x2="400" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                {/* SVG Paths for Trends */}
                {dailyData.list.length > 0 && (() => {
                  const widthStep = 400 / (dailyData.daysInMonth - 1 || 1);
                  const scaleY = (val: number) => 140 - (val / (dailyData.globalMax || 1)) * 110;

                  // Build path coordinates
                  const expensePoints = dailyData.list.map((d, idx) => `${idx * widthStep},${scaleY(d.expense)}`).join(' ');
                  const incomePoints = dailyData.list.map((d, idx) => `${idx * widthStep},${scaleY(d.income)}`).join(' ');

                  const expenseArea = `0,140 ${expensePoints} 400,140`;
                  const incomeArea = `0,140 ${incomePoints} 400,140`;

                  return (
                    <>
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Glow Fills */}
                      <polygon points={incomeArea} fill="url(#incomeGlow)" />
                      <polygon points={expenseArea} fill="url(#expenseGlow)" />

                      {/* Line Paths */}
                      <polyline points={incomePoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points={expensePoints} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Interactive hover points / columns */}
                      {dailyData.list.map((d, idx) => {
                        const x = idx * widthStep;
                        return (
                          <g key={d.day} className="cursor-pointer group">
                            {/* Hover detection column */}
                            <rect
                              x={x - 4}
                              y="0"
                              width="8"
                              height="140"
                              fill="transparent"
                              onMouseEnter={() => setHoveredDay({ day: d.day, amount: d.expense + d.income })}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                            {/* Accent indicator dots */}
                            {d.expense > 0 && (
                              <circle
                                cx={x}
                                cy={scaleY(d.expense)}
                                r="3"
                                fill="#f43f5e"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                            {d.income > 0 && (
                              <circle
                                cx={x}
                                cy={scaleY(d.income)}
                                r="3"
                                fill="#10b981"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between px-2 text-[10px] font-bold font-mono text-slate-400 mt-2">
              <span>วันที่ 1</span>
              <span>วันที่ 15</span>
              <span>วันที่ {dailyData.daysInMonth}</span>
            </div>
          </div>

          {/* Quick analytic takeaway */}
          {dailyData.maxExpense > 100 && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 text-indigo-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>
                💡 แนะนำ: วันที่มีการใช้เงินสูงที่สุดในเดือนนี้ คือจำนวน{' '}
                <span className="font-bold font-mono">{dailyData.maxExpense.toLocaleString()} ฿</span>
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ---------------- CATEGORIES LIST (BENTO / BARS) ---------------- */
        <div className="space-y-4">
          {activeCategories.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">ยังไม่มีประวัติบันทึกในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">กรุณากดเพิ่มรายการเพื่อเริ่มต้นทำวิเคราะห์ข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Category progress row bar list */}
              {activeCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 ${cat.colorClass}`}>
                        <CategoryIcon name={cat.icon} size={15} />
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {cat.amount.toLocaleString()} ฿
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1.5 font-mono">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal progress meter */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        isExpenseActive ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              ))}

              {/* Category distribution analytics commentary */}
              <div className="mt-5 pt-4 border-t border-slate-100/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  บทวิเคราะห์หมวดหมู่ {isExpenseActive ? 'รายจ่าย' : 'รายรับ'} หลัก
                </h4>
                <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
                  isExpenseActive ? 'bg-rose-50/50 border border-rose-100 text-rose-800' : 'bg-emerald-50/50 border border-emerald-100/60 text-emerald-800'
                }`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isExpenseActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isExpenseActive ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    {isExpenseActive ? (
                      <p>
                        หมวดหมู่ที่คุณจ่ายเงินไปมากที่สุดคือ{' '}
                        <span className="font-bold">"{activeCategories[0]?.name}"</span> คิดเป็นสัดส่วน{' '}
                        <span className="font-bold font-mono">{activeCategories[0]?.percentage}%</span> ของรายจ่ายทั้งหมด{' '}
                        {activeCategories[0]?.percentage > 40 ? 'ซึ่งถือว่าเป็นสัดส่วนที่ค่อนข้างสูง ควรควบคุมการใช้จ่ายในกลุ่มนี้' : 'ซึ่งสัดส่วนอยู่ในเกณฑ์สมดุลดี'}
                      </p>
                    ) : (
                      <p>
                        แหล่งรายรับหลักของคุณในเดือนนี้มาจาก{' '}
                        <span className="font-bold">"{activeCategories[0]?.name}"</span> เป็นจำนวนเงิน{' '}
                        <span className="font-bold font-mono">{activeCategories[0]?.amount.toLocaleString()} ฿</span> ({activeCategories[0]?.percentage}%) ของกระแสรายได้ทั้งหมด
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
