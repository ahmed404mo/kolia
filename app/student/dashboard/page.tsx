"use client";
import { useState, useEffect } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  User, LogOut, Save, Camera, Zap, ShieldCheck, Activity, 
  Edit3, X, CreditCard, Lock, ChevronRight, RefreshCw, Smile 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("scan"); 
  const [user, setUser] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  
  // حالة لاختيار الأفاتار
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);

  // 🔥 دالة توليد أسماء عشوائية للأفاتار (للـ refresh فقط)
  const generateRandomAvatars = () => {
    const seeds = Array.from({ length: 6 }, () => Math.random().toString(36).substring(7));
    setAvatarSeeds(seeds);
  };

  // 🔥 دالة حفظ الأفاتار المختار
  const handleSelectAvatar = async (seed: string) => {
    if (!user?.id) return;
    setLoading(true);
    const avatarUrl = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    
    try {
        const updatedUser = { ...user, image: avatarUrl };
        
        const res = await fetch("/api/students", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (res.ok) {
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setMsg("تم تحديث الشخصية بنجاح ✅");
            setShowAvatarSelector(false);
        } else {
            setMsg("حدث خطأ أثناء الحفظ ❌");
        }
    } catch (error) {
        setMsg("تعذر الاتصال بالسيرفر");
    } finally {
        setLoading(false);
        setTimeout(() => setMsg(""), 3000);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
        router.push("/login");
        return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);

    // 🔥 توليد الأفاتارز الأولية مباشرة داخل useEffect
    const initialSeeds = Array.from({ length: 6 }, () => Math.random().toString(36).substring(7));
    setAvatarSeeds(initialSeeds);
  }, [router]);

  const handleLogout = async () => {
    setLoading(true); 
    try {
        await fetch("/api/logout", { method: "POST", cache: "no-store" });
    } catch (e) { console.error(e); } 
    finally {
        localStorage.removeItem("user");
        router.push("/login?out=true"); 
    }
  };

  const handleScan = async (result: string) => {
    if (!result || loading || scanResult || !user?.id) return;
    
    setScanResult(result);
    setLoading(true);

    try {
        const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, qrCode: result })
        });

        const data = await res.json();

        if (res.ok) {
            setMsg("✅ تم تسجيل الحضور بنجاح!");
            new Audio('/success.mp3').play().catch(() => {}); 
        } else {
            if (data.message === "Already Registered") {
                setMsg("✅ تم تسجيل الحضور مسبقاً");
                new Audio('/success.mp3').play().catch(() => {}); 
            } else {
                setMsg("❌ فشل التسجيل: " + (data.message || "خطأ غير معروف"));
            }
        }
    } catch (e) {
        console.error(e);
        setMsg("❌ خطأ في الاتصال بالسيرفر");
    } finally {
        setLoading(false);
        setTimeout(() => { setScanResult(null); setMsg(""); }, 3000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.id) return;
      setLoading(true);
      try {
          const res = await fetch("/api/students", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(user)
          });
          if (res.ok) {
            setMsg("تم التحديث بنجاح ✅");
            setIsEditing(false);
            localStorage.setItem("user", JSON.stringify(user)); 
          } else {
    let errorMsg = data.message || "خطأ غير معروف";
    // تحسين الرسائل الشائعة
    if (errorMsg.includes("غير صالح")) errorMsg = "❌ " + errorMsg;
    if (errorMsg.includes("منتهي")) errorMsg = "❌ " + errorMsg;
    if (errorMsg.includes("ناقصة")) errorMsg = "❌ بيانات ناقصة";
    setMsg("❌ فشل التسجيل: " + errorMsg);
}
      } catch(e) { 
        setMsg("حدث خطأ غير متوقع"); 
      } finally {
        setLoading(false);
        setTimeout(() => setMsg(""), 3000);
      }
  };

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-sm animate-pulse">جاري التحميل...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden selection:bg-indigo-500/30" dir="rtl">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {msg && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-5 fade-in duration-300 border backdrop-blur-xl ${msg.includes('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
              <div className={`p-2 rounded-full ${msg.includes('✅') ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {msg.includes('✅') ? <ShieldCheck size={18}/> : <Activity size={18}/>}
              </div>
              <span className="font-semibold text-sm tracking-wide">{msg}</span>
          </div>
      )}

      <main className="flex-1 px-6 pb-32 pt-8 overflow-y-auto z-10 relative scrollbar-hide">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                    مرحباً، <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-cyan-300">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-xs text-zinc-500 font-medium tracking-wide flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    نظام الحضور الذكي
                </p>
            </div>
            
            <div className="relative group cursor-pointer" onClick={() => setActiveTab("profile")}>
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-lg text-indigo-400 overflow-hidden">
                    {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        user.name[0].toUpperCase()
                    )}
                </div>
            </div>
        </div>

        {/* Tab Content: SCAN */}
        {activeTab === "scan" && (
            <div className="flex flex-col h-[65vh] justify-center items-center animate-in fade-in zoom-in duration-500">
                <div className="relative w-full max-w-[320px] aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800 ring-4 ring-zinc-900/50">
                    {!scanResult ? (
                        <>
<Scanner 
    onScan={(result) => result[0] && handleScan(result[0].rawValue)}
    // الإعدادات دي بتخلي الأيفون يعرض الكاميرا جوه الصفحة مش كفيديو منفصل
    styles={{ 
        container: { width: '100%', height: '100%', borderRadius: '2.5rem' },
        video: { objectFit: 'cover' } 
    }}
    components={{ 
        audio: false, // بلاش صوت عشان Safari ساعات بيعمل بلوك بسببه
        finder: false 
    }}
    options={{
        delayBetweenScans: 3000 // بلاش يمسح بسرعة ورا بعض
    }}
/>
                            
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl opacity-80"></div>
                                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl opacity-80"></div>
                                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl opacity-80"></div>
                                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl opacity-80"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-[scan_2s_ease-in-out_infinite]"></div>
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-[scanLine_2s_ease-in-out_infinite]"></div>
                            </div>

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 px-4 py-2 rounded-full text-[10px] font-medium text-zinc-300 backdrop-blur-md border border-white/5 shadow-lg flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                                جاري البحث عن رمز QR...
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <p className="text-indigo-400 font-medium animate-pulse text-sm">جاري التحقق من البيانات...</p>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-white">{msg}</p>
                            )}
                        </div>
                    )}
                </div>
                
                <p className="mt-8 text-zinc-500 text-xs flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                    <Zap size={12} className="text-amber-500"/>
                    تأكد من إضاءة المكان لمسح أسرع
                </p>
            </div>
        )}

        {/* Tab Content: PROFILE */}
        {activeTab === "profile" && (
            <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500">
                {!isEditing ? (
                    <div className="space-y-5">
                        {/* ID Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-[2rem] border border-zinc-800 shadow-2xl group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/20 transition duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                
                                {/* 🔥🔥🔥 منطقة الأفاتار الجديدة 🔥🔥🔥 */}
                                <div className="relative w-32 h-32 mb-4 group/img">
                                    <div className="w-full h-full p-[4px] rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-500/20">
                                        <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden relative">
                                            {user.image ? (
                                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-bold text-white">{user.name[0]}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* زرار تغيير الشخصية */}
                                    <button 
                                        onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                        className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2.5 rounded-full shadow-lg hover:bg-indigo-50 transition active:scale-95 border-4 border-zinc-950 z-20"
                                        title="تغيير الشخصية"
                                    >
                                        <Smile size={18} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* 🔥🔥🔥 قائمة اختيار الأفاتار 🔥🔥🔥 */}
                                {showAvatarSelector && (
                                    <div className="w-full bg-zinc-900/90 backdrop-blur-md rounded-2xl p-4 mb-6 border border-zinc-700 animate-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-xs font-bold text-zinc-400">اختر شخصيتك</p>
                                            <button onClick={generateRandomAvatars} className="text-indigo-400 text-xs flex items-center gap-1 hover:text-indigo-300">
                                                <RefreshCw size={12}/> شخصيات جديدة
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {avatarSeeds.map((seed) => (
                                                <button 
                                                    key={seed}
                                                    onClick={() => handleSelectAvatar(seed)}
                                                    className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 hover:ring-2 ring-indigo-500 transition active:scale-95 group"
                                                >
                                                    {loading && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50"><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/></div>}
                                                    <img 
                                                        src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                                        alt="Avatar" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                                <p className="text-zinc-500 text-sm mb-8 font-medium bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">{user.email}</p>
                                
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5"><CreditCard size={10}/> الشعبة</p>
                                        <p className="font-bold text-lg text-indigo-200">{user.division || "-"}</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5"><User size={10}/> رقم الكشف</p>
                                        <p className="font-bold text-lg text-indigo-200">{user.classNumber || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-semibold transition-all border border-zinc-800 flex justify-between px-6 items-center group">
                                <span className="flex items-center gap-3"><Edit3 size={18} className="text-indigo-500"/> تعديل البيانات</span>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition"/>
                            </button>
                            <button onClick={handleLogout} className="w-full py-4 bg-zinc-900 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-2xl font-semibold transition-all border border-zinc-800 flex justify-between px-6 items-center group">
                                <span className="flex items-center gap-3"><LogOut size={18}/> تسجيل خروج</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Edit Mode */
                    <div className="bg-zinc-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-zinc-800 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">تعديل الملف الشخصي</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 transition"><X size={16}/></button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-500 mr-1 uppercase tracking-wider">الاسم الكامل</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full p-4 pl-10 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm text-white placeholder:text-zinc-700" 
                                        value={user.name} 
                                        onChange={e => setUser({...user, name: e.target.value})} 
                                        placeholder="الاسم الكامل" 
                                    />
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-500 mr-1 uppercase tracking-wider">كلمة المرور</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full p-4 pl-10 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm text-white placeholder:text-zinc-700" 
                                        type="password"
                                        value={user.password || ""} 
                                        onChange={e => setUser({...user, password: e.target.value})} 
                                        placeholder="اكتب كلمة مرور جديدة (اختياري)"
                                    />
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition"/>
                                </div>
                            </div>
                            
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3.5 bg-zinc-800 text-zinc-300 rounded-xl font-semibold hover:bg-zinc-700 transition">إلغاء</button>
                                <button disabled={loading} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-500 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20">
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={18}/> حفظ</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Modern Bottom Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[280px] bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-full shadow-2xl z-50 p-1.5">
        <div className="flex justify-between items-center relative h-12">
            <div className={`absolute top-0 bottom-0 w-[48%] bg-zinc-800 rounded-full transition-all duration-300 ease-out border border-zinc-700 ${activeTab === "profile" ? "left-[50%]" : "left-[2%]"}`}></div>
            
            <button onClick={() => { setActiveTab("scan"); setIsEditing(false); }} className={`relative flex-1 flex items-center justify-center h-full rounded-full transition-colors duration-300 z-10 gap-2 font-semibold text-sm ${activeTab === "scan" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                <Camera size={18} /> مسح
            </button>
            
            <button onClick={() => setActiveTab("profile")} className={`relative flex-1 flex items-center justify-center h-full rounded-full transition-colors duration-300 z-10 gap-2 font-semibold text-sm ${activeTab === "profile" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                <User size={18} /> ملفي
            </button>
        </div>
      </nav>
    </div>
  );
}