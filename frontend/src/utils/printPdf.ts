import { type BackendMeeting } from '../api/meetings'

export function printGuestList(meeting: BackendMeeting) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download/print the PDF.')
    return
  }

  const guestsHtml = meeting.guests && meeting.guests.length > 0
    ? meeting.guests.map((g, idx) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">${escapeHtml(g.name)}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(g.designation)}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(g.office)}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(g.department)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">${escapeHtml(g.email)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">${escapeHtml(g.phone)}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #666; border: 1px solid #ddd;">No guests registered yet.</td></tr>`

  printWindow.document.write(`
    <html>
      <head>
        <title>Guest List - ${escapeHtml(meeting.title)}</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #000;
            margin: 30px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 20px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header h2 {
            font-size: 13px;
            margin: 0;
            color: #333;
            font-weight: 600;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 12px;
          }
          .details-table td {
            padding: 6px 10px;
            border: 1px solid #ccc;
          }
          .details-table td.label {
            font-weight: 700;
            background-color: #f9f9f9;
            width: 20%;
          }
          .section-title {
            font-size: 14px;
            margin: 15px 0 8px 0;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table.guests-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          table.guests-table th {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 8px;
            font-weight: 700;
            text-align: left;
          }
          @media print {
            body { margin: 15px; }
            @page {
              size: A4 landscape;
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Government of Tripura</h1>
          <h2>District Meeting Management Portal (MoM)</h2>
          <h3 style="margin-top: 5px; margin-bottom: 0; font-size: 14px;">Official Guest Registry & Attendance Roster</h3>
        </div>

        <div class="section-title">Meeting Details</div>
        <table class="details-table">
          <tr>
            <td class="label">Meeting Title</td>
            <td colspan="3"><strong>${escapeHtml(meeting.title)}</strong></td>
          </tr>
          <tr>
            <td class="label">Creating Office</td>
            <td>${escapeHtml(meeting.office_name || 'N/A')}</td>
            <td class="label">Meeting Type</td>
            <td>${escapeHtml(meeting.meeting_type)}</td>
          </tr>
          <tr>
            <td class="label">Date & Time</td>
            <td>${escapeHtml(meeting.date)} at ${escapeHtml(meeting.time)}</td>
            <td class="label">Venue / Location</td>
            <td>${escapeHtml(meeting.venue)}</td>
          </tr>
          <tr>
            <td class="label">Institution Name</td>
            <td>${escapeHtml(meeting.institution_name)}</td>
            <td class="label">Department Name</td>
            <td>${escapeHtml(meeting.department_name)}</td>
          </tr>
          <tr>
            <td class="label">Chairperson</td>
            <td>${escapeHtml(meeting.chairperson || 'N/A')}</td>
            <td class="label">Status</td>
            <td><strong style="text-transform: uppercase;">${escapeHtml(meeting.status)}</strong></td>
          </tr>
          <tr>
            <td class="label">Agenda / Goal</td>
            <td colspan="3" style="white-space: pre-wrap;">${escapeHtml(meeting.agenda)}</td>
          </tr>
        </table>

        <div class="section-title">Registered Guests & Attendees</div>
        <table class="guests-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">S.No.</th>
              <th style="width: 20%;">Guest Name</th>
              <th style="width: 15%;">Designation</th>
              <th style="width: 15%;">Office</th>
              <th style="width: 15%;">Department</th>
              <th style="width: 15%;">Email Address</th>
              <th style="width: 15%;">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            ${guestsHtml}
          </tbody>
        </table>

        <div style="margin-top: 40px; font-size: 10px; text-align: center; color: #555; border-top: 1px dashed #ccc; padding-top: 10px;">
          This is an official computer-generated document. Printed on ${new Date().toLocaleString()} from MoM Administrative Portal.
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
