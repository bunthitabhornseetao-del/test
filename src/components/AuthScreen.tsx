import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ShieldCheck, 
  Smartphone,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface AuthScreenProps {
  onLoginGoogle: () => void;
  onLoginDemo: () => void;
  isFirebaseConfigured: boolean;
  loading: boolean;
}

export default function AuthScreen({ 
  onLoginGoogle, 
  onLoginDemo, 
  isFirebaseConfigured,
  loading 
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      {/* Top spacing */}
      <div></div>

      {/* Main Content Card */}
      <div className="w-full max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl shadow-slate-100"
          id="auth_card"
        >
          {/* App Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 mb-4">
              <Coins className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
              FinTrack <span className="text-emerald-500">Gay-67</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              แอปพลิเคชันจัดการรายรับรายจ่ายและการวิเคราะห์ข้อมูล
            </p>
          </div>

          {/* Quick Features Bento Grid style bullet points */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">บันทึกรายรับ-รายจ่ายแม่นยำ</h4>
                <p className="text-xs text-slate-500">บันทึกสะดวกรวดเร็ว แยกประเภทหมวดหมู่ได้ชัดเจน</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">วิเคราะห์ข้อมูลและสรุปรายเดือน</h4>
                <p className="text-xs text-slate-500">แสดงผลผ่านชาร์ตที่สวยงาม เข้าใจง่าย สรุปสถิติเปรียบเทียบ</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">ดีไซน์ที่รองรับบนมือถือ</h4>
                <p className="text-xs text-slate-500">แสดงผลยอดเยี่ยม ใช้งานง่ายรวดเร็วบนโทรศัพท์มือถือ</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Google Login button */}
            <button
              onClick={onLoginGoogle}
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-medium border flex items-center justify-center gap-3 transition-all duration-200 text-sm ${
                loading 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm active:scale-98'
              }`}
              id="google_signin_btn"
            >
              {/* Google colorful G logo as vector path */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>

            {/* Guest / Demo Mode button */}
            <button
              onClick={onLoginDemo}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-all duration-200 text-sm shadow-md shadow-emerald-100 active:scale-98"
              id="guest_signin_btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>ใช้งานบัญชีทดลอง (ไม่ต้องล็อกอิน)</span>
            </button>
          </div>

          {/* Connection note */}
          {!isFirebaseConfigured && (
            <div className="mt-6 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                ⚠️ ยังไม่ได้ตั้งค่า Firebase .env ระบบจะสลับไปเป็นโหมดออฟไลน์ใช้งานบนบราวเซอร์คุณโดยอัตโนมัติ
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 mt-6">
        <p>© 2026 Personal Finance Tracker (Gay-67). All rights reserved.</p>
      </div>
    </div>
  );
}
