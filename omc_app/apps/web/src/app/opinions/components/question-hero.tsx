'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, BookmarkPlus, Bookmark } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { OpinionDetail } from '../types/opinion-types';
import { formatAddress } from '../hooks/use-opinion-detail';
import { formatQuestion } from '@/lib/format-utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { SocialShareModal } from '@/components/ui/social-share-modal';
import { useState } from 'react';

const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'Technology': 'bg-blue-600 text-white',
    'AI & Robotics': 'bg-cyan-600 text-white',
    'Crypto & Web3': 'bg-orange-500 text-white',
    'DeFi': 'bg-yellow-500 text-white',
    'Gaming': 'bg-purple-600 text-white',
    'Social Media': 'bg-indigo-500 text-white',
    'Science': 'bg-indigo-600 text-white',
    'Environment & Climate': 'bg-green-600 text-white',
    'Business & Finance': 'bg-emerald-600 text-white',
    'Real Estate': 'bg-stone-600 text-white',
    'Career & Workplace': 'bg-teal-600 text-white',
    'Politics': 'bg-red-600 text-white',
    'Law & Legal': 'bg-slate-600 text-white',
    'News': 'bg-sky-600 text-white',
    'Sports': 'bg-yellow-600 text-white',
    'Automotive': 'bg-zinc-600 text-white',
    'Movies': 'bg-purple-700 text-white',
    'TV Shows': 'bg-violet-600 text-white',
    'Music': 'bg-pink-600 text-white',
    'Podcasts': 'bg-green-700 text-white',
    'Literature': 'bg-amber-700 text-white',
    'Art & Design': 'bg-fuchsia-600 text-white',
    'Photography': 'bg-sky-500 text-white',
    'Celebrities & Pop Culture': 'bg-rose-500 text-white',
    'Humor & Memes': 'bg-orange-400 text-white',
    'Fashion': 'bg-pink-500 text-white',
    'Beauty & Skincare': 'bg-rose-400 text-white',
    'Health & Fitness': 'bg-lime-600 text-white',
    'Food & Drink': 'bg-amber-500 text-white',
    'Travel': 'bg-cyan-500 text-white',
    'DIY & Home Improvement': 'bg-orange-600 text-white',
    'Pets & Animals': 'bg-amber-600 text-white',
    'History': 'bg-stone-500 text-white',
    'Philosophy': 'bg-purple-500 text-white',
    'Spirituality & Religion': 'bg-violet-500 text-white',
    'Education': 'bg-blue-500 text-white',
    'Relationships': 'bg-pink-400 text-white',
    'Parenting & Family': 'bg-lime-500 text-white',
    'True Crime': 'bg-red-700 text-white',
    'Adult (NSFW)': 'bg-red-900 text-white',
    'Other': 'bg-gray-600 text-white',
  };
  return colorMap[category] || 'bg-gray-600 text-white';
};

interface QuestionHeroProps {
  opinion: OpinionDetail;
}

export function QuestionHero({ opinion }: QuestionHeroProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { isWatched, toggleWatchlist } = useWatchlist();
  const isOpinionWatched = isWatched(opinion.id);

  const handleCategoryClick = (category: string) => {
    router.push(`/?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="space-y-3">
      {/* Top bar: categories + badges + actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-blue-400 text-xs font-medium bg-blue-600/10 px-2.5 py-1 rounded-md border border-blue-600/20">
            #{opinion.id}
          </span>
          {(opinion.categories?.length > 0 ? opinion.categories : ['Other']).map((category, index) => (
            <Badge
              key={index}
              onClick={() => handleCategoryClick(category)}
              className={`${getCategoryColor(category)} px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105`}
            >
              {category}
            </Badge>
          ))}
          {opinion.isActive ? (
            <Badge className="bg-emerald-600 text-white text-xs">Active</Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">Inactive</Badge>
          )}
          {Number(opinion.totalVolume) >= 100_000_000 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">Trending</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setIsShareModalOpen(true)}
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => toggleWatchlist({ id: opinion.id, question: opinion.question, nextPrice: opinion.nextPrice })}
            variant="ghost"
            size="sm"
            className={`h-8 px-2.5 ${isOpinionWatched ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {isOpinionWatched ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Question title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {formatQuestion(opinion.question)}
      </h1>

      {/* Meta line */}
      <div className="text-muted-foreground text-sm">
        Created by{' '}
        <span className="text-foreground font-medium">{formatAddress(opinion.creator)}</span>
      </div>

      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        opinion={opinion}
      />
    </div>
  );
}
