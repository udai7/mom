import { offices } from '../mockData'
import { Panel, Field } from '../components/Common'
import { OfficeTree } from '../components/OfficeTreeComponents'

export function Offices() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel title="Office Tree Management">
        <OfficeTree nodes={offices} />
      </Panel>
      <Panel title="Add / Edit Office">
        <div className="space-y-4">
          <Field label="Office name" placeholder="e-Governance Cell" />
          <Field label="Office code" placeholder="EGOV-01" />
          <Field label="Parent office" placeholder="DIT Tripura" />
          <Field label="Contact email" placeholder="office@gov.in" />
          <button className="clay-button w-full" type="button">
            Save Office
          </button>
        </div>
      </Panel>
    </div>
  )
}
export default Offices
