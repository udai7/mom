import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, GitMerge } from 'lucide-react'
import { Panel, Field } from '../components/Common'
import { offices, isAncestorOrSelf, type OfficeNode, type Meeting } from '../mockData'
import { getStoredMeetings, saveStoredMeetings, profiles, type DashboardLevel, ROLE_PREFIXES } from '../types'

export function CreateMeeting() {
  const navigate = useNavigate()

  // Read active session profile details
  const activeRole = (localStorage.getItem('mom_role') as DashboardLevel) || 'Office Admin'
  const profile = profiles.find((p) => p.level === activeRole)!
  const userOfficeCode = profile.officeCode

  // Flatten office nodes for selection dropdown
  const getFlatOffices = (nodes: OfficeNode[]): { name: string; code: string }[] => {
    const result: { name: string; code: string }[] = []
    const recurse = (list: OfficeNode[]) => {
      for (const node of list) {
        result.push({ name: node.name, code: node.code })
        if (node.children) recurse(node.children)
      }
    }
    recurse(nodes)
    return result
  }

  const flatOffices = getFlatOffices(offices)
  const allowedOffices =
    activeRole === 'Super Admin'
      ? flatOffices
      : flatOffices.filter((o) => isAncestorOrSelf(userOfficeCode, o.code))

  // State definitions
  const [title, setTitle] = useState('')
  const [selectedOfficeCode, setSelectedOfficeCode] = useState(userOfficeCode)
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [agenda, setAgenda] = useState('')
  const [parentMeetingId, setParentMeetingId] = useState<string | undefined>(undefined)
  const [parentTitle, setParentTitle] = useState('')

  // Check if we are scheduling a follow-up meeting
  useEffect(() => {
    const followUpParentId = localStorage.getItem('mom_followup_parent_id')
    if (followUpParentId) {
      const allMeetings = getStoredMeetings()
      const parent = allMeetings.find((m) => m.id === followUpParentId)
      if (parent) {
        setParentMeetingId(followUpParentId)
        setParentTitle(parent.title)
        setTitle(`Follow-up on: ${parent.title}`)
        setLocation(parent.location)
        setSelectedOfficeCode(parent.officeCode)
        setAgenda(
          `Follow-up discussions and audit of tasks initiated during: "${parent.title}".\n\nOriginal Agenda: ${
            parent.agenda || ''
          }`
        )
      }
    }
  }, [])

  const handleClearFollowUp = () => {
    localStorage.removeItem('mom_followup_parent_id')
    setParentMeetingId(undefined)
    setParentTitle('')
    setTitle('')
    setAgenda('')
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !location) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const matchedOffice = flatOffices.find((o) => o.code === selectedOfficeCode)
    const officeName = matchedOffice ? matchedOffice.name : profile.office

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title,
      officeName,
      officeCode: selectedOfficeCode,
      status: 'SCHEDULED',
      date,
      location,
      guests: 6, // default mock value
      summary: 'Pending',
      actionItems: 0,
      agenda,
      parentMeetingId,
    }

    const all = getStoredMeetings()
    all.unshift(newMeeting)
    saveStoredMeetings(all)

    // Clear follow-up state
    localStorage.removeItem('mom_followup_parent_id')

    // Navigate to meetings page
    const prefix = ROLE_PREFIXES[activeRole]
    navigate(`/${prefix}/meetings`)
  }

  return (
    <form onSubmit={handleSchedule} className="space-y-5">
      {parentMeetingId && (
        <div className="flex items-center justify-between rounded-2xl bg-[#ffb084] p-4 border border-[#e5e5e5] shadow-sm animate-fade-in text-sm font-semibold text-[#0a0a0a]">
          <span className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 shrink-0" />
            Scheduling follow-up meeting for: <strong className="underline">{parentTitle}</strong>
          </span>
          <button
            type="button"
            onClick={handleClearFollowUp}
            className="text-xs font-bold uppercase tracking-wider text-[#ff4d8b] hover:text-[#0a0a0a] transition pl-3"
          >
            Clear Follow-up link
          </button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel title="Schedule / Edit Meeting">
          <div className="grid gap-4">
            <Field
              label="Title"
              placeholder="District e-Governance Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
              <span>
                Creating Office
                <span className="text-red-500 ml-1">*</span>
              </span>
              <select
                value={selectedOfficeCode}
                onChange={(e) => setSelectedOfficeCode(e.target.value)}
                className="clay-input w-full text-sm bg-[#fffaf0] border border-[#e5e5e5] py-2 px-3 focus:border-[#0a0a0a] outline-none"
              >
                {allowedOffices.map((office) => (
                  <option key={office.code} value={office.code}>
                    {office.name} ({office.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
              Agenda
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="min-h-36 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] p-4 text-sm outline-none focus:border-[#0a0a0a]"
                placeholder="Details of discussions, reviews, and agenda items..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Scheduled date and time"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Field
                label="Location"
                placeholder="DM Conference Hall"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="clay-button-secondary inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button className="clay-button" type="submit">
                Schedule Meeting
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Guests Preview">
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
    </form>
  )
}
export default CreateMeeting
