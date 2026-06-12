import { useEffect, useState } from 'react'
import { CalendarDays, Download, MapPin, Users, ArrowLeft, Plus, CheckCircle, Play } from 'lucide-react'
import { Panel, Badge, StatusBadge, Info, MiniMetric, Field } from '../components/Common'
import type { WorkspaceView } from '../types'
import {
  getMeeting,
  updateMeeting,
  addMeetingGuest,
  removeMeetingGuest,
  type BackendMeeting
} from '../api/meetings'
import { printGuestList } from '../utils/printPdf'

export function MeetingDetail({
  readOnly,
  setActiveView,
}: {
  readOnly: boolean
  setActiveView: (view: WorkspaceView) => void
}) {
  const activeId = localStorage.getItem('mom_active_meeting_id')
  
  const [meeting, setMeeting] = useState<BackendMeeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Guest form states
  const [gName, setGName] = useState('')
  const [gDesignation, setGDesignation] = useState('')
  const [gOffice, setGOffice] = useState('')
  const [gDepartment, setGDepartment] = useState('')
  const [gEmail, setGEmail] = useState('')
  const [gPhone, setGPhone] = useState('')
  const [isAddingGuest, setIsAddingGuest] = useState(false)

  const fetchMeetingDetails = async () => {
    if (!activeId) {
      setError('No meeting selected.')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getMeeting(activeId)
      setMeeting(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetingDetails()
  }, [activeId])

  const handleStatusChange = async (newStatus: 'upcoming' | 'ongoing' | 'completed') => {
    if (!meeting) return
    try {
      const updated = await updateMeeting(meeting.id, { status: newStatus })
      setMeeting(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update meeting status.')
    }
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meeting) return
    if (!gName || !gDesignation || !gOffice || !gDepartment || !gEmail || !gPhone) {
      alert('Please fill in all guest details.')
      return
    }

    setIsAddingGuest(true)
    try {
      await addMeetingGuest(meeting.id, {
        name: gName,
        designation: gDesignation,
        office: gOffice,
        department: gDepartment,
        email: gEmail,
        phone: gPhone
      })
      // Clear form
      setGName('')
      setGDesignation('')
      setGOffice('')
      setGDepartment('')
      setGEmail('')
      setGPhone('')
      // Refresh details
      const updated = await getMeeting(meeting.id)
      setMeeting(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add guest.')
    } finally {
      setIsAddingGuest(false)
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (!meeting) return
    if (!window.confirm('Are you sure you want to remove this guest from the meeting?')) {
      return
    }
    try {
      await removeMeetingGuest(meeting.id, guestId)
      const updated = await getMeeting(meeting.id)
      setMeeting(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove guest.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="text-sm text-[#6a6a6a]">Loading meeting details...</p>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-10 text-center">
        <div className="rounded-2xl bg-rose-100 p-6 border border-rose-200 text-sm font-semibold text-rose-800">
          {error || 'Meeting not found.'}
        </div>
        <button
          onClick={() => setActiveView('Meetings')}
          className="clay-button-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('Meetings')}
          className="clay-button-secondary py-2 px-3 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Meetings
        </button>
      </div>

      <section className="clay-feature bg-[#1a3a3a] text-white p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={meeting.status} />
              <Badge>{meeting.office_name || 'N/A'}</Badge>
              <Badge tone={readOnly ? 'amber' : 'mint'}>
                {readOnly ? 'Read only' : 'Editable'}
              </Badge>
            </div>
            <h3 className="display-type text-3xl sm:text-4xl">{meeting.title}</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              <Info icon={CalendarDays}>{meeting.date} {meeting.time}</Info>
              <Info icon={MapPin}>{meeting.venue}</Info>
              <Info icon={Users}>{meeting.guests ? meeting.guests.length : 0} guests</Info>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => printGuestList(meeting)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-neutral-100 active:scale-95 shadow-sm"
              type="button"
            >
              <Download className="h-4 w-4" />
              Download Guests PDF
            </button>
            
            {!readOnly && meeting.status === 'upcoming' && (
              <button
                onClick={() => handleStatusChange('ongoing')}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ffb084] px-4 text-sm font-semibold text-[#0a0a0a] transition hover:bg-[#ffa070] active:scale-95 shadow-sm"
                type="button"
              >
                <Play className="h-4 w-4" />
                Start Meeting
              </button>
            )}

            {!readOnly && meeting.status === 'ongoing' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95 shadow-sm"
                type="button"
              >
                <CheckCircle className="h-4 w-4" />
                Complete Meeting
              </button>
            )}

            {!readOnly && meeting.status === 'completed' && (
              <button
                onClick={() => handleStatusChange('upcoming')}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gray-600 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95 shadow-sm"
                type="button"
              >
                Reset to Upcoming
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        {/* Left Column: Meeting Info */}
        <div className="space-y-5">
          <Panel title="Goal / Agenda">
            <p className="leading-7 text-[#3a3a3a] text-sm sm:text-base whitespace-pre-wrap">
              {meeting.agenda || 'No agenda recorded.'}
            </p>
          </Panel>

          <Panel title="Meeting Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniMetric label="Institution" value={meeting.institution_name} />
              <MiniMetric label="Department" value={meeting.department_name} />
              <MiniMetric label="Meeting Type" value={meeting.meeting_type} />
              <MiniMetric label="Chairperson" value={meeting.chairperson || 'N/A'} />
            </div>
          </Panel>
        </div>

        {/* Right Column: Add Guests Preview/Form */}
        <div>
          {!readOnly ? (
            <Panel title="Add Guest to Registry">
              <form onSubmit={handleAddGuest} className="grid gap-3">
                <Field
                  label="Guest Name"
                  placeholder="e.g. Rajesh Kumar"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Designation"
                    placeholder="e.g. Scientist C"
                    value={gDesignation}
                    onChange={(e) => setGDesignation(e.target.value)}
                    required
                  />
                  <Field
                    label="Office"
                    placeholder="e.g. NIC Tripura"
                    value={gOffice}
                    onChange={(e) => setGOffice(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Department"
                    placeholder="e.g. Tech Division"
                    value={gDepartment}
                    onChange={(e) => setGDepartment(e.target.value)}
                    required
                  />
                  <Field
                    label="Email"
                    placeholder="e.g. rajesh@nic.in"
                    value={gEmail}
                    onChange={(e) => setGEmail(e.target.value)}
                    required
                  />
                </div>
                <Field
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={gPhone}
                  onChange={(e) => setGPhone(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="clay-button w-full mt-2"
                  disabled={isAddingGuest}
                >
                  {isAddingGuest ? 'Adding...' : 'Save Guest & Add to List'}
                </button>
              </form>
            </Panel>
          ) : (
            <Panel title="Access Info">
              <p className="text-sm text-[#6a6a6a]">
                You are viewing this meeting in read-only mode because it belongs to a child office hierarchy.
              </p>
            </Panel>
          )}
        </div>
      </section>

      {/* Guest List Roster */}
      <section className="space-y-5">
        <Panel title="Registered Guest List">
          <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5]/80 bg-[#fffaf0] p-1">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-xs uppercase tracking-[1.5px] text-[#6a6a6a]">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Designation</th>
                  <th className="px-4 py-3 font-semibold">Office</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  {!readOnly && <th className="px-4 py-3 font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody>
                {meeting.guests && meeting.guests.length > 0 ? (
                  meeting.guests.map((g) => (
                    <tr className="border-b border-[#eee7d8] last:border-0 hover:bg-[#faf5e8]/50" key={g.id}>
                      <td className="px-4 py-3 text-[#0a0a0a] font-semibold">{g.name}</td>
                      <td className="px-4 py-3 text-[#0a0a0a]">{g.designation}</td>
                      <td className="px-4 py-3 text-[#0a0a0a]">{g.office}</td>
                      <td className="px-4 py-3 text-[#0a0a0a]">{g.department}</td>
                      <td className="px-4 py-3 text-[#0a0a0a] font-mono text-xs">{g.email}</td>
                      <td className="px-4 py-3 text-[#0a0a0a] font-mono text-xs">{g.phone}</td>
                      {!readOnly && (
                        <td className="px-4 py-3 text-[#0a0a0a]">
                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#6a6a6a]">
                      No guests added to this meeting yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  )
}
export default MeetingDetail
