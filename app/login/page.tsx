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

    // Basic client-side validation
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
        // Generic error message for security
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">تسجيل الدخول</h1>
          <p className="text-slate-500">نظام الحضور الذكي EasyAttend</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-3.5 text-slate-400" size={20} />
              <input
                type="email"
                required
                className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-3.5 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pr-12 pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3.5 text-slate-400 hover:text-blue-600 transition focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" /> : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          ليس لديك حساب؟
          <Link href="/register" className="text-blue-600 font-bold hover:underline mr-1">إنشاء حساب جديد</Link>
        </div>
      </div>
    </div>
  );
}