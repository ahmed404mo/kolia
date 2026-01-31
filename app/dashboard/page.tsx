"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Users, QrCode, ChevronRight, FileText, 
  Printer, Plus, Edit, Trash2, X, Menu,
  CheckCircle, AlertCircle, LogOut, BookOpen, Filter, Settings, RefreshCw, Copy, MoreVertical,
  Megaphone, Upload, Image as ImageIcon, Link as LinkIcon, ListTodo, ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("qr"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(""); 
  
  // Data States
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [globalTasks, setGlobalTasks] = useState<any[]>([]); 
  
  // UI States
  const [selectedTerm, setSelectedTerm] = useState("6");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lectureType, setLectureType] = useState("PHYSICAL");
  const [electiveName, setElectiveName] = useState(""); 
  
  // حالة تخزين الشعب المختارة (للـ QR)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); 
  
  // Session
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Report
  const [reportTerm, setReportTerm] = useState("6");
  const [reportSubject, setReportSubject] = useState("");
  const [reportType, setReportType] = useState("ALL"); 
  
  // فلتر مجموعات الشعب للطباعة
  const [reportDivisionGroup, setReportDivisionGroup] = useState("ALL");

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState<{ id: string, name: string, email: string, password?: string, division: string, classNumber: string }>({ id: "", name: "", email: "", password: "", division: "", classNumber: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showManualLectureModal, setShowManualLectureModal] = useState(false);
  const [manualLectureForm, setManualLectureForm] = useState({ topic: "", date: "", type: "PHYSICAL" });
  const [showEditLectureModal, setShowEditLectureModal] = useState(false);
  const [editLectureForm, setEditLectureForm] = useState({ id: "", topic: "", date: "" });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, type: 'STUDENT' | 'LECTURE' | 'TASK' | null, id: string | null}>({ isOpen: false, type: null, id: null });

  // 🔥🔥🔥 Modal & States الأخبار والمهام 🔥🔥🔥
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [modalType, setModalType] = useState<'NEWS' | 'TASK'>('NEWS'); // لتحديد نوع المودال (خبر أم مهمة)
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const [globalText, setGlobalText] = useState("");
  const [globalLink, setGlobalLink] = useState(""); 
  const [globalImage, setGlobalImage] = useState(""); // صورة (base64 أو رابط)

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
        // 🔥 جلب المهام والأخبار
        const tasksRes = await fetch("/api/tasks?type=GLOBAL_ALL");
        if(tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setGlobalTasks(Array.isArray(tasksData) ? tasksData : []);
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
    const interval = setInterval(updateReportData, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
      setSelectedSubject(""); 
      setSelectedDivisions([]); 
  }, [selectedTerm, lectureType]);

  const toggleDivision = (div: string) => {
      setSelectedDivisions(prev => 
          prev.includes(div) ? prev.filter(d => d !== div) : [...prev, div]
      );
  };

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
              const lecType = (l.type || "").toUpperCase().trim();
              const repType = (reportType || "").toUpperCase().trim();

              if (repType === "ALL") return true;
              if (repType === "SECTION") return lecType === "SECTION";
              if (repType === "PHYSICAL") return lecType === "PHYSICAL" || lecType === "ONLINE";
              return true;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];

  const isSelectedElectiveQR = (subjects || []).find(s => s.id === selectedSubject)?.isElective;
  
  const groupedStudents = ["1", "2", "3", "4", "5", "6"].map(div => ({
      division: div, 
      students: (students || [])
        .filter(s => String(s.division) === String(div))
        .sort((a, b) => parseInt(a.classNumber || "0") - parseInt(b.classNumber || "0"))
  })).filter(g => g.students.length > 0);

  const filteredGroupedStudents = groupedStudents.filter(g => {
      if (reportDivisionGroup === "ALL") return true;
      const targetDivisions = reportDivisionGroup.split("-"); // يحول "1-2" إلى ["1", "2"]
      return targetDivisions.includes(g.division);
  });

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
  
  const startLecture = async () => {
    if (!selectedSubject) return showNotify("يرجى اختيار المادة", "error");
    setLoading(true);

    const subjectObj = subjects.find(s => s.id === selectedSubject);
    let finalTopic = subjectObj?.name;
    
    if (subjectObj?.isElective) {
        if(!electiveName) { setLoading(false); return showNotify("اسم المقرر مطلوب", "error"); }
        finalTopic = electiveName;
    }
    
    const typeLabel = lectureType === 'SECTION' ? '(سكشن)' : lectureType === 'ONLINE' ? '(أونلاين)' : '(محاضرة)';
    
    let divLabel = "";
    if (selectedDivisions.length > 0) {
        divLabel = ` (شعبة ${selectedDivisions.sort().join('+')})`;
    }

    finalTopic = `${finalTopic} ${typeLabel}${divLabel}`;

    const createLecture = async (lat: number | null, lng: number | null) => {
        try {
            const res = await fetch("/api/lectures", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    topic: finalTopic, 
                    type: lectureType, 
                    subjectId: selectedSubject, 
                    electiveName: electiveName, 
                    lat, 
                    lng,
                    allowedDivisions: selectedDivisions.length > 0 ? selectedDivisions : null 
                })
            });
            const data = await res.json();
            if (res.ok) { 
                setCurrentLecture(data); 
                localStorage.setItem("activeLecture", JSON.stringify(data));
                fetchData(); 
                if(lat && lng) showNotify("تم بدء السيشن وحفظ موقع القاعة ✅");
                else showNotify("تم بدء السيشن الأونلاين (متاح للجميع) 🌍");
                updateReportData();
            }
        } catch (e) { showNotify("خطأ", "error"); } 
        finally { setLoading(false); }
    };

    if (lectureType === 'ONLINE') {
        createLecture(null, null); 
    } else {
        navigator.geolocation.getCurrentPosition(
            (position) => createLecture(position.coords.latitude, position.coords.longitude),
            (error) => { 
                setLoading(false); 
                showNotify("يجب السماح بالوصول للموقع للمحاضرات الحضوريه", "error"); 
            }
        );
    }
  };

  const endLectureSession = async () => {
    if (currentLecture?.id) {
        try {
            await fetch("/api/lectures", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: currentLecture.id, status: "ENDED" })
            });
            showNotify("تم إغلاق باب التسجيل للمحاضرة 🔒");
        } catch (e) {
            console.error("Failed to close lecture");
        }
    }
    
    setCurrentLecture(null);
    setElectiveName("");
    localStorage.removeItem("activeLecture");
  };

  const handleCreateManualLecture = async (e: React.FormEvent) => { e.preventDefault(); if (!reportSubject) return; const subjectObj = subjects.find(s => s.id === reportSubject); let finalTopic = subjectObj?.name; const typeLabel = manualLectureForm.type === 'SECTION' ? '(سكشن)' : manualLectureForm.type === 'ONLINE' ? '(أونلاين)' : '(محاضرة)'; if (manualLectureForm.topic) finalTopic = manualLectureForm.topic; else finalTopic = `${finalTopic} ${typeLabel}`; try { const res = await fetch("/api/lectures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: finalTopic, type: manualLectureForm.type, subjectId: reportSubject, date: manualLectureForm.date }) }); if (res.ok) { showNotify("تم الإضافة ✅"); setShowManualLectureModal(false); updateReportData(); } } catch (e) { showNotify("خطأ", "error"); } };
  const handleUpdateLecture = async (e: React.FormEvent) => { e.preventDefault(); try { const res = await fetch("/api/lectures", { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(editLectureForm) }); if(res.ok) { showNotify("تم التعديل"); setShowEditLectureModal(false); updateReportData(); } } catch(e) { showNotify("خطأ", "error"); } };
  const handleDeleteStudent = async () => { if (!confirmModal.id) return; await fetch(`/api/students?id=${confirmModal.id}`, { method: "DELETE" }); showNotify("تم الحذف"); updateReportData(); setConfirmModal({ isOpen: false, type: null, id: null }); };
  const handleDeleteLecture = async () => { if (!confirmModal.id) return; await fetch(`/api/lectures?id=${confirmModal.id}`, { method: "DELETE" }); showNotify("تم الحذف"); updateReportData(); setConfirmModal({ isOpen: false, type: null, id: null }); };
  
  const handleSaveStudent = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    const method = isEditingStudent ? "PUT" : "POST"; 
    const payload: any = { ...studentForm };
    if (isEditingStudent && !payload.password) {
        delete payload.password;
    }
    try {
        const res = await fetch("/api/students", { 
            method, 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
        });
        if(res.ok) {
            setShowStudentModal(false); 
            updateReportData(); 
            showNotify(isEditingStudent ? "تم تعديل البيانات" : "تم إضافة الطالب");
        } else {
            showNotify("حدث خطأ", "error");
        }
    } catch (err) {
        showNotify("فشل الاتصال", "error");
    }
  };

  // 🔥🔥🔥 دوال إدارة المهام والأخبار (الجديدة) 🔥🔥🔥
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { showNotify("حجم الصورة كبير جداً (أقصى حد 2MB)", "error"); return; }
          const reader = new FileReader();
          reader.onloadend = () => setGlobalImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleCreateOrUpdateGlobal = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // التحقق من المدخلات
      if(!globalText.trim() && !globalImage) { 
          showNotify("يجب إضافة نص أو صورة", "error"); 
          return; 
      }
      
      const btn = document.getElementById("pub-btn") as HTMLButtonElement;
      if(btn) { btn.disabled = true; btn.innerText = "جاري..."; }

      const method = isEditingTask ? 'PUT' : 'POST';
      const body = {
          id: currentTaskId,
          title: globalText,
          type: 'GLOBAL',
          link: modalType === 'NEWS' ? (globalLink || null) : null, // اللينك للأخبار بس
          image: modalType === 'NEWS' ? (globalImage || null) : null, // الصورة للأخبار بس
          category: modalType // 🔥 NEWS or TASK
      };

      try {
          const res = await fetch('/api/tasks', { 
              method, 
              headers: {'Content-Type': 'application/json'}, 
              body: JSON.stringify(body) 
          });
          
          if(res.ok) {
              setGlobalText(""); setGlobalLink(""); setGlobalImage("");
              setShowGlobalModal(false); setIsEditingTask(false); setCurrentTaskId(null);
              fetchData(); 
              showNotify(isEditingTask ? "تم التعديل" : "تم النشر ✅");
          } else { 
              const err = await res.json();
              console.error(err);
              showNotify("حدث خطأ في الخادم", "error"); 
          }
      } catch (e) { showNotify("خطأ في الاتصال", "error"); } 
      finally { if(btn) { btn.disabled = false; btn.innerText = isEditingTask ? "حفظ" : "نشر"; } }
  };

  const handleDeleteGlobal = async () => {
      if(!confirmModal.id) return;
      try {
          await fetch(`/api/tasks?id=${confirmModal.id}&type=GLOBAL`, { method: 'DELETE' });
          setGlobalTasks(prev => prev.filter(t => t.id !== confirmModal.id));
          showNotify("تم الحذف بنجاح");
          setConfirmModal({ isOpen: false, type: null, id: null });
      } catch(e) { showNotify("خطأ في الحذف", "error"); }
  };

  // فتح المودال للإضافة
  const openNewModal = (type: 'NEWS' | 'TASK') => {
      setModalType(type);
      setGlobalText(""); setGlobalLink(""); setGlobalImage(""); 
      setIsEditingTask(false); setCurrentTaskId(null);
      setShowGlobalModal(true);
  };

  // فتح المودال للتعديل
  const openEditModal = (item: any) => {
      setModalType(item.category === 'TASK' ? 'TASK' : 'NEWS');
      setGlobalText(item.title);
      setGlobalLink(item.link || "");
      setGlobalImage(item.image || "");
      setCurrentTaskId(item.id);
      setIsEditingTask(true);
      setShowGlobalModal(true);
  };

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
  const toggleMenu = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setActiveMenuId(activeMenuId === id ? null : id); };

  // تقسيم البيانات للعرض
  const newsItems = globalTasks.filter(t => t.category !== 'TASK');
  const taskItems = globalTasks.filter(t => t.category === 'TASK');

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-right overflow-hidden" dir="rtl">
      
<style jsx global>{`
  @media print {
      @page { size: A4 landscape; margin: 5mm; }
      
      * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
      }

      aside, .no-print, button, .modal, .sidebar-overlay { display: none !important; }
      
      body, main, #__next, div { 
          overflow: visible !important; 
          height: auto !important;
          background-color: white !important;
      }

      #printable-area {
          display: block !important;
          width: 100% !important;
      }

      .page-break {
          page-break-after: always !important;
          break-after: page !important;
          display: block !important;
          margin-bottom: 20px !important;
      }

      .page-break:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
          margin-bottom: 0 !important;
      }

      /* تنسيق الجدول (الشبكة) */
      .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          border: 2px solid #000 !important;
      }

      /* حدود الخلايا */
      .print-table th, .print-table td {
          border: 1px solid #000 !important;
          padding: 2px !important;
          color: black !important;
          text-align: center !important;
      }
      
      /* محاذاة اسم الطالب */
      .print-table th:nth-child(2), .print-table td:nth-child(2) {
          text-align: right !important;
          padding-right: 8px !important;
      }

      /* ألوان الهيدر (أزرق) */
      .print-table th { 
          background-color: #dbeafe !important;
          color: #172554 !important;
          vertical-align: middle !important;
          height: 45px !important;
      }

      /* إلغاء أي خلفيات أو حدود داخلية للعناصر جوه الهيدر */
      .print-table th div, .print-table th span {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
      }

      /* تنسيق نص التاريخ */
      .print-table th span:last-child {
          font-weight: 800 !important;
          font-size: 11px !important;
          color: #172554 !important;
          margin-top: 2px !important;
      }
      
      /* الصفوف المخططة */
      .print-table tr:nth-child(even) td {
          background-color: #eff6ff !important;
      }
      
      .check-mark { color: #1e3a8a !important; font-weight: bold; }
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
`}</style>

      {notification && (<div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 no-print ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}<span className="font-bold">{notification.message}</span></div>)}
      
      <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 sidebar-overlay lg:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)}/>

      <aside className={`fixed top-0 right-0 h-full z-50 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col no-print lg:relative lg:z-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0 w-64" : "translate-x-full lg:w-20"}`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between min-h-[80px]">
            <h1 className={`text-xl font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 hidden lg:block lg:opacity-0 group-hover:opacity-100"}`}>Admin Panel</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded hidden lg:block"><ChevronRight className={sidebarOpen ? "rotate-180" : ""}/></button>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-700 rounded lg:hidden"><X/></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {[
                {id: "qr", icon: QrCode, label: "إنشاء QR"}, 
                {id: "report", icon: FileText, label: "دفاتر الغياب"}, 
                {id: "students", icon: Users, label: "الطلاب"},
                {id: "tasks", icon: Megaphone, label: "الأخبار والمهام"} // 🔥 التاب الجديد
            ].map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition whitespace-nowrap ${activeTab === item.id ? "bg-blue-600" : "hover:bg-slate-800"}`}><item.icon size={22} className="min-w-[22px]"/> <span className={`${!sidebarOpen && "lg:hidden"}`}>{item.label}</span></button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-700"><button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-slate-800 rounded-xl transition whitespace-nowrap overflow-hidden font-bold cursor-pointer"><LogOut size={22} className="min-w-[22px]"/> <span className={`${!sidebarOpen && "lg:hidden"}`}>خروج</span></button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50 print:h-auto print:overflow-visible">
        <div className="lg:hidden p-4 bg-white border-b flex justify-between items-center shadow-sm z-30 no-print flex-shrink-0"><h1 className="font-bold text-slate-800">Admin Panel</h1><button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24}/></button></div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full print:overflow-visible print:h-auto">
            {activeTab === "qr" && (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 mb-10 no-print">
                    <div className="p-6 md:p-8 lg:w-1/2 border-b lg:border-b-0 lg:border-l border-slate-100 flex flex-col justify-center">
                        {!currentLecture ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2"><BookOpen className="text-blue-600"/><h2 className="text-2xl font-bold">إعداد سيشن جديد</h2></div>
                                
                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">1. اختر الفصل الدراسي</label><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{["6", "7", "8"].map(term => (<button key={term} onClick={() => setSelectedTerm(term)} className={`flex-1 min-w-[80px] py-3 rounded-lg border font-bold transition text-sm ${selectedTerm === term ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white text-gray-500 hover:bg-gray-50"}`}>تيرم {term}</button>))}</div></div>
                                
                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">2. نوع السيشن</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setLectureType("PHYSICAL")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "PHYSICAL" ? "bg-blue-100 text-blue-700 border-blue-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>محاضرة</button><button onClick={() => setLectureType("SECTION")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "SECTION" ? "bg-purple-100 text-purple-700 border-purple-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>سكشن</button><button onClick={() => setLectureType("ONLINE")} className={`p-3 rounded-xl border text-sm font-bold transition ${lectureType === "ONLINE" ? "bg-green-100 text-green-700 border-green-500 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>أونلاين</button></div></div>
                                
                                {lectureType === "SECTION" && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">3. تحديد الشعب (للسكاشن)</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={()=>setSelectedDivisions([])} className={`px-4 py-2 rounded-lg border text-xs font-bold transition ${selectedDivisions.length === 0 ? "bg-slate-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>الكل</button>
                                            {["1", "2", "3", "4", "5", "6"].map(div => (
                                                <button key={div} onClick={()=>toggleDivision(div)} className={`w-10 h-10 rounded-lg border text-xs font-bold transition flex items-center justify-center ${selectedDivisions.includes(div) ? "bg-blue-600 text-white shadow-md border-blue-600" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                                    {div}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{selectedDivisions.length > 0 ? `سيتم قبول الحضور من الشعب: ${selectedDivisions.sort().join(" + ")} فقط` : "مسموح لجميع الشعب بالحضور"}</p>
                                    </div>
                                )}

                                <div><label className="text-xs font-bold text-gray-500 mb-2 block">4. اختر المقرر الدراسي</label><div className="relative"><select className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}><option value="">-- اختر المادة --</option>{filteredSubjectsQR.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}</select><div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight className="rotate-90" size={20}/></div></div>{lectureType === "SECTION" && filteredSubjectsQR.length === 0 && (<div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-bold border border-red-100"><AlertCircle size={18}/> لا توجد مواد عملية مسجلة لهذا الترم</div>)}</div>
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

            {activeTab === "report" && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden w-full mb-10 print:shadow-none print:border-none">
                    <div className="p-4 md:p-6 border-b flex flex-col xl:flex-row justify-between items-center gap-4 no-print bg-slate-50">
                        <div className="w-full xl:w-auto text-center xl:text-right">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center xl:justify-start gap-2"><FileText className="text-blue-600"/> دفاتر الغياب</h2>
                            <p className="text-xs font-bold text-emerald-600 flex items-center justify-center xl:justify-start gap-1 mt-1"><RefreshCw size={12} className="animate-spin"/> آخر تحديث: {lastUpdate}</p>
                        </div>
                        <div className="flex flex-col md:flex-row flex-wrap justify-center xl:justify-end gap-3 w-full xl:w-auto">
                            <select className="bg-gray-50 border rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer w-full md:w-auto" value={reportTerm} onChange={e => { setReportTerm(e.target.value); setReportSubject(""); }}><option value="6">تيرم 6</option><option value="7">تيرم 7</option><option value="8">تيرم 8</option></select>
                            
                            <select className="bg-orange-50 border-orange-200 text-orange-800 border rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer w-full md:w-auto" value={reportDivisionGroup} onChange={e => setReportDivisionGroup(e.target.value)}>
                                <option value="ALL">كل الشعب</option>
                                <option value="1-2">شعبة 1 & 2</option>
                                <option value="3-4">شعبة 3 & 4</option>
                                <option value="5-6">شعبة 5 & 6</option>
                            </select>

                            <select className="bg-gray-50 border rounded-lg px-3 py-2 text-sm font-bold outline-none w-full md:min-w-[200px] cursor-pointer" value={reportSubject} onChange={e => setReportSubject(e.target.value)}><option value="">-- اختر المادة --</option>{filteredSubjectsReport.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}</select>
                            <select className="bg-indigo-50 border-indigo-200 text-indigo-800 border rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer w-full md:w-auto" value={reportType} onChange={e => setReportType(e.target.value)}><option value="ALL">عرض الكل</option><option value="PHYSICAL">محاضرات نظرية</option><option value="SECTION">سكاشن عملية</option></select>
                            <div className="flex gap-2 w-full md:w-auto">
                                {reportSubject && (<button onClick={() => { setManualLectureForm({topic: "", date: new Date().toISOString().split('T')[0], type: reportType === "SECTION" ? "SECTION" : "PHYSICAL"}); setShowManualLectureModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 font-bold transition shadow-md w-full md:w-auto"><Plus size={18}/> <span className="md:hidden lg:inline">إضافة عمود</span></button>)}
                                <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 font-bold transition shadow-md w-full md:w-auto"><Printer size={18}/> <span className="md:hidden lg:inline">طباعة</span></button>
                            </div>
                        </div>
                    </div>

                    <div id="printable-area" className="p-4 md:p-8 min-h-[400px] print:p-0 print:overflow-visible">
                        {!reportSubject ? (
                            <div className="text-center py-20 text-gray-400 bg-white no-print"><Filter size={60} className="mx-auto mb-4 opacity-20"/><p className="text-xl font-bold opacity-50">يرجى اختيار المادة</p></div>
                        ) : filteredGroupedStudents.length === 0 ? (
                            <div className="text-center p-10 text-gray-400 font-bold bg-gray-50 rounded-2xl no-print">لا يوجد طلاب في هذه المجموعة</div>
                        ) : (
                            filteredGroupedStudents.map((group) => {
                                const ledgerTitle = reportType === "SECTION" ? "سجل حضور السكاشن العملية" : reportType === "PHYSICAL" ? "سجل حضور المحاضرات النظرية" : "سجل الحضور الشامل";
                                const groupLectures = allSubjectLectures.filter(lec => {
                                    if (!lec.allowedDivisions) return true;
                                    return lec.allowedDivisions.split(',').includes(String(group.division));
                                });

                                return (
                                    <div key={group.division} className="page-break w-full block clear-both mb-10 print:mb-0">
                                        <div className="pb-2 border-b-2 border-black mb-4">
                                            <h1 className="text-xl font-extrabold mb-1 text-center md:text-right">{ledgerTitle}</h1>
                                            <h2 className="text-lg font-bold mb-1 text-slate-700 text-center md:text-right">{subjects.find(s=>s.id === reportSubject)?.name}</h2>
                                            <div className="flex justify-between px-2 md:px-10 text-sm font-bold border-t border-black pt-1 mt-1"><span>الشعبة: {group.division}</span><span>الفصل الدراسي: {reportTerm}</span><span>عدد الجلسات المسجلة: {groupLectures.length}</span></div>
                                        </div>
                                        
                                        <div className="w-full pb-4 print:pb-0 overflow-x-auto print:overflow-visible">
                                            <table className="print-table w-full border-collapse border-slate-200" dir="rtl">
<thead>
    <tr className="bg-slate-100 print:bg-blue-100">
        <th className="border p-1 w-12 text-xs align-middle">رقم الكشف</th>
        <th className="border p-1 text-right w-48 min-w-[150px] align-middle">اسم الطالب</th>
        
        {Array.from({ length: 16 }).map((_, i) => {
            const lec = groupLectures[i];
            return (
                <th key={i} className="border p-0.5 w-10 align-middle group relative">
                    {lec ? (
                        <div className="flex flex-col items-center justify-center w-full h-full min-h-[35px]">
                            {/* أزرار التعديل (مخفية في الطباعة) */}
                            <div className="absolute top-0 right-0 left-0 flex justify-center -mt-2 no-print z-10">
                                <button onClick={(e) => toggleMenu(e, lec.id)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition"><MoreVertical size={14} /></button>
                                {activeMenuId === lec.id && (
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-gray-200 shadow-xl rounded-xl p-1 flex flex-col gap-1 min-w-[120px]">
                                        <button onClick={(e) => { e.stopPropagation(); setEditLectureForm({id: lec.id, topic: lec.topic, date: lec.date.split('T')[0]}); setShowEditLectureModal(true); setActiveMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={14}/> تعديل</button>
                                        <button onClick={(e) => { e.stopPropagation(); setConfirmModal({isOpen: true, type: 'LECTURE', id: lec.id}); setActiveMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><Trash2 size={14}/> حذف</button>
                                    </div>
                                )}
                            </div>

                            {/* نوع المحاضرة/الشعبة */}
                            <span className="text-[8px] font-bold text-gray-500 mb-0.5 no-print">
                                {lec.allowedDivisions ? `(ش${lec.allowedDivisions})` : '(عام)'}
                            </span>
                            
                            {/* 🔥 التاريخ (عربي ومسنتر) */}
                            <span className="text-[10px] font-bold text-center leading-none">
                                {new Date(lec.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })}
                            </span>
                        </div>
                    ) : <span className="block h-8"></span>}
                </th>
            );
        })}
    </tr>
</thead>
                                                <tbody>
                                                    {group.students.map((student: any) => (
                                                        <tr key={student.id} className="hover:bg-slate-50 print:leading-tight">
                                                            <td className="border p-1 text-center font-bold text-xs bg-slate-50">{student.classNumber || "-"}</td>
                                                            <td className="border p-1 text-right font-medium text-xs whitespace-nowrap px-2">{student.name}</td>
                                                            {Array.from({ length: 16 }).map((_, i) => {
                                                                const lec = groupLectures[i];
                                                                const isPresent = lec ? (student.attendance || []).some((a:any) => a.lectureId === lec.id) : false;
                                                                return (
                                                                    <td key={i} className={`border p-0.5 text-center font-bold text-sm cursor-pointer transition select-none ${isPresent ? 'bg-black text-white print:bg-transparent print:text-black' : ''}`} onClick={() => lec && toggleAttendance(student.id, lec.id, isPresent)}>{isPresent ? "✔" : ""}</td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-2 flex justify-between text-[10px] font-bold px-4">
                                            <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
                                            <p>توقيع عضو هيئة التدريس: .....................</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === "students" && (
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow border border-slate-200 mb-10 no-print">
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
                                                           <button onClick={(e)=>{ 
                                                               e.stopPropagation(); 
                                                               setStudentForm({ ...s, password: "" }); 
                                                               setIsEditingStudent(true); 
                                                               setShowStudentModal(true); 
                                                               setActiveMenuId(null); 
                                                           }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={14}/> تعديل</button>
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

            {/* 🔥🔥🔥🔥 صفحة إدارة الأخبار والمهام (الجديدة كلياً) 🔥🔥🔥🔥 */}
            {activeTab === "tasks" && (
                <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in no-print pb-10">
                    
                    {/* القسم الأيمن: الأخبار */}
                    <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Megaphone className="text-indigo-600"/> الأخبار (Ticker)</h2>
                            <button onClick={() => openNewModal('NEWS')} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-1 shadow-lg shadow-indigo-600/20"><Plus size={16}/> خبر جديد</button>
                        </div>
                        <div className="space-y-3">
                            {newsItems.length === 0 ? <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border border-dashed text-sm">لا توجد أخبار منشورة</p> : 
                                newsItems.map(item => (
                                    <div key={item.id} className="flex gap-3 p-3 border rounded-xl hover:bg-gray-50 group relative transition-all">
                                        {item.image ? <img src={item.image} alt="news" className="w-12 h-12 rounded-lg object-cover bg-gray-100" /> : <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-300"><Megaphone size={20}/></div>}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-800 truncate">{item.title}</p>
                                            {item.link && <p className="text-[10px] text-blue-500 truncate flex items-center gap-1"><LinkIcon size={10}/> {item.link}</p>}
                                            <p className="text-[9px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                                            <button onClick={() => openEditModal(item)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit size={12}/></button>
                                            <button onClick={() => setConfirmModal({isOpen: true, type: 'TASK', id: item.id})} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={12}/></button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* القسم الأيسر: المهام العامة */}
                    <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="text-emerald-600"/> مهام عامة (To-Do)</h2>
                            <button onClick={() => openNewModal('TASK')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-lg shadow-emerald-600/20"><Plus size={16}/> مهمة جديدة</button>
                        </div>
                        <div className="space-y-2">
                            {taskItems.length === 0 ? <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border border-dashed text-sm">لا توجد مهام عامة</p> : 
                                taskItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 group transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                                            <p className="font-bold text-sm text-gray-700">{item.title}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                                            <button onClick={() => openEditModal(item)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit size={14}/></button>
                                            <button onClick={() => setConfirmModal({isOpen: true, type: 'TASK', id: item.id})} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </div>
            )}

        </div>
      </main>

      {/* --- Modals --- */}
      {showGlobalModal && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm no-print">
              <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${modalType === 'NEWS' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{modalType === 'NEWS' ? <Megaphone size={24}/> : <ClipboardList size={24}/>}</div>
                          <h3 className="font-bold text-xl">{isEditingTask ? "تعديل" : "إضافة"} {modalType === 'NEWS' ? "خبر" : "مهمة عامة"}</h3>
                      </div>
                      <button onClick={()=>setShowGlobalModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                  </div>
                  <form onSubmit={handleCreateOrUpdateGlobal} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold block mb-1 text-gray-500">العنوان / النص</label>
                          <textarea 
                              className="w-full border p-3 rounded-xl min-h-[80px] outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
                              placeholder={modalType === 'NEWS' ? "اكتب تفاصيل الخبر..." : "اكتب نص المهمة..."}
                              value={globalText} 
                              onChange={e => setGlobalText(e.target.value)}
                          />
                      </div>
                      
                      {/* حقول إضافية للأخبار فقط */}
                      {modalType === 'NEWS' && (
                          <>
                            <div>
                                <label className="text-xs font-bold block mb-1 text-gray-500">رابط (اختياري)</label>
                                <input className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="https://..." value={globalLink} onChange={e => setGlobalLink(e.target.value)}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1 text-gray-500">صورة (اختياري)</label>
                                <div className="relative mb-2">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                    <div className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 p-3 rounded-xl hover:bg-gray-50 transition text-gray-500 text-xs font-bold cursor-pointer hover:border-indigo-400 hover:text-indigo-500"><Upload size={16}/><span>رفع صورة من الجهاز</span></div>
                                </div>
                                {globalImage && (
                                    <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                                        <img src={globalImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setGlobalImage("")} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition"><X size={12}/></button>
                                    </div>
                                )}
                            </div>
                          </>
                      )}

                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={()=>setShowGlobalModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition text-sm">إلغاء</button>
                          <button id="pub-btn" type="submit" className={`flex-1 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm shadow-lg ${modalType === 'NEWS' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                              {isEditingTask ? "حفظ التعديلات" : "نشر"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showManualLectureModal && (<div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm no-print"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in"><h3 className="font-bold text-xl mb-4">إضافة عمود يدوي</h3><form onSubmit={handleCreateManualLecture} className="space-y-4"><div><label className="text-sm font-bold block mb-1">نوع الجلسة</label><select className="w-full border p-2 rounded-xl" value={manualLectureForm.type} onChange={e=>setManualLectureForm({...manualLectureForm, type: e.target.value})}><option value="PHYSICAL">محاضرة</option><option value="SECTION">سكشن</option></select></div><div><label className="text-sm font-bold block mb-1">التاريخ</label><input type="date" className="w-full border p-2 rounded-xl" value={manualLectureForm.date} onChange={e=>setManualLectureForm({...manualLectureForm, date: e.target.value})}/></div><div><label className="text-sm font-bold block mb-1">عنوان مخصص (اختياري)</label><input placeholder="مثال: كويز 1" className="w-full border p-2 rounded-xl" value={manualLectureForm.topic} onChange={e=>setManualLectureForm({...manualLectureForm, topic: e.target.value})}/></div><div className="flex gap-2"><button type="button" onClick={()=>setShowManualLectureModal(false)} className="flex-1 bg-gray-100 py-2 rounded-xl">إلغاء</button><button className="flex-1 bg-blue-600 text-white py-2 rounded-xl">إضافة</button></div></form></div></div>)}
      {showEditLectureModal && (<div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm no-print"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in"><h3 className="font-bold text-xl mb-4">تعديل الجلسة</h3><form onSubmit={handleUpdateLecture} className="space-y-4"><div><label className="text-sm font-bold block mb-1">عنوان الجلسة</label><input className="w-full border p-2 rounded-xl" value={editLectureForm.topic} onChange={e=>setEditLectureForm({...editLectureForm, topic: e.target.value})}/></div><div><label className="text-sm font-bold block mb-1">التاريخ</label><input type="date" className="w-full border p-2 rounded-xl" value={editLectureForm.date} onChange={e=>setEditLectureForm({...editLectureForm, date: e.target.value})}/></div><div className="flex gap-2"><button type="button" onClick={()=>setShowEditLectureModal(false)} className="flex-1 bg-gray-100 py-2 rounded-xl">إلغاء</button><button className="flex-1 bg-blue-600 text-white py-2 rounded-xl">حفظ</button></div></form></div></div>)}
      {showStudentModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm no-print"><div className="bg-white p-8 rounded-3xl w-full max-w-md animate-in zoom-in duration-200 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-2xl text-slate-800">{isEditingStudent ? "تعديل" : "جديد"}</h3><button onClick={()=>setShowStudentModal(false)}><X size={20}/></button></div><form onSubmit={handleSaveStudent} className="space-y-4"><div><label className="text-sm font-bold text-gray-700">الاسم</label><input required className="w-full border p-3 rounded-xl" value={studentForm.name} onChange={e=>setStudentForm({...studentForm, name:e.target.value})}/></div><div className="flex gap-4"><div className="flex-1"><label className="text-sm font-bold">رقم الكشف</label><input required className="w-full border p-3 rounded-xl" value={studentForm.classNumber} onChange={e=>setStudentForm({...studentForm, classNumber:e.target.value})}/></div><div className="flex-1"><label className="text-sm font-bold">الشعبة</label><select required className="w-full border p-3 rounded-xl" value={studentForm.division} onChange={e=>setStudentForm({...studentForm, division:e.target.value})}><option value="">اختر</option> {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div><div><label className="text-sm font-bold">الايميل</label><input required className="w-full border p-3 rounded-xl" value={studentForm.email} onChange={e=>setStudentForm({...studentForm, email:e.target.value})}/></div><div><label className="text-sm font-bold">كلمة المرور</label><input required className="w-full border p-3 rounded-xl" value={studentForm.password} onChange={e=>setStudentForm({...studentForm, password:e.target.value})}/></div><button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold mt-2">حفظ</button></form></div></div>)}
      {confirmModal.isOpen && (<div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm no-print"><div className="bg-white rounded-3xl shadow-2xl p-6 w-[400px] animate-in zoom-in text-center"><h3 className="text-xl font-bold mb-2">{confirmModal.type === 'TASK' ? 'حذف العنصر' : confirmModal.type === 'STUDENT' ? 'حذف الطالب' : 'حذف المحاضرة'}</h3><div className="flex gap-3 mt-6"><button onClick={() => setConfirmModal({isOpen: false, type: null, id: null})} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">إلغاء</button><button onClick={confirmModal.type === 'TASK' ? handleDeleteGlobal : confirmModal.type === 'STUDENT' ? handleDeleteStudent : handleDeleteLecture} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">تأكيد الحذف</button></div></div></div>)}
    </div>
  );
}