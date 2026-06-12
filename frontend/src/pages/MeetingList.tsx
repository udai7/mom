import { useState } from 'react'
import { CalendarDays, MapPin, Users, Trash2, Clock, X } from 'lucide-react'
import { Panel, Badge, StatusBadge, Info } from '../components/Common'
import type { WorkspaceView } from '../types'
import { deleteMeeting, postponeMeeting, type BackendMeeting } from '../api/meetings'

export function MeetingList({
  meetings,
  loading,
  meetingFilter,
  readOnly,
  setActiveView,
  setMeetingFilter,
  onRefresh,
}: {
  meetings: BackendMeeting[]
  loading: boolean
  meetingFilter: string
  readOnly: boolean
  setActiveView: (view: WorkspaceView) => void
  setMeetingFilter: (filter: string) => void
  onRefresh: () => void
}) {
  const [postponingMeeting, setPostponingMeeting] = useState<BackendMeeting | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [isActionPending, setIsActionPending] = useState(false)

  const handleMeetingClick = (id: string) => {
    localStorage.setItem('mom_active_meeting_id', id)
    setActiveView('Meeting Detail')
  }

  const handleDelete = async (e: React.MouseEvent, meeting: BackendMeeting) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete the meeting "${meeting.title}"?`)) {
      return
    }
    try {
      await deleteMeeting(meeting.id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete meeting.')
    }
  }

  const handlePostponeClick = (e: React.MouseEvent, meeting: BackendMeeting) => {
    e.stopPropagation()
    setPostponingMeeting(meeting)
    setNewDate(meeting.date || '')
    setNewTime(meeting.time || '')
  }

  const handlePostponeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postponingMeeting || !newDate || !newTime) return
    setIsActionPending(true)
    try {
      await postponeMeeting(postponingMeeting.id, newDate, newTime)
      setPostponingMeeting(null)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to postpone meeting.')
    } finally {
      setIsActionPending(false)
    }
  }

  // Filter meetings
  const filtered = meetings.filter((meeting) => {
    if (meetingFilter === 'All') return true
    return meeting.status.toUpperCase() === meetingFilter.toUpperCase()
  })

  return (
    <Panel action={readOnly ? <Badge tone="amber">Read only</Badge> : undefined} title="Meetings Dashboard">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'upcoming', 'ongoing', 'completed'].map((filter) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 capitalize ${
                meetingFilter.toLowerCase() === filter.toLowerCase()
                  ? 'bg-[#0a0a0a] text-white shadow-sm'
                  : 'bg-[#f5f0e0] text-[#3a3a3a] hover:bg-[#eee7d8]'
              }`}
              key={filter}
              onClick={() => setMeetingFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-3xl border border-[#e5e5e5] bg-[#faf5e8]/50 p-6 animate-pulse">
              <div className="h-5 w-2/3 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((meeting) => (
            <div
              className="group relative rounded-3xl border border-[#e5e5e5] bg-[#faf5e8] p-5 text-left transition duration-200 hover:bg-white hover:shadow-md cursor-pointer flex flex-col justify-between"
              key={meeting.id}
              onClick={() => handleMeetingClick(meeting.id)}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base text-[#0a0a0a] group-hover:text-[#ff4d8b] transition-colors">
                      {meeting.title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-[#6a6a6a]">
                      {meeting.office_name || 'Creating Office'}
                    </p>
                  </div>
                  <StatusBadge status={meeting.status} />
                </div>
                {meeting.agenda && (
                  <p className="mt-3 text-xs text-[#5a5a5a] line-clamp-2 italic bg-[#fffaf0] p-2 rounded-xl border border-[#eee7d8]">
                    {meeting.agenda}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#eee7d8]">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6a6a6a]">
                  <Info icon={CalendarDays}>
                    {meeting.date} {meeting.time}
                  </Info>
                  <Info icon={MapPin}>{meeting.venue}</Info>
                  <Info icon={Users}>
                    {meeting.guests ? meeting.guests.length : 0} guests
                  </Info>
                </div>

                {!readOnly && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handlePostponeClick(e, meeting)}
                      className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      title="Postpone Meeting"
                      type="button"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, meeting)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Delete Meeting"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#faf5e8]/20 p-12 text-center">
          <p className="text-sm text-[#6a6a6a]">
            No meetings matching this filter are visible to your office hierarchy.
          </p>
        </div>
      )}

      {/* Postpone Dialog */}
      {postponingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-[#0a0a0a]">Postpone Meeting</h4>
              <button
                onClick={() => setPostponingMeeting(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-[#6a6a6a] mb-4">
              Postponing: <strong>{postponingMeeting.title}</strong>. This action will reset the status to "upcoming".
            </p>
            <form onSubmit={handlePostponeSubmit} className="space-y-4">
              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>New Date</span>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="clay-input w-full text-sm"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>New Time</span>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="clay-input w-full text-sm"
                  required
                />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPostponingMeeting(null)}
                  className="clay-button-secondary py-2 px-4"
                  disabled={isActionPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-button py-2 px-4"
                  disabled={isActionPending}
                >
                  {isActionPending ? 'Updating...' : 'Postpone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Panel>
  )
}
export default MeetingList
