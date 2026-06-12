import { useEffect, useState } from 'react'
import { Panel, Badge } from '../components/Common'
import {
  getAccounts,
  blockAccount,
  deactivateAccount,
  reactivateAccount,
  resetPassword,
  type BackendUser
} from '../api/admin'
import { ShieldAlert, CheckCircle2, Ban, ShieldCheck, RefreshCw, Trash2, Power } from 'lucide-react'

export function Users() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadUsers = async () => {
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
          <p className="text-sm text-[#6a6a6a]">Loading users...</p>
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
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#e5e5e5] hover:bg-white transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0a0a0a]">{u.full_name}</p>
                      <p className="text-xs text-[#6a6a6a]">{u.email} • {u.designation}</p>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
export default Users
