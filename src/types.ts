export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  userId: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface PredefinedCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind class color
}

export const INCOME_CATEGORIES: PredefinedCategory[] = [
  { id: 'salary', name: 'เงินเดือน', icon: 'Briefcase', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'business', name: 'ธุรกิจส่วนตัว', icon: 'TrendingUp', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'investment', name: 'การลงทุน', icon: 'LineChart', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { id: 'extra', name: 'รายได้เสริม/งานเสริม', icon: 'PlusCircle', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'bonus', name: 'โบนัส/ของขวัญ', icon: 'Gift', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'others', name: 'อื่นๆ', icon: 'MoreHorizontal', color: 'bg-slate-50 text-slate-600 border-slate-100' },
];

export const EXPENSE_CATEGORIES: PredefinedCategory[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: 'Utensils', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'shopping', name: 'ช้อปปิ้ง', icon: 'ShoppingBag', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { id: 'transport', name: 'เดินทาง/น้ำมัน', icon: 'Car', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'housing', name: 'ที่อยู่อาศัย/ค่าเช่า', icon: 'Home', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'utilities', name: 'ค่าน้ำ/ค่าไฟ/เน็ต', icon: 'Zap', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { id: 'healthcare', name: 'สุขภาพ/โรงพยาบาล', icon: 'HeartPulse', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { id: 'entertainment', name: 'ท่องเที่ยว/บันเทิง', icon: 'Sparkles', color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { id: 'savings', name: 'เงินออม/การลงทุน', icon: 'PiggyBank', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'others', name: 'อื่นๆ', icon: 'MoreHorizontal', color: 'bg-slate-50 text-slate-600 border-slate-100' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
