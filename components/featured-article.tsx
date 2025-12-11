import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function FeaturedArticle() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Featured Article Card */}
        <article className="group bg-gradient-to-br from-primary to-primary/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Side */}
            <div className="h-80 md:h-96 bg-primary/50 relative overflow-hidden order-2 md:order-1">
              <img
                src="/---------------------.jpg"
                alt="صورة المقال الرئيسية"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-30"></div>
            </div>

            {/* Content Side */}
            <div className="bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-between order-1 md:order-2">
              <div>
                <div className="inline-block bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
                  أخبار الحرم الجامعي
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                  جديد البرامج الأكاديمية: إطلاق تخصص الذكاء الاصطناعي والبيانات الكبيرة
                </h2>
                <p className="text-base md:text-lg text-primary-foreground/90 mb-6 line-clamp-3">
                  تعلن الجامعة عن إطلاق برنامج أكاديمي متقدم يجمع بين الهندسة والعلوم الحاسوبية، مع فرص تدريب عملي مع
                  شركات تقنية رائدة.
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-primary-foreground/20">
                <div className="text-sm text-primary-foreground/80">
                  <p>د. محمود الحسني • ١٢ ديسمبر ٢٠٢٥</p>
                </div>
                <Button variant="secondary" size="sm" className="group/btn">
                  اقرأ المزيد
                  <ArrowLeft className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
