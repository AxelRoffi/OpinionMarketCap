import { Calendar, Clock, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";

// Mock blog posts - in production, these would come from a CMS or markdown files
const featuredPost = {
  id: "welcome-to-opinionmarketcap",
  title: "Welcome to OpinionMarketCap: The Future of Prediction Markets",
  excerpt: "Introducing a revolutionary prediction market platform built on Base blockchain, where your opinions become valuable digital assets.",
  content: `OpinionMarketCap represents a new paradigm in prediction markets, built on the robust Base blockchain infrastructure...`,
  author: "OpinionMarketCap Team",
  date: "2024-11-18",
  readTime: "5 min read",
  category: "Announcement",
  tags: ["Launch", "Platform", "Prediction Markets"],
  featured: true
};

const recentPosts = [
  {
    id: "understanding-pools",
    title: "Understanding Pool-Based Collective Opinion Trading",
    excerpt: "Learn how our innovative pool system allows communities to collectively fund and control opinion outcomes.",
    author: "Technical Team",
    date: "2024-11-15",
    readTime: "8 min read",
    category: "Tutorial"
  },
  {
    id: "base-blockchain-benefits",
    title: "Why We Built on Base: Technical Advantages",
    excerpt: "Exploring the benefits of Base blockchain for prediction markets: speed, cost-efficiency, and security.",
    author: "Development Team",
    date: "2024-11-12",
    readTime: "6 min read",
    category: "Technical"
  },
  {
    id: "testnet-launch",
    title: "Base Sepolia Testnet Now Live!",
    excerpt: "Our platform is now live on Base Sepolia testnet. Start trading opinions with test USDC.",
    author: "Product Team",
    date: "2024-11-10",
    readTime: "3 min read",
    category: "Update"
  }
];

export default function BlogHome() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          OpinionMarketCap Blog
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Latest news, updates, and insights from the world's most advanced prediction market platform
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-16">
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/20 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-2 mb-4">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-semibold">FEATURED</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 hover:text-emerald-400 transition-colors">
              <Link href={`/posts/${featuredPost.id}`}>
                {featuredPost.title}
              </Link>
            </h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {featuredPost.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{featuredPost.readTime}</span>
                </span>
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs">
                  {featuredPost.category}
                </span>
              </div>
              <Link 
                href={`/posts/${featuredPost.id}`}
                className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Read More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-8">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <article key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500 transition-colors group">
              <div className="p-6">
                <div className="mb-4">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  <Link href={`/posts/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                  <Link 
                    href={`/posts/${post.id}`}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="mt-16 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
        <p className="text-gray-300 mb-6">
          Get the latest updates on platform development, new features, and market insights.
        </p>
        <div className="flex max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
          />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-r-lg transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}