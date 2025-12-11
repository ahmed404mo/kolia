import { Header } from "@/components/header"
import { BreakingNewsTicker } from "@/components/breaking-news-ticker"
import { FeaturedArticle } from "@/components/featured-article"
import { ArticleGrid } from "@/components/article-grid"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
                        {/* Breaking News Ticker */}
                        <BreakingNewsTicker />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <FeaturedArticle />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles Grid - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <ArticleGrid />
          </div>

          {/* Sidebar - Takes 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
