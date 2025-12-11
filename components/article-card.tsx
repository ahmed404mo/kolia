import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Eye, MessageCircle, Share2 } from "lucide-react"
import Link from "next/link"

interface ArticleCardProps {
  id: string
  image: string
  category: string
  title: string
  excerpt: string
  author: string
  date: string
  views?: number
  comments?: number
  shares?: number
  featured?: boolean
  size?: "small" | "medium"
}

export function ArticleCard({
  id,
  image,
  category,
  title,
  excerpt,
  author,
  date,
  views = 0,
  comments = 0,
  shares = 0,
  featured = false,
  size = "medium",
}: ArticleCardProps) {
  const isSmall = size === "small"

  const formatNumber = (num: number) => {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    return String(num)
      .split("")
      .map((digit) => arabicNumerals[Number.parseInt(digit)])
      .join("")
  }

  return (
    <Link href={`/article/${id}`} className="group block h-full">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col border hover:border-accent/50 hover:scale-105 transform">
        {/* Image Container */}
        <div className={`relative overflow-hidden bg-muted ${isSmall ? "h-32 sm:h-40" : "h-48 sm:h-56"}`}>
          <img
            src={image || "/placeholder.svg?height=300&width=400&query=newspaper article"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground font-semibold">{category}</Badge>
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-destructive text-destructive-foreground">مختار</Badge>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3
            className={`font-bold text-foreground mb-2 group-hover:text-primary transition-colors ${
              isSmall ? "text-base sm:text-lg line-clamp-2" : "text-lg sm:text-xl line-clamp-3"
            }`}
          >
            {title}
          </h3>

          {/* Excerpt */}
          {!isSmall && <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{excerpt}</p>}

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground mb-3">
            <span>{author}</span>
            <span>{date}</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(views)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{formatNumber(comments)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
              <span>{formatNumber(shares)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
