"use client";
import Link from "next/link";
import { User, Hash, ScanQrCode, Mail, Lock, Layers, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", division: "", classNumber: "" });
  const [showPassword, setShowPassword] = useState(false);

  // --- شروط التحقق من كلمة المرور ---
  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;

  // --- شروط التحقق الجديدة ---
  // 1. الاسم: عربي فقط + 3 كلمات على الأقل
  const isNameValid = (name: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]+$/; // حروف عربية ومسافات فقط
    const wordCount = name.trim().split(/\s+/).length;
    return arabicRegex.test(name) && wordCount >= 3;
  };

  // 2. رقم الكشف: من 1 إلى 25 فقط
  const isClassNumberValid = (num: string) => {
    const n = parseInt(num);
    return !isNaN(n) && n >= 1 && n <= 25;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // التحقق من الاسم
    if (!isNameValid(formData.name)) {
        setError("يجب كتابة الاسم ثلاثياً وباللغة العربية فقط.");
        setLoading(false);
        return;
    }

    // التحقق من رقم الكشف
    if (!isClassNumberValid(formData.classNumber)) {
        setError("رقم الكشف يجب أن يكون بين 1 و 25 فقط.");
        setLoading(false);
        return;
    }

    // التحقق من كلمة المرور
    if (!isPasswordValid) {
      setError("كلمة المرور ضعيفة. يرجى اتباع التعليمات.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden select-none" dir="rtl">
      
      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Back Button */}
        <Link href="/login" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors" aria-label="Back to login">
          <ArrowLeft size={24} />
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-500/10 p-4 rounded-full mb-4 shadow-sm ring-1 ring-blue-500/20">
            <ScanQrCode className="text-blue-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">حساب طالب جديد</h2>
          <p className="text-zinc-400 text-xs font-bold mt-1">سجل بياناتك بدقة لتتمكن من الحضور</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Name Field */}
          <div className="space-y-1">
            <div className="relative group">
              <User className="absolute right-4 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                placeholder="الاسم ثلاثي (بالعربية)"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pr-12 pl-4 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-sm placeholder:text-zinc-600"
              />
            </div>
            {formData.name && !isNameValid(formData.name) && (
                <p className="text-[10px] text-red-400 mr-2 font-bold">يجب أن يكون الاسم ثلاثياً وباللغة العربية</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <div className="relative group">
              <Mail className="absolute right-4 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="البريد الإلكتروني"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pr-12 pl-4 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-sm placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Division and Class Number */}
          <div className="flex gap-3">
            <div className="relative w-1/2 group">
              <Layers className="absolute right-3 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <select 
                required 
                onChange={(e) => setFormData({ ...formData, division: e.target.value })} 
                className="w-full pr-10 pl-2 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer font-bold text-sm text-zinc-400 focus:text-white transition-all"
              >
                <option value="" className="bg-zinc-900 text-zinc-500">الشعبة</option>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n} className="bg-zinc-900 text-white">{n}</option>)}
              </select>
            </div>

            <div className="relative w-1/2 group">
              <Hash className="absolute right-3 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="number"
                required
                min="1"
                max="25"
                placeholder="رقم الكشف"
                onChange={(e) => setFormData({ ...formData, classNumber: e.target.value })}
                className="w-full pr-10 pl-2 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-sm placeholder:text-zinc-600"
              />
            </div>
          </div>
          {formData.classNumber && !isClassNumberValid(formData.classNumber) && (
             <p className="text-[10px] text-red-400 mr-2 font-bold mt-0">رقم الكشف يجب أن يكون بين 1 و 25</p>
          )}

          {/* Password Field */}
          <div>
            <div className="relative group">
              <Lock className="absolute right-4 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                placeholder="كلمة المرور"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pr-12 pl-12 py-4 bg-black/50 border rounded-2xl text-white outline-none focus:ring-1 transition-all font-bold text-sm placeholder:text-zinc-600 ${!isPasswordValid && formData.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-zinc-800 focus:border-blue-500 focus:ring-blue-500/50'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-4 text-zinc-500 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 text-[10px] font-bold space-y-1 px-2">
                <p className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : "text-zinc-600"}`}>
                  {hasMinLength ? <Check size={10} strokeWidth={4} /> : <XIcon size={10} strokeWidth={4} />} 8 أحرف على الأقل
                </p>
                <p className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400" : "text-zinc-600"}`}>
                  {hasNumber ? <Check size={10} strokeWidth={4} /> : <XIcon size={10} strokeWidth={4} />} رقم واحد على الأقل
                </p>
                <p className={`flex items-center gap-1 ${hasSpecialChar ? "text-emerald-400" : "text-zinc-600"}`}>
                  {hasSpecialChar ? <Check size={10} strokeWidth={4} /> : <XIcon size={10} strokeWidth={4} />} رمز خاص واحد على الأقل (!@#$...)
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !isPasswordValid || !isNameValid(formData.name) || !isClassNumberValid(formData.classNumber)} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "إنشاء حساب"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-zinc-500">
          لديك حساب بالفعل؟ <Link href="/login" className="text-blue-500 hover:text-blue-400 hover:underline mr-1 transition-colors">سجل دخول</Link>
        </div>
      </div>
    </div>
  );
}