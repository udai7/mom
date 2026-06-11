import { Paperclip } from 'lucide-react'
import { Panel, Field } from '../components/Common'

export function SubmitSummary() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Submit Meeting Summary">
        <div className="space-y-4">
          {['Agenda Recap', 'Discussion Points', 'Conclusions', 'Achievements / Outcomes'].map((label) => (
            <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]" key={label}>
              {label}
              <textarea className="min-h-24 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] p-4 text-sm outline-none focus:border-[#0a0a0a]" />
            </label>
          ))}
          <button className="clay-button" type="button">
            Submit Summary
          </button>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Action Items">
          <div className="space-y-3">
            <Field label="Task" placeholder="Prepare connectivity report" />
            <Field label="Assignee" placeholder="DIT Tripura" />
            <Field label="Due date" type="date" />
          </div>
        </Panel>
        <Panel title="PDF Upload">
          <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#f5f0e0] p-6 text-center">
            <Paperclip className="mx-auto h-8 w-8 text-[#6a6a6a]" />
            <p className="mt-3 font-medium">Drop signed minutes PDF</p>
            <p className="mt-1 text-sm text-[#6a6a6a]">Maximum size 20 MB</p>
            <button className="clay-button mt-4" type="button">
              Choose PDF
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
export default SubmitSummary
