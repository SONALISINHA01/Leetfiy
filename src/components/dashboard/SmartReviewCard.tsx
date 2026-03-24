'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ReviewData } from '@/lib/spacedRepetition';
import { Brain, Code2, Zap, Search, PlusCircle, PartyPopper, Square, Circle } from 'lucide-react';

interface SmartReviewCardProps {
  username: string;
  leetcodeUsername?: string;
  codeforcesUsername?: string;
}

interface SearchResult {
  problemId: string;
  problemTitle: string;
  difficulty: string;
  topic: string;
}

export function SmartReviewCard({ username, leetcodeUsername, codeforcesUsername }: SmartReviewCardProps) {
  const [platform, setPlatform] = useState<'leetcode' | 'cf'>('leetcode');
  const [dueProblems, setDueProblems] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingProblem, setAddingProblem] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [totalInQueue, setTotalInQueue] = useState(0);

  const currentUsername = platform === 'leetcode' ? leetcodeUsername : codeforcesUsername;

  useEffect(() => {
    if (!currentUsername) {
      setLoading(false);
      return;
    }

    const fetchDueProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/review/due?username=${encodeURIComponent(currentUsername)}&platform=${platform}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch due problems');
        }

        const data = await response.json();
        setDueProblems(data.dueProblems || []);
        setTotalInQueue(data.totalInQueue || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDueProblems();
  }, [currentUsername, platform]);

  // Search for problems
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setSearching(true);
      try {
        // Use platform-specific search API
        const searchEndpoint = platform === 'leetcode' 
          ? `/api/problems/search?q=${encodeURIComponent(searchQuery)}`
          : `/api/problems/search-cf?q=${encodeURIComponent(searchQuery)}`;
        
        const response = await fetch(searchEndpoint);
        const data = await response.json();
        setSearchResults(data.problems || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, platform]);

  // Add single problem to review queue
  const handleAddProblem = async (problem: SearchResult) => {
    if (!currentUsername) return;
    
    setAddingProblem(problem.problemId);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUsername,
          platform,
          problemId: problem.problemId,
          problemTitle: problem.problemTitle,
          topic: problem.topic,
          difficulty: problem.difficulty,
          quality: 4,
        }),
      });

      if (response.ok) {
        // Refresh due problems
        const dueResponse = await fetch(`/api/review/due?username=${encodeURIComponent(currentUsername)}&platform=${platform}`);
        const dueData = await dueResponse.json();
        setDueProblems(dueData.dueProblems || []);
        setTotalInQueue(dueData.totalInQueue || 0);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error adding problem:', err);
    } finally {
      setAddingProblem(null);
    }
  };

  // Bulk add from recent submissions
  const handleBulkAdd = async () => {
    if (!currentUsername) return;
    
    setBulkLoading(true);
    try {
      // Use GET method which auto-fetches from the platform
      const response = await fetch(`/api/review/bulk?username=${encodeURIComponent(currentUsername)}&platform=${platform}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh due problems
        const dueResponse = await fetch(`/api/review/due?username=${encodeURIComponent(currentUsername)}&platform=${platform}`);
        const dueData = await dueResponse.json();
        setDueProblems(dueData.dueProblems || []);
        setTotalInQueue(dueData.totalInQueue || 0);
      }
    } catch (err) {
      console.error('Error bulk adding problems:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTimeUntilDue = (nextReviewDate: number) => {
    const now = Date.now();
    const diff = nextReviewDate - now;
    
    if (diff <= 0) return 'Due now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return 'Due soon';
  };

  const handleMarkReviewed = async (problemId: string, quality: number = 4) => {
    if (!currentUsername) return;
    
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUsername,
          platform,
          problemId,
          problemTitle: dueProblems.find(p => p.problemId === problemId)?.problemTitle || '',
          topic: dueProblems.find(p => p.problemId === problemId)?.topic || '',
          difficulty: dueProblems.find(p => p.problemId === problemId)?.difficulty || 'Medium',
          quality,
        }),
      });

      if (response.ok) {
        // Remove from local state
        setDueProblems(prev => prev.filter(p => p.problemId !== problemId));
        setTotalInQueue(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking problem as reviewed:', err);
    }
  };

  if (!leetcodeUsername && !codeforcesUsername) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Smart Review
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm text-center py-4">
            Connect your LeetCode or Codeforces username to start smart review
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Smart Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Platform Tabs */}
        <Tabs value={platform} onValueChange={(v) => setPlatform(v as 'leetcode' | 'cf')} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger 
              value="leetcode" 
              disabled={!leetcodeUsername}
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Code2 className="w-4 h-4 mr-2 text-cyan-400" />
              LeetCode
            </TabsTrigger>
            <TabsTrigger 
              value="cf" 
              disabled={!codeforcesUsername}
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              <Circle className="w-4 h-4 mr-2 text-orange-400" />
              Codeforces
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!currentUsername ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">
              {platform === 'leetcode' 
                ? "No LeetCode username connected" 
                : "No Codeforces username connected"}
            </p>
          </div>
        ) : (
          <>
            {/* PART 1: ADD PROBLEMS */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-green-400" />
                Add Problems to Queue
              </h3>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  onClick={handleBulkAdd}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? 'Adding...' : <><Zap className="w-4 h-4 mr-1" /> Auto-Add Recent</>}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </Button>
              </div>

              {/* Search Section - Only for LeetCode */}
              {showSearch && platform === 'leetcode' && (
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Input
                    placeholder="Search LeetCode problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white mb-2"
                  />
                  {searching && (
                    <p className="text-gray-500 text-xs text-center">Searching...</p>
                  )}
                  {searchResults.length > 0 && (
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {searchResults.map((problem) => (
                          <div
                            key={problem.problemId}
                            className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{problem.problemTitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                                  {problem.difficulty}
                                </Badge>
                                <span className="text-gray-500 text-xs">{problem.topic}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="ml-2 bg-green-600 hover:bg-green-700 h-7"
                              onClick={() => handleAddProblem(problem)}
                              disabled={addingProblem === problem.problemId}
                            >
                              {addingProblem === problem.problemId ? '...' : '+ Add'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              {platform === 'cf' && (
                <p className="text-xs text-gray-500 mt-2">
                  Codeforces: Uses auto-add from your recent submissions
                </p>
              )}
            </div>

            <Separator className="my-4 bg-gray-700" />

            {/* PART 2: REVIEW QUEUE */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Square className="w-4 h-4 text-amber-400" />
                Review Queue 
                {totalInQueue > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-auto">
                    {dueProblems.length} due / {totalInQueue} total
                  </Badge>
                )}
              </h3>

              {/* Due Problems List */}
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-800 rounded-md"></div>
                  <div className="h-16 bg-gray-800 rounded-md"></div>
                </div>
              ) : error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : dueProblems.length === 0 ? (
                <div className="text-center py-6">
                  <PartyPopper className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <p className="text-gray-400 text-sm">
                    {totalInQueue > 0 
                      ? "No problems due today!" 
                      : "No problems in queue"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {totalInQueue === 0 
                      ? "Add problems to start reviewing" 
                      : "Check back later for more"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-3">
                    {dueProblems.slice(0, 5).map((problem) => (
                      <div
                        key={problem.problemId}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {problem.problemTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </Badge>
                              <span className="text-gray-500 text-xs">
                                {problem.topic}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-amber-400 text-xs">
                              {getTimeUntilDue(problem.nextReviewDate)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                onClick={() => handleMarkReviewed(problem.problemId, 4)}
                              >
                                Got it
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleMarkReviewed(problem.problemId, 2)}
                              >
                                Struggle
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dueProblems.length > 5 && (
                      <p className="text-gray-500 text-xs text-center pt-2">
                        +{dueProblems.length - 5} more problems due
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
