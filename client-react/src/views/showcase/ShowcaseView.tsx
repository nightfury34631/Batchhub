import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Dropdown } from '../../components/ui/Dropdown';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../services/apiClient';
import {
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  BookOpen,
  Search,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  Check,
  Megaphone,
} from 'lucide-react';

interface TaskRecord {
  id: number;
  title: string;
  course_code?: string;
  due_date: string;
  priority: string;
  is_completed?: number | boolean;
}

interface EventRecord {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  time?: string;
  location?: string;
}

interface NoticeRecord {
  id: number;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  is_pinned?: number | boolean;
  created_at?: string;
}

// Default fallback data for preview when unauthenticated
const FALLBACK_TASKS: TaskRecord[] = [
  { id: 1, title: 'CSE-3101: Algorithm Assignment 3 — Dynamic Programming', course_code: 'CSE-3101', due_date: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), priority: 'urgent', is_completed: false },
  { id: 2, title: 'CSE-3105: OS Midterm Review Problem Set', course_code: 'CSE-3105', due_date: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), priority: 'normal', is_completed: true },
  { id: 3, title: 'SWE-3109: Software Architecture Lab Report 2', course_code: 'SWE-3109', due_date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), priority: 'important', is_completed: false },
];

const FALLBACK_EVENTS: EventRecord[] = [
  { id: 1, title: 'Algorithmic Coding Contest 2026', event_date: '2026-11-10', time: '03:00 PM - 05:00 PM', location: 'Lab-3, CSE Building' },
  { id: 2, title: 'Operating Systems Midterm Review', event_date: '2026-11-14', time: '11:00 AM - 01:00 PM', location: 'Room 401' },
  { id: 3, title: 'Database Systems Architecture Demo', event_date: '2026-11-18', time: '02:00 PM - 04:00 PM', location: 'Lab-2, Annex' },
];

const FALLBACK_NOTICE: NoticeRecord = {
  id: 1,
  title: 'Final-Year Project Proposal Submission & Supervisor Defense',
  description: 'All student teams must finalize their project repository links and submit the 3-page proposal document before Friday midnight. No extensions will be granted by the department committee.',
  category: 'Academic',
  priority: 'urgent',
  is_pinned: 1,
  created_at: new Date().toISOString(),
};

export const ShowcaseView: React.FC = () => {
  const { user, token } = useAuthStore();
  const { success, error, warning, info } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('dashboard-preview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(10);

  // Local task state for fallback interactive completion
  const [localTasks, setLocalTasks] = useState<TaskRecord[]>(FALLBACK_TASKS);

  // 1. Live Task Query (Backend integration)
  const { data: serverTasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<{ tasks?: TaskRecord[] }>('/tasks'),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  // 2. Live Events Query
  const { data: serverEventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get<EventRecord[]>('/events'),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  // 3. Live Notices Query
  const { data: serverNoticesData } = useQuery({
    queryKey: ['notices'],
    queryFn: () => apiClient.get<NoticeRecord[]>('/notices'),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  // Active Tasks: use live server tasks if available, otherwise local state
  const activeTasks: TaskRecord[] = useMemo(() => {
    if (serverTasksData?.tasks && serverTasksData.tasks.length > 0) {
      return serverTasksData.tasks;
    }
    return localTasks;
  }, [serverTasksData, localTasks]);

  // Active Events: use live server events if available
  const activeEvents: EventRecord[] = useMemo(() => {
    if (Array.isArray(serverEventsData) && serverEventsData.length > 0) {
      return serverEventsData;
    }
    return FALLBACK_EVENTS;
  }, [serverEventsData]);

  // Pinned Notice: use live server notice if available
  const activeNotice: NoticeRecord = useMemo(() => {
    if (Array.isArray(serverNoticesData)) {
      const pinned = serverNoticesData.find((n) => n.is_pinned);
      if (pinned) return pinned;
      if (serverNoticesData.length > 0) return serverNoticesData[0];
    }
    return FALLBACK_NOTICE;
  }, [serverNoticesData]);

  // Task Completion Mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: number; isCompleted: boolean }) => {
      if (!token) {
        // Fallback toggle for demonstration
        setLocalTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, is_completed: !isCompleted } : t))
        );
        return { success: true };
      }
      if (isCompleted) {
        return apiClient.delete(`/tasks/${taskId}/complete`);
      } else {
        return apiClient.post(`/tasks/${taskId}/complete`);
      }
    },
    onSuccess: (_, variables) => {
      success(variables.isCompleted ? 'Task uncompleted' : 'Task marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      error('Failed to update task completion state.');
    },
  });

  const handleToggleTask = (task: TaskRecord) => {
    const isDone = Boolean(task.is_completed);
    toggleCompleteMutation.mutate({ taskId: task.id, isCompleted: isDone });
  };

  // Metric calculations
  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter((t) => Boolean(t.is_completed)).length;
  const overdueTasksCount = activeTasks.filter(
    (t) => !t.is_completed && new Date(t.due_date) < new Date()
  ).length;

  const showcaseTabs = [
    { id: 'dashboard-preview', label: 'Midnight Campus Dashboard', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'components', label: 'Design System Primitives', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <AppLayout title="Component Showcase">
      <div className="flex flex-col gap-6 pb-12 max-w-6xl mx-auto">
        {/* Top Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F353C]/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#00D084]">
                BatchHub 2.0
              </span>
              <span className="text-[#1F353C]">•</span>
              <span className="text-[12px] text-[#9BB2BC]">Midnight Campus Direction</span>
            </div>
            <h2 className="text-[20px] font-bold text-white tracking-tight">
              {activeTab === 'dashboard-preview' ? 'Cohort Flight Deck' : 'Component Showcase'}
            </h2>
          </div>

          <Tabs tabs={showcaseTabs} activeTab={activeTab} onChange={setActiveTab} size="sm" />
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MIDNIGHT CAMPUS DASHBOARD (REFINED & REAL BACKEND DATA INTEGRATED)  */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard-preview' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Unified Academic Hero Row (No empty space; student-focused) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left: Personalized Welcome & Workload Pace */}
              <div className="lg:col-span-8 bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="mint" size="xs" dot>
                      Autumn 2026
                    </Badge>
                    <span className="text-[12px] text-[#9BB2BC]">
                      Dept of Computer Science & Engineering
                    </span>
                  </div>
                  <h3 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight [text-wrap:balance]">
                    Welcome back, {user?.name || 'Nokib Rahman'}!
                  </h3>
                  <p className="text-[13.5px] text-[#9BB2BC] mt-1 [text-wrap:pretty]">
                    You have <strong className="text-white">{totalTasksCount - completedTasksCount} active coursework tasks</strong> remaining for your cohort this semester.
                  </p>
                </div>

                {/* Integrated Flight Deck Stat Strip */}
                <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#1F353C]/80">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                      Overdue
                    </span>
                    <span className={`text-[20px] font-bold ${overdueTasksCount > 0 ? 'text-[#F87171]' : 'text-white'}`}>
                      {overdueTasksCount}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                      Completed
                    </span>
                    <span className="text-[20px] font-bold text-[#00D084]">
                      {completedTasksCount} / {totalTasksCount}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                      Batch
                    </span>
                    <span className="text-[20px] font-bold text-white">
                      {user?.batch || '2024'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Academic Next Up / Routine Flight Deck (Replaces technical DB box) */}
              <div className="lg:col-span-4 bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#00D084]">
                      Next Academic Session
                    </span>
                    <Badge variant="info" size="xs">
                      Today
                    </Badge>
                  </div>
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    CSE-3101: Algorithm Theory
                  </h4>
                  <div className="flex items-center gap-2 text-[12.5px] text-[#9BB2BC] mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>02:30 PM - 04:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12.5px] text-[#9BB2BC] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Room 402, Academic Building 2</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1F353C]/80 flex items-center justify-between text-[12px]">
                  <span className="text-[#9BB2BC]">Prof. Dr. Mahfuzur Rahman</span>
                  <span className="text-[#00D084] font-medium font-mono">Lecture 14</span>
                </div>
              </div>
            </div>

            {/* Asymmetrical 2-Column Content: Calendar & Schedule on Left, Tasks & Notices on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (5 cols): Interactive Calendar & Filtered Events */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Event Calendar Card */}
                <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F353C]/60">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#00D084]" />
                      <h4 className="text-[15px] font-bold text-white">November 2026</h4>
                    </div>
                    <span className="text-[11.5px] text-[#9BB2BC]">Click day to filter</span>
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center select-none text-[12px]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-[#9BB2BC] font-semibold py-1">
                        {d}
                      </div>
                    ))}

                    {[
                      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
                      22, 23, 24, 25, 26, 27, 28, 29, 30,
                    ].map((day) => {
                      const isSelected = selectedCalendarDate === day;
                      const hasEvent = [10, 14, 18, 24].includes(day);

                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedCalendarDate(day);
                            info(`Filtered events for November ${day}, 2026`);
                          }}
                          className={`relative py-1.5 rounded-[9px] font-medium transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[#00D084] text-[#0B1316] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
                              : 'text-[#D2DFE5] hover:bg-[#192C34]'
                          }`}
                        >
                          <span>{day}</span>
                          {hasEvent && !isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Events List */}
                <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                    <h4 className="text-[15px] font-bold text-white [text-wrap:balance]">
                      Upcoming Cohort Events
                    </h4>
                    <button
                      onClick={() => info('Opening full events calendar...')}
                      className="text-[12px] text-[#00D084] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-[#1F353C]/60">
                    {activeEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="py-3 flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-[10px] bg-[#0E171B] border border-[#1F353C] flex flex-col items-center justify-center text-center shrink-0">
                            <span className="text-[11px] uppercase font-bold text-[#9BB2BC]">Nov</span>
                            <span className="text-[15px] font-bold text-[#00D084]">
                              {ev.event_date.split('-')[2] || '10'}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13.5px] font-semibold text-white group-hover:text-[#00D084] transition-colors truncate">
                              {ev.title}
                            </span>
                            <div className="flex items-center gap-3 text-[12px] text-[#9BB2BC] mt-0.5 truncate">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#38BDF8]" /> {ev.time || 'TBA'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#38BDF8]" /> {ev.location || 'Campus'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#9BB2BC] group-hover:text-white transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Active Deadlines & Pinned Announcements */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Active Tasks & Deadlines (Live completion toggle) */}
                <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                      <h4 className="text-[15px] font-bold text-white [text-wrap:balance]">
                        Course Deadlines & Tasks
                      </h4>
                    </div>
                    <Badge variant="mint" size="xs">
                      {completedTasksCount} of {totalTasksCount} Completed
                    </Badge>
                  </div>

                  <div className="flex flex-col divide-y divide-[#1F353C]/60">
                    {activeTasks.map((task) => {
                      const isDone = Boolean(task.is_completed);
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task)}
                          className="py-3 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all shrink-0 ${
                                isDone
                                  ? 'bg-[#00D084] border-[#00D084] text-[#0B1316]'
                                  : 'border-[#1F353C] group-hover:border-[#00D084]'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`text-[13.5px] font-medium transition-all truncate ${
                                  isDone
                                    ? 'line-through text-[#9BB2BC]'
                                    : 'text-white group-hover:text-[#00D084]'
                                }`}
                              >
                                {task.title}
                              </span>
                              <span className="text-[12px] text-[#9BB2BC] flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-[#38BDF8]" /> Due:{' '}
                                {new Date(task.due_date).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <Badge
                            size="xs"
                            variant={
                              task.priority === 'urgent'
                                ? 'danger'
                                : task.priority === 'important'
                                ? 'warning'
                                : 'neutral'
                            }
                            className="shrink-0 ml-3"
                          >
                            {task.priority?.toUpperCase()}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pinned Announcements Board */}
                <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#00D084]" />
                      <h4 className="text-[15px] font-bold text-white [text-wrap:balance]">
                        Pinned Batch Announcement
                      </h4>
                    </div>
                    <Badge variant="mint" size="xs">
                      CR Broadcast
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" size="xs">
                          {activeNotice.priority?.toUpperCase() || 'URGENT'}
                        </Badge>
                        <span className="text-[12px] text-[#9BB2BC]">
                          {activeNotice.category || 'Academic'}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-[#9BB2BC]">
                        {new Date(activeNotice.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="text-[15px] font-bold text-white [text-wrap:balance]">
                      {activeNotice.title}
                    </h5>

                    <p className="text-[13px] text-[#9BB2BC] leading-relaxed [text-wrap:pretty]">
                      {activeNotice.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#1F353C]/60 text-[12px]">
                      <span className="text-[#9BB2BC]">Department of Computer Science & Engineering</span>
                      <button
                        onClick={() => info('Opening full announcement discussion...')}
                        className="text-[#00D084] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Read Full Notice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPONENT LIBRARY (STRUCTURED, CONSTRAINED & COHESIVE)              */}
        {/* ========================================================================= */}
        {activeTab === 'components' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            {/* Row 1: Colors & Badges side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Color System */}
              <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-[16px] font-bold text-white tracking-tight">Midnight Color System</h4>
                  <p className="text-[13px] text-[#9BB2BC]">Deep obsidian slate with luminous mint accents</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0B1316] p-3.5 rounded-[12px] border border-[#1F353C] flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-[#9BB2BC]">Canvas</span>
                    <span className="text-[13px] font-bold text-white">#0B1316</span>
                  </div>
                  <div className="bg-[#15242A] p-3.5 rounded-[12px] border border-[#1F353C] flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-[#9BB2BC]">Card Surface</span>
                    <span className="text-[13px] font-bold text-white">#15242A</span>
                  </div>
                  <div className="bg-[#00D084] p-3.5 rounded-[12px] text-[#0B1316] flex flex-col gap-1">
                    <span className="text-[11px] font-mono font-bold">Luminous Mint</span>
                    <span className="text-[13px] font-extrabold">#00D084</span>
                  </div>
                  <div className="bg-[#1B2E36] p-3.5 rounded-[12px] border border-[#1F353C] flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-[#9BB2BC]">Elevated</span>
                    <span className="text-[13px] font-bold text-white">#1B2E36</span>
                  </div>
                  <div className="bg-[#0E171B] p-3.5 rounded-[12px] border border-[#1F353C] flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-[#9BB2BC]">Inset Field</span>
                    <span className="text-[13px] font-bold text-white">#0E171B</span>
                  </div>
                  <div className="bg-[#1F353C] p-3.5 rounded-[12px] flex flex-col gap-1 text-white">
                    <span className="text-[11px] font-mono text-[#9BB2BC]">Border</span>
                    <span className="text-[13px] font-bold">#1F353C</span>
                  </div>
                </div>
              </div>

              {/* Status Badges & Indicators */}
              <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-[16px] font-bold text-white tracking-tight">Status Indicators & Badges</h4>
                  <p className="text-[13px] text-[#9BB2BC]">Disciplined semantic labeling with status indicators</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Badge variant="mint" dot>
                    Active Semester
                  </Badge>
                  <Badge variant="info" dot>
                    Routine Class
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending CR Review
                  </Badge>
                  <Badge variant="danger" dot>
                    Overdue Deadline
                  </Badge>
                  <Badge variant="purple" dot>
                    Project Team
                  </Badge>
                  <Badge variant="neutral">General Notice</Badge>
                </div>
              </div>
            </div>

            {/* Row 2: Button System & Form Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Button System */}
              <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-[16px] font-bold text-white tracking-tight">Button Hierarchy</h4>
                  <p className="text-[13px] text-[#9BB2BC]">Tactile buttons with hover states and loading spinners</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button variant="primary" size="sm">Primary Mint</Button>
                  <Button variant="secondary" size="sm">Secondary Slate</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="danger" size="sm">Danger Alert</Button>
                  <Button variant="subtle" size="sm">Subtle Inset</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="primary" size="sm" isLoading>
                    Syncing
                  </Button>
                  <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Record
                  </Button>
                </div>
              </div>

              {/* Interactive Modals, Dropdowns & Toasts */}
              <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-[16px] font-bold text-white tracking-tight">Dialogs, Dropdowns & Feedback</h4>
                  <p className="text-[13px] text-[#9BB2BC]">Accessible modal overlays and reactive toast alerts</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                    Trigger Modal
                  </Button>

                  <Dropdown
                    trigger={<Button variant="secondary" size="sm">Options Menu ▾</Button>}
                    items={[
                      { id: '1', label: 'Download Syllabus', onClick: () => success('Downloading syllabus...') },
                      { id: '2', label: 'Copy Routine Link', onClick: () => info('Routine link copied!') },
                      { id: '3', label: 'Report Issue', danger: true, onClick: () => warning('Issue reported.') },
                    ]}
                  />

                  <div className="h-5 w-px bg-[#1F353C]" />

                  <Button variant="subtle" size="xs" onClick={() => success('Assignment submitted successfully!')}>
                    Success Toast
                  </Button>
                  <Button variant="subtle" size="xs" onClick={() => error('Unauthorized action blocked!')}>
                    Error Toast
                  </Button>
                  <Button variant="subtle" size="xs" onClick={() => warning('Routine room changed!')}>
                    Warning Toast
                  </Button>
                </div>
              </div>
            </div>

            {/* Row 3: Form Controls */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
              <div>
                <h4 className="text-[16px] font-bold text-white tracking-tight">Form Controls & Validation</h4>
                <p className="text-[13px] text-[#9BB2BC]">High-contrast recessed inputs with focus borders</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Course Code"
                  placeholder="e.g. CSE-3101"
                  leftElement={<Search className="w-4 h-4" />}
                  defaultValue="CSE-3101"
                />
                <Select
                  label="Priority Escalation"
                  options={[
                    { value: 'normal', label: 'Normal Priority' },
                    { value: 'important', label: 'Important Notice' },
                    { value: 'urgent', label: 'Urgent Deadline' },
                  ]}
                />
                <Input
                  label="Input with Error"
                  placeholder="name@university.edu"
                  defaultValue="invalid-student-id"
                  error="Please enter a valid student ID."
                />
              </div>

              <Textarea
                label="Task / Assignment Description"
                placeholder="Submission guidelines..."
                defaultValue="Submit the lab report in PDF format before the deadline. Include team member IDs and project repository link."
              />
            </div>

            {/* Row 4: Shimmer Skeletons & Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-6 flex flex-col gap-4">
                <div>
                  <h4 className="text-[16px] font-bold text-white tracking-tight">Shimmer Pulse Placeholders</h4>
                  <p className="text-[13px] text-[#9BB2BC]">Non-blocking skeletons during background query sync</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circle" className="w-9 h-9 shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <Skeleton variant="text" className="w-3/4" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                  </div>
                  <Skeleton variant="rect" className="h-14 w-full" />
                </div>
              </div>

              <EmptyState
                icon={<BookOpen className="w-5 h-5" />}
                title="No Pending Submissions"
                description="All coursework submissions have been reviewed by your Class Representatives."
                actionLabel="Upload Study Material"
                onAction={() => info('Opening submission modal...')}
              />
            </div>
          </div>
        )}

        {/* Accessible Modal Dialog */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Academic Deadline"
          description="Broadcast a new coursework deadline to your batch cohort."
        >
          <div className="flex flex-col gap-4">
            <Input label="Assignment Title" placeholder="e.g. Operating Systems Lab 4" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Course Code" placeholder="CSE-3105" />
              <Input label="Due Date" type="datetime-local" />
            </div>
            <Textarea label="Instructions" placeholder="Specific lab submission criteria..." />
            <div className="flex items-center justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  success('Deadline broadcasted to cohort!');
                }}
              >
                Publish Deadline
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
};
