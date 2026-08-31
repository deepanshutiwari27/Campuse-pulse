import React, { useState } from 'react';
import { X, BookOpen, CheckSquare, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

interface WorkloadPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MicroTask {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
}

export const WorkloadPlannerModal: React.FC<WorkloadPlannerModalProps> = ({ isOpen, onClose }) => {
  const [assignmentName, setAssignmentName] = useState('Discrete Math Problem Set 4');
  const [tasks, setTasks] = useState<MicroTask[]>([
    { id: '1', title: 'Read Chapter 3.2 Proof techniques (skimming only)', minutes: 15, completed: true },
    { id: '2', title: 'Solve Question 1 (Base inductive step)', minutes: 20, completed: true },
    { id: '3', title: 'Outline Question 2 & 3 rough diagrams', minutes: 25, completed: false },
    { id: '4', title: 'Take a 10-minute water & eye rest break', minutes: 10, completed: false },
    { id: '5', title: 'Write clean submission draft for Question 4', minutes: 25, completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isOpen) return null;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      { id: 'task_' + Date.now(), title: newTaskTitle.trim(), minutes: 25, completed: false }
    ]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.completed ? 0 : t.minutes), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">25-Minute Workload De-Escalator</h3>
              <p className="text-[11px] font-mono text-slate-500">
                Segment complex assignments into actionable micro-sprints
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
          
          {/* Target Assignment */}
          <div>
            <label className="block font-bold text-slate-800 font-heading mb-1">
              Current Target Assignment
            </label>
            <input
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Progress Pill */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span className="font-bold text-slate-800 font-heading">
                {completedCount} of {tasks.length} mini-tasks finished
              </span>
            </div>
            <div className="text-slate-500 font-mono flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalMinutes} mins remaining</span>
            </div>
          </div>

          {/* Tasks Checklist */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 border flex items-center justify-between transition-colors ${
                  t.completed ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="font-medium text-xs">{t.title}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 border border-slate-200">
                    {t.minutes}m
                  </span>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Micro-Task */}
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add next 15-25 min micro-step..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 flex items-center space-x-1 shrink-0 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Step</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Rule: Take a 5-minute break every 50 minutes of continuous focus.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors"
          >
            Done Planning
          </button>
        </div>

      </div>
    </div>
  );
};
