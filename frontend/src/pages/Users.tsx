import { useEffect, useState, Fragment } from 'react'
import { Panel, Badge } from '../components/Common'
import {
  getAccounts,
  blockAccount,
  deactivateAccount,
  reactivateAccount,
  resetPassword,
  type BackendUser
} from '../api/admin'
import { ShieldAlert, CheckCircle2, Ban, ShieldCheck, RefreshCw, Trash2, Power, ChevronDown, ChevronUp } from 'lucide-react'

export function Users() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await getAccounts()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleBlock = async (id: string) => {
    try {
      setError('')
      setSuccessMsg('')
      await blockAccount(id)
      setSuccessMsg('Account blocked successfully.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block account')
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      setError('')
      setSuccessMsg('')
      await deactivateAccount(id)
      setSuccessMsg('Account deactivated successfully.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate account')
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      setError('')
      setSuccessMsg('')
      await reactivateAccount(id)
      setSuccessMsg('Account activated successfully.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate account')
    }
  }

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password (at least 10 characters, including a letter and digit):')
    if (!newPassword) return
    try {
      setError('')
      setSuccessMsg('')
      await resetPassword(id, newPassword)
      setSuccessMsg('Password reset successfully. User must change password upon next login.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
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

      <Panel title="User Account Management Directory">
        {loading ? (
          <div className="space-y-4 animate-pulse p-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-4">
                <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                <div className="h-6 bg-slate-200 rounded col-span-1"></div>
                <div className="h-6 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-10 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-[#6a6a6a]">No users found in your scope.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[#6a6a6a]">
                  <th className="py-3 px-4 font-semibold">Name & Contact</th>
                  <th className="py-3 px-4 font-semibold">Office Code / Name</th>
                  <th className="py-3 px-4 font-semibold">System Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isExpanded = expandedUserId === u.id
                  return (
                    <Fragment key={u.id}>
                      <tr className="border-b border-[#e5e5e5] hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0a0a0a]">{u.full_name}</p>
                          <p className="text-xs text-[#6a6a6a]">{u.email} • {u.designation}</p>
                          <button
                            onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                            className="mt-1.5 text-xs text-[#0066cc] hover:underline flex items-center gap-1 font-semibold"
                            type="button"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3" /> Hide User Info
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" /> View User Info
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.office.code ? (
                            <>
                              <p className="font-semibold text-[#0a0a0a]">{u.office.name}</p>
                              <p className="text-xs text-[#6a6a6a] font-mono">{u.office.code}</p>
                            </>
                          ) : (
                            <p className="text-xs text-[#6a6a6a] italic">Central System User</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-[#3a3a3a]">
                          {u.role}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            tone={
                              u.status === 'ACTIVE'
                                ? 'green'
                                : u.status === 'BLOCKED'
                                ? 'red'
                                : 'amber'
                            }
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex gap-2">
                            {u.status === 'ACTIVE' ? (
                              <>
                                <button
                                  onClick={() => handleBlock(u.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                  title="Block Account"
                                  type="button"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeactivate(u.id)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                                  title="Deactivate Account"
                                  type="button"
                                >
                                  <Power className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReactivate(u.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                title="Activate Account"
                                type="button"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleResetPassword(u.id)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                              title="Reset Password"
                              type="button"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={5} className="py-4 px-6 border-b border-[#e5e5e5]">
                            <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl text-xs space-y-3 text-[#4a5568] shadow-sm">
                              <div className="flex items-center justify-between border-b border-[#edf2f7] pb-1.5">
                                <span className="font-bold text-[#2d3748] uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <span className="w-1.5 h-3 bg-[#0066cc] rounded-full"></span>
                                  User Profile & Status Information
                                </span>
                                <span className="font-mono text-[#718096] text-[10px]">ID: {u.id}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                  <p className="font-bold text-[#2d3748] text-xs pb-0.5 border-b border-slate-100">Primary Contact</p>
                                  <p><span className="font-semibold text-[#718096]">Full Name:</span> <span className="text-[#1a202c] font-medium">{u.full_name}</span></p>
                                  <p><span className="font-semibold text-[#718096]">Email Address:</span> <span className="font-mono text-[#1a202c]">{u.email}</span></p>
                                  <p><span className="font-semibold text-[#718096]">Mobile Number:</span> <span className="text-[#1a202c]">{u.mobile_number || 'N/A'}</span></p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="font-bold text-[#2d3748] text-xs pb-0.5 border-b border-slate-100">Role & Identity</p>
                                  <p><span className="font-semibold text-[#718096]">Designation:</span> <span className="text-[#1a202c]">{u.designation}</span></p>
                                  <p><span className="font-semibold text-[#718096]">Employee ID:</span> <span className="font-mono text-[#1a202c]">{u.employee_id || 'N/A'}</span></p>
                                  <p><span className="font-semibold text-[#718096]">System Role:</span> <span className="text-[#1a202c] font-semibold">{u.role}</span></p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="font-bold text-[#2d3748] text-xs pb-0.5 border-b border-slate-100">Security & Status</p>
                                  <p><span className="font-semibold text-[#718096]">Must Reset Password:</span> <span className="text-[#1a202c] font-semibold">{u.must_change_password ? 'Yes (Pending)' : 'No'}</span></p>
                                  <p className="text-[11px] leading-relaxed">
                                    <span className="font-semibold text-[#718096]">Access Permissions:</span>{' '}
                                    <span className="text-slate-600 font-mono text-[10px] break-all bg-slate-50 px-1.5 py-0.5 rounded block mt-0.5">
                                      {u.permissions && u.permissions.length > 0 ? u.permissions.join(', ') : 'None'}
                                    </span>
                                  </p>
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
    </div>
  )
}
export default Users
