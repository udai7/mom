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
  Menu,
} from 'lucide-react'

import { isAncestorOrSelf } from './mockData'
import {
  ROLE_PREFIXES,
  PREFIX_TO_ROLE,
  VIEW_SLUGS,
  SLUG_TO_VIEW,
  profiles,
  type DashboardLevel,
  type WorkspaceView,
  type Icon,
  getStoredMeetings,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const profile = profiles.find((item) => item.level === level)!

  const navigation = useMemo(() => getNavigation(level), [level])

  // Load meetings dynamically from local storage
  const allMeetings = getStoredMeetings()
  const visibleMeetings = level === 'Super Admin'
    ? allMeetings
    : allMeetings.filter((m) => isAncestorOrSelf(profile.officeCode, m.officeCode))

  const filteredMeetings =
    meetingFilter === 'All'
      ? visibleMeetings
      : visibleMeetings.filter((meeting) => meeting.status === meetingFilter)

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a]">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a0a0a]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#faf5e8] border-r border-[#e5e5e5] text-[#0a0a0a] transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-[#e5e5e5] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffb084] text-[#0a0a0a]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-[#6a6a6a] truncate max-w-[170px]">{profile.office}</p>
                  <h1 className="display-type text-lg">{profile.title}</h1>
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
                  onClick={() => {
                    setActiveView(view)
                    setIsMobileMenuOpen(false)
                  }}
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

        {/* Main Workspace Frame */}
        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-[#fffaf0]/95 backdrop-blur">
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 lg:hidden border-b border-[#e5e5e5]/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 rounded-lg hover:bg-[#f5f0e0]"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-6 w-6 text-[#1a3a3a]" />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-semibold">{profile.office}</p>
                  <h1 className="display-type text-base">{profile.title}</h1>
                </div>
              </div>
              <IconButton label="Notifications">
                <Bell className="h-4 w-4" />
              </IconButton>
            </div>

            {/* Sub Header Content */}
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#6a6a6a]">
                  {profile.office} / {level}
                </p>
                <h2 className="display-type text-3xl">
                  {activeView}
                </h2>
              </div>
              <div className="lg:hidden">
                <h2 className="display-type text-2xl">{activeView}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex flex-1 sm:flex-initial items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#6a6a6a]" />
                  <input
                    className="clay-input h-10 w-full sm:w-64 !pl-10 text-sm"
                    placeholder="Search records"
                  />
                </div>
                <div className="hidden lg:block">
                  <IconButton label="Notifications">
                    <Bell className="h-4 w-4" />
                  </IconButton>
                </div>
                {level !== 'Parent Office' && (
                  <button
                    className="clay-button inline-flex items-center gap-2 text-sm"
                    onClick={() => setActiveView('Create Meeting')}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    New Meeting
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="px-5 py-6">
            {activeView === 'Overview' && <Dashboard level={level} setActiveView={setActiveView} />}
            {activeView === 'Meetings' && (
              <MeetingList
                filteredMeetings={filteredMeetings}
                meetingFilter={meetingFilter}
                readOnly={level === 'Parent Office'}
                setActiveView={setActiveView}
                setMeetingFilter={setMeetingFilter}
              />
            )}
            {activeView === 'Create Meeting' && <CreateMeeting />}
            {activeView === 'Meeting Detail' && (
              <MeetingDetail
                readOnly={level === 'Parent Office'}
                setActiveView={setActiveView}
              />
            )}
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



  return [
    { view: 'Overview', icon: LayoutDashboard },
    { view: 'Meetings', icon: ClipboardList },
    { view: 'Create Meeting', icon: Plus },
    { view: 'Submit Summary', icon: Upload },
    { view: 'Meeting Detail', icon: FileText },
  ]
}

export default MomApp
