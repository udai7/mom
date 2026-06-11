import { CalendarDays, Download, MapPin, Users, ArrowRight, GitMerge, Plus } from 'lucide-react'
import { guests, actions } from '../mockData'
import { Panel, Badge, StatusBadge, Info, DataTable, MiniMetric } from '../components/Common'
import { getStoredMeetings, type WorkspaceView } from '../types'

export function MeetingDetail({
  readOnly,
  setActiveView,
}: {
  readOnly: boolean
  setActiveView: (view: WorkspaceView) => void
}) {
  const allMeetings = getStoredMeetings()
  const activeId = localStorage.getItem('mom_active_meeting_id') || 'meet-1'
  const meeting = allMeetings.find((m) => m.id === activeId) || allMeetings[0]

  // Trace the follow-up chain: find all meetings in the same thread
  // Let's find any meetings that have a parent-child relationship with this one
  const getThreadMeetings = () => {
    const thread: typeof allMeetings = []
    
    // 1. Trace up to the root parent
    let current = meeting
    while (current.parentMeetingId) {
      const parent = allMeetings.find((m) => m.id === current.parentMeetingId)
      if (parent) {
        thread.unshift(parent)
        current = parent
      } else {
        break
      }
    }

    // 2. Add current meeting
    thread.push(meeting)

    // 3. Trace down to find any children follow-ups
    let children = allMeetings.filter((m) => m.parentMeetingId === meeting.id)
    while (children.length > 0) {
      const nextChild = children[0] // take first child path
      thread.push(nextChild)
      children = allMeetings.filter((m) => m.parentMeetingId === nextChild.id)
    }

    return thread
  }

  const threadMeetings = getThreadMeetings()

  const handleStartFollowUp = () => {
    localStorage.setItem('mom_followup_parent_id', meeting.id)
    setActiveView('Create Meeting')
  }

  const handleSwitchToMeeting = (id: string) => {
    localStorage.setItem('mom_active_meeting_id', id)
    // Simple state reload trick by calling setActiveView with same view or toggle
    setActiveView('Meeting Detail')
  }

  return (
    <div className="space-y-5">
      <section className="clay-feature bg-[#1a3a3a] text-white p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={meeting.status} />
              <Badge>{meeting.officeName}</Badge>
              <Badge tone={readOnly ? 'amber' : 'mint'}>
                {readOnly ? 'Read only' : 'Editable by owner'}
              </Badge>
              {meeting.parentMeetingId && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#ffb084] text-[#0a0a0a] rounded-full px-3 py-1 font-semibold">
                  <GitMerge className="h-3 w-3" />
                  Follow-up Meeting
                </span>
              )}
            </div>
            <h3 className="display-type text-3xl sm:text-4xl">{meeting.title}</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              <Info icon={CalendarDays}>{meeting.date.replace('T', ' ')}</Info>
              <Info icon={MapPin}>{meeting.location}</Info>
              <Info icon={Users}>{meeting.guests} guests</Info>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-neutral-100 active:scale-95"
              type="button"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            {!readOnly && (
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ffb084] px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-[#ffa070] active:scale-95"
                onClick={handleStartFollowUp}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Build Follow-up Meeting
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Overview / Summary Agenda">
          <p className="leading-7 text-[#3a3a3a] text-sm sm:text-base">
            {meeting.agenda || 'No agenda recorded.'}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MiniMetric label="Summary version" value={meeting.status === 'COMPLETED' ? 'v2 locked' : 'Draft'} />
            <MiniMetric label="Stored file status" value={meeting.status === 'COMPLETED' ? 'bytea PDF stored' : 'No uploads'} />
          </div>
        </Panel>

        <Panel title="Follow-up Meeting Thread">
          <div className="space-y-4 relative pl-3 border-l-2 border-[#e5e5e5]">
            {threadMeetings.map((m, index) => {
              const isCurrent = m.id === meeting.id
              return (
                <div key={m.id} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[21px] top-1.5 grid h-6.5 w-6.5 place-items-center rounded-full text-[10px] font-bold border-2 transition ${
                      isCurrent
                        ? 'bg-[#1a3a3a] text-white border-white'
                        : 'bg-[#faf5e8] text-[#3a3a3a] border-[#e5e5e5]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="pl-3">
                    <button
                      onClick={() => handleSwitchToMeeting(m.id)}
                      className={`text-left font-semibold text-sm hover:text-[#ff4d8b] transition ${
                        isCurrent ? 'text-[#ff4d8b]' : 'text-[#0a0a0a]'
                      }`}
                    >
                      {m.title}
                    </button>
                    <p className="text-[10px] text-[#6a6a6a] mt-0.5">
                      {m.officeName} • {m.date.replace('T', ' ')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </section>

      <section className="space-y-5">
        <Panel title="Guest List">
          <DataTable headers={['Name', 'Designation', 'Office', 'Attendance']} rows={guests} />
        </Panel>
        <Panel title="Action Items">
          <DataTable headers={['Task', 'Assignee', 'Due date', 'Status']} rows={actions} />
        </Panel>
      </section>
    </div>
  )
}
export default MeetingDetail
