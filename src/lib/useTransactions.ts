import { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  FirebaseUser
} from './firebase';
import { Transaction, UserProfile } from '../types';

export function useTransactions() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Check initial login state
  useEffect(() => {
    // If we have a saved demo user state, load it
    const savedDemo = localStorage.getItem('finance_tracker_demo_mode');
    if (savedDemo === 'true') {
      setIsDemoMode(true);
      setUser({
        uid: 'demo-user',
        displayName: 'ผู้ใช้งานทดลอง (Guest)',
        email: 'demo@example.com',
        photoURL: null,
        isAnonymous: true
      });
      setLoading(false);
      
      // Load demo transactions
      const demoData = localStorage.getItem('finance_tracker_demo_transactions');
      if (demoData) {
        try {
          setTransactions(JSON.parse(demoData));
        } catch (e) {
          console.error("Error parsing demo transactions", e);
        }
      }
    } else {
      if (!isFirebaseConfigured) {
        // If Firebase is not configured and no demo mode is set, we start as loading=false, user=null
        setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isAnonymous: false
          });
          setIsDemoMode(false);
        } else {
          setUser(null);
          setTransactions([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Sync / Listen to transactions
  useEffect(() => {
    if (loading) return;

    if (isDemoMode) {
      // For demo mode, save to localStorage whenever transactions change
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(transactions));
    } else {
      // For Firebase mode, listen in real-time
      if (!user || !db) return;

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            type: data.type,
            amount: Number(data.amount),
            category: data.category,
            date: data.date,
            note: data.note || '',
            userId: data.userId,
            createdAt: data.createdAt || Date.now()
          });
        });
        setTransactions(list);
      }, (error) => {
        console.error("Error listening to transactions:", error);
        setFirebaseError(error.message);
      });

      return () => unsubscribe();
    }
  }, [user, isDemoMode, loading]);

  // Methods
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase is not fully configured yet. Please use the Demo Mode or set up your Firebase environment variables.");
      return;
    }
    
    setLoading(true);
    try {
      setFirebaseError(null);
      await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('finance_tracker_demo_mode');
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setFirebaseError(error.message);
      setLoading(false);
    }
  };

  const loginAsDemo = () => {
    setLoading(true);
    setIsDemoMode(true);
    localStorage.setItem('finance_tracker_demo_mode', 'true');
    setUser({
      uid: 'demo-user',
      displayName: 'ผู้ใช้งานทดลอง (Guest)',
      email: 'demo@example.com',
      photoURL: null,
      isAnonymous: true
    });
    
    // Load initial seed data if localStorage is empty
    const demoData = localStorage.getItem('finance_tracker_demo_transactions');
    if (!demoData) {
      const today = new Date();
      const formatOffsetDate = (offsetDays: number) => {
        const d = new Date();
        d.setDate(today.getDate() - offsetDays);
        return d.toISOString().split('T')[0];
      };

      const seed: Transaction[] = [
        {
          id: 'seed-1',
          type: 'income',
          amount: 35000,
          category: 'เงินเดือน',
          date: formatOffsetDate(4),
          note: 'เงินเดือนประจำเดือนนี้',
          userId: 'demo-user',
          createdAt: Date.now() - 400000000
        },
        {
          id: 'seed-2',
          type: 'expense',
          amount: 120,
          category: 'อาหารและเครื่องดื่ม',
          date: formatOffsetDate(0),
          note: 'ข้าวกะเพราไข่ดาว + น้ำเปล่า',
          userId: 'demo-user',
          createdAt: Date.now()
        },
        {
          id: 'seed-3',
          type: 'expense',
          amount: 1500,
          category: 'ช้อปปิ้ง',
          date: formatOffsetDate(1),
          note: 'เสื้อผ้าแบรนด์ลดราคา',
          userId: 'demo-user',
          createdAt: Date.now() - 86400000
        },
        {
          id: 'seed-4',
          type: 'expense',
          amount: 450,
          category: 'เดินทาง/น้ำมัน',
          date: formatOffsetDate(2),
          note: 'เติมน้ำมันรถยนต์',
          userId: 'demo-user',
          createdAt: Date.now() - 172800000
        },
        {
          id: 'seed-5',
          type: 'income',
          amount: 3000,
          category: 'ธุรกิจส่วนตัว',
          date: formatOffsetDate(3),
          note: 'ขายของออนไลน์รอบค่ำ',
          userId: 'demo-user',
          createdAt: Date.now() - 259200000
        },
        {
          id: 'seed-6',
          type: 'expense',
          amount: 650,
          category: 'ค่าน้ำ/ค่าไฟ/เน็ต',
          date: formatOffsetDate(4),
          note: 'ค่าอินเทอร์เน็ตรายเดือน',
          userId: 'demo-user',
          createdAt: Date.now() - 345600000
        },
        {
          id: 'seed-7',
          type: 'expense',
          amount: 3200,
          category: 'ที่อยู่อาศัย/ค่าเช่า',
          date: formatOffsetDate(4),
          note: 'ค่าส่วนกลางคอนโด',
          userId: 'demo-user',
          createdAt: Date.now() - 350000000
        }
      ];
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(seed));
      setTransactions(seed);
    } else {
      try {
        setTransactions(JSON.parse(demoData));
      } catch (e) {
        console.error("Error parsing stored demo transactions:", e);
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (isDemoMode) {
      localStorage.removeItem('finance_tracker_demo_mode');
      setIsDemoMode(false);
      setUser(null);
      setTransactions([]);
      setLoading(false);
    } else {
      try {
        await firebaseSignOut(auth);
        setUser(null);
        setTransactions([]);
      } catch (error) {
        console.error("Error signing out:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTx: Omit<Transaction, 'id'> = {
      ...data,
      userId: user.uid,
      createdAt: Date.now()
    };

    if (isDemoMode) {
      const createdTx: Transaction = {
        ...newTx,
        id: 'demo-' + Math.random().toString(36).substr(2, 9)
      };
      const updated = [createdTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(updated));
    } else {
      if (!db) return;
      try {
        await addDoc(collection(db, 'transactions'), newTx);
      } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
      }
    }
  };

  const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    if (isDemoMode) {
      const updated = transactions.map(t => t.id === id ? { ...t, ...data } : t);
      setTransactions(updated);
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(updated));
    } else {
      if (!db) return;
      try {
        const docRef = doc(db, 'transactions', id);
        await updateDoc(docRef, data);
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    if (isDemoMode) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('finance_tracker_demo_transactions', JSON.stringify(updated));
    } else {
      if (!db) return;
      try {
        const docRef = doc(db, 'transactions', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      }
    }
  };

  return {
    user,
    loading,
    transactions,
    isDemoMode,
    isFirebaseConfigured,
    firebaseError,
    loginWithGoogle,
    loginAsDemo,
    logout,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}
