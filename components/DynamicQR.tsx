"use client";
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';

export default function DynamicQR({ lectureId }: { lectureId: string }) {
  const [qrData, setQrData] = useState("");
  const [timer, setTimer] = useState(10);

  // دالة توليد الكود الجديد
  const generateNewCode = () => {
    const data = {
      lectureId: lectureId,
      token: uuidv4(),      // رقم سري عشوائي
      generatedAt: Date.now() // وقت الإنشاء (عشان نكشف الغش)
    };
    
    setQrData(JSON.stringify(data));
    setTimer(10); // إعادة ضبط العداد
  };

  useEffect(() => {
    generateNewCode(); // أول ما يفتح

    // تغيير الكود كل 10 ثواني
    const interval = setInterval(generateNewCode, 10000);

    // عداد تنازلي للشكل الجمالي
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [lectureId]);

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-100 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">سجل حضورك الآن</h2>
      
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white p-4 rounded-lg border border-gray-100">
            {qrData && (
                <QRCodeSVG 
                    value={qrData} 
                    size={250}
                    level={"H"}
                    includeMargin={true}
                />
            )}
        </div>
      </div>

      <div className="mt-8 text-center w-full">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-2">
           <span>سيتم تحديث الرمز خلال</span>
        </div>
        
        {/* شريط التقدم (Timer Bar) */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                style={{ width: `${(timer / 10) * 100}%` }}
            ></div>
        </div>
        <p className="mt-2 text-blue-600 font-bold font-mono text-xl">{timer}s</p>
      </div>
    </div>
  );
}