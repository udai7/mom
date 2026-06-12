import { useEffect, useState, Fragment } from 'react'
import { Panel, Field, Badge } from '../components/Common'
import { OfficeTree } from '../components/OfficeTreeComponents'
import {
  getAllOffices,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  registerDM,
  registerOffice,
  type BackendOffice,
  type RegistrationRequest
} from '../api/admin'
import { buildOfficeTree } from '../utils/tree'
import type { OfficeNode } from '../mockData'
import { getStoredAuthUser } from '../MomApp'
import { Check, X, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

export function Offices() {
  const authUser = getStoredAuthUser()
  const isSuper = authUser?.role === 'SUPER_ADMIN'

  // States
  const [officesList, setOfficesList] = useState<BackendOffice[]>([])
  const [treeNodes, setTreeNodes] = useState<OfficeNode[]>([])
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([])
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form states
  const [officeName, setOfficeName] = useState('')
  const [officeSlug, setOfficeSlug] = useState('')
  const [officeType, setOfficeType] = useState(isSuper ? 'DM' : 'NIC')
  const [department, setDepartment] = useState('')
  const [officialEmail, setOfficialEmail] = useState('')
  const [officialPhone, setOfficialPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  
  const [adminName, setAdminName] = useState('')
  const [adminDesignation, setAdminDesignation] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMobile, setAdminMobile] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const [selectedParentId, setSelectedParentId] = useState('')
  const [website, setWebsite] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await getAllOffices()
      setOfficesList(list)
      setTreeNodes(buildOfficeTree(list))

      if (authUser?.role !== 'OFFICE_MEMBER') {
        const pending = await getPendingRegistrations()
        setPendingRequests(pending)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill parent ID if user is not super
  useEffect(() => {
    if (officesList.length > 0 && !isSuper && authUser?.office?.id) {
      setSelectedParentId(authUser.office.id)
    }
  }, [officesList])

  const handleApprove = async (id: string) => {
    const note = prompt('Enter an optional review note:')
    if (note === null) return // cancel
    try {
      setError('')
      await approveRegistration(id, note)
      setSuccessMsg('Registration request approved successfully.')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Enter the reason for rejection (required):')
    if (!reason) {
      if (reason === '') alert('Rejection reason is required.')
      return
    }
    try {
      setError('')
      await rejectRegistration(id, reason)
      setSuccessMsg('Registration request rejected successfully.')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    try {
      if (isSuper) {
        await registerDM({
          name: officeName,
          official_email: officialEmail,
          official_phone: officialPhone,
          website: website || undefined,
          address_line_1: addressLine1,
          city: city || undefined,
          district,
          state,
          pincode: pincode || undefined,
          admin_name: adminName,
          admin_designation: adminDesignation,
          employee_id: employeeId || undefined,
          admin_email: adminEmail,
          admin_mobile: adminMobile,
          admin_password: adminPassword,
        })
        setSuccessMsg('DM Office created and activated successfully.')
      } else {
        if (!selectedParentId) {
          throw new Error('Please select a parent office.')
        }
        await registerOffice({
          parent_id: selectedParentId,
          name: officeName,
          office_slug: officeSlug,
          type: officeType,
          department: department || undefined,
          official_email: officialEmail,
          official_phone: officialPhone,
          website: website || undefined,
          address_line_1: addressLine1,
          city: city || undefined,
          district,
          state,
          pincode: pincode || undefined,
          admin_name: adminName,
          admin_designation: adminDesignation,
          employee_id: employeeId || undefined,
          admin_email: adminEmail,
          admin_mobile: adminMobile,
          admin_password: adminPassword,
        })
        setSuccessMsg('Office registration submitted. Pending parent approval.')
      }

      // Reset form fields
      setOfficeName('')
      setOfficeSlug('')
      setDepartment('')
      setOfficialEmail('')
      setOfficialPhone('')
      setWebsite('')
      setAddressLine1('')
      setCity('')
      setDistrict('')
      setState('')
      setPincode('')
      setAdminName('')
      setAdminDesignation('')
      setEmployeeId('')
      setAdminEmail('')
      setAdminMobile('')
      setAdminPassword('')

      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-700 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {authUser?.role !== 'OFFICE_MEMBER' && (
        <Panel title="Pending Registrations Approval Queue">
          {loading ? (
            <div className="space-y-4 animate-pulse p-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                  <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                  <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                  <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-sm text-[#6a6a6a]">No pending registration requests to approve.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[#6a6a6a]">
                    <th className="py-3 px-4 font-semibold">Office Details</th>
                    <th className="py-3 px-4 font-semibold">Admin Account</th>
                    <th className="py-3 px-4 font-semibold">Submitted At</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => {
                    const isExpanded = expandedRequestId === req.id
                    const payload = req.submitted_payload || {}
                    return (
                      <Fragment key={req.id}>
                        <tr className="border-b border-[#e5e5e5] hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#0a0a0a]">{req.office.name}</p>
                            <p className="text-xs text-[#6a6a6a] font-mono">{req.office.code} • {req.office.type}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#0a0a0a]">{req.primary_user.full_name}</p>
                            <p className="text-xs text-[#6a6a6a]">{req.primary_user.email} • {req.primary_user.designation}</p>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#6a6a6a]">
                            {new Date(req.submitted_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                title={isExpanded ? "Hide Details" : "View Full Details"}
                                type="button"
                              >
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </button>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                title="Approve"
                                type="button"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                title="Reject"
                                type="button"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/40 border-b border-[#e5e5e5]">
                            <td colSpan={4} className="px-6 py-5">
                              <div className="grid gap-6 md:grid-cols-2 text-xs text-[#3a3a3a] text-left">
                                {/* Office Details Card */}
                                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4a5568] border-b border-[#edf2f7] pb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-3 bg-[#3182ce] rounded-full"></span>
                                    Office Registration Details
                                  </h4>
                                  <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                                    <span className="font-semibold text-[#718096]">Official Email:</span>
                                    <span className="col-span-2 font-mono text-[#1a202c]">{payload.official_email || 'N/A'}</span>
                                    
                                    <span className="font-semibold text-[#718096]">Official Phone:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.official_phone || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Department:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.department || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Website:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.website || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Address:</span>
                                    <span className="col-span-2 text-[#1a202c]">
                                      {[
                                        payload.address_line_1,
                                        payload.address_line_2,
                                        payload.city,
                                        payload.district,
                                        payload.state,
                                        payload.pincode
                                      ].filter(Boolean).join(', ')}
                                    </span>
                                  </div>
                                </div>

                                {/* Admin Account Details Card */}
                                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4a5568] border-b border-[#edf2f7] pb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-3 bg-[#e53e3e] rounded-full"></span>
                                    Primary Admin Account Details
                                  </h4>
                                  <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                                    <span className="font-semibold text-[#718096]">Full Name:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.admin_name || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Designation:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.admin_designation || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Login Email:</span>
                                    <span className="col-span-2 font-mono text-[#1a202c]">{payload.admin_email || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Mobile Number:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.admin_mobile || 'N/A'}</span>

                                    <span className="font-semibold text-[#718096]">Employee ID:</span>
                                    <span className="col-span-2 text-[#1a202c]">{payload.employee_id || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <div className={isSuper ? "grid gap-6 xl:grid-cols-[1fr_450px]" : "space-y-6"}>
        <Panel title="Office Tree Management">
          {loading ? (
            <div className="space-y-3 animate-pulse p-2">
              <div className="h-12 bg-slate-100 rounded-2xl border border-slate-200"></div>
              <div className="h-12 bg-slate-100 rounded-2xl border border-slate-200 ml-6 w-[95%]"></div>
              <div className="h-12 bg-slate-100 rounded-2xl border border-slate-200 ml-12 w-[90%]"></div>
            </div>
          ) : treeNodes.length === 0 ? (
            <p className="text-sm text-[#6a6a6a]">No offices found.</p>
          ) : (
            <OfficeTree nodes={treeNodes} />
          )}
        </Panel>

        {isSuper && (
          <Panel title="Register New DM Office">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6a6a6a] border-b border-[#e5e5e5] pb-1">
                Office Details
              </h3>

              <Field
                label="Office Name *"
                placeholder="e.g. NIC Tripura State Centre"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Office Email *"
                  type="email"
                  placeholder="office@gov.in"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  required
                />
                <Field
                  label="Office Phone *"
                  placeholder="0381-2350022"
                  value={officialPhone}
                  onChange={(e) => setOfficialPhone(e.target.value)}
                  required
                />
              </div>

              <Field
                label="Website URL"
                placeholder="e.g. https://sdmwest.tripura.gov.in"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              <Field
                label="Address Line 1 *"
                placeholder="e.g. Secretariat Complex"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="District *"
                  placeholder="West Tripura"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
                <Field
                  label="State *"
                  placeholder="Tripura"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>

              <Field
                label="Pincode"
                placeholder="799010"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />

              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6a6a6a] border-b border-[#e5e5e5] pb-1 pt-2">
                Primary Account Holder Details
              </h3>

              <Field
                label="Admin Full Name *"
                placeholder="e.g. Maya Debbarma"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Admin Designation *"
                  placeholder="e.g. State Informatics Officer"
                  value={adminDesignation}
                  onChange={(e) => setAdminDesignation(e.target.value)}
                  required
                />
                <Field
                  label="Employee ID"
                  placeholder="e.g. EMP123456"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Login Email *"
                  type="email"
                  placeholder="maya.nic@gov.in"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <Field
                  label="Mobile Number *"
                  placeholder="9436123456"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  required
                />
              </div>

              <Field
                label="Initial Password *"
                type="password"
                placeholder="At least 10 chars, letter + digit"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />

              <button className="clay-button w-full mt-2 py-3.5 text-base" type="submit">
                Create & Activate DM Office
              </button>
            </form>
          </Panel>
        )}
      </div>
    </div>
  )
}
export default Offices
