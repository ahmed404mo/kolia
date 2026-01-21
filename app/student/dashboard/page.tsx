"use client";
import { useState, useEffect } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  User, LogOut, Camera, Zap, Edit3, X, RefreshCw, 
  LayoutGrid, ScanLine, BookOpen, CheckCircle2, XCircle, 
  Calendar, ChevronLeft, Filter, GraduationCap, Code2, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  
  // Data States
  const [isClient, setIsClient] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });
  const [selectedTerm, setSelectedTerm] = useState<string>("6");
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState<any>(null);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  // Avatar States
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarSeeds, setAvatarSeeds] = useState<string[]>([]);
  const [avatarStyle, setAvatarStyle] = useState("micah");
  const avatarStyles = ["micah", "avataaars", "bottts", "notionists"];

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("user");
    if (!stored) {
      // ✅ إعادة توجيه إجباري للخروج في حالة عدم وجود بيانات
      window.location.href = "/login?out=true";
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);
    
    // ✅ ميزة جديدة: فتح قائمة الأفاتار تلقائياً لو مفيش صورة
    if (!userData.image) {
        setShowAvatarSelector(true);
    }
    
    buildFullReport(userData);
    generateRandomAvatars();
  }, []);

  // 🔥 دالة بناء التقرير وحساب الغياب 🔥
  const buildFullReport = async (userData: any) => {
    setIsReportLoading(true);
    try {
        const subjectsRes = await fetch('/api/subjects');
        const allSubjects = await subjectsRes.json();

        const terms = Array.from(new Set(allSubjects.map((s: any) => s.term))).sort() as string[];
        setAvailableTerms(terms);
        if (!terms.includes(selectedTerm) && terms.length > 0) setSelectedTerm(terms[0]);

        // استخدام Set للبحث السريع عن المحاضرات التي تم حضورها
        const attendedLectureIds = new Set((userData.attendance || []).map((a: any) => a.lectureId));
        
        const now = new Date();

        const report = allSubjects.map((subject: any) => {
            let lecTotal = 0, lecPresent = 0;
            let secTotal = 0, secPresent = 0;
            const detailedLectures: any[] = [];

            if (subject.lectures) {
                subject.lectures.forEach((lecture: any) => {
                    const lectureDate = new Date(lecture.date);
                    const isSection = lecture.type === 'SECTION';
                    
                    const didAttend = attendedLectureIds.has(lecture.id);
                    // أي محاضرة تاريخها فات أو اليوم
                    const isPastOrToday = lectureDate <= now;

                    if (isPastOrToday) {
                        if (isSection) {
                            secTotal++;
                            if (didAttend) secPresent++;
                        } else {
                            lecTotal++;
                            if (didAttend) lecPresent++;
                        }

                        detailedLectures.push({
                            topic: lecture.topic || (isSection ? "سكشن عملي" : "محاضرة نظرية"),
                            date: lecture.date,
                            status: didAttend ? 'PRESENT' : 'ABSENT',
                            type: isSection ? 'سكشن' : 'محاضرة'
                        });
                    }
                });
            }

            // ترتيب المحاضرات (الأحدث أولاً)
            detailedLectures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return {
                ...subject,
                lecStats: { total: lecTotal, present: lecPresent, absent: lecTotal - lecPresent },
                secStats: { total: secTotal, present: secPresent, absent: secTotal - secPresent },
                lectures: detailedLectures,
                hasSection: subject.hasSection
            };
        });

        setSubjectsList(report);

        // الإحصائيات العامة
        const totalItems = report.reduce((acc: number, s: any) => acc + s.lecStats.total + s.secStats.total, 0);
        const totalPres = report.reduce((acc: number, s: any) => acc + s.lecStats.present + s.secStats.present, 0);
        const percentage = totalItems > 0 ? Math.round((totalPres / totalItems) * 100) : 0;

        setStats({ total: totalItems, present: totalPres, percentage });

    } catch (error) {
        console.error("Error building report:", error);
    } finally {
        setIsReportLoading(false);
    }
  };

  const filteredSubjects = subjectsList.filter(s => s.term === selectedTerm);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 4000);
  };

  // 🔥 دالة المسح (Scan) مع التحديث الفوري 🔥
// ابحث عن دالة handleScan واستبدلها بهذا
const handleScan = async (result: string) => {
  if (!result || loading || scanResult || !user?.id) return;
  setLoading(true);

  // 🔥 طلب موقع الطالب
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch("/api/scan", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ 
            userId: user.id, 
            qrCode: result,
            lat: latitude, // 🔥 إرسال الموقع
            lng: longitude
          }) 
        });
        const data = await res.json();
        
        if (res.ok) {
          showNotification("تم تسجيل الحضور بنجاح! 🎉", 'success');
          // ... (باقي منطق التحديث المحلي الموجود عندك)
          const newLectureId = data.lectureId || data.id; 
          if (newLectureId) {
              const updatedUser = { ...user, attendance: [...(user.attendance || []), { lectureId: newLectureId }] };
              setUser(updatedUser); 
              localStorage.setItem("user", JSON.stringify(updatedUser));
              await buildFullReport(updatedUser);
          }
          setTimeout(() => setActiveTab("dashboard"), 1500);
        } else {
          showNotification(data.message || "خطأ في تسجيل الحضور", 'error');
        }
      } catch (e) { showNotification("فشل الاتصال", 'error'); } 
      finally { setLoading(false); setScanResult(null); }
    },
    (error) => {
      setLoading(false);
      showNotification("يجب فتح الموقع (GPS) لتسجيل الحضور", 'error');
    }
  );
};

  // 🔥 دوال الأفاتار (توليد + اختيار) 🔥
  const generateRandomAvatars = () => setAvatarSeeds(Array.from({ length: 6 }, () => Math.random().toString(36).substring(7)));
  
  const handleSelectAvatar = async (seed: string) => {
      setLoading(true);
      const avatarUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      try {
        const updatedUser = { ...user, image: avatarUrl };
        await fetch("/api/students", { method: "PUT", body: JSON.stringify(updatedUser) });
        setUser(updatedUser); 
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showNotification("تم تحديث الصورة", 'success'); 
        setShowAvatarSelector(false); // إغلاق القائمة
      } catch(e){
        showNotification("حدث خطأ", 'error');
      } finally {setLoading(false);}
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault(); setLoading(true);
      try {
        await fetch("/api/students", { method: "PUT", body: JSON.stringify({ id: user.id, name: user.name, password: user.password }) });
        showNotification("تم الحفظ", 'success'); setIsEditing(false); localStorage.setItem("user", JSON.stringify(user));
      } catch(e){} finally {setLoading(false);}
  };

  // 🔥 دالة الخروج النهائية 🔥
  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/login?out=true"; // Force Reload
  };

  if (!user || !isClient) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-hidden select-none relative" dir="rtl">
      
      {/* Background & Header */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      {msg && <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-300 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><span className="text-xs font-bold">{msg.text}</span></div>}

      <header className="px-6 pt-12 pb-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div onClick={() => setShowAvatarSelector(true)} className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-blue-500">
              <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden">
                {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">{user.name[0]}</div>}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-400">مرحباً بك 👋</h1>
            <p className="text-lg font-black tracking-tight text-white">{user.name.split(' ')[0]}</p>
          </div>
        </div>
        <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"><Edit3 size={18} className="text-zinc-400" /></button>
      </header>

      <main className="px-5 pb-32 relative z-10 h-full overflow-y-auto scrollbar-hide">
        
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 animate-in fade-in zoom-in duration-500">
            
            {/* Progress Card */}
            <div className="w-full bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/10 p-6 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">الالتزام العام</p>
                  <h2 className="text-4xl font-black text-white">{stats.percentage}%</h2>
                  <p className="text-[10px] text-zinc-500 mt-2 font-medium">إجمالي الحضور لجميع المواد</p>
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="200" strokeDashoffset={200 - (200 * stats.percentage) / 100} className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                  </svg>
                  <Zap size={20} className="absolute text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 shrink-0"><Filter size={14}/></div>
                {availableTerms.map(term => (
                  <button 
                    key={term}
                    onClick={() => setSelectedTerm(term)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold transition whitespace-nowrap ${selectedTerm === term ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
                  >
                    المستوى {term}
                  </button>
                ))}
              </div>

              {/* Subject List */}
              <div className="space-y-3">
                {isReportLoading ? (
                  <div className="text-center py-8 border border-dashed border-zinc-800 rounded-[1.5rem]"><p className="text-xs text-zinc-500 font-bold animate-pulse">جاري تحميل البيانات...</p></div>
                ) : filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedSubjectDetails(sub)} 
                      className="bg-zinc-900/50 border border-white/5 p-4 rounded-[1.5rem] hover:bg-zinc-800/80 transition cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.lecStats.absent > 0 || (sub.hasSection && sub.secStats.absent > 0) ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white mb-0.5 max-w-[180px] leading-tight">{sub.name}</p>
                            <p className="text-[9px] text-zinc-500 font-bold">كود: {sub.code}</p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-zinc-600 group-hover:text-white transition-colors mt-2"/>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 rounded-xl p-2 flex justify-between items-center border border-white/5">
                            <span className="text-[9px] text-zinc-400">محاضرات</span>
                            <div className="flex gap-2 text-[9px] font-bold">
                                <span className="text-emerald-400">✔ {sub.lecStats.present}</span>
                                <span className="text-red-400">✘ {sub.lecStats.absent}</span>
                            </div>
                        </div>

                        {sub.hasSection && (
                            <div className="flex-1 bg-black/40 rounded-xl p-2 flex justify-between items-center border border-white/5">
                                <span className="text-[9px] text-zinc-400">سكاشن</span>
                                <div className="flex gap-2 text-[9px] font-bold">
                                    <span className="text-emerald-400">✔ {sub.secStats.present}</span>
                                    <span className="text-red-400">✘ {sub.secStats.absent}</span>
                                </div>
                            </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-zinc-900/50 rounded-[1.5rem] border border-zinc-800">
                    <p className="text-sm text-zinc-400 font-bold">لا توجد مواد لهذا الترم</p>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/10 transition mt-2"><LogOut size={14} /> تسجيل الخروج</button>
          </div>
        )}

        {/* 🔥🔥🔥 Scan Tab الأبيض 🔥🔥🔥 */}
        {activeTab === "scan" && (
            <div className="h-[75vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
             
             {/* التوقيع أعلى اليسار */}
             <div className="fixed top-6 left-6 opacity-80 hover:opacity-100 transition-opacity duration-500 z-50 pointer-events-none">
                <div className="flex flex-col gap-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <span>Designed &</span>
                    <span className="flex items-center gap-1">Made by <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Ahmed Mokhtar</span></span>
                </div>
             </div>

             {/* Scanner Container (White Theme) */}
             <div className="relative w-full max-w-md aspect-square rounded-[3rem] p-1.5 bg-gradient-to-br from-white/20 via-zinc-900 to-white/10 shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]">
                <div className="absolute -inset-1 bg-gradient-to-r from-white to-zinc-400 rounded-[3.2rem] opacity-20 blur-xl animate-pulse pointer-events-none"></div>

                <div className="w-full h-full rounded-[2.8rem] bg-black overflow-hidden relative border border-white/10 z-10">
                    {!scanResult ? (
                        <>
                            <Scanner 
                                onScan={(result) => result[0] && handleScan(result[0].rawValue)} 
                                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }} 
                                components={{ audio: false, finder: false }} 
                                constraints={{ facingMode: 'environment' }} 
                            />
                            
                            {/* Overlay UI (White) */}
                            <div className="absolute inset-0 bg-black/10 z-20 pointer-events-none">
                                <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-white rounded-tl-[2rem] shadow-[0_0_20px_white]"></div>
                                <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-white rounded-tr-[2rem] shadow-[0_0_20px_white]"></div>
                                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-white rounded-bl-[2rem] shadow-[0_0_20px_white]"></div>
                                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-white rounded-br-[2rem] shadow-[0_0_20px_white]"></div>
                                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_30px_white] animate-[scanLine_2.5s_ease-in-out_infinite]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-xl flex items-center justify-center">
                                     <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-zinc-950 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-[6px] border-white border-t-transparent rounded-full animate-spin"></div>
                                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white fill-white animate-pulse" size={24} />
                            </div>
                            <p className="text-sm font-bold text-white tracking-[0.3em] animate-pulse">جاري التحقق...</p>
                        </div>
                    )}
                </div>
             </div>

             <div className="mt-10 text-center space-y-3">
                <p className="text-white font-black text-lg tracking-wide drop-shadow-lg">MAS Scanner Pro</p>
                <div className="inline-flex items-center gap-2 bg-zinc-900/80 px-5 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
                    <AlertCircle size={14} className="text-white"/>
                    <p className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
                        ضع الكود داخل الإطار
                    </p>
                </div>
             </div>

            </div>
        )}

      </main>

      {/* Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex gap-2 shadow-2xl z-50">
        <button onClick={() => setActiveTab("dashboard")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === "dashboard" ? "bg-white text-black shadow-lg scale-110" : "text-zinc-500 hover:bg-white/5"}`}><LayoutGrid size={22} /></button>
        <button onClick={() => setActiveTab("scan")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === "scan" ? "bg-white text-black shadow-lg shadow-white/40 scale-110" : "text-zinc-500 hover:bg-white/5"}`}><ScanLine size={24} /></button>
      </div>

      {/* Subject Details Modal */}
      {selectedSubjectDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center animate-in fade-in duration-300" onClick={() => setSelectedSubjectDetails(null)}>
            <div className="bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 border-t sm:border border-white/10 shadow-2xl animate-in slide-in-from-bottom-20 duration-300 h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
                
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                    <div>
                        <h3 className="text-lg font-black text-white">{selectedSubjectDetails.name}</h3>
                        <div className="flex gap-2 mt-1">
                             <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">محاضرات: {selectedSubjectDetails.lecStats.present}/{selectedSubjectDetails.lecStats.total}</span>
                             {selectedSubjectDetails.hasSection && (
                                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">سكاشن: {selectedSubjectDetails.secStats.present}/{selectedSubjectDetails.secStats.total}</span>
                             )}
                        </div>
                    </div>
                    <button onClick={() => setSelectedSubjectDetails(null)} className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition"><X size={18}/></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                    {selectedSubjectDetails.lectures.length > 0 ? (
                        selectedSubjectDetails.lectures.map((lec: any, idx: number) => (
                            <div key={idx} className={`border p-4 rounded-2xl flex items-center justify-between ${lec.status === 'PRESENT' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {lec.type === 'سكشن' ? <GraduationCap size={18}/> : <BookOpen size={18}/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${lec.type === 'سكشن' ? 'bg-purple-500 text-purple-100' : 'bg-blue-500 text-blue-100'}`}>{lec.type}</span>
                                            <p className="text-xs font-bold text-white">{lec.topic}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(lec.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[9px] px-2 py-1 rounded-lg font-bold ${lec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {lec.status === 'PRESENT' ? 'حاضر' : 'غائب'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-xs text-zinc-500">لا توجد سجلات لهذه المادة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Edit & Avatar Modals */}
      {(isEditing || showAvatarSelector) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
           {showAvatarSelector ? (
               <div className="bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 border-t sm:border border-white/10 shadow-2xl">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-black">اختر شكلاً رمزياً</h3><button onClick={() => setShowAvatarSelector(false)} className="bg-zinc-800 p-2 rounded-full"><X size={16}/></button></div>
                 <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">{avatarStyles.map(s => (<button key={s} onClick={() => setAvatarStyle(s)} className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${avatarStyle === s ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"}`}>{s}</button>))}</div>
                 <div className="grid grid-cols-3 gap-3 mb-6">{avatarSeeds.map(s => (<button key={s} onClick={() => handleSelectAvatar(s)} className="aspect-square bg-zinc-800/50 rounded-2xl overflow-hidden hover:ring-2 ring-blue-500 transition"><img src={`https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${s}`} className="w-full h-full" /></button>))}</div>
                 <button onClick={generateRandomAvatars} className="w-full py-4 bg-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><RefreshCw size={14}/> تحديث الخيارات</button>
               </div>
           ) : (
               <div className="bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 border-t sm:border border-white/10 shadow-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-5"><h3 className="text-lg font-black mb-6">تعديل البيانات</h3><div className="space-y-2"><label className="text-xs font-bold text-zinc-500 mr-2">الاسم</label><input className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 transition font-bold text-sm" value={user.name} onChange={e=>setUser({...user, name: e.target.value})} /></div><div className="space-y-2"><label className="text-xs font-bold text-zinc-500 mr-2">كلمة المرور</label><input type="password" className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white outline-none focus:border-blue-500 transition font-bold text-sm" placeholder="••••••" value={user.password || ""} onChange={e=>setUser({...user, password: e.target.value})} /></div><div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold text-sm">إلغاء</button><button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20">حفظ</button></div></form>
               </div>
           )}
        </div>
      )}

      <style jsx global>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}