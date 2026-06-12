import type { ReactNode } from 'react'
import {
  CalendarDays,
  MapPin,
} from 'lucide-react'
import type { MeetingStatus } from '../mockData'
import type { Icon } from '../types'

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'amber' | 'green' | 'red' | 'ochre' | 'peach' | 'lavender' | 'mint'
}) {
  const colors = {
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-emerald-100 text-emerald-800',
    lavender: 'bg-[#b8a4ed] text-[#0a0a0a]',
    mint: 'bg-[#a4d4c5] text-[#0a0a0a]',
    ochre: 'bg-[#e8b94a] text-[#0a0a0a]',
    peach: 'bg-[#ffb084] text-[#0a0a0a]',
    red: 'bg-rose-100 text-rose-800',
    slate: 'bg-[#f5f0e0] text-[#3a3a3a]',
  }

  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${colors[tone]}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const upper = (status || '').toUpperCase()
  const tone =
    upper === 'COMPLETED'
      ? 'green'
      : upper === 'SCHEDULED' || upper === 'UPCOMING'
        ? 'mint'
        : upper === 'IN_PROGRESS' || upper === 'ONGOING'
          ? 'amber'
          : upper === 'CANCELLED'
            ? 'red'
            : 'slate'

  return <Badge tone={tone}>{upper.replace('_', ' ')}</Badge>
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 rounded-2xl border border-[#e5e5e5] bg-[#f5f0e0] p-3 last:mb-0">
      <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a]">{label}</p>
      <p className="mt-1 font-medium text-[#0a0a0a]">{value}</p>
    </div>
  )
}

export function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-[#e5e5e5] bg-[#fffaf0] text-[#0a0a0a] transition hover:bg-white active:scale-95"
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

export function Info({ children, icon: InfoIcon }: { children: ReactNode; icon: Icon }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <InfoIcon className="h-4 w-4 shrink-0 text-[#6a6a6a]" />
      <span className="truncate">{children}</span>
    </span>
  )
}

export function Field({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required,
}: {
  label: string
  placeholder?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <input
        className="clay-input w-full text-sm"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </label>
  )
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5]/80 bg-[#fffaf0] p-1">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e5e5e5] text-xs uppercase tracking-[1.5px] text-[#6a6a6a]">
            {headers.map((header) => (
              <th className="px-4 py-3 font-semibold" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr className="border-b border-[#eee7d8] last:border-0 hover:bg-[#faf5e8]/50" key={rIdx}>
              {row.map((cell, index) => (
                <td className="px-4 py-3 text-[#0a0a0a]" key={`${cell}-${index}`}>
                  {index === row.length - 1 && (cell === 'Active' || cell === 'Inactive' || cell === 'OPEN' || cell === 'IN_PROGRESS' || cell === 'DONE' || cell === 'ATTENDED' || cell === 'CONFIRMED' || cell === 'INVITED') ? (
                    <Badge tone={
                      cell === 'Active' || cell === 'DONE' || cell === 'ATTENDED' || cell === 'CONFIRMED' ? 'green' :
                        cell === 'IN_PROGRESS' || cell === 'INVITED' ? 'amber' :
                          'slate'
                    }>
                      {cell}
                    </Badge>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MeetingRow({
  meeting,
  onClick,
}: {
  meeting: { title: string; date: string; location: string; status: MeetingStatus }
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[#e5e5e5] bg-[#faf5e8] p-4 transition ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-sm active:scale-[0.99]' : ''
        }`}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-semibold text-[#0a0a0a]">{meeting.title}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#6a6a6a]">
            <Info icon={CalendarDays}>{meeting.date.replace('T', ' ')}</Info>
            <Info icon={MapPin}>{meeting.location}</Info>
          </div>
        </div>
        <StatusBadge status={meeting.status} />
      </div>
    </div>
  )
}

export function StatCard({
  icon: StatIcon,
  label,
  tone,
  value,
}: {
  icon: Icon
  label: string
  tone: number
  value: string
}) {
  const fills = [
    'bg-[#ff4d8b] text-white',
    'bg-[#1a3a3a] text-white',
    'bg-[#b8a4ed] text-[#0a0a0a]',
    'bg-[#ffb084] text-[#0a0a0a]',
  ]

  return (
    <div className={`clay-feature p-6 ${fills[tone % fills.length]}`}>
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white/90 text-[#0a0a0a] shadow-sm">
        <StatIcon className="h-5 w-5" />
      </div>
      <p className="display-type text-3xl sm:text-4xl">{value}</p>
      <p className="mt-1.5 text-xs sm:text-sm opacity-85 font-medium">{label}</p>
    </div>
  )
}

export function Panel({
  action,
  children,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  title: string
}) {
  return (
    <section className="clay-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="display-type text-lg sm:text-xl">{title}</h3>
          {action}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  )
}

export function ActionButton({
  icon: ButtonIcon,
  label,
  onClick,
}: {
  icon: Icon
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="mb-3 flex w-full items-center justify-between rounded-xl border border-[#e5e5e5] bg-[#fffaf0] px-4 py-3 text-left text-sm font-semibold last:mb-0 transition hover:bg-white hover:shadow-sm active:scale-[0.98]"
      onClick={onClick}
      type="button"
    >
      <span className="inline-flex items-center gap-2">
        <ButtonIcon className="h-4 w-4 text-[#1a3a3a]" />
        {label}
      </span>
      <span className="text-[#6a6a6a] text-xs">Open</span>
    </button>
  )
}
