import { Card } from "@/components/ui/card"
import { Eye, TrendingUp, Calendar, AlertCircle } from "lucide-react"

export function Sidebar() {
  const mostRead = [
    {
      id: 1,
      title: "منحة دراسية جديدة للطلاب المتفوقين",
      image: "/scholarship-award.jpg",
      views: "٢,٣٤٥",
      comments: 234,
    },
    {
      id: 2,
      title: "إعادة جدولة العطلة الشتوية",
      image: "/winter-break-calendar.jpg",
      views: "١,٩٨٧",
      comments: 156,
    },
    {
      id: 3,
      title: "معرض الوظائف الربيعي ٢٠٢٦",
      image: "/job-fair-careers.jpg",
      views: "١,٦٥٤",
      comments: 89,
    },
    {
      id: 4,
      title: "تحديثات منصة التعليم الإلكتروني",
      image: "/online-learning-platform.png",
      views: "١,٢٣١",
      comments: 67,
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "ندوة: أخلاقيات الذكاء الاصطناعي",
      date: "١٥ ديسمبر",
      time: "٣:٠٠ م",
      image: "/ai-ethics-seminar.jpg",
    },
    {
      id: 2,
      title: "ورشة عمل: تطوير المهارات المهنية",
      date: "١٧ ديسمبر",
      time: "٤:٣٠ م",
      image: "/professional-skills-workshop.jpg",
    },
    {
      id: 3,
      title: "معرض الابتكار الطلابي",
      date: "٢٠ ديسمبر",
      time: "١٠:٠٠ ص",
      image: "/student-innovation-expo.jpg",
    },
  ]

  return (
    <aside className="space-y-6">
      {/* Most Read Section */}
      <Card className="p-6 bg-card border-2 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">الأكثر قراءة</h3>
          </div>
          <div className="h-1 w-8 bg-accent rounded-full"></div>
        </div>

        <div className="space-y-4">
          {mostRead.map((item, index) => (
            <a
              key={item.id}
              href="#"
              className="group flex items-start gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0 hover:opacity-80 transition-opacity"
            >
              <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <span className="absolute bottom-1 right-1 text-xs font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
                  {index + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{item.views}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{item.comments}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Upcoming Events Section */}
      <Card className="p-6 bg-card border-2 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">الفعاليات القادمة</h3>
          </div>
          <div className="h-1 w-8 bg-accent rounded-full"></div>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <a
              key={event.id}
              href="#"
              className="group block p-3 rounded-lg bg-muted/50 hover:bg-muted hover:border-l-2 hover:border-accent transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Newsletter Subscription */}
      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold mb-2">الاشتراك في النشرة البريدية</h3>
        <p className="text-sm text-primary-foreground/80 mb-4">احصل على أحدث الأخبار مباشرة في صندوق بريدك كل صباح</p>
        <input
          type="email"
          placeholder="بريدك الإلكتروني"
          className="w-full px-3 py-2 rounded-lg bg-primary-foreground text-primary text-sm placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-accent mb-3 transition-all"
        />
        <button className="w-full px-3 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 active:scale-95 transition-all">
          اشترك الآن
        </button>
      </Card>
    </aside>
  )
}
