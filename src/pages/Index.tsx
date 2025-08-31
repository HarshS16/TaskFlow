import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import SimpleBackground from '@/components/SimpleBackground';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import StatsOverview from '@/components/StatsOverview';
import { Task, ViewMode } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoize stable values to prevent unnecessary re-renders
  const stableTasks = React.useMemo(() => tasks || [], [tasks]);
  const stableSearchQuery = React.useMemo(() => searchQuery || '', [searchQuery]);

  // Filter tasks based on search query - MUST be before any conditional returns
  const filteredTasks = React.useMemo(() => {
    if (!stableSearchQuery || !Array.isArray(stableTasks)) return stableTasks;
    
    const query = stableSearchQuery.toLowerCase();
    return stableTasks.filter(task => {
      if (!task || typeof task !== 'object') return false;
      try {
        return (
          (task.title && task.title.toLowerCase().includes(query)) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.category && task.category.toLowerCase().includes(query)) ||
          (Array.isArray(task.tags) && task.tags.some(tag => tag && tag.toLowerCase().includes(query)))
        );
      } catch (error) {
        console.error('Error filtering task:', error, task);
        return false;
      }
    });
  }, [stableTasks, stableSearchQuery]);

  // Load tasks from Supabase
  const loadTasks = React.useCallback(async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert Supabase data to our Task interface
      const convertedTasks: Task[] = data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: task.status === 'completed',
        priority: task.priority as Task['priority'],
        dueDate: task.due_date || undefined,
        category: task.category || undefined,
        tags: task.tags || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        completedAt: task.completed_at || undefined,
      })) || [];

      setTasks(Array.isArray(convertedTasks) ? convertedTasks : []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: error?.message || 'Failed to load tasks',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Handle user logout
  const handleLogout = React.useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setTasks([]);
      navigate('/auth');
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  const handleAddTask = React.useCallback(() => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  }, []);

  const handleEditTask = React.useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  }, []);

  const handleSubmitTask = React.useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            status: taskData.completed ? 'completed' : 'pending',
            priority: taskData.priority,
            due_date: taskData.dueDate,
            category: taskData.category,
            tags: taskData.tags,
            completed_at: taskData.completed ? new Date().toISOString() : null,
          })
          .eq('id', editingTask.id);

        if (error) throw error;

        setTasks(prev => prev.map(task => 
          task.id === editingTask.id 
            ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
            : task
        ));
        
        toast({
          title: "Task updated successfully!",
          description: `"${taskData.title}" has been updated.`
        });
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user!.id,
            title: taskData.title,
            description: taskData.description,
            status: taskData.completed ? 'completed' : 'pending',
            priority: taskData.priority,
            due_date: taskData.dueDate,
            category: taskData.category,
            tags: taskData.tags,
            completed_at: taskData.completed ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;

        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          completed: data.status === 'completed',
          priority: data.priority as Task['priority'],
          dueDate: data.due_date || undefined,
          category: data.category || undefined,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          completedAt: data.completed_at || undefined,
        };

        setTasks(prev => [newTask, ...prev]);
        toast({
          title: "Task created successfully!",
          description: `"${taskData.title}" has been added to your tasks.`
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [editingTask, user, toast]);

  const handleToggleComplete = React.useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const newStatus = task.completed ? 'pending' : 'completed';
      const completedAt = !task.completed ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed_at: completedAt,
        })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          const updatedTask = {
            ...t,
            completed: !t.completed,
            updatedAt: new Date().toISOString(),
            completedAt: !t.completed ? new Date().toISOString() : undefined
          };
          
          toast({
            title: updatedTask.completed ? "Task completed! 🎉" : "Task reopened",
            description: `"${t.title}" has been ${updatedTask.completed ? 'completed' : 'reopened'}.`
          });
          
          return updatedTask;
        }
        return t;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [tasks, toast]);

  const handleDeleteTask = React.useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been removed.`,
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [tasks, toast]);

  // Authentication state management
  useEffect(() => {
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          try {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              loadTasks();
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setIsLoading(false);
          }
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            loadTasks();
          } else {
            setIsLoading(false);
            navigate('/auth');
          }
        } catch (error) {
          console.error('Error checking session:', error);
          setIsLoading(false);
          navigate('/auth');
        }
      }).catch((error) => {
        console.error('Error getting session:', error);
        setIsLoading(false);
        navigate('/auth');
      });

      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up auth:', error);
      setIsLoading(false);
      navigate('/auth');
    }
  }, [navigate, loadTasks]);



  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <ErrorBoundary>
          <SimpleBackground />
        </ErrorBoundary>
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user || !session) {
    return null;
  }





  return (
    <div className="min-h-screen bg-background relative">
      <ErrorBoundary>
        <SimpleBackground />
      </ErrorBoundary>
      
      <Header 
        onAddTask={handleAddTask}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        user={user}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <StatsOverview tasks={tasks} />
        </motion.div>

        {/* Tasks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-16"
              >
                <div className="glass rounded-2xl p-12 text-center max-w-md">
                  <div className="animate-float text-6xl mb-4">
                    📝
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gradient">
                    {searchQuery ? 'No matching tasks' : 'No tasks yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first task to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddTask}
                      className="bg-gradient-primary text-primary-foreground px-6 py-3 rounded-lg shadow-glow hover:shadow-elevated transition-all duration-300"
                    >
                      Create First Task
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleSubmitTask}
        editingTask={editingTask}
      />
    </div>
  );
};

export default Index;
