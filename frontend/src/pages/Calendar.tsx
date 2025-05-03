import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useProblemStore, Problem } from '../store/problemStore';
import { getPointsColor, formatTime, getDifficultyColor } from '../lib/utils';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

// Simplified CalendarHeatmap for visual presentation
const CalendarHeatmap = ({ 
  dailyData, 
  startDate, 
  endDate, 
  onDayClick 
}: { 
  dailyData: { date: string; points: number; problems: Problem[] }[];
  startDate: Date;
  endDate: Date;
  onDayClick: (date: string, problems: Problem[]) => void;
}) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group days by week
  const weeks = [];
  let currentWeek = [];
  
  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  // Get data for a specific date
  const getDataForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyData.find(d => d.date === dateString) || { date: dateString, points: 0, problems: [] };
  };
  
  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      <div className="text-xs text-gray-400 text-center">Sun</div>
      <div className="text-xs text-gray-400 text-center">Mon</div>
      <div className="text-xs text-gray-400 text-center">Tue</div>
      <div className="text-xs text-gray-400 text-center">Wed</div>
      <div className="text-xs text-gray-400 text-center">Thu</div>
      <div className="text-xs text-gray-400 text-center">Fri</div>
      <div className="text-xs text-gray-400 text-center">Sat</div>
      
      {/* Calendar grid */}
      {weeks.flatMap((week) =>
        week.map((day) => {
          const dayData = getDataForDate(day);
          const hasActivity = dayData.points > 0;
          const isToday = isSameDay(day, new Date());
          
          return (
            <motion.div
              key={dayData.date}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDayClick(dayData.date, dayData.problems)}
              style={{ backgroundColor: getPointsColor(dayData.points) }}
              className={`
                aspect-square rounded-md flex items-center justify-center cursor-pointer relative
                ${hasActivity ? 'text-white' : 'text-gray-600'}
                ${isToday ? 'ring-2 ring-neon-cyan ring-offset-1 ring-offset-dark-300' : ''}
              `}
            >
              <span className="text-xs">{format(day, 'd')}</span>
              {hasActivity && (
                <span className="absolute bottom-1 right-1 text-[10px] font-bold">
                  {dayData.problems.length}
                </span>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};

const Calendar = () => {
  const { user } = useAuth();
  const { problems, fetchProblems } = useProblemStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyData, setDailyData] = useState<{ date: string; points: number; problems: Problem[] }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchProblems(user.uid);
    }
  }, [user, fetchProblems]);
  
  useEffect(() => {
    const data: Record<string, { points: number; problems: Problem[] }> = {};
    
    problems.forEach(problem => {
      const date = format(problem.solvedAt.toDate(), 'yyyy-MM-dd');
      
      if (!data[date]) {
        data[date] = { points: 0, problems: [] };
      }
      
      data[date].points += problem.points;
      data[date].problems.push(problem);
    });
    
    const formattedData = Object.entries(data).map(([date, value]) => ({
      date,
      points: value.points,
      problems: value.problems
    }));
    
    setDailyData(formattedData);
  }, [problems]);
  
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };
  
  const handleDayClick = (date: string, problems: Problem[]) => {
    setSelectedDate(date);
    setSelectedProblems(problems);
  };
  
  const closeDetails = () => {
    setSelectedDate(null);
    setSelectedProblems([]);
  };
  
  // Get the total points for the month
  const getMonthlyPoints = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return dailyData
      .filter(d => {
        const date = new Date(d.date);
        return date >= start && date <= end;
      })
      .reduce((sum, d) => sum + d.points, 0);
  };
  
  // Get the total problems for the month
  const getMonthlyProblemCount = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return dailyData
      .filter(d => {
        const date = new Date(d.date);
        return date >= start && date <= end;
      })
      .reduce((sum, d) => sum + d.problems.length, 0);
  };
  
  // Get the most active day of the month
  const getMostActiveDay = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const monthData = dailyData
      .filter(d => {
        const date = new Date(d.date);
        return date >= start && date <= end;
      });
      
    if (monthData.length === 0) return null;
    
    return monthData.reduce((max, day) => day.points > max.points ? day : max, monthData[0]);
  };
  
  const mostActiveDay = getMostActiveDay();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white font-mono">Activity Calendar</h2>
      
      {/* Calendar Controls */}
      <div className="glassmorphism rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8 border-gray-700"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <h3 className="text-lg font-medium text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 border-gray-700"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date())}
          className="border-gray-700"
        >
          <CalendarIcon size={16} className="mr-2" />
          Today
        </Button>
      </div>
      
      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glassmorphism rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-1">Total Problems</h4>
          <p className="text-2xl font-bold text-white">{getMonthlyProblemCount()}</p>
        </div>
        
        <div className="glassmorphism rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-1">Total Points</h4>
          <p className="text-2xl font-bold text-white">{getMonthlyPoints()}</p>
        </div>
        
        <div className="glassmorphism rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-1">Most Active Day</h4>
          {mostActiveDay ? (
            <p className="text-xl font-bold text-white">
              {format(new Date(mostActiveDay.date), 'MMM d')} 
              <span className="text-lg ml-2 text-neon-purple">({mostActiveDay.points} pts)</span>
            </p>
          ) : (
            <p className="text-xl text-gray-500">No activity</p>
          )}
        </div>
      </div>
      
      {/* Calendar Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism rounded-lg p-6"
      >
        <CalendarHeatmap
          dailyData={dailyData}
          startDate={startOfMonth(currentMonth)}
          endDate={endOfMonth(currentMonth)}
          onDayClick={handleDayClick}
        />
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-1.5"
              style={{ backgroundColor: getPointsColor(0) }}
            />
            <span className="text-xs text-gray-400">0 pts</span>
          </div>
          
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-1.5"
              style={{ backgroundColor: getPointsColor(15) }}
            />
            <span className="text-xs text-gray-400">1-20 pts</span>
          </div>
          
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-1.5"
              style={{ backgroundColor: getPointsColor(30) }}
            />
            <span className="text-xs text-gray-400">21-40 pts</span>
          </div>
          
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-1.5"
              style={{ backgroundColor: getPointsColor(60) }}
            />
            <span className="text-xs text-gray-400">41-70 pts</span>
          </div>
          
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-1.5"
              style={{ backgroundColor: getPointsColor(100) }}
            />
            <span className="text-xs text-gray-400">71+ pts</span>
          </div>
        </div>
      </motion.div>
      
      {/* Day Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={closeDetails}></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative glassmorphism rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800"
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={closeDetails}
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold mb-2 text-white font-mono">
              {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </h2>
            
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-gray-400">
                {selectedProblems.length} problem{selectedProblems.length !== 1 ? 's' : ''} solved
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-neon-purple font-semibold">
                {selectedProblems.reduce((sum, p) => sum + p.points, 0)} points earned
              </span>
            </div>
            
            {selectedProblems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No problems solved on this day
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProblems.map((problem) => (
                  <div 
                    key={problem.id} 
                    className="p-4 bg-dark-300/30 rounded-md border border-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-200">{problem.name}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-xs ${getDifficultyColor(problem.difficulty)} px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty).replace('text', 'bg').replace('400', '900/40')}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(problem.timeTaken)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {problem.tags.slice(0, 2).join(', ')}
                            {problem.tags.length > 2 ? '...' : ''}
                          </span>
                        </div>
                        
                        {problem.notes && (
                          <p className="text-sm text-gray-300 mt-2 border-l-2 border-gray-700 pl-3">
                            {problem.notes}
                          </p>
                        )}
                      </div>
                      
                      <span className="bg-primary/20 text-white px-3 py-1 rounded-md font-mono">
                        +{problem.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Calendar;