import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time in minutes to hours and minutes
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

// Get difficulty bg color
export function getDifficultyBgColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-400/20';
    case 'medium':
      return 'bg-yellow-400/20';
    case 'hard':
      return 'bg-red-400/20';
    default:
      return 'bg-gray-400/20';
  }
}

// Calculate color for points visualization on heatmap
export function getPointsColor(points: number): string {
  if (points === 0) return '#1E1E2E'; // background color
  if (points < 20) return '#133742'; // low activity
  if (points < 40) return '#0F3460'; // medium activity
  if (points < 70) return '#5E1AB1'; // high activity
  return '#9400D3'; // very high activity
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(timestamp: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diff = timestamp.getTime() - now.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days < -30) {
    return new Intl.DateTimeFormat('en', { 
      month: 'short', 
      day: 'numeric' 
    }).format(timestamp);
  }
  
  if (days !== 0) {
    return rtf.format(days, 'day');
  }
  
  if (hours !== 0) {
    return rtf.format(hours, 'hour');
  }
  
  if (minutes !== 0) {
    return rtf.format(minutes, 'minute');
  }
  
  return rtf.format(seconds, 'second');
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}