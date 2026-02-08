'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
  Trophy,
  Medal,
  Award,
  ChevronUp,
  ChevronDown,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuestions } from '@/hooks';
import { CATEGORIES } from '@/lib/contracts';
import { formatUSDC, shortenAddress } from '@/lib/utils';

type RankingType = 'volume' | 'shares' | 'questions' | 'positions';
type SortDirection = 'asc' | 'desc';

interface LeaderboardUser {
  address: string;
  questionsCreated: number;
  totalVolume: number;
  positionsHeld: number;
  sharesValue: number;
  rank: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { questions, isLoading } = useQuestions();

  const [category, setCategory] = useState<string>('all');
  const [rankingType, setRankingType] = useState<RankingType>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate leaderboard data from questions
  const { users, stats } = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        users: [],
        stats: { totalUsers: 0, totalVolume: 0, totalQuestions: 0, totalPositions: 0 },
      };
    }

    // Filter by category if selected
    const filteredQuestions = category === 'all'
      ? questions
      : questions.filter(q => q.category === category);

    // Aggregate user data from questions
    const userMap = new Map<string, {
      address: string;
      questionsCreated: number;
      totalVolume: number;
      positionsHeld: number;
      sharesValue: number;
    }>();

    let totalVolume = 0;
    let totalPositions = 0;

    filteredQuestions.forEach((question) => {
      const creator = question.creator.toLowerCase();
      const volume = Number(question.totalVolume) / 1e6;

      totalVolume += volume;

      // Track creator
      if (!userMap.has(creator)) {
        userMap.set(creator, {
          address: creator,
          questionsCreated: 0,
          totalVolume: 0,
          positionsHeld: 0,
          sharesValue: 0,
        });
      }

      const userData = userMap.get(creator)!;
      userData.questionsCreated += 1;
      userData.totalVolume += volume;
    });

    // Convert to array and sort
    const usersArray: LeaderboardUser[] = Array.from(userMap.values()).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Sort based on ranking type
    usersArray.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (rankingType) {
        case 'shares':
          aVal = a.sharesValue;
          bVal = b.sharesValue;
          break;
        case 'questions':
          aVal = a.questionsCreated;
          bVal = b.questionsCreated;
          break;
        case 'positions':
          aVal = a.positionsHeld;
          bVal = b.positionsHeld;
          break;
        case 'volume':
        default:
          aVal = a.totalVolume;
          bVal = b.totalVolume;
          break;
      }

      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Update ranks
    usersArray.forEach((user, index) => {
      user.rank = index + 1;
    });

    return {
      users: usersArray,
      stats: {
        totalUsers: usersArray.length,
        totalVolume,
        totalQuestions: filteredQuestions.length,
        totalPositions,
      },
    };
  }, [questions, category, rankingType, sortDirection]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankRowClass = (rank: number, address: string): string => {
    const isCurrentUser = connectedAddress?.toLowerCase() === address.toLowerCase();

    if (isCurrentUser) {
      return 'bg-emerald-500/10 border-l-4 border-emerald-500';
    }

    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-l-4 border-yellow-500';
      case 2:
        return 'bg-gray-500/10 border-l-4 border-gray-400';
      case 3:
        return 'bg-orange-500/10 border-l-4 border-orange-500';
      default:
        return 'hover:bg-muted/50';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const SortableHeader = ({ field, children }: { field: RankingType; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={() => {
        if (rankingType === field) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setRankingType(field);
          setSortDirection('desc');
        }
      }}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {rankingType === field && (
          sortDirection === 'desc'
            ? <ChevronDown className="w-3 h-3" />
            : <ChevronUp className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top performers on OpinionMarketCap
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-xl font-bold">{formatNumber(stats.totalUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-xl font-bold">${formatNumber(stats.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{formatNumber(stats.totalQuestions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Live</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Real-time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rank by:</span>
          <Select value={rankingType} onValueChange={(v) => setRankingType(v as RankingType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Volume
                </div>
              </SelectItem>
              <SelectItem value="questions">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Questions
                </div>
              </SelectItem>
              <SelectItem value="positions">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Positions
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card variant="glass">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground">
                Start trading to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <SortableHeader field="questions">Questions</SortableHeader>
                    <SortableHeader field="volume">Volume</SortableHeader>
                    <SortableHeader field="positions">Positions</SortableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr
                      key={user.address}
                      className={`${getRankRowClass(user.rank, user.address)} cursor-pointer transition-colors`}
                      onClick={() => router.push(`/profile/${user.address}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRankIcon(user.rank)}
                          <span className="text-sm font-medium">#{user.rank}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {shortenAddress(user.address)}
                          </span>
                          {connectedAddress?.toLowerCase() === user.address.toLowerCase() && (
                            <span className="text-xs text-emerald-500">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.questionsCreated}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                        ${formatNumber(user.totalVolume)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.positionsHeld}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
