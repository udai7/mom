import { offices } from '../mockData'
import { Panel } from '../components/Common'
import { OfficeTree } from '../components/OfficeTreeComponents'

export function Hierarchy() {
  return (
    <Panel title="Office Tree Hierarchy">
      <OfficeTree nodes={offices} />
    </Panel>
  )
}
export default Hierarchy
