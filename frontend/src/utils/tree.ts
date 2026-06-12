import type { BackendOffice } from '../api/admin'
import type { OfficeNode } from '../mockData'
import { getStoredMeetings } from '../types'

export function buildOfficeTree(officesList: BackendOffice[]): OfficeNode[] {
  const meetings = getStoredMeetings()
  const meetingsCountMap = new Map<string, number>()
  const pendingCountMap = new Map<string, number>()
  const lastMeetingMap = new Map<string, string>()

  for (const m of meetings) {
    meetingsCountMap.set(m.officeCode, (meetingsCountMap.get(m.officeCode) || 0) + 1)
    if (m.status !== 'COMPLETED') {
      pendingCountMap.set(m.officeCode, (pendingCountMap.get(m.officeCode) || 0) + 1)
    }
    const curLast = lastMeetingMap.get(m.officeCode)
    if (!curLast || new Date(m.date) > new Date(curLast)) {
      lastMeetingMap.set(m.officeCode, m.date)
    }
  }

  const nodesMap = new Map<string, OfficeNode & { id: string; parentId: string | null }>()
  
  for (const o of officesList) {
    nodesMap.set(o.id, {
      id: o.id,
      parentId: o.parent_id,
      name: o.name,
      code: o.code,
      type: o.type,
      meetings: meetingsCountMap.get(o.code) || 0,
      pending: pendingCountMap.get(o.code) || 0,
      lastMeeting: lastMeetingMap.get(o.code) || 'N/A',
      children: []
    })
  }

  const roots: OfficeNode[] = []
  for (const node of nodesMap.values()) {
    if (node.parentId && nodesMap.has(node.parentId)) {
      nodesMap.get(node.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
