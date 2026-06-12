import { useState } from 'react'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  ArrowRight,
  Database,
  Eye,
  History,
  Check,
} from 'lucide-react'
import { meetings } from '../mockData'
import { profiles, type DashboardLevel } from '../types'

export function LandingPage({
  selectedLevel,
  setSelectedLevel,
  signIn,
}: {
  selectedLevel: DashboardLevel
  setSelectedLevel: (level: DashboardLevel) => void
  signIn: () => void
}) {
  const selectedProfile = profiles.find((profile) => profile.level === selectedLevel)!

  const credentials: Record<DashboardLevel, { email: string; pass: string }> = {
    'Office Admin': { email: 'maya.nic@gov.in', pass: 'nic@tripura2026' },
    'Parent Office': { email: 'rc.adm@gov.in', pass: 'adm@tripura2026' },
    'Super Admin': { email: 'udai.das@gov.in', pass: 'super@tripura2026' },
  }

  const activeCreds = credentials[selectedLevel]

  const handleSmoothScroll = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] font-sans selection:bg-[#ffb084] selection:text-[#0a0a0a]">
      {/* Pinned Header / Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#e5e5e5]/80 bg-[#fffaf0]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8b94a] text-[#0a0a0a] shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-[#6a6a6a] uppercase">Government of Tripura</span>
              <h1 className="display-type text-2xl leading-none">MoM Portal</h1>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => handleSmoothScroll('features')} className="text-sm font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] transition">Features</button>
            <button onClick={() => handleSmoothScroll('visualization')} className="text-sm font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] transition">Flow</button>
            <button onClick={() => handleSmoothScroll('portals')} className="text-sm font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] transition">Access Portals</button>
          </div>

          <button
            onClick={() => handleSmoothScroll('portals')}
            className="clay-button inline-flex items-center gap-2"
          >
            Enter Console
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 py-1.5 text-xs font-bold text-[#6a6a6a] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#ff4d8b]" />
              NIC Audited & Compliant Platform
            </div>

            <h1 className="display-type text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Minutes of Meetings <br />
              <span className="text-[#ff4d8b]">Flowing Seamlessly</span> <br />
              Across Hierarchy.
            </h1>

            <p className="max-w-xl text-lg text-[#6a6a6a] leading-relaxed">
              A high-fidelity administrative system designed for block, district, and regional government structures. Upload signed minutes, track action items, and close hierarchy loops instantly.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleSmoothScroll('portals')}
                className="clay-button text-base px-6 py-3.5 inline-flex items-center gap-3"
              >
                Access Portal Console
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSmoothScroll('features')}
                className="clay-button-secondary text-base px-6 py-3.5"
              >
                Learn More
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-[#e5e5e5] pt-8">
              <LandingMetric label="Registered Offices" value="48+" />
              <LandingMetric label="Meetings Audited" value="1,240+" />
              <LandingMetric label="Action Item Rate" value="98.4%" />
            </div>
          </div>

          {/* Interactive visual canvas mockup */}
          <div className="lg:col-span-5">
            <HeroClayScene />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-[#faf5e8] border-y border-[#e5e5e5] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-[#ff4d8b] uppercase">Features</span>
            <h2 className="display-type mt-3 text-4xl sm:text-5xl">Engineered for Regional Structure</h2>
            <p className="mt-4 text-lg text-[#6a6a6a] leading-relaxed">
              Every detail is tailored to represent standard department hierarchy and meet documentation compliance protocols.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="clay-feature bg-white border border-[#e5e5e5]/80 p-8 shadow-sm">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[#ffb084] text-[#0a0a0a]">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="display-type text-2xl mb-3">Inherited Visibility</h3>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">
                Meetings created by child offices flow upwards automatically, ensuring parent offices and super admins maintain comprehensive dashboards without manual check-ins.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="clay-feature bg-white border border-[#e5e5e5]/80 p-8 shadow-sm">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[#b8a4ed] text-[#0a0a0a]">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="display-type text-2xl mb-3">Database-Native PDFs</h3>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">
                Upload scanned, physically signed MoM documents. Files are stored as SQL binary blobs, ensuring tamper-proof compliance archiving.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="clay-feature bg-white border border-[#e5e5e5]/80 p-8 shadow-sm">
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[#a4d4c5] text-[#0a0a0a]">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="display-type text-2xl mb-3">Action Item Threads</h3>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">
                Convert agenda points directly into trackable actions. Assignees from any hierarchy depth receive tasks with mandatory status update cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visualizing Hierarchy Flow */}
      <section id="visualization" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#e8b94a] uppercase">Hierarchy Flow</span>
            <h2 className="display-type text-4xl sm:text-5xl">Closed Loop Verification</h2>
            <p className="text-[#6a6a6a] leading-relaxed">
              Tripura's administrative flow requires verification at multiple steps. MoM Portal links every level:
            </p>

            <div className="space-y-4">
              {[
                { title: '1. Create & Log Agenda', desc: 'Office Admin logs attendees and schedules' },
                { title: '2. Auto-Notify Ancestors', desc: 'Parent office gets real-time notice of new schedules' },
                { title: '3. Upload Signed Minutes', desc: 'Completed meeting summaries locked in binary store' },
                { title: '4. Action Completion Audit', desc: 'Super Admins audit action completion status' },
              ].map((step) => (
                <div key={step.title} className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-[#1a3a3a] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-base">{step.title}</h4>
                    <p className="text-sm text-[#6a6a6a]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Flow Chart */}
          <div className="lg:col-span-7 bg-[#faf5e8] border border-[#e5e5e5]/80 rounded-3xl p-8 shadow-sm">
            <h3 className="display-type text-2xl mb-6">Workflow Trace Diagram</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#a4d4c5] grid place-items-center"><Building2 className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-sm">SCERT Office (Admin)</p>
                    <p className="text-[10px] text-[#6a6a6a]">Create meeting & log action items</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#ff4d8b]">Triggers Outbound</div>
              </div>

              <div className="h-8 w-0.5 bg-[#e5e5e5] mx-auto border-dashed border-l-2" />

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#ffb084] grid place-items-center"><Building2 className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-sm">NIC Office (Admin)</p>
                    <p className="text-[10px] text-[#6a6a6a]">Submit signed summary binary</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#e8b94a]">Approve / Lock</div>
              </div>

              <div className="h-8 w-0.5 bg-[#e5e5e5] mx-auto border-dashed border-l-2" />

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#b8a4ed] grid place-items-center"><Building2 className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-sm">DM Office (Parent)</p>
                    <p className="text-[10px] text-[#6a6a6a]">Inspect overall child metrics</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#22c55e]">Consolidated View</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals */}
      <section id="portals" className="bg-[#faf5e8] border-t border-[#e5e5e5] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-[#ff4d8b] uppercase">Access Portals</span>
            <h2 className="display-type mt-3 text-4xl">Persona Role-Based Viewports</h2>
            <p className="mt-4 text-[#6a6a6a] leading-relaxed">
              Select an administrative access level below to mock-authenticate and experience the tailored dashboard features.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Persona List Selector */}
            <div className="lg:col-span-5 space-y-3">
              {profiles.map((profile) => {
                const isSelected = profile.level === selectedLevel
                return (
                  <button
                    key={profile.level}
                    onClick={() => setSelectedLevel(profile.level)}
                    className={`w-full text-left p-5 rounded-2xl border transition duration-200 flex items-start gap-4 ${
                      isSelected
                        ? 'border-[#0a0a0a] bg-white shadow-md translate-x-1'
                        : 'border-[#e5e5e5]/80 bg-[#fffaf0] hover:bg-white'
                    }`}
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      isSelected ? 'bg-[#ff4d8b] text-white' : 'bg-[#faf5e8] text-[#1a3a3a]'
                    }`}>
                      {profile.level === 'Office Admin' && <Building2 className="h-5 w-5" />}
                      {profile.level === 'Parent Office' && <Eye className="h-5 w-5" />}
                      {profile.level === 'Super Admin' && <UserCog className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{profile.level}</h4>
                      <p className="text-xs text-[#6a6a6a] mt-0.5">{profile.office}</p>
                      <p className="text-sm text-[#6a6a6a] mt-2 line-clamp-2 leading-relaxed">{profile.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Column: Sign In Card */}
            <div className="lg:col-span-7 bg-white border border-[#e5e5e5] rounded-3xl p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-[#faf5e8] pb-4">
                <div>
                  <h3 className="display-type text-2xl">Console Authentication</h3>
                  <p className="text-xs text-[#6a6a6a] mt-1">Mock profile session details</p>
                </div>
                <span className="rounded-full bg-[#faf5e8] px-3 py-1 text-xs font-bold text-[#ff4d8b]">
                  {selectedLevel}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Email Username</label>
                  <input
                    readOnly
                    type="text"
                    value={activeCreds.email}
                    className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Access Passcode</label>
                  <input
                    readOnly
                    type="password"
                    value={activeCreds.pass}
                    className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                  />
                </div>

                <div className="rounded-2xl bg-[#faf5e8] p-4 text-xs text-[#6a6a6a] leading-relaxed">
                  <strong>Verification Note:</strong> This mock authentication signs you into the localized client-state dashboard sandbox simulating exact regional authorization rules.
                </div>

                <button
                  onClick={signIn}
                  className="w-full clay-button py-4 text-base font-bold flex items-center justify-center gap-3 mt-4"
                >
                  Open Dashboard Console
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-[#fffaf0] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#1a3a3a] text-white grid place-items-center"><ShieldCheck className="h-5 w-5" /></div>
            <span className="font-bold text-lg">MoM Portal</span>
          </div>
          <p className="text-sm text-[#6a6a6a] max-w-md mx-auto leading-relaxed">
            Designed for the State and District Administration of Tripura. Ensuring transparency and tracking alignment.
          </p>
          <div className="mt-8 text-xs text-[#6a6a6a]">
            &copy; 2026 National Informatics Centre (NIC), Tripura. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

function LandingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#f5f0e0] p-5">
      <p className="display-type text-4xl">{value}</p>
      <p className="mt-1 text-sm text-[#6a6a6a]">{label}</p>
    </div>
  )
}

function HeroClayScene() {
  return (
    <div className="clay-feature relative min-h-[440px] overflow-hidden bg-[#faf5e8] border border-[#e5e5e5]/80 shadow-md">
      {/* Background soft circles */}
      <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#a4d4c5]/20 blur-xl" />
      
      {/* Connected Nodes Background SVG */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 120 320 C 150 250, 240 260, 280 180" fill="none" stroke="#ebe6d6" strokeWidth="3" strokeDasharray="4 4" />
        <path d="M 280 180 C 320 120, 340 100, 420 80" fill="none" stroke="#ebe6d6" strokeWidth="3" strokeDasharray="4 4" />
        <path d="M 80 140 C 160 120, 200 140, 280 180" fill="none" stroke="#ebe6d6" strokeWidth="3" strokeDasharray="4 4" />
      </svg>

      {/* Floating Blobs (simulating clay shapes) */}
      <div className="clay-blob absolute bottom-8 left-8 h-24 w-40 rounded-[40px] bg-[#e8b94a] opacity-80 float-slow" />
      <div className="clay-blob absolute bottom-16 left-36 h-32 w-48 rounded-[48px] bg-[#ffb084] opacity-90 float-medium" />
      <div className="clay-blob absolute bottom-4 right-6 h-36 w-40 rounded-[54px] bg-[#b8a4ed] opacity-80 float-slow" />
      <div className="clay-blob absolute top-12 left-6 h-16 w-16 rounded-full bg-[#a4d4c5] opacity-75 float-medium" />

      {/* Top Left Tag: Active Office */}
      <div className="absolute left-8 top-8 rounded-full bg-[#1a3a3a] text-white px-4 py-1.5 text-xs font-bold font-jakarta tracking-wide shadow-sm flex items-center gap-1.5 z-10">
        <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
        DM Office (Root)
      </div>

      {/* Floating Card 1: Hierarchy Summary Route */}
      <div className="absolute right-8 top-8 w-56 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-md transition-transform duration-300 hover:scale-[1.03] z-20">
        <div className="mb-3 flex items-center justify-between border-b border-[#faf5e8] pb-2">
          <span className="text-xs font-bold font-jakarta uppercase tracking-wider text-[#6a6a6a]">Summary Route</span>
          <span className="rounded-full bg-[#a4d4c5] px-2 py-0.5 text-[10px] font-bold text-[#0a0a0a]">
            Verified
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { name: 'Block Office A1', level: '1', active: false },
            { name: 'SDO Office A', level: '2', active: false },
            { name: 'NIC Tripura', level: '3', active: true },
            { name: 'DM Office', level: '4', active: true },
          ].map((item) => (
            <div className="flex items-center gap-2" key={item.name}>
              <div className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                item.active ? 'bg-[#0a0a0a] text-white' : 'bg-[#e5e5e5] text-[#3a3a3a]'
              }`}>
                {item.level}
              </div>
              <div className="h-1.5 flex-1 rounded-full bg-[#faf5e8] overflow-hidden">
                <div className={`h-full ${item.active ? 'bg-[#22c55e]' : 'bg-[#e5e5e5]'} w-full`} />
              </div>
              <span className="text-[10px] font-semibold text-[#0a0a0a]">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Card 2: Recent Document Upload */}
      <div className="absolute left-6 bottom-10 w-64 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-lg transition-transform duration-300 hover:scale-[1.03] z-20">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff4d8b] text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0a0a0a] truncate">connectivity-review.pdf</p>
            <p className="text-[10px] text-[#6a6a6a] mt-0.5">DIT Tripura • 12.4 KB</p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#22c55e]" />
              <span className="text-[9px] font-bold font-jakarta text-[#22c55e] uppercase tracking-wider">bytea stored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Big floating status icon */}
      <div className="absolute right-12 bottom-12 grid h-16 w-16 place-items-center rounded-full bg-[#1a3a3a] text-white shadow-lg float-medium z-10 border-2 border-white">
        <ShieldCheck className="h-7 w-7 text-[#e8b94a]" />
      </div>
    </div>
  )
}
