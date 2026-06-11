import { ListFilter, CalendarDays, MapPin, Users } from 'lucide-react'
import { meetings } from '../mockData'
import { Panel, Badge, StatusBadge, Info } from '../components/Common'
import type { WorkspaceView } from '../types'

export function MeetingList({
  filteredMeetings,
  meetingFilter,
  readOnly,
  setActiveView,
  setMeetingFilter,
}: {
  filteredMeetings: typeof meetings
  meetingFilter: string
  readOnly: boolean
  setActiveView: (view: WorkspaceView) => void
  setMeetingFilter: (filter: string) => void
}) {
  return (
    <Panel action={readOnly ? <Badge tone="amber">Read only</Badge> : undefined} title="Meeting List">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((filter) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                meetingFilter === filter ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f0e0] text-[#3a3a3a]'
              }`}
              key={filter}
              onClick={() => setMeetingFilter(filter)}
              type="button"
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button className="clay-button-secondary inline-flex items-center gap-2" type="button">
          <ListFilter className="h-4 w-4" />
          Date range
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {filteredMeetings.map((meeting) => (
          <button
            className="rounded-3xl border border-[#e5e5e5] bg-[#faf5e8] p-5 text-left transition hover:bg-white"
            key={meeting.title}
            onClick={() => setActiveView('Meeting Detail')}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{meeting.title}</p>
                <p className="mt-1 text-sm text-[#6a6a6a]">{meeting.office}</p>
              </div>
              <StatusBadge status={meeting.status} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#6a6a6a] sm:grid-cols-3">
              <Info icon={CalendarDays}>{meeting.date}</Info>
              <Info icon={MapPin}>{meeting.location}</Info>
              <Info icon={Users}>{meeting.guests} guests</Info>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  )
}
