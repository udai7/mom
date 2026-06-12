import { useState, useEffect } from 'react'
import {
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  UserCog,
  ArrowLeft,
} from 'lucide-react'
import { profiles, type DashboardLevel } from '../types'
import { getPublicParentOffices, registerOffice } from '../api/admin'
import { useNavigate } from 'react-router-dom'

export function AuthPage({
  authError,
  isSigningIn,
  selectedLevel,
  setSelectedLevel,
  signIn,
}: {
  authError?: string
  isSigningIn?: boolean
  selectedLevel: DashboardLevel
  setSelectedLevel: (level: DashboardLevel) => void
  signIn: (email: string, password: string) => Promise<void>
}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('maya.nic@gov.in')
  const [password, setPassword] = useState('nicadmin2026')
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [parentOffices, setParentOffices] = useState<any[]>([])

  // Registration form states
  const [regParentId, setRegParentId] = useState('')
  const [regOfficeName, setRegOfficeName] = useState('')
  const [regOfficeSlug, setRegOfficeSlug] = useState('')
  const [regOfficeType, setRegOfficeType] = useState('NIC')
  const [regDepartment, setRegDepartment] = useState('')
  const [regOfficialEmail, setRegOfficialEmail] = useState('')
  const [regOfficialPhone, setRegOfficialPhone] = useState('')
  const [regWebsite, setRegWebsite] = useState('')
  const [regAddressLine1, setRegAddressLine1] = useState('')
  const [regDistrict, setRegDistrict] = useState('')
  const [regState, setRegState] = useState('')
  const [regPincode, setRegPincode] = useState('')
  const [regAdminName, setRegAdminName] = useState('')
  const [regAdminDesignation, setRegAdminDesignation] = useState('')
  const [regEmployeeId, setRegEmployeeId] = useState('')
  const [regAdminEmail, setRegAdminEmail] = useState('')
  const [regAdminMobile, setRegAdminMobile] = useState('')
  const [regAdminPassword, setRegAdminPassword] = useState('')

  const [regSuccess, setRegSuccess] = useState('')
  const [regError, setRegError] = useState('')
  const [submittingReg, setSubmittingReg] = useState(false)

  const loadParentOffices = () => {
    getPublicParentOffices()
      .then((data) => {
        setParentOffices(data)
      })
      .catch((err) => {
        console.error('Failed to load parent offices', err)
      })
  }

  useEffect(() => {
    loadParentOffices()
  }, [])

  const credentials: Record<DashboardLevel, { email: string; pass: string }> = {
    'Office Admin': { email: 'maya.nic@gov.in', pass: 'nicadmin2026' },
    'Parent Office': { email: 'dm@gov.in', pass: 'dmadmin2026' },
    'Super Admin': { email: 'super@gov.in', pass: 'superadmin2026' },
  }

  const fillDemoCredentials = (level: DashboardLevel) => {
    setSelectedLevel(level)
    setEmail(credentials[level].email)
    setPassword(credentials[level].pass)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void signIn(email, password)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    setSubmittingReg(true)

    try {
      await registerOffice({
        parent_id: regParentId,
        name: regOfficeName,
        department: regDepartment || undefined,
        official_email: regOfficialEmail,
        official_phone: regOfficialPhone,
        website: regWebsite || undefined,
        address_line_1: regAddressLine1,
        district: regDistrict,
        state: regState,
        pincode: regPincode || undefined,
        admin_name: regAdminName,
        admin_designation: regAdminDesignation,
        employee_id: regEmployeeId || undefined,
        admin_email: regAdminEmail,
        admin_mobile: regAdminMobile,
        admin_password: regAdminPassword,
      })
      setRegSuccess('Office registration request submitted! The account has been sent to the parent office for verification. After approval, the office will be active.')
      
      // Clear form
      setRegOfficeName('')
      setRegOfficeSlug('')
      setRegDepartment('')
      setRegOfficialEmail('')
      setRegOfficialPhone('')
      setRegWebsite('')
      setRegAddressLine1('')
      setRegDistrict('')
      setRegState('')
      setRegPincode('')
      setRegAdminName('')
      setRegAdminDesignation('')
      setRegEmployeeId('')
      setRegAdminEmail('')
      setRegAdminMobile('')
      setRegAdminPassword('')
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmittingReg(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] font-sans selection:bg-[#ffb084]">
      {/* Navigation Header */}
      <nav className="border-b border-[#e5e5e5]/80 bg-[#fffaf0]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8b94a] text-[#0a0a0a] shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-[#6a6a6a] uppercase">Government of Tripura</span>
              <h1 className="display-type text-2xl leading-none">MoM Portal</h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="clay-button inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Seed Persona Selectors */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm">
              <h3 className="display-type text-xl mb-2">Seeded Console Profiles</h3>
              <p className="text-sm text-[#6a6a6a] leading-relaxed mb-4">
                Click any profile button below to automatically load the demo login details.
              </p>

              <div className="space-y-3">
                {profiles.map((profile) => {
                  const isSelected = profile.level === selectedLevel && activeTab === 'signin'
                  return (
                    <button
                      key={profile.level}
                      onClick={() => {
                        setActiveTab('signin')
                        fillDemoCredentials(profile.level)
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition duration-200 flex items-start gap-4 ${
                        isSelected
                          ? 'border-[#0a0a0a] bg-[#faf5e8] shadow-sm'
                          : 'border-[#e5e5e5]/80 bg-white hover:bg-[#faf5e8]/30'
                      }`}
                    >
                      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        isSelected ? 'bg-[#ff4d8b] text-white' : 'bg-[#faf5e8] text-[#1a3a3a]'
                      }`}>
                        {profile.level === 'Office Admin' && <Building2 className="h-4 w-4" />}
                        {profile.level === 'Parent Office' && <Eye className="h-4 w-4" />}
                        {profile.level === 'Super Admin' && <UserCog className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{profile.level}</h4>
                        <p className="text-[10px] text-[#6a6a6a] mt-0.5">{profile.office}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sign In & Register Tab Card */}
          <div className="lg:col-span-7 bg-white border border-[#e5e5e5] rounded-3xl p-8 shadow-sm">
            <div className="mb-6 flex border-b border-[#faf5e8]">
              <button
                onClick={() => {
                  setActiveTab('signin')
                  setRegError('')
                  setRegSuccess('')
                }}
                className={`flex-1 pb-4 text-center text-sm font-bold transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'border-b-2 border-[#ff4d8b] text-[#ff4d8b]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
                type="button"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab('register')
                  setRegError('')
                  setRegSuccess('')
                  loadParentOffices()
                }}
                className={`flex-1 pb-4 text-center text-sm font-bold transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-[#ff4d8b] text-[#ff4d8b]'
                    : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
                type="button"
              >
                Register Office
              </button>
            </div>

            {activeTab === 'signin' ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="display-type text-xl">Sign In</h3>
                    <p className="text-xs text-[#6a6a6a] mt-0.5">Secure credential verification</p>
                  </div>
                  <span className="rounded-full bg-[#faf5e8] px-3 py-1 text-xs font-bold text-[#ff4d8b]">
                    {selectedLevel}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Email Username</label>
                  <input
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    value={email}
                    required
                    className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">Access Passcode</label>
                    <button
                      type="button"
                      onClick={() => alert('Please contact your parent office administrator or system support to request a password reset.')}
                      className="text-xs font-semibold text-[#ff4d8b] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      required
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#0a0a0a] transition p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                    {authError}
                  </div>
                )}

                <button
                  disabled={isSigningIn}
                  className="w-full clay-button py-4 text-base font-bold flex items-center justify-center gap-3 mt-4"
                  type="submit"
                >
                  {isSigningIn ? 'Signing in...' : 'Open Dashboard Console'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div>
                  <h3 className="display-type text-xl">Register Sub-Office</h3>
                  <p className="text-xs text-[#6a6a6a] mt-0.5">Submit new child node details for verification</p>
                </div>

                {regError && (
                  <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                    {regSuccess}
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6a6a6a] border-b border-[#e5e5e5] pb-1">
                    Office Information
                  </h4>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Parent Office *</label>
                    <select
                      value={regParentId}
                      onChange={(e) => setRegParentId(e.target.value)}
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      required
                    >
                      <option value="">Select Parent Office</option>
                      {parentOffices.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Office Name *</label>
                    <input
                      value={regOfficeName}
                      onChange={(e) => setRegOfficeName(e.target.value)}
                      placeholder="e.g. Sub-Divisional Office A"
                      required
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                    />
                  </div>


                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Department Name</label>
                    <input
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Information Technology"
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Official Email *</label>
                      <input
                        type="email"
                        value={regOfficialEmail}
                        onChange={(e) => setRegOfficialEmail(e.target.value)}
                        placeholder="office@gov.in"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Official Phone *</label>
                      <input
                        value={regOfficialPhone}
                        onChange={(e) => setRegOfficialPhone(e.target.value)}
                        placeholder="0381-2224455"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Website URL</label>
                    <input
                      type="url"
                      value={regWebsite}
                      onChange={(e) => setRegWebsite(e.target.value)}
                      placeholder="e.g. https://sdmwest.tripura.gov.in"
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Address Line 1 *</label>
                    <input
                      value={regAddressLine1}
                      onChange={(e) => setRegAddressLine1(e.target.value)}
                      placeholder="Building / Complex Address"
                      required
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6a6a6a] mb-1">District *</label>
                      <input
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        placeholder="West Tripura"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6a6a6a] mb-1">State *</label>
                      <input
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        placeholder="Tripura"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6a6a6a] mb-1">Pincode</label>
                      <input
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value)}
                        placeholder="799001"
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6a6a6a] border-b border-[#e5e5e5] pb-1 pt-2">
                    Primary Admin User Account
                  </h4>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Admin Full Name *</label>
                    <input
                      value={regAdminName}
                      onChange={(e) => setRegAdminName(e.target.value)}
                      placeholder="Admin Full Name"
                      required
                      className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Admin Designation *</label>
                      <input
                        value={regAdminDesignation}
                        onChange={(e) => setRegAdminDesignation(e.target.value)}
                        placeholder="e.g. Sub-Divisional Magistrate"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Employee ID</label>
                      <input
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        placeholder="e.g. EMP123456"
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Admin Email (Login) *</label>
                      <input
                        type="email"
                        value={regAdminEmail}
                        onChange={(e) => setRegAdminEmail(e.target.value)}
                        placeholder="admin@gov.in"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Mobile Number *</label>
                      <input
                        value={regAdminMobile}
                        onChange={(e) => setRegAdminMobile(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6a6a] mb-1.5">Account Password *</label>
                    <div className="relative">
                      <input
                        value={regAdminPassword}
                        onChange={(e) => setRegAdminPassword(e.target.value)}
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="At least 10 chars, letter + digit"
                        required
                        className="w-full clay-input bg-[#faf5e8] border-[#e5e5e5] focus:border-[#0a0a0a] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#0a0a0a] transition p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  disabled={submittingReg}
                  className="w-full clay-button py-4 text-base font-bold flex items-center justify-center gap-3 mt-4"
                  type="submit"
                >
                  {submittingReg ? 'Submitting request...' : 'Submit Office Registration Request'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
