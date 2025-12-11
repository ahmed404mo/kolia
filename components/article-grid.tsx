import { ArticleCard } from "./article-card"

const articles = [
  {
    id: "1",
    image: "/student-exam-results.jpg",
    category: "أكاديمي",
    title: "نتائج امتحانات الفصل الأول: تحسن ملحوظ في الأداء",
    excerpt: "أعلنت عمادة الشؤون الأكاديمية عن النتائج النهائية لامتحانات الفصل الأول...",
    author: "أ. فاطمة محمد",
    date: "١٠ ديسمبر",
    featured: true,
    views: 2345,
    comments: 145,
    shares: 89,
  },
  {
    id: "2",
    image: "/football-soccer-game.jpg",
    category: "رياضة",
    title: "كرة القدم: فوز فريق الجامعة في البطولة الإقليمية",
    excerpt: "حقق فريق كرة القدم بجامعتنا فوزاً مستحقاً أمام الفريق المنافس...",
    author: "أ. علي الأحمد",
    date: "٩ ديسمبر",
    views: 1987,
    comments: 234,
    shares: 156,
  },
  {
    id: "3",
    image: "/cultural-festival-diversity.jpg",
    category: "ثقافة",
    title: "مهرجان الثقافات: عرض طلابي متنوع من ٢٠ دولة",
    excerpt: "احتفلت الجامعة بتنوعها الثقافي من خلال مهرجان شامل يضم عروضاً...",
    author: "أ. رنا السويد",
    date: "٨ ديسمبر",
    views: 1654,
    comments: 189,
    shares: 120,
  },
  {
    id: "4",
    image: "/volunteer-community-service.jpg",
    category: "أخبار",
    title: "حملة التطوع: ١٠٠٠ طالب في خدمة المجتمع",
    excerpt: "انطلقت حملة التطوع الربيعية بمشاركة طلابية استثنائية لخدمة...",
    author: "أ. محمود سالم",
    date: "٧ ديسمبر",
    views: 1231,
    comments: 98,
    shares: 76,
  },
]

export function ArticleGrid() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">أحدث الأخبار</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} size={article.id === "1" ? "medium" : "small"} />
          ))}
        </div>
      </div>
    </section>
  )
}
