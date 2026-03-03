"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Video, LogOut, UserCircle2, ShieldCheck } from "lucide-react";

export default function GuestLiveLecture() {
  const params = useParams();
  const router = useRouter();
  
  const lectureId = params?.id as string;
  const containerRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState("Guest");

  // 🔥🔥🔥 تم وضع مفاتيحك الخاصة هنا
  const appID = 448049879; 
  const serverSecret = "136c78dcaa7c22c6184c47d79dc3b77a"; 

  useEffect(() => {
    // 1. تحديد هوية الضيف
    let name = "Guest_" + Math.floor(Math.random() * 1000); 
    let userId = "guest_" + Date.now(); 

    // لو هو أصلاً مسجل دخول ودخل من رابط الضيف، نستخدم اسمه
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const u = JSON.parse(storedUser);
        name = u.name + " (Guest)";
        userId = u.id;
    }
    setUserName(name);

    // 2. تشغيل الفيديو
    const myMeeting = async (element: HTMLDivElement) => {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            lectureId, 
            userId, 
            name
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
            showScreenSharingButton: false, // الضيف ميعملش شير سكرين
            showUserList: true, 
            onLeaveRoom: () => router.push('/'),
        });
    };

    if(containerRef.current) {
        myMeeting(containerRef.current);
    }

  }, []);

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-hidden relative font-sans" dir="rtl">
        
        {/* خلفية جمالية */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

        {/* --- الشريط العلوي للضيوف --- */}
        <header className="absolute top-0 left-0 w-full z-50 p-4">
            <div className="max-w-[1920px] mx-auto bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-3 rounded-2xl flex justify-between items-center shadow-2xl">
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-3 border-l border-white/10 pl-4">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                            <span className="relative w-3 h-3 bg-red-500 rounded-full block border-2 border-zinc-900"></span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white leading-tight">بث مباشر</h1>
                            <p className="text-[10px] text-zinc-400 font-mono">وضع الضيف (Guest)</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 transition-all">
                        <ShieldCheck size={14}/>
                        مشاهدة فقط
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-white/5 mr-2">
                        <UserCircle2 size={16} className="text-zinc-400"/>
                        <span className="text-xs font-bold text-zinc-300">{userName}</span>
                    </div>

                    <button 
                        onClick={() => router.push('/')} 
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all hover:pr-5 group font-bold text-xs"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/>
                        <span className="hidden md:inline">مغادرة</span>
                    </button>
                </div>
            </div>
        </header>

        {/* --- منطقة الفيديو --- */}
        <main className="w-full h-full pt-[80px] pb-4 px-4 flex justify-center">
            <div className="w-full max-w-[1800px] h-full bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none z-20"></div>
                <div ref={containerRef} className="w-full h-full"></div>
            </div>
        </main>
    </div>
  );
}