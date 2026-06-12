import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Panel, Field } from '../components/Common'
import { getStoredAuthUser } from '../MomApp'
import { createMeeting } from '../api/meetings'
import { ROLE_PREFIXES, type DashboardLevel } from '../types'

export function CreateMeeting() {
  const navigate = useNavigate()

  // Read active session profile details
  const activeRole = (localStorage.getItem('mom_role') as DashboardLevel) || 'Office Admin'
  const authUser = getStoredAuthUser()

  // State definitions for all required fields
  const [title, setTitle] = useState('')
  const [agenda, setAgenda] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [meetingType, setMeetingType] = useState('Review')
  const [chairperson, setChairperson] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !agenda || !date || !time || !venue || !institutionName || !departmentName || !meetingType) {
      alert('Please fill in all mandatory fields.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await createMeeting({
        title,
        agenda,
        date,
        time,
        venue,
        institution_name: institutionName,
        department_name: departmentName,
        meeting_type: meetingType,
        chairperson: chairperson.trim() || null
      })

      // Navigate to meetings page
      const prefix = ROLE_PREFIXES[activeRole]
      navigate(`/${prefix}/meetings`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSchedule} className="space-y-5">
      <div className="max-w-3xl mx-auto">
        <Panel title="Schedule New Meeting">
          {error && (
            <div className="rounded-2xl bg-rose-100 p-4 border border-rose-200 text-sm font-semibold text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <Field
              label="Meeting Title"
              placeholder="e.g. Quarterly Review Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>Creating Office (Automatic)</span>
                <input
                  className="clay-input w-full text-sm bg-[#faf5e8]/70 opacity-80 cursor-not-allowed"
                  type="text"
                  value={authUser?.office?.name || 'Your Office'}
                  disabled
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>
                  Meeting Type
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="clay-input w-full text-sm bg-[#fffaf0] border border-[#e5e5e5] py-2 px-3 focus:border-[#0a0a0a] outline-none"
                >
                  <option value="Review">Review Meeting</option>
                  <option value="Briefing">Briefing Session</option>
                  <option value="Audit">Audit / Compliance</option>
                  <option value="Emergency">Emergency Meeting</option>
                  <option value="General">General / Discussion</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Institution Name"
                placeholder="e.g. Department of IT"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
              <Field
                label="Department Name"
                placeholder="e.g. Software Development"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Chairperson (Optional)"
                placeholder="e.g. Mr. John Doe, Director"
                value={chairperson}
                onChange={(e) => setChairperson(e.target.value)}
              />
              <Field
                label="Venue / Location"
                placeholder="e.g. Conference Hall A"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>
                  Date
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="clay-input w-full text-sm"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
                <span>
                  Time
                  <span className="text-red-500 ml-1">*</span>
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="clay-input w-full text-sm"
                  required
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
              <span>
                Goal / Agenda
                <span className="text-red-500 ml-1">*</span>
              </span>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="min-h-36 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] p-4 text-sm outline-none focus:border-[#0a0a0a]"
                placeholder="Details of discussions, reviews, and agenda items..."
                required
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="clay-button-secondary inline-flex items-center gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button className="clay-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </form>
  )
}
export default CreateMeeting
