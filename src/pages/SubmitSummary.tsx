import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paperclip, FileText, CheckCircle2 } from 'lucide-react'
import { Panel, Field } from '../components/Common'
import { getStoredMeetings, saveStoredMeetings, type DashboardLevel, ROLE_PREFIXES } from '../types'
import type { Meeting } from '../mockData'

export function SubmitSummary() {
  const navigate = useNavigate()
  const activeRole = (localStorage.getItem('mom_role') as DashboardLevel) || 'Office Admin'

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeetingId, setSelectedMeetingId] = useState('')
  const [discussion, setDiscussion] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [fileName, setFileName] = useState('')
  const [isUploaded, setIsUploaded] = useState(false)

  useEffect(() => {
    const all = getStoredMeetings()
    // Find meetings that are not completed yet
    const pending = all.filter((m) => m.status !== 'COMPLETED')
    setMeetings(pending)

    // Default to the active meeting if it's pending
    const activeId = localStorage.getItem('mom_active_meeting_id')
    if (activeId && pending.some((m) => m.id === activeId)) {
      setSelectedMeetingId(activeId)
    } else if (pending.length > 0) {
      setSelectedMeetingId(pending[0].id)
    }
  }, [])

  const handleMockUpload = () => {
    setFileName('signed-minutes-mom-' + Math.floor(Math.random() * 1000) + '.pdf')
    setIsUploaded(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeetingId) {
      alert('Please select a meeting to submit a summary for.')
      return
    }

    const all = getStoredMeetings()
    const updated = all.map((meeting) => {
      if (meeting.id === selectedMeetingId) {
        return {
          ...meeting,
          status: 'COMPLETED' as const,
          summary: 'Submitted v1 (bytea PDF locked)',
          pdfFileName: fileName || 'signed-minutes.pdf',
          actionItems: taskTitle ? meeting.actionItems + 1 : meeting.actionItems,
          agenda: discussion ? meeting.agenda + '\n\nDecisions:\n' + discussion : meeting.agenda,
        }
      }
      return meeting
    })

    saveStoredMeetings(updated)
    alert('Meeting summary submitted and archived as tampered-proof PDF blob!')

    const prefix = ROLE_PREFIXES[activeRole]
    navigate(`/${prefix}/overview`)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Submit Meeting Summary">
        <div className="space-y-4">
          <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
            <span>
              Select Meeting
              <span className="text-red-500 ml-1">*</span>
            </span>
            <select
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              className="clay-input w-full text-sm bg-[#fffaf0] border border-[#e5e5e5] py-2 px-3 focus:border-[#0a0a0a] outline-none"
            >
              {meetings.length > 0 ? (
                meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.officeName})
                  </option>
                ))
              ) : (
                <option value="">No pending meetings available</option>
              )}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#0a0a0a]">
            Discussion Points & Decisions
            <textarea
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              className="min-h-36 rounded-xl border border-[#e5e5e5] bg-[#fffaf0] p-4 text-sm outline-none focus:border-[#0a0a0a]"
              placeholder="Record all agreed points, resolutions, and outcomes..."
              required
            />
          </label>

          <button type="submit" className="clay-button w-full sm:w-auto">
            Submit Summary
          </button>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="New Action Item">
          <div className="space-y-3">
            <Field
              label="Task"
              placeholder="Prepare connectivity report"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Field
              label="Assignee"
              placeholder="DIT Tripura"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
            />
            <Field
              label="Due date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
        </Panel>

        <Panel title="PDF Upload">
          <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#f5f0e0] p-6 text-center">
            {isUploaded ? (
              <div className="space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#22c55e] animate-bounce" />
                <p className="font-semibold text-sm text-[#0a0a0a] truncate">{fileName}</p>
                <p className="text-xs text-[#6a6a6a]">24.5 KB • Locked in PostgreSQL bytea</p>
                <button
                  type="button"
                  onClick={() => setIsUploaded(false)}
                  className="text-xs font-bold text-red-500 hover:underline mt-2 block mx-auto"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <Paperclip className="mx-auto h-8 w-8 text-[#6a6a6a]" />
                <p className="mt-3 font-semibold text-sm text-[#0a0a0a]">Drop signed minutes PDF</p>
                <p className="mt-1 text-xs text-[#6a6a6a]">Maximum size 20 MB</p>
                <button type="button" onClick={handleMockUpload} className="clay-button mt-4">
                  Choose PDF
                </button>
              </>
            )}
          </div>
        </Panel>
      </div>
    </form>
  )
}
export default SubmitSummary
