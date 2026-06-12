import { useEffect, useState } from 'react'
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
import { Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react'

export function Offices() {
  const authUser = getStoredAuthUser()
  const isSuper = authUser?.role === 'SUPER_ADMIN'

  // States
  const [officesList, setOfficesList] = useState<BackendOffice[]>([])
  const [treeNodes, setTreeNodes] = useState<OfficeNode[]>([])
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([])
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

  const loadData = async () => {
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
          address_line_1: addressLine1,
          city: city || undefined,
          district,
          state,
          pincode: pincode || undefined,
          admin_name: adminName,
          admin_designation: adminDesignation,
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
          address_line_1: addressLine1,
          city: city || undefined,
          district,
          state,
          pincode: pincode || undefined,
          admin_name: adminName,
          admin_designation: adminDesignation,
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
      setAddressLine1('')
      setCity('')
      setDistrict('')
      setState('')
      setPincode('')
      setAdminName('')
      setAdminDesignation('')
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

      {pendingRequests.length > 0 && (
        <Panel title="Pending Registrations Approval Queue">
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
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="border-b border-[#e5e5e5] hover:bg-white transition">
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
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_450px]">
        <Panel title="Office Tree Management">
          {loading ? (
            <p className="text-sm text-[#6a6a6a]">Loading office hierarchy...</p>
          ) : treeNodes.length === 0 ? (
            <p className="text-sm text-[#6a6a6a]">No offices found.</p>
          ) : (
            <OfficeTree nodes={treeNodes} />
          )}
        </Panel>

        <Panel title={isSuper ? 'Register New DM Office' : 'Add Child / Sub-Office'}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#6a6a6a] border-b border-[#e5e5e5] pb-1">
              Office Details
            </h3>

            {!isSuper && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3a3a3a]">Parent Office *</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="clay-input w-full text-sm bg-white"
                  required
                >
                  <option value="">Select Parent Office</option>
                  {officesList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Field
              label="Office Name *"
              placeholder="e.g. NIC Tripura State Centre"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              required
            />

            {!isSuper && (
              <Field
                label="Office Slug / Short Code *"
                placeholder="e.g. nic"
                value={officeSlug}
                onChange={(e) => setOfficeSlug(e.target.value)}
                required
              />
            )}

            {!isSuper && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#3a3a3a]">Office Type *</label>
                <select
                  value={officeType}
                  onChange={(e) => setOfficeType(e.target.value)}
                  className="clay-input w-full text-sm bg-white"
                  required
                >
                  <option value="NIC">NIC (National Informatics Centre)</option>
                  <option value="DIT">DIT (Department of IT)</option>
                  <option value="SCERT">SCERT</option>
                  <option value="TRML">TRML</option>
                  <option value="ADM">ADM</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            )}

            {!isSuper && (
              <Field
                label="Department Name"
                placeholder="e.g. Ministry of Electronics & IT"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            )}

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

            <Field
              label="Admin Designation *"
              placeholder="e.g. State Informatics Officer"
              value={adminDesignation}
              onChange={(e) => setAdminDesignation(e.target.value)}
              required
            />

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
              {isSuper ? 'Create & Activate DM Office' : 'Submit Registration Request'}
            </button>
          </form>
        </Panel>
      </div>
    </div>
  )
}
export default Offices
