import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import {
  PreInterviewSettings,
  DEFAULT_PREINTERVIEW_SETTINGS,
  getDaysUntilInterview,
} from '@/lib/spacedRepetition';

const USER_PREINTERVIEW_KEY = (username: string) => `user:${username}:preinterview`;

/**
 * GET /api/preinterview?username=xxx
 * Get pre-interview mode settings
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const settings = await redis.get<PreInterviewSettings>(USER_PREINTERVIEW_KEY(username));
    
    const finalSettings = settings || DEFAULT_PREINTERVIEW_SETTINGS;
    const daysUntil = getDaysUntilInterview(finalSettings.targetDate);
    
    return NextResponse.json({
      ...finalSettings,
      daysUntilInterview: daysUntil,
    });
  } catch (error) {
    console.error('Error fetching preinterview settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * POST /api/preinterview
 * Enable or update pre-interview mode
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, action, targetDate, intensity, selectedTopics, problemsPerDay } = body;

    if (!username || !action) {
      return NextResponse.json(
        { error: 'Username and action are required' },
        { status: 400 }
      );
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    try {
      if (action === 'enable') {
        // Get existing settings or use defaults
        const existing = await redis.get<PreInterviewSettings>(USER_PREINTERVIEW_KEY(username));
        const settings: PreInterviewSettings = {
          enabled: true,
          targetDate: targetDate ? new Date(targetDate).getTime() : null,
          intensity: intensity || 'normal',
          selectedTopics: selectedTopics || DEFAULT_PREINTERVIEW_SETTINGS.selectedTopics,
          problemsPerDay: problemsPerDay || DEFAULT_PREINTERVIEW_SETTINGS.problemsPerDay,
        };

        await redis.set(USER_PREINTERVIEW_KEY(username), settings);
        
        const daysUntil = getDaysUntilInterview(settings.targetDate);
        
        return NextResponse.json({
          success: true,
          ...settings,
          daysUntilInterview: daysUntil,
          message: daysUntil !== null 
            ? `Pre-interview mode enabled! ${daysUntil} days until your interview.`
            : 'Pre-interview mode enabled! Set a target date for personalized schedule.',
        });
      } 
      else if (action === 'disable') {
        await redis.set(USER_PREINTERVIEW_KEY(username), DEFAULT_PREINTERVIEW_SETTINGS);
        
        return NextResponse.json({
          success: true,
          ...DEFAULT_PREINTERVIEW_SETTINGS,
          daysUntilInterview: null,
          message: 'Pre-interview mode disabled.',
        });
      }
      else if (action === 'update') {
        const existing = await redis.get<PreInterviewSettings>(USER_PREINTERVIEW_KEY(username));
        const currentSettings = existing || DEFAULT_PREINTERVIEW_SETTINGS;
        
        const updatedSettings: PreInterviewSettings = {
          ...currentSettings,
          targetDate: targetDate ? new Date(targetDate).getTime() : (currentSettings.targetDate || null),
          intensity: intensity || currentSettings.intensity,
          selectedTopics: selectedTopics || currentSettings.selectedTopics,
          problemsPerDay: problemsPerDay || currentSettings.problemsPerDay,
        };

        await redis.set(USER_PREINTERVIEW_KEY(username), updatedSettings);
        
        const daysUntil = getDaysUntilInterview(updatedSettings.targetDate);
        
        return NextResponse.json({
          success: true,
          ...updatedSettings,
          daysUntilInterview: daysUntil,
        });
      }
      else {
        return NextResponse.json(
          { error: 'Invalid action. Use "enable", "disable", or "update"' },
          { status: 400 }
        );
      }
    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in preinterview POST:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
