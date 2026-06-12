import { useState, useMemo, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getMeetings, type BackendMeeting } from './api/meetings'
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
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { MeetingList } from './pages/MeetingList'
import { CreateMeeting } from './pages/CreateMeeting'
import { MeetingDetail } from './pages/MeetingDetail'
import { SubmitSummary } from './pages/SubmitSummary'
import { Hierarchy } from './pages/Hierarchy'
import { Offices } from './pages/Offices'
import { Users as UsersPage } from './pages/Users'
import {
  clearAuthSession,
  login,
  logout,
  saveAuthSession,
  type AuthUser,
  type BackendRole,
} from './api/auth'

const BACKEND_ROLE_TO_DASHBOARD: Record<BackendRole, DashboardLevel> = {
  SUPER_ADMIN: 'Super Admin',
  DM_ADMIN: 'Parent Office',
  OFFICE_ADMIN: 'Office Admin',
  OFFICE_MEMBER: 'Office Admin',
}

function LandingPageRoot({
  selectedLevel,
  setSelectedLevel,
}: {
  selectedLevel: DashboardLevel
  setSelectedLevel: (level: DashboardLevel) => void
}) {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Redirect if already authenticated
  const authUser = getStoredAuthUser()
  const token = localStorage.getItem('mom_access_token')
  if (token && authUser) {
    const mappedLevel = BACKEND_ROLE_TO_DASHBOARD[authUser.role] ?? selectedLevel
    return <Navigate to={`/${ROLE_PREFIXES[mappedLevel]}/overview`} replace />
  }

  const signIn = async (email: string, password: string) => {
    setAuthError('')
    setIsSigningIn(true)
    try {
      const auth = await login(email, password)
      saveAuthSession(auth)
      const mappedLevel = BACKEND_ROLE_TO_DASHBOARD[auth.user.role] ?? selectedLevel
      setSelectedLevel(mappedLevel)

      localStorage.setItem('mom_authenticated', 'true')
      localStorage.setItem('mom_role', mappedLevel)
      navigate(`/${ROLE_PREFIXES[mappedLevel]}/overview`)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <LandingPage
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      signIn={signIn}
      authError={authError}
      isSigningIn={isSigningIn}
      onEnterConsole={() => navigate('/auth')}
    />
  )
}

function AuthPageRoot({
  selectedLevel,
  setSelectedLevel,
}: {
  selectedLevel: DashboardLevel
  setSelectedLevel: (level: DashboardLevel) => void
}) {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Redirect if already authenticated
  const authUser = getStoredAuthUser()
  const token = localStorage.getItem('mom_access_token')
  if (token && authUser) {
    const mappedLevel = BACKEND_ROLE_TO_DASHBOARD[authUser.role] ?? selectedLevel
    return <Navigate to={`/${ROLE_PREFIXES[mappedLevel]}/overview`} replace />
  }

  const signIn = async (email: string, password: string) => {
    setAuthError('')
    setIsSigningIn(true)
    try {
      const auth = await login(email, password)
      saveAuthSession(auth)
      const mappedLevel = BACKEND_ROLE_TO_DASHBOARD[auth.user.role] ?? selectedLevel
      setSelectedLevel(mappedLevel)

      localStorage.setItem('mom_authenticated', 'true')
      localStorage.setItem('mom_role', mappedLevel)
      navigate(`/${ROLE_PREFIXES[mappedLevel]}/overview`)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <AuthPage
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      signIn={signIn}
      authError={authError}
      isSigningIn={isSigningIn}
    />
  )
}

function WorkspaceRoot() {
  const { rolePrefix, viewSlug } = useParams<{ rolePrefix: string; viewSlug: string }>()
  const navigate = useNavigate()

  const authUser = getStoredAuthUser()
  const token = localStorage.getItem('mom_access_token')

  if (!token || !authUser) {
    return <Navigate to="/" replace />
  }

  const expectedLevel = BACKEND_ROLE_TO_DASHBOARD[authUser.role]
  const expectedPrefix = ROLE_PREFIXES[expectedLevel]

  if (rolePrefix !== expectedPrefix) {
    return <Navigate to={`/${expectedPrefix}/overview`} replace />
  }

  const level = rolePrefix ? PREFIX_TO_ROLE[rolePrefix] : undefined
  const activeView = viewSlug ? SLUG_TO_VIEW[viewSlug] : undefined

  if (!level || !activeView) {
    return <Navigate to={`/${expectedPrefix}/overview`} replace />
  }

  const signOut = async () => {
    const refreshToken = localStorage.getItem('mom_refresh_token')
    if (refreshToken) {
      await logout(refreshToken).catch(() => undefined)
    }
    clearAuthSession()
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
  const authUser = getStoredAuthUser()
  const token = localStorage.getItem('mom_access_token')

  if (!token || !authUser) {
    return <Navigate to="/" replace />
  }

  const expectedLevel = BACKEND_ROLE_TO_DASHBOARD[authUser.role]
  const expectedPrefix = ROLE_PREFIXES[expectedLevel]
  return <Navigate to={`/${expectedPrefix}/overview`} replace />
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
        <Route
          path="/auth"
          element={
            <AuthPageRoot
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
  const authUser = getStoredAuthUser()!
  const fallbackProfile = profiles.find((item) => item.level === level)!
  const profile = {
    ...fallbackProfile,
    office: authUser.office.name ?? fallbackProfile.office,
    officeCode: authUser.office.code ?? fallbackProfile.officeCode,
    title: roleTitle(authUser.role),
  }

  const navigation = useMemo(() => getNavigation(level), [level])

  // Fetch meetings from the backend
  const [meetings, setMeetings] = useState<BackendMeeting[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(false)

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true)
    try {
      const data = await getMeetings()
      setMeetings(data)
    } catch (err) {
      console.error('Failed to load meetings:', err)
    } finally {
      setLoadingMeetings(false)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings, activeView])

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a]">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a0a0a]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="min-h-screen">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#faf5e8] border-r border-[#e5e5e5] text-[#0a0a0a] transition-transform duration-300 lg:translate-x-0 lg:h-screen lg:overflow-y-auto ${
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
        <main className="min-w-0 lg:pl-[280px]">
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
                meetings={meetings}
                loading={loadingMeetings}
                meetingFilter={meetingFilter}
                readOnly={level === 'Parent Office'}
                setActiveView={setActiveView}
                setMeetingFilter={setMeetingFilter}
                onRefresh={loadMeetings}
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

export function getStoredAuthUser(): AuthUser | null {
  const data = localStorage.getItem('mom_user')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function roleTitle(role: BackendRole): string {
  const titles: Record<BackendRole, string> = {
    SUPER_ADMIN: 'Central Super Admin',
    DM_ADMIN: 'DM Admin',
    OFFICE_ADMIN: 'Office Admin',
    OFFICE_MEMBER: 'Office Member',
  }
  return titles[role]
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
      { view: 'Offices', icon: Building2 },
      { view: 'Users', icon: UserCog },
      { view: 'Meetings', icon: ClipboardList },
      { view: 'Create Meeting', icon: Plus },
      { view: 'Meeting Detail', icon: FileText },
    ]
  }

  return [
    { view: 'Overview', icon: LayoutDashboard },
    { view: 'Offices', icon: Building2 },
    { view: 'Users', icon: UserCog },
    { view: 'Meetings', icon: ClipboardList },
    { view: 'Create Meeting', icon: Plus },
    { view: 'Submit Summary', icon: Upload },
    { view: 'Meeting Detail', icon: FileText },
  ]
}

export default MomApp
