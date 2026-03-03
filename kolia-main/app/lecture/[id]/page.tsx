"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Users, Clock, MapPin, Wifi, AlertTriangle } from "lucide-react";

export default function LecturePage() {
  const params = useParams();
  const id = params.id as string;

  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // جلب المحاضرة
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const res = await fetch(`/api/lectures/${id}`);
        if (!res.ok) throw new Error();
        setLecture(await res.json());
      } catch (err) { setError("المحاضرة غير موجودة"); } finally { setLoading(false); }
    };
    if (id) fetchLecture();
  }, [id]);

  // تحديث عدد الحضور فقط (كل 5 ثواني)
  useEffect(() => {
    if (!lecture) return;
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`/api/lectures/${id}`);
            const data = await res.json();
            setLecture((prev: any) => ({ ...prev, _count: data._count }));
        } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [lecture?.id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-400">جاري التحميل...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 gap-2"><AlertTriangle/> {error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* خلفية */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black -z-10"></div>

      <div className="text-center mb-10 z-10">
        <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 mb-4 backdrop-blur-md">
            {lecture.type === "PHYSICAL" ? <MapPin className="text-blue-400" size={18}/> : <Wifi className="text-purple-400" size={18}/>}
            <span className="text-sm font-bold text-slate-300">
                {lecture.type === "PHYSICAL" ? "محاضرة في الكلية" : "محاضرة أونلاين"}
            </span>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">{lecture.topic}</h1>
        <p className="text-slate-400 text-xl">امسح الرمز لتسجيل الحضور</p>
      </div>

      {/* QR Code ثابت */}
      <div className="relative bg-white p-6 rounded-3xl shadow-2xl">
           <QRCodeSVG value={lecture.qrCode} size={350} level="H" />
      </div>

      {/* شريط المعلومات */}
      <div className="mt-16 flex gap-8">
        <div className="bg-slate-800/50 backdrop-blur p-5 rounded-2xl border border-slate-700 flex items-center gap-4 min-w-[200px]">
            <div className="bg-green-500/20 p-3 rounded-xl text-green-400"><Users size={32} /></div>
            <div>
                <p className="text-slate-400 text-sm">عدد الحضور</p>
                <p className="text-3xl font-bold">{lecture._count?.attendance || 0}</p>
            </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur p-5 rounded-2xl border border-slate-700 flex items-center gap-4 min-w-[200px]">
            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400"><Clock size={32} /></div>
            <div>
                <p className="text-slate-400 text-sm">التاريخ</p>
                <p className="text-xl font-bold">{new Date().toLocaleDateString('ar-EG')}</p>
            </div>
        </div>
      </div>
    </div>
  );
}