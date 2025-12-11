"use client"

import { useState } from "react"
import { X, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">("medium")
  const [notifications, setNotifications] = useState(true)

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">الإعدادات</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Settings content */}
        <div className="p-6 space-y-6">
          {/* Theme setting */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">الوضع</label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Sun className="h-4 w-4" />
                فاتح
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Moon className="h-4 w-4" />
                داكن
              </Button>
            </div>
          </div>

          {/* Text size setting */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">حجم الخط</label>
            <div className="flex gap-2">
              <Button
                variant={textSize === "small" ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize("small")}
                className="flex-1"
              >
                صغير
              </Button>
              <Button
                variant={textSize === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize("medium")}
                className="flex-1"
              >
                عادي
              </Button>
              <Button
                variant={textSize === "large" ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize("large")}
                className="flex-1"
              >
                كبير
              </Button>
            </div>
          </div>

          {/* Notifications setting */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">التنبيهات</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-1">تلقي إشعارات بآخر الأخبار</p>
          </div>

          {/* Close button */}
          <Button onClick={onClose} className="w-full">
            تم
          </Button>
        </div>
      </div>
    </div>
  )
}
