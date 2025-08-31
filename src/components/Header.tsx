import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, Calendar, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onAddTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list' | 'calendar';
  onViewModeChange: (mode: 'grid' | 'list' | 'calendar') => void;
  user?: SupabaseUser | null;
  onLogout?: () => void;
}

export default function Header({
  onAddTask,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  user,
  onLogout
}: HeaderProps) {
  const viewIcons = {
    grid: Grid,
    list: List,
    calendar: Calendar
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass backdrop-blur-xl border-b border-glass-border/20 sticky top-0 z-50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white/80 rounded-sm"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">TaskFlow 3D</h1>
              <p className="text-sm text-muted-foreground">Next-gen task management</p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 max-w-md relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 glass border-glass-border/30 focus:border-primary/50 transition-all duration-300"
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 p-1 glass rounded-lg">
              {Object.entries(viewIcons).map(([mode, Icon]) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange(mode as any)}
                  className={`p-2 transition-all duration-300 ${
                    viewMode === mode 
                      ? 'bg-gradient-primary shadow-glow' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Filter Button */}
            <Button variant="outline" size="sm" className="glass border-glass-border/30">
              <Filter className="w-4 h-4" />
            </Button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-2 glass rounded-lg p-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground truncate max-w-24">
                  {user.email?.split('@')[0]}
                </span>
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="glass border-glass-border/30"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            {/* Add Task Button */}
            <Button
              onClick={onAddTask}
              className="bg-gradient-primary hover:scale-105 transform transition-all duration-300 shadow-glow hover:shadow-elevated"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}