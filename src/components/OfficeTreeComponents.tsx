import { Building2 } from 'lucide-react'
import { offices, type OfficeNode } from '../mockData'
import { Badge, DataTable } from './Common'

export function OfficeTree({ nodes, depth = 0 }: { nodes: OfficeNode[]; depth?: number }) {
  return (
    <div className="space-y-2 overflow-x-auto min-w-0">
      {nodes.map((office) => (
        <div key={office.code} className="min-w-0">
          <div
            className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-3 transition hover:bg-white"
            style={{ marginLeft: depth * 14 }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {depth > 0 && (
                <span className="text-[#6a6a6a]/60 select-none font-mono tracking-widest shrink-0">
                  {'•'.repeat(depth)}
                </span>
              )}
              <Building2 className="h-4 w-4 shrink-0 text-[#1a3a3a]" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{office.name}</p>
                <p className="text-[10px] text-[#6a6a6a] font-mono">{office.code} • {office.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[#f5f0e0] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {office.meetings} meetings
              </span>
              <Badge tone={office.pending ? 'amber' : 'green'}>
                {office.pending ? `${office.pending} pending` : 'cleared'}
              </Badge>
            </div>
          </div>
          {office.children && <OfficeTree depth={depth + 1} nodes={office.children} />}
        </div>
      ))}
    </div>
  )
}

export function OfficeActivityTable() {
  const rows =
    offices[0].children?.map((office) => [
      office.name,
      office.lastMeeting,
      String(office.meetings),
      String(office.pending),
    ]) ?? []

  return <DataTable headers={['Office', 'Last meeting', 'Meetings this month', 'Pending']} rows={rows} />
}
