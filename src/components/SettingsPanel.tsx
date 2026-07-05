import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Database, 
  LogOut, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';

interface SettingsPanelProps {
  user: UserProfile | null;
  isFirebaseConfigured: boolean;
  isDemoMode: boolean;
  transactions: Transaction[];
  onLogout: () => void;
  onImportBackup: (importedList: Transaction[]) => void;
}

export default function SettingsPanel({
  user,
  isFirebaseConfigured,
  isDemoMode,
  transactions,
  onLogout,
  onImportBackup
}: SettingsPanelProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Export JSON backup helper
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fintrack_backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
  };

  // Import JSON backup helper
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Rudimentary validation
          const isValid = parsed.every(item => 
            item.id && 
            item.type && 
            (item.type === 'income' || item.type === 'expense') && 
            typeof item.amount === 'number' && 
            item.category && 
            item.date
          );

          if (isValid) {
            onImportBackup(parsed);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            setImportError('รูปแบบข้อมูลสำรอง JSON ไม่ถูกต้อง');
          }
        } else {
          setImportError('ไฟล์ไม่ใช่รูปแบบลิสต์รายการข้อมูลที่ถูกต้อง');
        }
      } catch (err) {
        setImportError('การอ่านไฟล์ล้มเหลว ตรวจสอบรูปแบบไฟล์ JSON ของคุณ');
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="settings_panel_section">
      {/* User Card */}
      <div className="flex items-center gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
        {user?.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ring-emerald-500/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-sm">
            <User className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-800 text-sm truncate">
              {user?.displayName || 'ผู้ใช้งาน'}
            </h3>
            {isDemoMode && (
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> DEMO
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px] md:max-w-xs">
            {user?.email || 'บัญชีทดลองออฟไลน์'}
          </p>
        </div>
      </div>

      {/* Cloud Integration Status Indicators */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          ข้อมูลการเชื่อมต่อและคลาวด์
        </h4>

        {isFirebaseConfigured && !isDemoMode ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">เชื่อมต่อ Firebase สำเร็จ (Project: Gay-67)</p>
              <p className="text-emerald-600 mt-0.5 leading-relaxed">
                ข้อมูลรายรับรายจ่ายของคุณกำลังได้รับการซิงค์และบันทึกอยู่บนฐานข้อมูล Cloud Firestore แบบเรียลไทม์อย่างปลอดภัย
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">กำลังทำงานในโหมดออฟไลน์ (Local State)</p>
              <p className="text-amber-600/90 mt-0.5 leading-relaxed">
                ข้อมูลบันทึกทั้งหมดของคุณจะถูกเก็บไว้ที่บราวเซอร์ (LocalStorage) เพื่อเชื่อมต่อข้อมูลกับคลาวด์ Project <strong>Gay-67</strong> กรุณาตั้งค่าตัวแปรสภาวะในไฟล์ <code>.env</code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Backup Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          จัดการไฟล์ข้อมูลสำรอง (Backup & Restore)
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Export button */}
          <button
            onClick={handleExportBackup}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold gap-2 text-center transition-all active:scale-98"
            id="export_backup_btn"
          >
            <Download className="w-5 h-5 text-indigo-500" />
            <span className="text-[11px] leading-tight text-slate-700">ส่งออกสำรอง JSON</span>
          </button>

          {/* Import label button */}
          <label
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold gap-2 text-center transition-all cursor-pointer active:scale-98"
            id="import_backup_label"
          >
            <Upload className="w-5 h-5 text-emerald-500" />
            <span className="text-[11px] leading-tight text-slate-700">นำเข้าสำรอง JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {importError && (
          <p className="text-rose-500 text-xs font-medium text-center">{importError}</p>
        )}
        {importSuccess && (
          <p className="text-emerald-500 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> นำเข้าข้อมูลสำรองเรียบร้อยแล้ว!
          </p>
        )}
      </div>

      {/* App details info */}
      <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1.5 text-slate-500">
        <div className="flex justify-between">
          <span className="font-semibold">เวอร์ชันแอป:</span>
          <span>1.0.0</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">เป้าหมายระบบ:</span>
          <span>Gay-67 Firebase Integration</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">จำนวนรายการทั้งหมด:</span>
          <span className="font-mono font-bold text-slate-700">{transactions.length} รายการ</span>
        </div>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl font-semibold border border-rose-100 hover:border-rose-200 bg-rose-50 hover:bg-rose-100/80 text-rose-600 flex items-center justify-center gap-2 transition-all text-xs active:scale-98"
          id="logout_btn"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบบัญชีปัจจุบัน</span>
        </button>
      </div>
    </div>
  );
}
