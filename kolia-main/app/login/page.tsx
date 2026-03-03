"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = data.role === "ADMIN" ? "/dashboard" : "/student/dashboard";
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden select-none" dir="rtl">
      
      {/* Background Elements (Same as Dashboard) */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">مرحباً بعودتك 👋</h1>
          <p className="text-zinc-400 text-sm font-bold">سجل دخولك للمتابعة إلى EasyAttend</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 mr-2">البريد الإلكتروني</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                required
                className="w-full pr-12 pl-4 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-sm placeholder:text-zinc-600"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 mr-2">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pr-12 pl-12 py-4 bg-black/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-sm placeholder:text-zinc-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-4 text-zinc-500 hover:text-blue-500 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "تسجيل الدخول"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs font-bold text-zinc-500">
          ليس لديك حساب؟
          <Link href="/register" className="text-blue-500 hover:text-blue-400 hover:underline mr-1 transition-colors">إنشاء حساب جديد</Link>
        </div>
      </div>
    </div>
  );
}