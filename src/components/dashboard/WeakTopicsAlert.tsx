'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeakTopic } from '@/lib/spacedRepetition';
import { Trophy } from 'lucide-react';

interface WeakTopicsAlertProps {
  username: string;
}

export function WeakTopicsAlert({ username }: WeakTopicsAlertProps) {
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchWeakTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/review/weak-topics?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weak topics');
        }

        const data = await response.json();
        setWeakTopics(data.weakTopics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWeakTopics();
  }, [username]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-400';
    if (rate >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuccessRateBg = (rate: number) => {
    if (rate >= 0.7) return 'bg-green-500';
    if (rate >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation.includes('Focus')) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    if (recommendation.includes('Review')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (recommendation.includes('Refresh')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">⚠️ Topics to Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-800 rounded-md"></div>
            <div className="h-16 bg-gray-800 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">⚠️ Topics to Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          ⚠️ Topics to Focus
        </CardTitle>
        {weakTopics.length > 0 && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            {weakTopics.length} needs work
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {weakTopics.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-gray-400 text-sm">
              No weak topics identified yet!
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Keep practicing to get personalized recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {weakTopics.slice(0, 4).map((topic) => (
              <div
                key={topic.topic}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-white text-sm font-medium">{topic.topic}</p>
                    <p className="text-gray-500 text-xs">
                      {topic.totalAttempts} attempts • {topic.successfulAttempts} successful
                    </p>
                  </div>
                  <Badge className={`text-xs ${getRecommendationBadge(topic.recommendation)}`}>
                    {topic.recommendation}
                  </Badge>
                </div>
                
                {/* Success Rate Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Success Rate</span>
                    <span className={getSuccessRateColor(topic.successRate)}>
                      {Math.round(topic.successRate * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={topic.successRate * 100} 
                    className="h-2 bg-gray-700"
                    indicatorClassName={getSuccessRateBg(topic.successRate)}
                  />
                </div>

                {/* Gap Info */}
                {topic.averageGap > 0 && (
                  <p className="text-gray-500 text-xs mt-2">
                    Avg. gap: {Math.round(topic.averageGap)} days
                    {topic.averageGap > 14 && ' ⚠️ Too long!'}
                  </p>
                )}
              </div>
            ))}

            {weakTopics.length > 4 && (
              <p className="text-gray-500 text-xs text-center pt-2">
                +{weakTopics.length - 4} more topics need attention
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
