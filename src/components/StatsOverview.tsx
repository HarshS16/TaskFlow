import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Task } from '@/types/task';

interface StatsOverviewProps {
  tasks: Task[];
}

export default function StatsOverview({ tasks }: StatsOverviewProps) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(task => task && task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = safeTasks.filter(task => 
    task && 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    !task.completed
  ).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Calendar,
      color: 'primary',
      description: 'All tasks created'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'success',
      description: `${completionRate}% completion rate`
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: 'warning',
      description: 'Tasks in progress'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: TrendingUp,
      color: 'danger',
      description: 'Needs attention'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="glass border-card-border/30 hover:border-primary/30 transition-all duration-300 overflow-hidden relative group">
              {/* Gradient overlay */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300
                ${stat.color === 'primary' ? 'bg-gradient-primary' : ''}
                ${stat.color === 'success' ? 'bg-gradient-success' : ''}
                ${stat.color === 'warning' ? 'bg-gradient-to-r from-warning to-warning-glow' : ''}
                ${stat.color === 'danger' ? 'bg-gradient-to-r from-danger to-danger-glow' : ''}
              `} />
              
              <div className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <motion.p 
                      className="text-3xl font-bold"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.4 }}
                    className={`
                      p-3 rounded-lg transition-all duration-300 group-hover:scale-110
                      ${stat.color === 'primary' ? 'bg-primary/20 text-primary' : ''}
                      ${stat.color === 'success' ? 'bg-success/20 text-success' : ''}
                      ${stat.color === 'warning' ? 'bg-warning/20 text-warning' : ''}
                      ${stat.color === 'danger' ? 'bg-danger/20 text-danger' : ''}
                    `}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                </div>

                {/* Progress bar for completion rate */}
                {stat.title === 'Completed' && totalTasks > 0 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                    className="mt-4 h-2 bg-accent/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ delay: index * 0.1 + 0.8, duration: 1 }}
                      className="h-full bg-gradient-success rounded-full"
                    />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}