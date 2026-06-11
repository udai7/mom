import { CalendarDays, Download, MapPin, Users } from 'lucide-react'
import { meetings, guests, actions } from '../mockData'
import { Panel, Badge, StatusBadge, Info, DataTable, MiniMetric } from '../components/Common'

export function MeetingDetail({ readOnly }: { readOnly: boolean }) {
  const meeting = meetings[1]

  return (
    <div className="space-y-5">
      <section className="clay-feature bg-[#1a3a3a] text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={meeting.status} />
              <Badge>{meeting.office}</Badge>
              <Badge tone={readOnly ? 'amber' : 'mint'}>{readOnly ? 'Read only' : 'Editable by owner'}</Badge>
            </div>
            <h3 className="display-type text-4xl">{meeting.title}</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              <Info icon={CalendarDays}>{meeting.date}</Info>
              <Info icon={MapPin}>{meeting.location}</Info>
              <Info icon={Users}>{meeting.guests} guests</Info>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-neutral-100"
              type="button"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            {!readOnly && (
              <button
                className="min-h-11 rounded-xl bg-[#ffb084] px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-[#ffa070]"
                type="button"
              >
                Schedule Follow-up
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Overview / Summary">
          <p className="leading-7 text-[#3a3a3a]">
            Review of district-level e-Governance initiatives, pending connectivity
            actions, PDF record submission, and follow-up ownership across NIC,
            DIT, ADM, and block offices.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MiniMetric label="Summary version" value="v2 latest" />
            <MiniMetric label="PDF" value="signed-minutes.pdf" />
          </div>
        </Panel>
        <Panel title="Follow-up Thread">
          {['Original review', 'NIC Infrastructure Upgrade', 'Block Office Connectivity Follow-up'].map((item, index) => (
            <div className="flex gap-3 pb-4 last:pb-0" key={item}>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8b94a] text-sm font-semibold text-[#0a0a0a]">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-sm text-[#6a6a6a]">Thread node #{index + 1}</p>
              </div>
            </div>
          ))}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
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
