import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Users,
  Search,
  Mail,
  GraduationCap,
  Shield,
  UserPlus,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export interface MemberItem {
  id: number;
  name: string;
  email: string;
  student_id?: string;
  batch?: string;
  department?: string;
  role: 'student' | 'cr' | 'admin' | string;
  skills?: string;
  profile_picture?: string;
}

interface MembersApiResponse {
  success: boolean;
  members: MemberItem[];
}

interface MyProjectsResponse {
  success: boolean;
  projects: Array<{ id: number; title: string }>;
}

export const MembersView: React.FC = () => {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  // Filters & State
  const [activeFilter, setActiveFilter] = useState<'my-batch' | 'all' | 'leadership'>('my-batch');
  const [searchQuery, setSearchQuery] = useState('');

  // Invite modal state
  const [inviteTargetStudent, setInviteTargetStudent] = useState<MemberItem | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Query members
  const { data, isLoading } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => apiClient.get<MembersApiResponse>('/members'),
  });

  // Query user's owned projects (for invite modal)
  const { data: myProjectsData } = useQuery({
    queryKey: ['my-projects-invite'],
    queryFn: () => apiClient.get<MyProjectsResponse>('/projects/my-projects'),
    enabled: Boolean(inviteTargetStudent),
  });

  const members = data?.members || [];
  const myProjects = myProjectsData?.projects || [];

  // Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: number; userId: number }) => {
      return apiClient.post(`/projects/${projectId}/invite`, { user_id: userId });
    },
    onSuccess: () => {
      setInviteTargetStudent(null);
      setSelectedProjectId('');
      success('Collaboration invitation sent successfully!');
    },
    onError: (err: Error) => error(err.message || 'Failed to send project invitation'),
  });

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const isMyBatch =
        m.batch && user?.batch
          ? m.batch.trim().toLowerCase() === user.batch.trim().toLowerCase()
          : true;
      const isLeadership = m.role === 'cr' || m.role === 'admin';

      if (activeFilter === 'my-batch' && !isMyBatch) return false;
      if (activeFilter === 'leadership' && !isLeadership) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.student_id?.toLowerCase().includes(q) ||
          m.skills?.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, activeFilter, searchQuery, user?.batch]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      error('Please select one of your projects');
      return;
    }
    if (!inviteTargetStudent) return;

    inviteMutation.mutate({
      projectId: Number(selectedProjectId),
      userId: inviteTargetStudent.id,
    });
  };

  return (
    <AppLayout title="Batch Members">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#00D084]">
                Batch Directory
              </span>
              <span className="text-[#1F353C]">•</span>
              <span className="text-[12px] text-[#9BB2BC]">Students, CRs & Cohort Talent</span>
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight mt-0.5">
              Classmates & Member Roster
            </h1>
            <p className="text-[13.5px] text-[#9BB2BC] mt-0.5">
              Explore your batch, filter peers by technical expertise, and recruit teammates for course projects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="mint">Batch {user?.batch || '2024'}</Badge>
            <Badge variant="muted">{user?.department || 'CSE'}</Badge>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#15242A] border border-[#1F353C] rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('my-batch')}
              className={`px-3 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer ${
                activeFilter === 'my-batch'
                  ? 'bg-[#0E171B] text-[#00D084] border border-[#00D084]/30'
                  : 'text-[#9BB2BC] hover:text-white'
              }`}
            >
              My Batch ({members.filter((m) => m.batch === user?.batch).length || members.length})
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0E171B] text-[#00D084] border border-[#00D084]/30'
                  : 'text-[#9BB2BC] hover:text-white'
              }`}
            >
              All Students ({members.length})
            </button>

            <button
              onClick={() => setActiveFilter('leadership')}
              className={`px-3 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'leadership'
                  ? 'bg-[#0E171B] text-[#00D084] border border-[#00D084]/30'
                  : 'text-[#9BB2BC] hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CRs & Admins</span>
            </button>
          </div>

          {/* Search */}
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-[#9BB2BC] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, student ID, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E171B] border border-[#1F353C] rounded-[10px] pl-9 pr-3 py-1.5 text-[12.5px] text-white placeholder:text-[#9BB2BC] focus:outline-none focus:border-[#00D084]"
            />
          </div>
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-[#9BB2BC]">Loading student directory...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-[#15242A] border border-[#1F353C] rounded-[18px] p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-10 h-10 text-[#9BB2BC] mb-2" />
            <h3 className="text-[16px] font-bold text-white">No Students Found</h3>
            <p className="text-[13px] text-[#9BB2BC] mt-1">
              No students matched your search criteria or batch filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const isSelf = member.id === user?.id;
              const isCR = member.role === 'cr';
              const isAdmin = member.role === 'admin';
              const skillsList = member.skills
                ? member.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={member.id}
                  className="bg-[#15242A] border border-[#1F353C] hover:border-[#00D084]/40 rounded-[18px] p-5 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {member.profile_picture ? (
                          <img
                            src={member.profile_picture}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#00D084]/30 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#0E171B] border border-[#1F353C] group-hover:border-[#00D084]/40 flex items-center justify-center text-[16px] font-bold text-[#00D084] shrink-0 transition-colors">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <h3 className="text-[15px] font-bold text-white group-hover:text-[#00D084] transition-colors truncate">
                            {member.name}
                          </h3>
                          <span className="text-[12px] text-[#9BB2BC] font-mono">
                            ID: {member.student_id || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={isAdmin ? 'danger' : isCR ? 'warning' : 'muted'}
                        size="xs"
                      >
                        {member.role.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Department & Batch */}
                    <div className="text-[12.5px] text-[#9BB2BC] flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>
                        {member.department || 'CSE'} • Batch {member.batch || '2024'}
                      </span>
                    </div>

                    {/* Technical Skills Pills */}
                    {skillsList.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {skillsList.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium bg-[#0E171B] border border-[#1F353C] text-[#D2DFE5] px-2 py-0.5 rounded-[6px]"
                          >
                            {skill}
                          </span>
                        ))}
                        {skillsList.length > 4 && (
                          <span className="text-[11px] text-[#9BB2BC]">+{skillsList.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Email & Invite Action */}
                  <div className="pt-3 border-t border-[#1F353C]/60 flex items-center justify-between text-[12px]">
                    <a
                      href={`mailto:${member.email}`}
                      className="text-[#9BB2BC] hover:text-white flex items-center gap-1.5 truncate max-w-[170px]"
                      title={member.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#00D084]" />
                      <span className="truncate">{member.email}</span>
                    </a>

                    {!isSelf && (
                      <button
                        onClick={() => setInviteTargetStudent(member)}
                        className="text-[12px] text-[#00D084] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Invite</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Invite to Project */}
        {inviteTargetStudent && (
          <Modal
            isOpen={Boolean(inviteTargetStudent)}
            onClose={() => setInviteTargetStudent(null)}
            title="Invite Student to Project"
            description={`Select one of your projects to send a collaboration invitation to ${inviteTargetStudent.name}.`}
            maxWidth="sm"
          >
            <form onSubmit={handleSendInvite} className="space-y-4">
              {myProjects.length === 0 ? (
                <div className="text-[13px] text-[#9BB2BC] bg-[#0E171B] border border-[#1F353C] p-4 rounded-[12px]">
                  You have not published any projects yet. Go to the Projects tab to create one first before inviting teammates!
                </div>
              ) : (
                <div>
                  <label className="text-[13px] font-semibold text-white block mb-2">
                    Select Your Project *
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#0E171B] border border-[#1F353C] rounded-[10px] p-2.5 text-[13px] text-white focus:outline-none focus:border-[#00D084]"
                    required
                  >
                    <option value="">Choose project...</option>
                    {myProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1F353C]/60">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setInviteTargetStudent(null)}
                >
                  Cancel
                </Button>
                {myProjects.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={inviteMutation.isPending}
                  >
                    Send Invitation
                  </Button>
                )}
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
};
