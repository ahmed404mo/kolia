"use client";
import Link from "next/link";
import { User, Hash, ScanQrCode, Mail, Lock, Layers, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"; // 1. استيراد الأيقونات
import { useState } from "react";
import { useRouter } from "next/navigation"; // تأكد من استيراد useRouter لو مش موجود

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "", division: "", classNumber: "" });
  
  // 2. حالة التحكم في ظهور كلمة المرور
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            window.location.href = "/";
        } else {
            setError(data.message || "حدث خطأ أثناء التسجيل");
        }

    } catch (error) {
        setError("فشل الاتصال بالخادم، تأكد من الإنترنت");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10" dir="rtl">
      
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300 relative">
        
        <Link href="/login" className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-50 p-3 rounded-2xl mb-4 shadow-sm">
            <ScanQrCode className="text-blue-600 w-8 h-8"/>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">حساب طالب جديد</h2>
          <p className="text-slate-500 text-sm mt-1">سجل بياناتك بدقة لتتمكن من الحضور</p>
        </div>
        
        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={18}/> {error}
            </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* الاسم */}
          <div>
            <div className="relative">
                <User className="absolute right-4 top-3.5 text-slate-400" size={20}/>
                <input 
                    type="text" required 
                    placeholder="الاسم ثلاثي" 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                />
            </div>
          </div>
          
          {/* البريد */}
          <div>
            <div className="relative">
                <Mail className="absolute right-4 top-3.5 text-slate-400" size={20}/>
                <input 
                    type="email" required 
                    placeholder="البريد الإلكتروني" 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                />
            </div>
          </div>
          
          {/* الشعبة ورقم الكشف */}
          <div className="flex gap-3">
            <div className="relative w-1/2">
                <Layers className="absolute right-3 top-3.5 text-slate-400" size={18}/>
                <select required onChange={e => setFormData({...formData, division: e.target.value})} className="w-full pr-10 pl-2 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="">الشعبة</option>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>

            <div className="relative w-1/2">
                <Hash className="absolute right-3 top-3.5 text-slate-400" size={18}/>
                <input 
                    type="number" required 
                    placeholder="رقم الكشف" 
                    onChange={e => setFormData({...formData, classNumber: e.target.value})} 
                    className="w-full pr-10 pl-2 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                />
            </div>
          </div>

          {/* كلمة المرور (مع زر الإظهار) */}
          <div>
            <div className="relative">
                {/* 1. القفل على اليمين */}
                <Lock className="absolute right-4 top-3.5 text-slate-400" size={20}/>
                
                <input 
                    // 2. نوع الحقل متغير
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="كلمة المرور" 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    // 3. زيادة الـ Padding من اليسار عشان زرار العين
                    className="w-full pr-12 pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                />

                {/* 4. زر التبديل على اليسار */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-3.5 text-slate-400 hover:text-blue-600 transition focus:outline-none"
                >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
            لديك حساب بالفعل؟ <Link href="/login" className="text-blue-600 font-bold hover:underline">سجل دخول</Link>
        </p>

      </div>
    </div>
  );
}