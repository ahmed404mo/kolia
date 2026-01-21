"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 1. نتأكد هل فيه بيانات محفوظة في المتصفح؟
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // 2. لو مفيش بيانات -> روح سجل دخول
      router.push("/login");
    } else {
      // 3. لو فيه بيانات -> شوف هو مين ووجهه
      try {
        const user = JSON.parse(storedUser);
        
        if (user.role === "ADMIN") {
          router.push("/dashboard"); // لو دكتور
        } else {
          router.push("/student/dashboard"); // لو طالب
        }
      } catch (e) {
        // لو البيانات بايظة امسحها وروح سجل دخول
        localStorage.clear();
        router.push("/login");
      }
    }
  }, [router]);

  // 4. شاشة تحميل بسيطة لحد ما التوجيه يحصل
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4" dir="rtl">
      <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
      <h1 className="text-2xl font-bold">جاري التحقق من البيانات...</h1>
      <p className="text-slate-400">يرجى الانتظار لحظات</p>
    </div>
  );
}
// ووkmkmkn