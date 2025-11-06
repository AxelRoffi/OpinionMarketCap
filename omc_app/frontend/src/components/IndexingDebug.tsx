'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Database, Clock, Activity } from 'lucide-react';

interface IndexingDebugProps {
  stats?: {
    cachedOpinions: number;
    cachedEvents: number;
    oldestCache: number;
  };
  isVisible?: boolean;
}

export function IndexingDebug({ stats, isVisible = false }: IndexingDebugProps) {
  const [expanded, setExpanded] = useState(false);

  if (!isVisible || !stats) return null;

  const cacheAge = stats.oldestCache ? (Date.now() - stats.oldestCache) / 1000 : 0;

  return (
    <Card className="border border-emerald-500/20 bg-gray-900/50 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">
              Indexing: {stats.cachedOpinions} opinions, {stats.cachedEvents} events
            </span>
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {cacheAge < 60 ? 'Fresh' : `${Math.floor(cacheAge / 60)}m old`}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 p-0"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Cached Opinions:</span>
              <span className="text-emerald-400">{stats.cachedOpinions}</span>
            </div>
            <div className="flex justify-between">
              <span>Cached Events:</span>
              <span className="text-blue-400">{stats.cachedEvents}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Age:</span>
              <span className="text-yellow-400">{Math.floor(cacheAge)}s</span>
            </div>
            <div className="flex justify-between">
              <span>Webhook:</span>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}