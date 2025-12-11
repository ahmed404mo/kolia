"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, MessageCircle, Eye, Calendar, User } from "lucide-react"
import Link from "next/link"

// Mock article data
const articlesData: Record<string, any> = {
  "1": {
    id: 1,
    image: "/student-exam-results.jpg",
    category: "أكاديمي",
    title: "نتائج امتحانات الفصل الأول: تحسن ملحوظ في الأداء",
    excerpt: "أعلنت عمادة الشؤون الأكاديمية عن النتائج النهائية لامتحانات الفصل الأول مع تحسن ملحوظ في أداء الطلاب",
    author: "أ. فاطمة محمد",
    date: "١٠ ديسمبر ٢٠٢٤",
    views: 2345,
    comments: 145,
    shares: 89,
    likes: 234,
    content: `
      أعلنت عمادة الشؤون الأكاديمية بجامعتنا عن النتائج النهائية لامتحانات الفصل الأول، والتي أظهرت تحسناً ملحوظاً في أداء الطلاب مقارنة بالفصل السابق.

      وقال الدكتور محمود الشرقاوي، عميد الشؤون الأكاديمية: "هذا التحسن يعكس الجهود المستمرة من جانب الطلاب والأساتذة في تحسين العملية التعليمية، وكذلك الدعم الذي تقدمه الجامعة للطلاب من خلال مراكز الدعم والتعليم الإضافي."

      وأوضحت الإحصائيات الصادرة عن العمادة أن نسبة الطلاب الذين حصلوا على تقديرات امتياز ارتفعت بمعدل 12%، فيما انخفضت نسبة الطلاب الذين حصلوا على تقديرات ضعيفة بمعدل 8%.

      وشددت العمادة على أهمية استمرار هذا الجهد في الفصول القادمة، مؤكدة على توفير الدعم الكامل لجميع الطلاب الذين يحتاجون إلى مساعدة إضافية.
    `,
  },
  "2": {
    id: 2,
    image: "/football-soccer-game.jpg",
    category: "رياضة",
    title: "كرة القدم: فوز فريق الجامعة في البطولة الإقليمية",
    excerpt: "حقق فريق كرة القدم بجامعتنا فوزاً مستحقاً أمام الفريق المنافس في نصف النهائي",
    author: "أ. علي الأحمد",
    date: "٩ ديسمبر ٢٠٢٤",
    views: 1987,
    comments: 234,
    shares: 156,
    likes: 189,
    content: `
      حقق فريق كرة القدم الذكوري بجامعتنا فوزاً مستحقاً 3-1 على فريق جامعة المنافسة في مباراة نصف نهائي البطولة الإقليمية.

      كان اللاعب محمد حسن نجماً في المباراة حيث سجل هدفين رائعين في الشوط الأول، بينما أضاف علي السيد الهدف الثالث في الشوط الثاني.

      يتأهل الفريق بهذا الفوز إلى نهائي البطولة الذي سيلعبه في أسبوعين ضد فريق جامعة الشرقية.

      وقال مدرب الفريق أحمد عبد الحميد: "أنا فخور بأداء الفريق، وسنبذل كل جهدنا للفوز بالبطولة في المباراة النهائية."
    `,
  },
  "3": {
    id: 3,
    image: "/cultural-festival-diversity.jpg",
    category: "ثقافة",
    title: "مهرجان الثقافات: عرض طلابي متنوع من ٢٠ دولة",
    excerpt: "احتفلت الجامعة بتنوعها الثقافي من خلال مهرجان شامل يضم عروضاً من طلاب من جنسيات مختلفة",
    author: "أ. رنا السويد",
    date: "٨ ديسمبر ٢٠٢٤",
    views: 1654,
    comments: 189,
    shares: 120,
    likes: 156,
    content: `
      احتفلت الجامعة أمس بتنوعها الثقافي من خلال مهرجان ثقافات عالمي شارك فيه طلاب من أكثر من 20 دولة.

      قدم الطلاب عروضاً موسيقية وراقصة تقليدية من بلادهم، وعرضوا أيضاً أطباقاً شهية من مختلف دول العالم.

      وقالت رئيسة اللجنة المنظمة رنا محمود: "هذا المهرجان يعكس روح التسامح والتعايش السلمي التي تتمتع بها جامعتنا، ويساهم في بناء جسور من الفهم والاحترام بين الثقافات المختلفة."

      استقطب المهرجان حضور أكثر من 3000 زائر من طلاب الجامعة والمجتمع المحلي.
    `,
  },
  "4": {
    id: 4,
    image: "/volunteer-community-service.jpg",
    category: "أخبار",
    title: "حملة التطوع: ١٠٠٠ طالب في خدمة المجتمع",
    excerpt: "انطلقت حملة التطوع الربيعية بمشاركة طلابية استثنائية تجاوزت 1000 طالب لخدمة المجتمع",
    author: "أ. محمود سالم",
    date: "٧ ديسمبر ٢٠٢٤",
    views: 1231,
    comments: 98,
    shares: 76,
    likes: 112,
    content: `
      انطلقت حملة التطوع الربيعية لجامعتنا بمشاركة طلابية استثنائية تجاوزت 1000 طالب موزعين على مختلف المجالات.

      شارك الطلاب في عدة مجالات تطوعية من بينها تنظيف المناطق السكنية، وتوفير الدعم التعليمي للأطفال المحتاجين، والمساعدة في دور العجزة.

      وقال رئيس الجامعة: "هذا يعكس الروح الوطنية القوية لدى طلابنا والتزامهم تجاه المجتمع. نحن فخورون بهذا الإقبال الكبير على العمل التطوعي."

      ستستمر الحملة لمدة شهر كامل، مع تنظيم عدة فعاليات إضافية في مختلف أنحاء المدينة.
    `,
  },
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articlesData[params.id]
  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "محمد علي",
      date: "١٠ ديسمبر",
      text: "مقالة رائعة وشاملة، شكراً على المعلومات المفيدة",
      likes: 45,
    },
    {
      id: 2,
      author: "فاطمة أحمد",
      date: "١٠ ديسمبر",
      text: "متفق تماماً مع الرأي، نتطلع للمزيد من المقالات بهذا المستوى",
      likes: 32,
    },
    {
      id: 3,
      author: "علي محمود",
      date: "٩ ديسمبر",
      text: "معلومات قيمة جداً، شكراً على التغطية الشاملة",
      likes: 28,
    },
  ])

  const formatNumber = (num: number) => {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    return String(num)
      .split("")
      .map((digit) => arabicNumerals[Number.parseInt(digit)])
      .join("")
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "أنت",
        date: "الآن",
        text: commentText,
        likes: 0,
      }
      setComments([...comments, newComment])
      setCommentText("")
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">المقالة غير موجودة</h1>
          <Link href="/" className="text-primary hover:underline mt-4 block">
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">{article.category}</span>
        </nav>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-accent text-accent-foreground">{article.category}</Badge>
            <Badge variant="outline">مختار</Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">{article.title}</h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(article.views)} مشاهدة</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img src={article.image || "/placeholder.svg"} alt={article.title} className="w-full h-96 object-cover" />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              liked ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span>{formatNumber(article.likes + (liked ? 1 : 0))}</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
            <Share2 className="w-5 h-5" />
            <span>{formatNumber(article.shares)}</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
            <MessageCircle className="w-5 h-5" />
            <span>{formatNumber(article.comments)}</span>
          </button>
        </div>

        {/* Article Content */}
        <article className="prose prose-sm max-w-none mb-12 text-foreground leading-relaxed">
          {article.content.split("\n").map(
            (paragraph: string, idx: number) =>
              paragraph.trim() && (
                <p key={idx} className="mb-4 text-base">
                  {paragraph.trim()}
                </p>
              ),
          )}
        </article>

        {/* Comments Section */}
        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">التعليقات</h2>

          {/* Add Comment Form */}
          <Card className="p-6 mb-8 bg-muted/50 border-border">
            <h3 className="font-semibold text-foreground mb-4">أضف تعليقك</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
              className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            <Button
              onClick={handleAddComment}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              إرسال التعليق
            </Button>
          </Card>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-6 border-border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{comment.author}</h4>
                    <p className="text-sm text-muted-foreground">{comment.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{formatNumber(comment.likes)}</span>
                  </Button>
                </div>
                <p className="text-foreground leading-relaxed">{comment.text}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
