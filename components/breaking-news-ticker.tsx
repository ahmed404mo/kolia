"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

export function BreakingNewsTicker() {
  const newsItems = [
    "عاجل: افتتاح معرض الفنون الطلابي السنوي - مشاركة 250 طالب من 15 كلية",
    "عاجل: الجامعة تحصل على اعتراف دولي في مجال البحث العلمي",
    "عاجل: انطلاق برنامج منح دراسية جديد للطلاب المتفوقين",
    "عاجل: افتتاح مركز الابتكار والتكنولوجيا بجامعتنا",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-destructive text-destructive-foreground py-3 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Left Icon Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="h-5 w-5 animate-pulse" />
            <span className="font-bold text-sm uppercase whitespace-nowrap">عاجل</span>
          </div>

          {/* Scrolling News Container */}
          <div className="flex-1 overflow-hidden relative">
            <div className="relative h-6 flex items-center">
              {newsItems.map((item, index) => (
                <div
                  key={index}
                  className={`absolute whitespace-nowrap transition-all duration-700 ease-in-out ${
                    index === currentIndex
                      ? "opacity-100 translate-x-0"
                      : index < currentIndex
                        ? "opacity-0 -translate-x-full"
                        : "opacity-0 translate-x-full"
                  }`}
                >
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-destructive-foreground w-6"
                    : "bg-destructive-foreground/40 hover:bg-destructive-foreground/60"
                }`}
                aria-label={`خبر ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
