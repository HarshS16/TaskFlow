import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Flag, MoreVertical, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  index: number;
}

const priorityColors = {
  low: 'bg-priority-low',
  medium: 'bg-priority-medium', 
  high: 'bg-priority-high',
  urgent: 'bg-priority-urgent'
};

const priorityGlows = {
  low: 'shadow-[0_0_20px_hsl(var(--priority-low)/0.3)]',
  medium: 'shadow-[0_0_20px_hsl(var(--priority-medium)/0.3)]',
  high: 'shadow-[0_0_20px_hsl(var(--priority-high)/0.3)]',
  urgent: 'shadow-[0_0_20px_hsl(var(--priority-urgent)/0.3)]'
};

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, index }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <Card className={`
        glass border-card-border/30 hover:border-primary/30 transition-all duration-300 
        hover-lift overflow-hidden relative
        ${task.completed ? 'opacity-75' : ''}
        ${priorityGlows[task.priority]}
      `}>
        {/* Priority Indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${priorityColors[task.priority]}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  className="mt-1 data-[state=checked]:bg-gradient-success"
                />
              </motion.div>
              
              <div className="flex-1">
                <h3 className={`
                  font-semibold text-lg mb-2 transition-all duration-300
                  ${task.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-card-foreground group-hover:text-gradient'
                  }
                `}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => onEdit(task)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Priority Badge */}
              <Badge variant="outline" className={`
                border-current capitalize transition-all duration-300
                ${priorityColors[task.priority]} text-white border-0
              `}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>

              {/* Category */}
              {task.category && (
                <Badge variant="secondary" className="glass">
                  {task.category}
                </Badge>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`
                flex items-center gap-1 text-xs
                ${isOverdue ? 'text-danger' : 'text-muted-foreground'}
              `}>
                {isOverdue ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.tags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs glass border-glass-border/20"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Completion Celebration Effect */}
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-gradient-success rounded-full p-2"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}