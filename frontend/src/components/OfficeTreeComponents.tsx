import { useState } from 'react'
import { Building2, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { offices, type OfficeNode } from '../mockData'
import { Badge, DataTable } from './Common'

export function OfficeTree({ nodes, depth = 0 }: { nodes: OfficeNode[]; depth?: number }) {
  return (
    <div className="space-y-2 min-w-0">
      {nodes.map((office) => (
        <OfficeTreeNode key={office.code} office={office} depth={depth} />
      ))}
    </div>
  )
}

function OfficeTreeNode({ office, depth }: { office: OfficeNode; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const hasChildren = office.children && office.children.length > 0

  return (
    <div className="min-w-0">
      <div
        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0] p-3 transition hover:bg-white"
        style={{ marginLeft: Math.min(depth * 10, 40) }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-[#faf5e8] text-[#1a3a3a] shrink-0"
              type="button"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-6 shrink-0" /> // spacer
          )}
          <Building2 className="h-4 w-4 shrink-0 text-[#1a3a3a]" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate text-[#0a0a0a]">{office.name}</p>
            <p className="text-[10px] text-[#6a6a6a] font-mono">{office.code} • {office.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          <span className="bg-[#f5f0e0] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {office.meetings} meetings
          </span>
          <Badge tone={office.pending ? 'amber' : 'green'}>
            {office.pending ? `${office.pending} pending` : 'cleared'}
          </Badge>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-1 rounded-md transition ${showDetails ? 'bg-[#1a3a3a] text-white shadow-sm' : 'hover:bg-[#faf5e8] text-[#1a3a3a]'}`}
            title="View office details"
            type="button"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div 
          className="mt-2 bg-white border border-[#e2e8f0] p-4 rounded-2xl text-xs space-y-2 text-[#4a5568] shadow-sm"
          style={{ marginLeft: Math.min(depth * 10 + 24, 64) }}
        >
          <div className="flex items-center justify-between border-b border-[#edf2f7] pb-1.5 mb-2">
            <span className="font-bold text-[#2d3748] uppercase tracking-wider text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-3 bg-[#3182ce] rounded-full"></span>
              Office Registration & Address details
            </span>
            <span className="font-mono text-[#718096] text-[10px]">Code: {office.code}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p><span className="font-semibold text-[#718096]">Official Email:</span> <span className="font-mono text-[#1a202c]">{office.official_email || 'N/A'}</span></p>
              <p><span className="font-semibold text-[#718096]">Official Phone:</span> <span className="text-[#1a202c]">{office.official_phone || 'N/A'}</span></p>
              <p><span className="font-semibold text-[#718096]">Department:</span> <span className="text-[#1a202c]">{office.department || 'N/A'}</span></p>
            </div>
            <div className="space-y-1.5">
              <p><span className="font-semibold text-[#718096]">Website:</span> <span className="text-[#1a202c]">{office.website || 'N/A'}</span></p>
              <p>
                <span className="font-semibold text-[#718096]">Address:</span>{' '}
                <span className="text-[#1a202c]">
                  {[
                    office.address_line_1,
                    office.address_line_2,
                    office.city,
                    office.district,
                    office.state,
                    office.pincode
                  ].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {hasChildren && expanded && (
        <div className="mt-2">
          <OfficeTree depth={depth + 1} nodes={office.children!} />
        </div>
      )}
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
