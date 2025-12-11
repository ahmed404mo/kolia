"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  category: string
  author: string
  date: string
}

const allArticles: SearchResult[] = [
  {
    id: "1",
    title: "نتائج امتحانات الفصل الأول: تحسن ملحوظ في الأداء",
    category: "أكاديمي",
    author: "أ. فاطمة محمد",
    date: "١٠ ديسمبر",
  },
  {
    id: "2",
    title: "كرة القدم: فوز فريق الجامعة في البطولة الإقليمية",
    category: "رياضة",
    author: "أ. علي الأحمد",
    date: "٩ ديسمبر",
  },
  {
    id: "3",
    title: "مهرجان الثقافات: عرض طلابي متنوع من ٢٠ دولة",
    category: "ثقافة",
    author: "أ. رنا السويد",
    date: "٨ ديسمبر",
  },
  {
    id: "4",
    title: "حملة التطوع: ١٠٠٠ طالب في خدمة المجتمع",
    category: "أخبار",
    author: "أ. محمود سالم",
    date: "٧ ديسمبر",
  },
]

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      const filtered = allArticles.filter(
        (article) =>
          article.title.includes(value) || article.category.includes(value) || article.author.includes(value),
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed top-0 right-0 left-0 bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن أخبار، فئات، أو كتاب..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result) => (
                  <Link key={result.id} href={`/article/${result.id}`} onClick={onClose}>
                    <div className="p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground line-clamp-2">{result.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">{result.category}</span>
                            <span>{result.author}</span>
                            <span>{result.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد نتائج للبحث "{query}"</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">ابدأ الكتابة للبحث عن أخبار</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
