"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Users, QrCode, ChevronRight, FileText, 
  Printer, Plus, Edit, Trash2, X, Menu,
  CheckCircle, AlertCircle, LogOut, BookOpen, Filter, Settings, RefreshCw, Copy, MoreVertical
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  // ... (All existing state and logic remains the same)
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("qr"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(""); 
  
  // Data States
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  
  // UI States
  const [selectedTerm, setSelectedTerm] = useState("6");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lectureType, setLectureType] = useState("PHYSICAL");
  const [electiveName, setElectiveName] = useState(""); 
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); 
  
  // Session
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Report
  const [reportTerm, setReportTerm] = useState("6");
  const [reportSubject, setReportSubject] = useState("");
  const [reportType, setReportType] = useState("ALL"); 

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: "", name: "", email: "", password: "", division: "", classNumber: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showManualLectureModal, setShowManualLectureModal] = useState(false);
  const [manualLectureForm, setManualLectureForm] = useState({ topic: "", date: "", type: "PHYSICAL" });
  const [showEditLectureModal, setShowEditLectureModal] = useState(false);
  const [editLectureForm, setEditLectureForm] = useState({ id: "", topic: "", date: "" });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, type: 'STUDENT' | 'LECTURE' | null, id: string | null}>({ isOpen: false, type: null, id: null });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); 
      } else {
        setSidebarOpen(false); 
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    try {
        const subRes = await fetch("/api/subjects");
        if(subRes.ok) {
            const data = await subRes.json();
            setSubjects(Array.isArray(data) ? data : []);
        }
        updateReportData();
    } catch (e) { console.error(e); }
  };

  const updateReportData = () => {
    fetch("/api/report", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
            if(data.students && Array.isArray(data.students)) setStudents(data.students);
            if(data.lectures && Array.isArray(data.lectures)) setLectures(data.lectures);
            setLastUpdate(new Date().toLocaleTimeString('ar-EG'));
        })
        .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const savedLecture = localStorage.getItem("activeLecture");
    if (savedLecture) { try { setCurrentLecture(JSON.parse(savedLecture)); } catch (e) { localStorage.removeItem("activeLecture"); } }
    const interval = setInterval(updateReportData, 2000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setSelectedSubject(""); }, [selectedTerm, lectureType]);

  const filteredSubjectsQR = (subjects || []).filter(s => {
      if (s.term !== selectedTerm) return false;
      if (lectureType === "SECTION") return s.hasSection === true;
      return true;
  });

  const filteredSubjectsReport = (subjects || []).filter(s => {
      if (s.term !== reportTerm) return false;
      if (reportType === "SECTION" && !s.hasSection) return false;
      return true;
  });
  
  const allSubjectLectures = reportSubject 
      ? (lectures || [])
          .filter(l => {
              if (l.subjectId !== reportSubject) return false;
              if (reportType === "SECTION") return l.type === "SECTION";
              if (reportType === "PHYSICAL") return l.type === "PHYSICAL" || l.type === "ONLINE";
              return true;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];

  const isSelectedElectiveQR = (subjects || []).find(s => s.id === selectedSubject)?.isElective;
  
  const groupedStudents = ["1", "2", "3", "4", "5", "6"].map(div => ({
      division: div, 
      students: (students || [])
        .filter(s => s.division === div)
        .sort((a, b) => parseInt(a.classNumber || "0") - parseInt(b.classNumber || "0"))
  })).filter(g => g.students.length > 0);

  const handleLogout = (e: React.MouseEvent) => { 
    e.preventDefault();
    e.stopPropagation();
    localStorage.clear(); 
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    try {
        if (navigator.sendBeacon) { navigator.sendBeacon("/api/logout"); } 
        else { fetch("/api/logout", { method: "POST", keepalive: true }); }
    } catch (e) { console.error(e); }
    window.location.replace("/login?out=true"); 
  };
  
// ابحث عن دالة startLecture واستبدلها بهذا الجزء
const startLecture = async () => {
  if (!selectedSubject) return showNotify("يرجى اختيار المادة", "error");
  
  setLoading(true);

  // 🔥 جلب إحداثيات الأدمن الحالية
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      let finalTopic = subjectObj?.name;
      const typeLabel = lectureType === 'SECTION' ? '(سكشن)' : lectureType === 'ONLINE' ? '(أونلاين)' : '(محاضرة)';
      finalTopic = `${finalTopic} ${typeLabel}`;

      try {
        const res = await fetch("/api/lectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: finalTopic, 
            type: lectureType, 
            subjectId: selectedSubject,
            lat: latitude, // 🔥 إرسال الموقع
            lng: longitude 
          })
        });
        const data = await res.json();
        if (res.ok) { 
          setCurrentLecture(data);
          localStorage.setItem("activeLecture", JSON.stringify(data));
          showNotify("تم بدء السيشن وحفظ موقعك الحالي ✅"); 
          updateReportData();
        }
      } catch (e) { showNotify("خطأ في الاتصال", "error"); }
      finally { setLoading(false); }
    },
    (error) => {
      setLoading(false);
      showNotify("يجب السماح بالوصول للموقع لإنشاء QR صالح", "error");
    }
  );
};

  const endLectureSession = () => { setCurrentLecture(null); setElectiveName(""); localStorage.removeItem("activeLecture"); };
  const handleCreateManualLecture = async (e: React.FormEvent) => { e.preventDefault(); if (!reportSubject) return; const subjectObj = subjects.find(s => s.id === reportSubject); let finalTopic = subjectObj?.name; const typeLabel = manualLectureForm.type === 'SECTION' ? '(سكشن)' : manualLectureForm.type === 'ONLINE' ? '(أونلاين)' : '(محاضرة)'; if (manualLectureForm.topic) finalTopic = manualLectureForm.topic; else finalTopic = `${finalTopic} ${typeLabel}`; try { const res = await fetch("/api/lectures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: finalTopic, type: manualLectureForm.type, subjectId: reportSubject, date: manualLectureForm.date }) }); if (res.ok) { showNotify("تم الإضافة ✅"); setShowManualLectureModal(false); updateReportData(); } } catch (e) { showNotify("خطأ", "error"); } };
  const handleUpdateLecture = async (e: React.FormEvent) => { e.preventDefault(); try { const res = await fetch("/api/lectures", { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(editLectureForm) }); if(res.ok) { showNotify("تم التعديل"); setShowEditLectureModal(false); updateReportData(); } } catch(e) { showNotify("خطأ", "error"); } };
  const handleDeleteStudent = async () => { if (!confirmModal.id) return; await fetch(`/api/students?id=${confirmModal.id}`, { method: "DELETE" }); showNotify("تم الحذف"); updateReportData(); setConfirmModal({ isOpen: false, type: null, id: null }); };
  const handleDeleteLecture = async () => { if (!confirmModal.id) return; await fetch(`/api/lectures?id=${confirmModal.id}`, { method: "DELETE" }); showNotify("تم الحذف"); updateReportData(); setConfirmModal({ isOpen: false, type: null, id: null }); };
  const handleSaveStudent = async (e: React.FormEvent) => { e.preventDefault(); const method = isEditingStudent ? "PUT" : "POST"; await fetch("/api/students", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(studentForm) }); setShowStudentModal(false); updateReportData(); showNotify("تم الحفظ"); };
  const toggleAttendance = async (studentId: string, lectureId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
            let newAttendance = [...(s.attendance || [])];
            if (newStatus) newAttendance.push({ lectureId, userId: studentId });
            else newAttendance = newAttendance.filter((a:any) => a.lectureId !== lectureId);
            return { ...s, attendance: newAttendance };
        }
        return s;
    }));
    await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: studentId, lectureId, status: newStatus ? "PRESENT" : "ABSENT" }) });
    updateReportData(); 
  };
  const handlePrint = () => { window.print(); };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-right overflow-hidden" dir="rtl">
      
      <style jsx global>{`
        @media print {
            @page { size: A4 landscape; margin: 5mm; }
            body { background-color: white; -webkit-print-color-adjust: exact; }
            body * { visibility: hidden; }
            #printable-area, #printable-area * { visibility: visible; }
            #printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .print-table { width: 100%; border-collapse: collapse !important; border: 2px solid #000 !important; font-size: 11px; }
            .print-table th, .print-table td { border: 1px solid #000 !important; padding: 2px; text-align: center; color: black; }
            .print-table th { background-color: #f3f4f6 !important; font-weight: bold; }
            .print-header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 10px; padding-bottom: 5px; }
            .id-copy-section { display: none !important; }
            .check-mark { font-size: 14px; font-weight: bold; }
            
            /* 🔥🔥🔥 THIS IS THE FIX 🔥🔥🔥 */
            /* Force page break after each group div */
            .page-break { page-break-after: always; break-after: page; display: block; }
            /* Prevent page break inside the table if possible, though 'page-break-after: always' on container handles the main requirement */
            tr { page-break-inside: avoid; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {notification && (<div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 no-print ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}<span className="font-bold">{notification.message}</span></div>)}
      
      {/* ... (Rest of the JSX remains exactly the same, as the class 'page-break' was already present in your original code) ... */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside 
        className={`
            fixed top-0 right-0 h-full z-50 bg-slate-900 text-white shadow-2xl
            transition-transform duration-300 ease-in-out flex flex-col no-print
            lg:relative lg:z-auto lg:translate-x-0
            ${sidebarOpen ? "translate-x-0 w-64" : "translate-x-full lg:w-20"}
        `}
      >
        {/* ... Sidebar content ... */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between min-h-[80px]">
            <h1 className={`text-xl font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 hidden lg:block lg:opacity-0 group-hover:opacity-100"}`}>Admin Panel</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded hidden lg:block">
                <ChevronRight className={sidebarOpen ? "rotate-180" : ""}/>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-700 rounded lg:hidden">
                <X/>
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {[{id: "qr", icon: QrCode, label: "إنشاء QR"}, {id: "report", icon: FileText, label: "دفاتر الغياب"}, {id: "students", icon: Users, label: "الطلاب"}].map(item => (
                <button 
                    key={item.id} 
                    onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) setSidebarOpen(false); }} 
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition whitespace-nowrap ${activeTab === item.id ? "bg-blue-600" : "hover:bg-slate-800"}`}
                >
                    <item.icon size={22} className="min-w-[22px]"/> 
                    <span className={`${!sidebarOpen && "lg:hidden"}`}>{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
            <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-slate-800 rounded-xl transition whitespace-nowrap overflow-hidden font-bold cursor-pointer">
                <LogOut size={22} className="min-w-[22px]"/> 
                <span className={`${!sidebarOpen && "lg:hidden"}`}>خروج</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        {/* ... Main content ... */}
        <div className="lg:hidden p-4 bg-white border-b flex justify-between items-center shadow-sm z-30 no-print flex-shrink-0">
            <h1 className="font-bold text-slate-800">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24}/>
            </button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full">
            {/* QR Tab */}
            {activeTab === "qr" && (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 mb-10">
                    {/* ... QR Tab Content ... */}
                    <div className="p-6 md:p-8 lg:w-1/2 border-b lg:border-b-0 lg:border-l border-slate-100 flex flex-col justify-center">
                        {!currentLecture ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2"><BookOpen className="text-blue-600"/><h2 className="text-2xl font-bold">إعداد سيشن جديد</h2></div>
                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">1. اختر الفصل الدراسي</label><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{["6", "7", "8"].map(term => (<button key={term} onClick={() => setSelectedTerm(term)} className={`flex-1 min-w-[80px] py-3 rounded-lg border font-bold transition text-sm ${selectedTerm === term ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white text-gray-500 hover:bg-gray-50"}`}>تيرم {term}</button>))}</div></div>
                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">2. نوع السيشن</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setLectureType("PHYSICAL")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "PHYSICAL" ? "bg-blue-100 text-blue-700 border-blue-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>محاضرة</button><button onClick={() => setLectureType("SECTION")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "SECTION" ? "bg-purple-100 text-purple-700 border-purple-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>سكشن</button><button onClick={() => setLectureType("ONLINE")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "ONLINE" ? "bg-green-100 text-green-700 border-green-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>أونلاين</button></div></div>
                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">3. اختر المقرر الدراسي</label><div className="relative"><select className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}><option value="">-- اختر المادة --</option>{filteredSubjectsQR.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}</select><div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight className="rotate-90" size={20}/></div></div>{lectureType === "SECTION" && filteredSubjectsQR.length === 0 && (<div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-bold border border-red-100"><AlertCircle size={18}/> لا توجد مواد عملية مسجلة لهذا الترم</div>)}</div>
                                {isSelectedElectiveQR && (<div className="animate-in fade-in slide-in-from-top-2"><label className="text-xs font-bold text-blue-600 mb-2 block">اسم المقرر الاختياري</label><input type="text" className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="اكتب اسم المقرر هنا..." value={electiveName} onChange={(e) => setElectiveName(e.target.value)}/></div>)}
                                <button onClick={startLecture} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition transform active:scale-[0.99] disabled:opacity-50 mt-4">{loading ? "جاري الإنشاء..." : "إنشاء الرمز (QR)"}</button>
                            </div>
                        ) : (<div className="text-center space-y-6"><div className="bg-green-50 p-8 rounded-3xl border border-green-100 shadow-sm"><CheckCircle className="mx-auto text-green-600 mb-3" size={48}/><h2 className="text-2xl font-bold text-green-800 mb-2">{currentLecture.topic}</h2><p className="text-green-600 font-mono text-lg bg-white/50 inline-block px-4 py-1 rounded-lg">{new Date(currentLecture.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div><button onClick={endLectureSession} className="w-full py-4 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"><X size={20}/> إنهاء الجلسة</button></div>)}
                    </div>
                    <div className="p-10 lg:w-1/2 bg-slate-50 flex items-center justify-center">
                        {currentLecture ? (<div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in zoom-in duration-300 w-full max-w-[320px] flex flex-col items-center"><QRCodeSVG value={currentLecture.qrCode} size={250} level="H" className="w-full h-auto" /><p className="text-center mt-6 font-bold text-slate-400 font-mono text-xl tracking-[0.5em] opacity-50">SCAN ME</p></div>) : (<div className="text-slate-300 text-center flex flex-col items-center"><div className="bg-white p-6 rounded-full mb-4 shadow-sm"><QrCode size={60} className="text-slate-200"/></div><p className="text-lg font-bold text-slate-400">الرمز سيظهر هنا</p></div>)}
                    </div>
                </div>
            )}

            {/* Report Tab */}
            {activeTab === "report" && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden w-full mb-10">
                    {/* ... Report Header ... */}
                    <div className="p-4 md:p-6 border-b flex flex-col xl:flex-row justify-between items-center gap-4 no-print bg-slate-50">
                        <div className="w-full xl:w-auto text-center xl:text-right">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center xl:justify-start gap-2"><FileText className="text-blue-600"/> دفاتر الغياب</h2>
                            <p className="text-xs font-bold text-emerald-600 flex items-center justify-center xl:justify-start gap-1 mt-1"><RefreshCw size={12} className="animate-spin"/> آخر تحديث: {lastUpdate}</p>
                        </div>
                        <div className="flex flex-col md:flex-row flex-wrap justify-center xl:justify-end gap-3 w-full xl:w-auto">
                            <select className="bg-gray-50 border rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer w-full md:w-auto" value={reportTerm} onChange={e => { setReportTerm(e.target.value); setReportSubject(""); }}><option value="6">تيرم 6</option><option value="7">تيرم 7</option><option value="8">تيرم 8</option></select>
                            <select className="bg-gray-50 border rounded-lg px-3 py-2 text-sm font-bold outline-none w-full md:min-w-[200px] cursor-pointer" value={reportSubject} onChange={e => setReportSubject(e.target.value)}><option value="">-- اختر المادة --</option>{filteredSubjectsReport.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}</select>
                            <select className="bg-indigo-50 border-indigo-200 text-indigo-800 border rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer w-full md:w-auto" value={reportType} onChange={e => setReportType(e.target.value)}><option value="ALL">عرض الكل</option><option value="PHYSICAL">محاضرات نظرية</option><option value="SECTION">سكاشن عملية</option></select>
                            <div className="flex gap-2 w-full md:w-auto">
                                {reportSubject && (<button onClick={() => { setManualLectureForm({topic: "", date: new Date().toISOString().split('T')[0], type: reportType === "SECTION" ? "SECTION" : "PHYSICAL"}); setShowManualLectureModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 font-bold transition shadow-md w-full md:w-auto"><Plus size={18}/> <span className="md:hidden lg:inline">إضافة عمود</span></button>)}
                                <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 font-bold transition shadow-md w-full md:w-auto"><Printer size={18}/> <span className="md:hidden lg:inline">طباعة</span></button>
                            </div>
                        </div>
                    </div>

                    <div id="printable-area" className="p-4 md:p-8 overflow-x-auto min-h-[400px]">
                        {!reportSubject ? (<div className="text-center py-20 text-gray-400 bg-white"><Filter size={60} className="mx-auto mb-4 opacity-20"/><p className="text-xl font-bold opacity-50">يرجى اختيار المادة</p></div>) : groupedStudents.length === 0 ? (<div className="text-center p-10 text-gray-400 font-bold bg-gray-50 rounded-2xl">لا يوجد طلاب</div>) : (
                            groupedStudents.map((group) => {
                                const ledgerTitle = reportType === "SECTION" ? "سجل حضور السكاشن العملية" : reportType === "PHYSICAL" ? "سجل حضور المحاضرات النظرية" : "سجل الحضور الشامل";
                                return (
                                    <div key={group.division} className="page-break mb-10 w-full overflow-hidden">
                                        <div className="print-header no-print-view min-w-[600px] overflow-x-auto pb-4">
                                            <h1 className="text-xl font-extrabold mb-1 text-center md:text-right">{ledgerTitle}</h1>
                                            <h2 className="text-lg font-bold mb-2 text-slate-700 text-center md:text-right">{subjects.find(s=>s.id === reportSubject)?.name}</h2>
                                            <div className="flex justify-between px-2 md:px-10 text-sm font-bold border-t border-black pt-2 mt-2"><span>الشعبة: {group.division}</span><span>الفصل الدراسي: {reportTerm}</span><span>عدد الجلسات: {allSubjectLectures.length}</span></div>
                                        </div>
                                        
                                        <div className="overflow-x-auto w-full pb-32">
                                            <table className="w-full border-collapse border-slate-200 print-table min-w-[600px]" dir="rtl">
                                                <thead>
                                                    <tr className="bg-slate-100 print:bg-gray-200">
                                                        <th className="border p-2 w-16 text-xs bg-slate-200">رقم الكشف</th>
                                                        <th className="border p-2 text-right w-40 min-w-[150px]">اسم الطالب</th>
                                                        {allSubjectLectures.map((lec: any) => (
                                                            <th key={lec.id} className="border p-1 w-10 relative align-bottom group">
                                                                <div className="relative no-print flex justify-center mb-1">
                                                                    <button 
                                                                        onClick={(e) => toggleMenu(e, lec.id)}
                                                                        className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"
                                                                    >
                                                                        <MoreVertical size={16} />
                                                                    </button>
                                                                    {activeMenuId === lec.id && (
                                                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-gray-200 shadow-xl rounded-xl p-1 flex flex-col gap-1 min-w-[120px] animate-in fade-in zoom-in duration-200">
                                                                                <button 
                                                                                    onClick={(e) => { 
                                                                                        e.stopPropagation(); 
                                                                                        setEditLectureForm({id: lec.id, topic: lec.topic, date: lec.date.split('T')[0]}); 
                                                                                        setShowEditLectureModal(true); 
                                                                                        setActiveMenuId(null);
                                                                                    }} 
                                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                                                                                >
                                                                                    <Edit size={14}/> تعديل الجلسة
                                                                                </button>
                                                                                <button 
                                                                                    onClick={(e) => { 
                                                                                        e.stopPropagation(); 
                                                                                        setConfirmModal({isOpen: true, type: 'LECTURE', id: lec.id}); 
                                                                                        setActiveMenuId(null);
                                                                                    }} 
                                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                                                                >
                                                                                    <Trash2 size={14}/> حذف الجلسة
                                                                                </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col items-center justify-end h-auto py-1">
                                                                    <span className="text-[10px] font-bold text-gray-500 mb-1 no-print">
                                                                        {reportType === "ALL" && (lec.type === "SECTION" ? "(س)" : "(م)")}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap">
                                                                        {new Date(lec.date).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        ))}
                                                        {Array.from({length: Math.max(0, 12 - allSubjectLectures.length)}).map((_, i) => (<th key={i} className="border p-1 w-8"></th>))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.students.map((student: any) => (
                                                        <tr key={student.id} className="hover:bg-slate-50">
                                                            <td className="border p-2 font-bold text-center bg-slate-50">{student.classNumber || "-"}</td>
                                                            <td className="border p-2 text-right font-medium text-xs whitespace-nowrap">
                                                                {student.name}
                                                                <br/>
                                                                <span className="text-[9px] text-gray-400 cursor-pointer hover:text-blue-600 no-print id-copy-section" title="اضغط للنسخ" onClick={() => {navigator.clipboard.writeText(student.id); showNotify("تم نسخ ID الطالب", "success")}}>
                                                                    ID: {student.id.substring(0, 6)}... <Copy size={8} className="inline"/>
                                                                </span>
                                                            </td>
                                                            {allSubjectLectures.map((lec: any) => { 
                                                                const isPresent = (student.attendance || []).some((a:any) => a.lectureId === lec.id); 
                                                                return (
                                                                    <td key={lec.id} className={`border p-1 cursor-pointer transition select-none text-center ${isPresent ? 'bg-black text-white print:bg-transparent print:text-black' : ''}`} onClick={() => toggleAttendance(student.id, lec.id, isPresent)}>
                                                                        {isPresent ? <span className="check-mark">✔</span> : ""}
                                                                    </td>
                                                                ); 
                                                            })}
                                                            {Array.from({length: Math.max(0, 12 - allSubjectLectures.length)}).map((_, i) => (<td key={i} className="border p-1"></td>))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 flex justify-between text-xs px-4 w-full"><p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p><p className="font-bold">توقيع عضو هيئة التدريس: .....................</p></div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow border border-slate-200 mb-10">
                   <div className="flex flex-col md:flex-row justify-between mb-6 gap-4"><div className="relative w-full md:w-64"><input className="border border-gray-300 p-2 pr-4 rounded-xl w-full outline-none focus:ring-2 focus:ring-blue-500" placeholder="بحث..." onChange={e=>setSearchTerm(e.target.value)}/></div><button onClick={()=>{setShowStudentModal(true); setIsEditingStudent(false); setStudentForm({ id: "", name: "", email: "", password: "", division: "", classNumber: "" })}} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex gap-2 hover:bg-blue-700 font-bold items-center justify-center w-full md:w-auto"><Plus size={18}/> إضافة طالب</button></div>
                   <div className="overflow-x-auto w-full pb-32">
                       <table className="w-full text-right min-w-[600px]">
                           <thead className="bg-gray-50 font-bold text-gray-600 border-b">
                               <tr>
                                   <th className="p-4">رقم الكشف</th>
                                   <th className="p-4">الصورة</th>
                                   <th className="p-4">الاسم</th>
                                   <th className="p-4">الشعبة</th>
                                   <th className="p-4">خيارات</th>
                               </tr>
                           </thead>
                           <tbody>
                               {students.filter(s=>s.name.includes(searchTerm)).map(s=>(
                                   <tr key={s.id} className="border-b hover:bg-gray-50">
                                           <td className="p-4 font-bold text-blue-600">{s.classNumber}</td>
                                           <td className="p-4">
                                               {s.image ? (
                                                   <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                                               ) : (
                                                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200 shadow-sm">
                                                       {s.name[0]}
                                                   </div>
                                               )}
                                           </td>
                                           <td className="p-4 font-medium">{s.name}</td>
                                           <td className="p-4">{s.division}</td>
                                           <td className="p-4">
                                               <div className="relative flex justify-center">
                                                   <button onClick={(e) => toggleMenu(e, `student-${s.id}`)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"><MoreVertical size={18}/></button>
                                                   {activeMenuId === `student-${s.id}` && (
                                                       <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-white border border-gray-200 shadow-xl rounded-xl p-1 flex flex-col gap-1 min-w-[120px] animate-in fade-in zoom-in duration-200">
                                                               <button onClick={(e)=>{ e.stopPropagation(); setStudentForm(s); setIsEditingStudent(true); setShowStudentModal(true); setActiveMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={14}/> تعديل</button>
                                                               <button onClick={(e)=>{ e.stopPropagation(); setConfirmModal({isOpen: true, type: 'STUDENT', id: s.id}); setActiveMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><Trash2 size={14}/> حذف</button>
                                                       </div>
                                                   )}
                                               </div>
                                           </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                </div>
            )}
        </div>
      </main>

      {/* --- Modals --- */}
      {showManualLectureModal && (<div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in"><h3 className="font-bold text-xl mb-4">إضافة عمود يدوي</h3><form onSubmit={handleCreateManualLecture} className="space-y-4"><div><label className="text-sm font-bold block mb-1">نوع الجلسة</label><select className="w-full border p-2 rounded-xl" value={manualLectureForm.type} onChange={e=>setManualLectureForm({...manualLectureForm, type: e.target.value})}><option value="PHYSICAL">محاضرة</option><option value="SECTION">سكشن</option></select></div><div><label className="text-sm font-bold block mb-1">التاريخ</label><input type="date" className="w-full border p-2 rounded-xl" value={manualLectureForm.date} onChange={e=>setManualLectureForm({...manualLectureForm, date: e.target.value})}/></div><div><label className="text-sm font-bold block mb-1">عنوان مخصص (اختياري)</label><input placeholder="مثال: كويز 1" className="w-full border p-2 rounded-xl" value={manualLectureForm.topic} onChange={e=>setManualLectureForm({...manualLectureForm, topic: e.target.value})}/></div><div className="flex gap-2"><button type="button" onClick={()=>setShowManualLectureModal(false)} className="flex-1 bg-gray-100 py-2 rounded-xl">إلغاء</button><button className="flex-1 bg-blue-600 text-white py-2 rounded-xl">إضافة</button></div></form></div></div>)}
      {showEditLectureModal && (<div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in"><h3 className="font-bold text-xl mb-4">تعديل الجلسة</h3><form onSubmit={handleUpdateLecture} className="space-y-4"><div><label className="text-sm font-bold block mb-1">عنوان الجلسة</label><input className="w-full border p-2 rounded-xl" value={editLectureForm.topic} onChange={e=>setEditLectureForm({...editLectureForm, topic: e.target.value})}/></div><div><label className="text-sm font-bold block mb-1">التاريخ</label><input type="date" className="w-full border p-2 rounded-xl" value={editLectureForm.date} onChange={e=>setEditLectureForm({...editLectureForm, date: e.target.value})}/></div><div className="flex gap-2"><button type="button" onClick={()=>setShowEditLectureModal(false)} className="flex-1 bg-gray-100 py-2 rounded-xl">إلغاء</button><button className="flex-1 bg-blue-600 text-white py-2 rounded-xl">حفظ</button></div></form></div></div>)}
      {showStudentModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm"><div className="bg-white p-8 rounded-3xl w-full max-w-md animate-in zoom-in duration-200 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-2xl text-slate-800">{isEditingStudent ? "تعديل" : "جديد"}</h3><button onClick={()=>setShowStudentModal(false)}><X size={20}/></button></div><form onSubmit={handleSaveStudent} className="space-y-4"><div><label className="text-sm font-bold text-gray-700">الاسم</label><input required className="w-full border p-3 rounded-xl" value={studentForm.name} onChange={e=>setStudentForm({...studentForm, name:e.target.value})}/></div><div className="flex gap-4"><div className="flex-1"><label className="text-sm font-bold">رقم الكشف</label><input required className="w-full border p-3 rounded-xl" value={studentForm.classNumber} onChange={e=>setStudentForm({...studentForm, classNumber:e.target.value})}/></div><div className="flex-1"><label className="text-sm font-bold">الشعبة</label><select required className="w-full border p-3 rounded-xl" value={studentForm.division} onChange={e=>setStudentForm({...studentForm, division:e.target.value})}><option value="">اختر</option> {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div><div><label className="text-sm font-bold">الايميل</label><input required className="w-full border p-3 rounded-xl" value={studentForm.email} onChange={e=>setStudentForm({...studentForm, email:e.target.value})}/></div><div><label className="text-sm font-bold">كلمة المرور</label><input required className="w-full border p-3 rounded-xl" value={studentForm.password} onChange={e=>setStudentForm({...studentForm, password:e.target.value})}/></div><button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold mt-2">حفظ</button></form></div></div>)}
      {confirmModal.isOpen && (<div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl p-6 w-[400px] animate-in zoom-in text-center"><h3 className="text-xl font-bold mb-2">{confirmModal.type === 'STUDENT' ? 'حذف الطالب' : 'حذف المحاضرة'}</h3><div className="flex gap-3 mt-6"><button onClick={() => setConfirmModal({isOpen: false, type: null, id: null})} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">إلغاء</button><button onClick={confirmModal.type === 'STUDENT' ? handleDeleteStudent : handleDeleteLecture} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">تأكيد الحذف</button></div></div></div>)}
    </div>
  );
}