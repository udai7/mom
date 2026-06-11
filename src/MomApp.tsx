import { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
} from 'lucide-react'

import { meetings } from './mockData'
import {
  ROLE_PREFIXES,
  PREFIX_TO_ROLE,
  VIEW_SLUGS,
  SLUG_TO_VIEW,
  profiles,
  type DashboardLevel,
  type WorkspaceView,
  type Icon,
} from './types'

import { IconButton } from './components/Common'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import { MeetingList } from './pages/MeetingList'
import { CreateMeeting } from './pages/CreateMeeting'
import { MeetingDetail } from './pages/MeetingDetail'
import { SubmitSummary } from './pages/SubmitSummary'
import { Hierarchy } from './pages/Hierarchy'
import { Offices } from './pages/Offices'
import { Users as UsersPage } from './pages/Users'

function LandingPageRoot({
  selectedLevel,
  setSelectedLevel,
}: {
  selectedLevel: DashboardLevel
  setSelectedLevel: (level: DashboardLevel) => void
}) {
  const navigate = useNavigate()

  const signIn = () => {
    localStorage.setItem('mom_authenticated', 'true')
    localStorage.setItem('mom_role', selectedLevel)
    navigate(`/${ROLE_PREFIXES[selectedLevel]}/overview`)
  }

  return (
    <LandingPage
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      signIn={signIn}
    />
  )
}

function WorkspaceRoot() {
  const { rolePrefix, viewSlug } = useParams<{ rolePrefix: string; viewSlug: string }>()
  const navigate = useNavigate()

  const level = rolePrefix ? PREFIX_TO_ROLE[rolePrefix] : undefined
  const activeView = viewSlug ? SLUG_TO_VIEW[viewSlug] : undefined

  if (!level || !activeView) {
    return <Navigate to="/" replace />
  }

  const signOut = () => {
    localStorage.removeItem('mom_authenticated')
    localStorage.removeItem('mom_role')
    navigate('/')
  }

  return (
    <Workspace
      level={level}
      activeView={activeView}
      setActiveView={(view) => {
        navigate(`/${ROLE_PREFIXES[level]}/${VIEW_SLUGS[view]}`)
      }}
      signOut={signOut}
    />
  )
}

function RoleRedirect() {
  const { rolePrefix } = useParams<{ rolePrefix: string }>()
  if (rolePrefix && PREFIX_TO_ROLE[rolePrefix]) {
    return <Navigate to={`/${rolePrefix}/overview`} replace />
  }
  return <Navigate to="/" replace />
}

function MomApp() {
  const [selectedLevel, setSelectedLevel] = useState<DashboardLevel>('Office Admin')

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPageRoot
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
            />
          }
        />
        <Route path="/:rolePrefix" element={<RoleRedirect />} />
        <Route path="/:rolePrefix/:viewSlug" element={<WorkspaceRoot />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function Workspace({
  level,
  activeView,
  setActiveView,
  signOut,
}: {
  level: DashboardLevel
  activeView: WorkspaceView
  setActiveView: (view: WorkspaceView) => void
  signOut: () => void
}) {
  const [meetingFilter, setMeetingFilter] = useState('All')
  const profile = profiles.find((item) => item.level === level)!

  const navigation = useMemo(() => getNavigation(level), [level])
  const filteredMeetings =
    meetingFilter === 'All'
      ? meetings
      : meetings.filter((meeting) => meeting.status === meetingFilter)

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-r border-[#e5e5e5] bg-[#faf5e8] text-[#0a0a0a]">
          <div className="flex h-full flex-col">
            <div className="border-b border-[#e5e5e5] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffb084] text-[#0a0a0a]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-[#6a6a6a]">{profile.office}</p>
                  <h1 className="display-type text-xl">{profile.title}</h1>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map(({ view, icon: NavIcon }) => (
                <button
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                    activeView === view
                      ? 'bg-[#0a0a0a] text-white'
                      : 'text-[#3a3a3a] hover:bg-[#f5f0e0]'
                  }`}
                  key={view}
                  onClick={() => setActiveView(view)}
                  type="button"
                >
                  <NavIcon className="h-4 w-4" />
                  {view}
                </button>
              ))}
            </nav>

            <div className="space-y-3 border-t border-[#e5e5e5] p-4">
              <p className="text-sm leading-6 text-[#6a6a6a]">{profile.description}</p>
              <button
                className="clay-button-secondary inline-flex w-full items-center justify-center gap-2"
                onClick={signOut}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-[#fffaf0]/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-[#6a6a6a]">
                  {profile.office} / {level}
                </p>
                <h2 className="display-type text-3xl">
                  {activeView}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#6a6a6a]" />
                  <input
                    className="clay-input h-10 w-64 !pl-10"
                    placeholder="Search records"
                  />
                </div>
                <IconButton label="Notifications">
                  <Bell className="h-4 w-4" />
                </IconButton>
                <button
                  className="clay-button inline-flex items-center gap-2"
                  onClick={() => setActiveView('Create Meeting')}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  New Meeting
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-6">
            {activeView === 'Overview' && <Dashboard level={level} setActiveView={setActiveView} />}
            {activeView === 'Meetings' && (
              <MeetingList
                filteredMeetings={filteredMeetings}
                meetingFilter={meetingFilter}
                readOnly={false}
                setActiveView={setActiveView}
                setMeetingFilter={setMeetingFilter}
              />
            )}
            {activeView === 'Create Meeting' && <CreateMeeting />}
            {activeView === 'Meeting Detail' && <MeetingDetail readOnly={false} />}
            {activeView === 'Submit Summary' && <SubmitSummary />}
            {activeView === 'Hierarchy' && <Hierarchy />}
            {activeView === 'Offices' && <Offices />}
            {activeView === 'Users' && <UsersPage />}
          </div>
        </main>
      </div>
    </div>
  )
}

function getNavigation(level: DashboardLevel): { view: WorkspaceView; icon: Icon }[] {
  if (level === 'Super Admin') {
    return [
      { view: 'Overview', icon: LayoutDashboard },
      { view: 'Hierarchy', icon: GitBranch },
      { view: 'Offices', icon: Building2 },
      { view: 'Users', icon: UserCog },
      { view: 'Meetings', icon: ClipboardList },
      { view: 'Create Meeting', icon: Plus },
    ]
  }

  if (level === 'Parent Office') {
    return [
      { view: 'Overview', icon: LayoutDashboard },
      { view: 'Hierarchy', icon: GitBranch },
      { view: 'Meetings', icon: ClipboardList },
      { view: 'Create Meeting', icon: Plus },
      { view: 'Meeting Detail', icon: FileText },
    ]
  }

  if (level === 'Office Member') {
    return [
      { view: 'Overview', icon: LayoutDashboard },
      { view: 'Meetings', icon: ClipboardList },
      { view: 'Create Meeting', icon: Plus },
      { view: 'Meeting Detail', icon: FileText },
    ]
  }

  return [
    { view: 'Overview', icon: LayoutDashboard },
    { view: 'Meetings', icon: ClipboardList },
    { view: 'Create Meeting', icon: Plus },
    { view: 'Submit Summary', icon: Upload },
    { view: 'Meeting Detail', icon: FileText },
  ]
}

export default MomApp
