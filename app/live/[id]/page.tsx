"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Loader2, Wifi, ShieldCheck, Video } from "lucide-react"; 

export default function LiveLecture() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lectureId = params?.id as string;
  const isHost = searchParams.get("role") === "host";
  
  const [isLoading, setIsLoading] = useState(true); 
  const containerRef = useRef<HTMLDivElement>(null);

  // مفاتيح ZEGOCLOUD الخاصة بك
  const appID = 448049879; 
  const serverSecret = "136c78dcaa7c22c6184c47d79dc3b77a"; 

  useEffect(() => {
    const initMeeting = async () => {
        const studentData = localStorage.getItem("user");
        const hasAdminToken = document.cookie.includes("token=");
        const isDoctor = isHost || hasAdminToken;

        let userName = "Guest";
        let userId = "guest_" + Date.now();

        if (isDoctor) {
            userName = "Dr. Instructor 👨‍🏫";
            userId = "host_" + Date.now();
        } else if (studentData) {
            const student = JSON.parse(studentData);
            userName = student.name;
            userId = student.id;
            
            // تسجيل الحضور
            fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: student.id, lectureId: lectureId, status: "PRESENT" })
            }).catch(err => console.error(err));
        } else {
            router.push("/login");
            return;
        }

        if(containerRef.current) {
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, lectureId, userId, userName);
            const zp = ZegoUIKitPrebuilt.create(kitToken);
            
            zp.joinRoom({
                container: containerRef.current,
                sharedLinks: [], 
                scenario: {
                    mode: ZegoUIKitPrebuilt.VideoConference, 
                },
                
                // إعدادات الواجهة الاحترافية
                showPreJoinView: false,            // دخول مباشر بدون شاشة انتظار مكسورة
                turnOnMicrophoneWhenJoining: false, // المايك مقفول عند الدخول
                turnOnCameraWhenJoining: false,     // الكاميرا مقفولة عند الدخول
                showScreenSharingButton: isDoctor,  // الشير سكرين للدكتور فقط
                showUserList: true,                 // إظهار قائمة الأشخاص (مهمة لرفع الإيد)
                showChatInterface: true,            // إظهار الشات والتفاعلات
                showTextChat: true,
                showRoomTimer: true,
                layout: "Grid",                     // توزيع الصور بشكل شبكة منظم
                theme: "Dark",                      // الثيم الغامق الفخم

                // إعدادات الإشعارات (بتظهر لما حد يرفع إيده)
                lowerLeftNotification: {
                    showUserJoinAndLeave: true,
                    showTextChat: true,
                },

                onLeaveRoom: () => router.back(),
                onJoinRoom: () => setIsLoading(false)
            });
        }
    };
    initMeeting();
  }, [lectureId, isHost, router]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#0F1014] overflow-hidden z-50">
        
        {/* --- شاشة تحميل بريميوم --- */}
        {isLoading && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F1014] text-white">
                <div className="relative mb-8">
                    {/* تأثير التوهج الخلفي */}
                    <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full animate-pulse"></div>
                    
                    <div className="relative w-24 h-24 bg-zinc-900/50 rounded-3xl border border-white/10 flex items-center justify-center backdrop-blur-xl">
                        <Video size={40} className="text-blue-500 drop-shadow-lg" />
                        <div className="absolute inset-0 border-2 border-blue-500/30 rounded-3xl animate-ping opacity-20"></div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-2">قاعة كوليا التعليمية</h2>
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-[0.3em]">
                    <Wifi size={14} className="text-emerald-500 animate-pulse"/>
                    جاري تأمين البث
                </div>
                
                <div className="absolute bottom-10 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <ShieldCheck size={14} className="text-zinc-400"/>
                    <span className="text-[10px] text-zinc-400 tracking-widest uppercase">End-to-End Encrypted</span>
                </div>
            </div>
        )}

        {/* --- حاوية الفيديو (الديزاين الإجباري) --- */}
        <div 
            ref={containerRef} 
            className="w-full h-full zego-integrated-container"
        ></div>

        {/* --- CSS Overrides لإصلاح شكل الموبايل والتابلت --- */}
        <style jsx global>{`
            /* إخفاء اللوجو وأي عناصر زيادة */
            .Q8K55_J5h40_wL4_p9N, .zego-logo, [class*="branding"], .zego-top-bar { 
                display: none !important; 
            }

            /* تنظيم الفيديوهات لتكون Rounded واحترافية */
            .zego-video-frame, video {
                border-radius: 18px !important;
                background: #15171f !important;
                object-fit: cover !important;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3) !important;
            }

            /* تحسين شكل شريط التحكم السفلي */
            .ji5jASsz7DM2byNvld43, .zego-bottom-bar {
                background: rgba(15, 16, 20, 0.8) !important;
                backdrop-filter: blur(15px) !important;
                border-top: 1px solid rgba(255,255,255,0.05) !important;
                height: 80px !important;
                padding-bottom: env(safe-area-inset-bottom) !important;
            }

            /* تحسين شكل زر الخروج */
            .ZegoRoom_LeaveButton {
                background: #ef4444 !important;
                border-radius: 14px !important;
                font-weight: bold !important;
                padding: 10px 20px !important;
            }

            /* تخصيص الشات ليكون متناسق مع الموبايل */
            .zego-chat-list-container {
                background: #0F1014 !important;
                border-radius: 20px 0 0 20px !important;
            }
        `}</style>
    </div>
  );
}