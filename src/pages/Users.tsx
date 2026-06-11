import { Plus } from 'lucide-react'
import { users } from '../mockData'
import { Panel, DataTable } from '../components/Common'

export function Users() {
  return (
    <Panel
      action={
        <button className="clay-button inline-flex items-center gap-2" type="button">
          <Plus className="h-4 w-4" />
          Create User
        </button>
      }
      title="User Management"
    >
      <DataTable headers={['Name', 'Email', 'Office', 'Role', 'Status']} rows={users} />
    </Panel>
  )
}
export default Users
