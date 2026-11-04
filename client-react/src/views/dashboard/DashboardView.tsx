import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Pin,
  Check,
  Megaphone,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../services/apiClient';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

interface Task {
  id: number;
  title: string;
  course_code?: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  is_completed?: number | boolean;
  description?: string;
}

interface EventItem {
  id: number;
  title: string;
  event_date: string;
  time?: string;
  location?: string;
  description?: string;
}

interface NoticeItem {
  id: number;
  title: string;
  description: string;
  priority: 'Urgent' | 'Important' | 'Normal';
  is_pinned?: number | boolean;
  category: string;
  created_at: string;
}

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 1. Fetch Tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => apiClient.get<{ tasks: Task[] }>('/tasks'),
  });

  // 2. Fetch Events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: () => apiClient.get<{ events: EventItem[] }>('/events'),
  });

  // 3. Fetch Notices
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ['dashboard-notices'],
    queryFn: () => apiClient.get<{ notices: NoticeItem[] }>('/notices'),
  });

  // 4. Fetch Academic Routine
  const { data: academicData } = useQuery({
    queryKey: ['dashboard-academic'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/academic'),
  });

  // Task Completion Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCurrentlyCompleted }: { taskId: number; isCurrentlyCompleted: boolean }) => {
      if (isCurrentlyCompleted) {
        return apiClient.delete(`/tasks/${taskId}/complete`);
      } else {
        return apiClient.post(`/tasks/${taskId}/complete`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] });
      success(variables.isCurrentlyCompleted ? 'Task marked as pending' : 'Task marked as completed!');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update task status');
    },
  });

  const tasks = tasksData?.tasks || [];
  const events = eventsData?.events || [];
  const notices = noticesData?.notices || [];

  // Metrics computation
  const now = new Date();
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => Boolean(t.is_completed)).length;
  const overdueTasksCount = tasks.filter(
    (t) => !t.is_completed && new Date(t.due_date).getTime() < now.getTime()
  ).length;
  const activeTasks = tasks.slice(0, 5);
  const activeEvents = events.slice(0, 4);
  const pinnedNotices = notices.filter((n) => Boolean(n.is_pinned)).slice(0, 2);

  // Extract routine info if available
  const routinesList = Array.isArray(academicData?.routine)
    ? (academicData?.routine as Array<{ course_name?: string; time_slot?: string; room_number?: string; day_of_week?: string }>)
    : [];
  const nextClass = routinesList.length > 0 ? routinesList[0] : null;

  return (
    <AppLayout title="Academic Flight Deck">
      <div className="space-y-6">
        {/* 1. Unified Hero Banner with Metrics */}
        <section className="bg-[#15242A] border border-[#1F353C] rounded-[20px] p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.25)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[14px] bg-[#0E171B] border border-[#00D084]/30 flex items-center justify-center text-[#00D084] shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[12px] uppercase font-bold tracking-wider text-[#00D084]">
                  Academic Year 2026
                </span>
                <span className="text-[#1F353C]">•</span>
                <span className="text-[12.5px] text-[#9BB2BC]">
                  {user?.department || 'Computer Science & Engineering'}
                </span>
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight mt-1">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Scholar'}!
              </h2>
              <p className="text-[13.5px] text-[#9BB2BC] mt-0.5">
                You have{' '}
                <strong className="text-white font-semibold">
                  {Math.max(0, totalTasksCount - completedTasksCount)} active coursework deadlines
                </strong>{' '}
                and {events.length} upcoming events scheduled.
              </p>
            </div>
          </div>

          {/* Metric Badges Strip */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-3 rounded-[14px] bg-[#0E171B] border border-[#1F353C] hover:border-[#F87171]/40 flex flex-col min-w-[110px] text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                Overdue
              </span>
              <span className={`text-[22px] font-bold ${overdueTasksCount > 0 ? 'text-[#F87171]' : 'text-white'}`}>
                {overdueTasksCount}
              </span>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-3 rounded-[14px] bg-[#0E171B] border border-[#1F353C] hover:border-[#00D084]/40 flex flex-col min-w-[110px] text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                Completed
              </span>
              <span className="text-[22px] font-bold text-[#00D084]">{completedTasksCount}</span>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-3 rounded-[14px] bg-[#0E171B] border border-[#1F353C] hover:border-[#38BDF8]/40 flex flex-col min-w-[110px] text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                Total Tasks
              </span>
              <span className="text-[22px] font-bold text-white">{totalTasksCount}</span>
            </button>
          </div>
        </section>

        {/* 2. Primary 2-Column Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Academic Next Up, Mini Calendar & Events */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Academic Next Up Session Flight Deck */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
                  <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#00D084]">
                    Next Up on Routine
                  </span>
                </div>
                <Badge variant="mint" size="xs">
                  {nextClass?.day_of_week || 'Today'}
                </Badge>
              </div>

              <div className="mt-4">
                <h3 className="text-[16px] font-bold text-white tracking-tight">
                  {nextClass?.course_name || 'CSE-3201: Operating Systems & System Programming'}
                </h3>
                <div className="flex items-center gap-2 text-[12.5px] text-[#9BB2BC] mt-2">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{nextClass?.time_slot || '11:30 AM - 01:00 PM'}</span>
                </div>
                <div className="flex items-center gap-2 text-[12.5px] text-[#9BB2BC] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{nextClass?.room_number || 'Room 402, Dept of CSE'}</span>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-[#1F353C]/60 flex items-center justify-between text-[12px]">
                <span className="text-[#9BB2BC]">Instructor: Faculty Advisor</span>
                <Link
                  to="/cr-panel"
                  className="text-[#00D084] hover:underline font-medium inline-flex items-center gap-1"
                >
                  View full routine <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Interactive Mini Calendar */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F353C]/60">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#00D084]" />
                  <h3 className="text-[15px] font-bold text-white">November 2026</h3>
                </div>
                <span className="text-[11.5px] text-[#9BB2BC]">Cohort Schedule</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center select-none text-[12px]">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-[#9BB2BC] font-semibold py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isSelected = selectedDay === day;
                  const hasEvent = [4, 10, 15, 22, 28].includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
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
                <h3 className="text-[15px] font-bold text-white">Upcoming Events</h3>
                <Link
                  to="/events"
                  className="text-[12px] text-[#00D084] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {eventsLoading ? (
                <div className="py-6 text-center text-[13px] text-[#9BB2BC]">Loading events...</div>
              ) : activeEvents.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-[#9BB2BC]">No upcoming events scheduled.</div>
              ) : (
                <div className="flex flex-col divide-y divide-[#1F353C]/60">
                  {activeEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      to="/events"
                      className="py-3 flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-[10px] bg-[#0E171B] border border-[#1F353C] flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-[11px] uppercase font-bold text-[#9BB2BC]">
                            {new Date(ev.event_date).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-[15px] font-bold text-[#00D084]">
                            {new Date(ev.event_date).getDate()}
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Course Deadlines & Pinned Notices */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Active Deadlines with Live Checkbox Mutation */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                  <h3 className="text-[15px] font-bold text-white">Active Course Deadlines</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="mint" size="xs">
                    {completedTasksCount} of {totalTasksCount} Done
                  </Badge>
                  <Link
                    to="/tasks"
                    className="text-[12px] text-[#00D084] hover:underline flex items-center gap-1 font-semibold"
                  >
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {tasksLoading ? (
                <div className="py-8 text-center text-[13px] text-[#9BB2BC]">Loading course deadlines...</div>
              ) : activeTasks.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[#9BB2BC]">
                  No active deadlines! You're completely up to date.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#1F353C]/60">
                  {activeTasks.map((task) => {
                    const isDone = Boolean(task.is_completed);
                    return (
                      <div
                        key={task.id}
                        onClick={() =>
                          toggleTaskMutation.mutate({
                            taskId: task.id,
                            isCurrentlyCompleted: isDone,
                          })
                        }
                        className="py-3 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            aria-label={`Toggle task ${task.title}`}
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
                                isDone ? 'line-through text-[#9BB2BC]' : 'text-white group-hover:text-[#00D084]'
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

                        <div className="flex items-center gap-2 shrink-0">
                          {task.course_code && (
                            <Badge variant="muted" size="xs">
                              {task.course_code}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              task.priority === 'High'
                                ? 'danger'
                                : task.priority === 'Medium'
                                ? 'warning'
                                : 'muted'
                            }
                            size="xs"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pinned Announcements */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F353C]/60">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="text-[15px] font-bold text-white">Cohort Notices & Bulletins</h3>
                </div>
                <Link
                  to="/announcements"
                  className="text-[12px] text-[#00D084] hover:underline flex items-center gap-1 font-semibold"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {noticesLoading ? (
                <div className="py-6 text-center text-[13px] text-[#9BB2BC]">Loading notices...</div>
              ) : pinnedNotices.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-[#9BB2BC]">No pinned announcements currently.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pinnedNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-4 rounded-[14px] bg-[#0E171B] border border-[#1F353C] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pin className="w-3.5 h-3.5 text-[#00D084]" />
                          <Badge
                            variant={
                              notice.priority === 'Urgent'
                                ? 'danger'
                                : notice.priority === 'Important'
                                ? 'warning'
                                : 'info'
                            }
                            size="xs"
                          >
                            {notice.priority}
                          </Badge>
                          <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#9BB2BC]">
                            {notice.category}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-[#9BB2BC]">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-[14.5px] font-bold text-white tracking-tight">{notice.title}</h4>
                      <p className="text-[13px] text-[#9BB2BC] line-clamp-2 leading-relaxed">
                        {notice.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-[14.5px] font-bold text-white">Need to submit coursework or an event?</h4>
                <p className="text-[12.5px] text-[#9BB2BC] mt-0.5">
                  Class representatives review student submissions before posting to the cohort flight deck.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/resources')}
                >
                  Browse Notes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/tasks')}
                >
                  Create Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
