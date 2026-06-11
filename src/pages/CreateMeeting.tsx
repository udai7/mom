import { Plus } from 'lucide-react'
import { Panel, Field } from '../components/Common'

export function CreateMeeting() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Create / Edit Meeting">
        <div className="grid gap-4">
          <Field label="Title" placeholder="District e-Governance Review" />
          <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
            Agenda
            <textarea className="min-h-36 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] p-4 text-sm outline-none focus:border-[#0a0a0a]" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Scheduled date and time" type="datetime-local" />
            <Field label="Location" placeholder="DM Conference Hall" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="clay-button-secondary" type="button">
              Save Draft
            </button>
            <button className="clay-button" type="button">
              Schedule Meeting
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Guests">
        <div className="space-y-4">
          <Field label="Internal guest search" placeholder="Search users from any office" />
          <div className="grid gap-3 rounded-2xl border border-[#e5e5e5] bg-[#f5f0e0] p-4">
            <Field label="External guest name" placeholder="Name" />
            <Field label="Designation" placeholder="Designation" />
            <Field label="Contact email" placeholder="optional@email.gov.in" />
          </div>
          <button className="clay-button inline-flex w-full items-center justify-center gap-2" type="button">
            <Plus className="h-4 w-4" />
            Add Guest
          </button>
        </div>
      </Panel>
    </div>
  )
}
export default CreateMeeting
