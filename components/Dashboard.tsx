
import React, { useMemo } from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { Calendar, CheckCircle2, AlertCircle, Sun, Layers, LayoutList } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onToggleComplete, onDelete, onToggleSubtask }) => {
  
  const { overdue, today, upcoming, completed, stats } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0)).getTime();
    const todayEnd = new Date(now.setHours(23,59,59,999)).getTime();

    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    // Sort helper: Priority (High>Med>Low) -> Date
    const sorter = (a: Task, b: Task) => {
      const pMap = { High: 0, Medium: 1, Low: 2 };
      if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    };

    tasks.forEach(t => {
      if (t.isCompleted) {
        completed.push(t);
        return;
      }

      const d = t.dueDate ? new Date(t.dueDate).getTime() : null;
      
      // If no date, put in upcoming/backlog unless High Priority
      if (!d) {
        if (t.priority === 'High') todayTasks.push(t); // Treat undated High priority as "Do Today"
        else upcoming.push(t);
        return;
      }

      if (d < todayStart) overdue.push(t);
      else if (d <= todayEnd) todayTasks.push(t);
      else upcoming.push(t);
    });

    // Calculate stats
    const totalActive = overdue.length + todayTasks.length;
    const totalDoneToday = completed.filter(t => {
        // Simple check: if a task is completed, we count it towards "Daily Velocity" if it was done recently or originally due today.
        // For simplicity in this app, we just count total completed tasks in the list vs total tasks.
        return true; 
    }).length;
    
    return {
      overdue: overdue.sort(sorter),
      today: todayTasks.sort(sorter),
      upcoming: upcoming.sort(sorter),
      completed: completed.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Newest completed first
      stats: {
        total: tasks.length,
        done: completed.length,
        percent: tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100)
      }
    };
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Velocity Header */}
      <div className="flex-shrink-0 mb-6 px-1">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">{greeting}.</h2>
                <p className="text-zinc-500 text-sm font-medium">You have <span className="text-zinc-200">{overdue.length + today.length} tasks</span> to focus on today.</p>
            </div>
            <div className="text-right">
                <span className="text-3xl font-bold text-zinc-200">{stats.percent}%</span>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-red-600 to-amber-600 transition-all duration-1000 ease-out"
                style={{ width: `${stats.percent}%` }}
            ></div>
        </div>
      </div>

      {/* 2. Scrollable Task Sections */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-8 custom-scrollbar">
        
        {/* SECTION: CRITICAL (Overdue) */}
        {overdue.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-2 mb-3 text-red-400">
                <AlertCircle size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Critical Attention</h3>
                <span className="bg-red-950/50 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-900/30">{overdue.length}</span>
             </div>
             <div className="space-y-3">
               {overdue.map(task => (
                 <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onToggleSubtask={onToggleSubtask} />
               ))}
             </div>
          </div>
        )}

        {/* SECTION: TODAY */}
        {(today.length > 0 || (overdue.length === 0 && upcoming.length === 0 && completed.length === 0)) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-2 mb-3 text-amber-400">
                <Sun size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Action Plan (Today)</h3>
                <span className="bg-amber-950/30 text-amber-500 text-xs px-2 py-0.5 rounded-full border border-amber-900/30">{today.length}</span>
             </div>
             {today.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-600 italic">
                    No active tasks for today. Enjoy the calm.
                </div>
             ) : (
                <div className="space-y-3">
                  {today.map(task => (
                    <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onToggleSubtask={onToggleSubtask} />
                  ))}
                </div>
             )}
          </div>
        )}

        {/* SECTION: UPCOMING */}
        {upcoming.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
            <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <Calendar size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">On The Horizon</h3>
                <span className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full border border-zinc-700">{upcoming.length}</span>
             </div>
             <div className="space-y-3 opacity-90">
               {upcoming.map(task => (
                 <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onToggleSubtask={onToggleSubtask} />
               ))}
             </div>
          </div>
        )}

        {/* SECTION: COMPLETED */}
        {completed.length > 0 && (
            <div className="pt-8 border-t border-zinc-900">
                <div className="flex items-center gap-2 mb-3 text-zinc-600">
                    <CheckCircle2 size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Recently Completed</h3>
                </div>
                <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                    {completed.slice(0, 5).map(task => ( // Only show last 5 completed to keep it clean
                        <TaskCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onToggleSubtask={onToggleSubtask} />
                    ))}
                    {completed.length > 5 && (
                        <div className="text-center text-xs text-zinc-700 py-2">
                            + {completed.length - 5} more completed tasks hidden
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
