import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Flag, Tag, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Task, TaskPriority } from '@/types/task';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTask?: Task;
}

export default function TaskForm({ isOpen, onClose, onSubmit, editingTask }: TaskFormProps) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || '');
  const [category, setCategory] = useState(editingTask?.category || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingTask?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: editingTask?.completed || false,
      priority,
      dueDate: dueDate || undefined,
      category: category.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      completedAt: editingTask?.completedAt
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setCategory('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="glass border-glass-border/30 max-w-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader>
                <DialogTitle className="text-gradient text-xl">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Title */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="glass border-glass-border/30 focus:border-primary/50"
                    required
                  />
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="glass border-glass-border/30 focus:border-primary/50 min-h-[100px]"
                  />
                </motion.div>

                {/* Priority & Due Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Priority
                    </label>
                    <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                      <SelectTrigger className="glass border-glass-border/30">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="glass border-glass-border/30">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Due Date */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="glass border-glass-border/30 focus:border-primary/50"
                    />
                  </motion.div>
                </div>

                {/* Category */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal, Shopping..."
                    className="glass border-glass-border/30 focus:border-primary/50"
                  />
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add tags..."
                      className="glass border-glass-border/30 focus:border-primary/50"
                    />
                    <Button 
                      type="button" 
                      onClick={addTag}
                      variant="outline"
                      className="glass border-glass-border/30"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <motion.div 
                      className="flex flex-wrap gap-2 mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Badge 
                            variant="secondary" 
                            className="glass cursor-pointer hover:bg-accent/70 transition-colors"
                            onClick={() => removeTag(tag)}
                          >
                            #{tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end gap-3 pt-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="glass border-glass-border/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-primary hover:scale-105 transform transition-all duration-300 shadow-glow"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}