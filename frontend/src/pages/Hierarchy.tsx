import { useEffect, useState } from 'react'
import { Panel } from '../components/Common'
import { OfficeTree } from '../components/OfficeTreeComponents'
import { getAllOffices, type BackendOffice } from '../api/admin'
import { buildOfficeTree } from '../utils/tree'
import type { OfficeNode } from '../mockData'

export function Hierarchy() {
  const [nodes, setNodes] = useState<OfficeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllOffices()
      .then((data) => {
        setNodes(buildOfficeTree(data))
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load hierarchy')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Panel title="Office Tree Hierarchy">
      {loading && <p className="text-sm text-[#6a6a6a]">Loading hierarchy...</p>}
      {error && <p className="text-sm text-rose-700 font-semibold">{error}</p>}
      {!loading && !error && nodes.length === 0 && (
        <p className="text-sm text-[#6a6a6a]">No offices found in hierarchy.</p>
      )}
      {!loading && !error && nodes.length > 0 && <OfficeTree nodes={nodes} />}
    </Panel>
  )
}
export default Hierarchy

