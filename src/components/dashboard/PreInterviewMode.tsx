'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { INTERVIEW_TOPICS } from '@/lib/spacedRepetition';
import { Target } from 'lucide-react';

interface PreInterviewSettings {
  enabled: boolean;
  targetDate: number | null;
  intensity: 'normal' | 'intensive' | 'crash';
  selectedTopics: string[];
  problemsPerDay: number;
  daysUntilInterview: number | null;
}

export function PreInterviewMode({ username }: { username: string }) {
  const [settings, setSettings] = useState<PreInterviewSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [intensity, setIntensity] = useState<'normal' | 'intensive' | 'crash'>('normal');

  useEffect(() => {
    if (!username) return;

    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/preinterview?username=${encodeURIComponent(username)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          if (data.targetDate) {
            setTargetDate(new Date(data.targetDate).toISOString().split('T')[0]);
          }
          setIntensity(data.intensity || 'normal');
        }
      } catch (err) {
        console.error('Error fetching preinterview settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [username]);

  const handleEnable = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preinterview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          action: 'enable',
          targetDate: targetDate || null,
          intensity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error enabling preinterview mode:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preinterview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          action: 'disable',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setTargetDate('');
        setIntensity('normal');
      }
    } catch (err) {
      console.error('Error disabling preinterview mode:', err);
    } finally {
      setSaving(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'crash':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'intensive':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Pre-Interview Mode
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-800 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEnabled = settings?.enabled;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Pre-Interview Mode
        </CardTitle>
        {isEnabled && (
          <Badge className={getIntensityColor(settings?.intensity || 'normal')}>
            {settings?.intensity?.toUpperCase()}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isEnabled ? (
          <div className="space-y-4">
            {/* Countdown */}
            {settings?.daysUntilInterview !== null && settings?.daysUntilInterview !== undefined && (
              <div className="text-center py-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
                <div className="text-4xl font-bold text-white mb-1">
                  {settings.daysUntilInterview}
                </div>
                <div className="text-purple-400 text-sm">
                  days until interview
                </div>
              </div>
            )}

            {/* Active Settings */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Problems per day:</span>
                <span className="text-white">{settings?.problemsPerDay || 5}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Focus topics:</span>
                <span className="text-white">{settings?.selectedTopics?.length || 10}</span>
              </div>
            </div>

            {/* Topics */}
            <div>
              <p className="text-gray-400 text-xs mb-2">Focus topics:</p>
              <div className="flex flex-wrap gap-1">
                {settings?.selectedTopics?.slice(0, 6).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                    {topic}
                  </Badge>
                ))}
                {settings?.selectedTopics && settings.selectedTopics.length > 6 && (
                  <Badge variant="outline" className="text-xs bg-gray-500/10 border-gray-500/30 text-gray-400">
                    +{settings.selectedTopics.length - 6}
                  </Badge>
                )}
              </div>
            </div>

            {/* Disable Button */}
            <Button
              onClick={handleDisable}
              disabled={saving}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              {saving ? 'Disabling...' : 'Disable Pre-Interview Mode'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Intensify your practice schedule to prepare for upcoming interviews.
            </p>

            {/* Target Date */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Interview Date (optional)</label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="text-gray-400 text-xs mb-2 block">Intensity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'intensive', 'crash'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`p-2 rounded-lg border text-xs capitalize transition-colors ${
                      intensity === level
                        ? level === 'crash'
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : level === 'intensive'
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                            : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Enable Button */}
            <Button
              onClick={handleEnable}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? 'Enabling...' : 'Enable Pre-Interview Mode'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
