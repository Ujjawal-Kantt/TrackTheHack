import { create } from 'zustand';
import { Problem } from './problemStore';
import { format, startOfWeek, endOfWeek, differenceInDays, addDays, startOfMonth, endOfMonth, getDay } from 'date-fns';

interface DailyPoints {
  date: string;
  count: number;
  points: number;
}

interface TopicDistribution {
  topic: string;
  count: number;
  percentage: number;
}

interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

export interface Stats {
  totalPoints: number;
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  dailyPoints: DailyPoints[];
  topicDistribution: TopicDistribution[];
  difficultyStats: DifficultyStats;
  weeklyPoints: number;
  weeklyGoalProgress: number; // percentage of the weekly goal achieved
  weeklyGoal: number; // target number of problems per week
}

interface StatsState {
  stats: Stats;
  calculateStats: (problems: Problem[]) => void;
  setWeeklyGoal: (goal: number) => void;
}

const DEFAULT_WEEKLY_GOAL = 10;

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    totalPoints: 0,
    totalProblems: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyPoints: [],
    topicDistribution: [],
    difficultyStats: { easy: 0, medium: 0, hard: 0 },
    weeklyPoints: 0,
    weeklyGoalProgress: 0,
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
  },

  calculateStats: (problems) => {
    if (!problems.length) return;

    // Calculate total points and problems
    const totalPoints = problems.reduce((sum, p) => sum + p.points, 0);
    const totalProblems = problems.length;

    // Calculate difficulty distribution
    const difficultyStats = {
      easy: problems.filter(p => p.difficulty === 'Easy').length,
      medium: problems.filter(p => p.difficulty === 'Medium').length,
      hard: problems.filter(p => p.difficulty === 'Hard').length,
    };

    // Calculate topic distribution
    const topicCounts: Record<string, number> = {};
    problems.forEach(problem => {
      problem.tags.forEach(tag => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    });

    const topicDistribution = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: (count / totalProblems) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 topics

    // Calculate daily activity
    const dailyPoints: Record<string, { count: number; points: number }> = {};
    
    // Initialize with last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = addDays(today, -i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dailyPoints[dateStr] = { count: 0, points: 0 };
    }

    // Fill in actual data
    problems.forEach(problem => {
      const date = format(problem.solvedAt.toDate(), 'yyyy-MM-dd');
      if (!dailyPoints[date]) {
        dailyPoints[date] = { count: 0, points: 0 };
      }
      dailyPoints[date].count += 1;
      dailyPoints[date].points += problem.points;
    });

    // Convert to array for easier consumption
    const dailyPointsArray = Object.entries(dailyPoints).map(([date, data]) => ({
      date,
      count: data.count,
      points: data.points,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    // Sort problems by date (newest first)
    const sortedProblems = [...problems].sort((a, b) => 
      b.solvedAt.toDate().getTime() - a.solvedAt.toDate().getTime()
    );

    // Calculate current streak
    const recentDates = new Set<string>();
    sortedProblems.forEach(problem => {
      recentDates.add(format(problem.solvedAt.toDate(), 'yyyy-MM-dd'));
    });

    // Check streak from today backwards
    let checkDate = new Date();
    while (recentDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }

    // Calculate longest streak
    sortedProblems.forEach(problem => {
      const currentDate = problem.solvedAt.toDate();
      
      if (!previousDate) {
        tempStreak = 1;
      } else {
        const diffDays = differenceInDays(previousDate, currentDate);
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      previousDate = currentDate;
    });

    // Calculate weekly points and progress
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weeklyProblems = problems.filter(problem => {
      const date = problem.solvedAt.toDate();
      return date >= weekStart && date <= weekEnd;
    });
    
    const weeklyPoints = weeklyProblems.reduce((sum, p) => sum + p.points, 0);
    const weeklyCount = weeklyProblems.length;
    const weeklyGoal = 10; // Target number of problems per week
    const weeklyGoalProgress = Math.min((weeklyCount / weeklyGoal) * 100, 100);

    set({
      stats: {
        totalPoints,
        totalProblems,
        currentStreak,
        longestStreak,
        dailyPoints: dailyPointsArray,
        topicDistribution,
        difficultyStats,
        weeklyPoints,
        weeklyGoalProgress,
        weeklyGoal,
      }
    });
  },

  setWeeklyGoal: (goal) => {
    set(state => ({
      stats: {
        ...state.stats,
        weeklyGoal: goal,
        weeklyGoalProgress: (state.stats.weeklyPoints / goal) * 100
      }
    }));
  }
}));