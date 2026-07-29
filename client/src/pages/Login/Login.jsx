import { useState } from 'react'
import {
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound
} from 'lucide-react'
import { PublicNavbar } from '../../components/Navbar'
import './Login.css'

function Login({
  authMode = 'login',
  forms = {
    login: { email: '', password: '' },
    register: { name: '', email: '', password: '' },
    forgot: { email: '' },
    reset: { token: '', password: '' }
  },
  loading = false,
  loginRole = 'student',
  notice = '',
  error = '',
  checkingSession = false,
  onForgot,
  onLogin,
  onRegister,
  onReset,
  onRoleChange,
  onModeChange,
  onChange,
  onHome,
  onLibrary,
  onCourses,
  onContact
}) {
  if (checkingSession) {
    return (
      <main className="auth-page login-page">
        <PublicNavbar
          active="login"
          onHome={onHome}
          onLibrary={onLibrary}
          onCourses={onCourses}
          onContact={onContact}
          onSignIn={() => onModeChange?.('login')}
        />
        <section className="auth-content compact-auth">
          <div className="login-panel">
            <p className="auth-title">Checking session</p>
            <div className="alert success">Restoring your login...</div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page login-page">
      <PublicNavbar
        active="login"
        onHome={onHome}
        onLibrary={onLibrary}
        onCourses={onCourses}
        onContact={onContact}
        onSignIn={() => onModeChange('login')}
      />
      <section className="auth-content">
        <header className="auth-page-header">
          <h1>Welcome Back</h1>
          <p>Select your role and sign in to continue</p>
        </header>
        <AuthPanel
          authMode={authMode}
          forms={forms}
          loading={loading}
          loginRole={loginRole}
          notice={notice}
          error={error}
          onForgot={onForgot}
          onLogin={onLogin}
          onRegister={onRegister}
          onReset={onReset}
          onRoleChange={onRoleChange}
          onModeChange={onModeChange}
          onChange={onChange}
        />
        <div className="support-card">
          <h2>Need Help?</h2>
          <p>Contact our support team for assistance with login issues</p>
          <a href="mailto:support@erpacademy.local">Contact Support &rarr;</a>
        </div>
      </section>
    </main>
  )
}

function AuthPanel({
  authMode,
  forms,
  loading,
  loginRole,
  notice,
  error,
  onForgot,
  onLogin,
  onRegister,
  onReset,
  onRoleChange,
  onModeChange,
  onChange
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const activePassword =
    authMode === 'login'
      ? forms.login.password
      : authMode === 'register'
        ? forms.register.password
        : forms.reset.password

  return (
    <section className="login-panel">
      {authMode === 'login' && (
        <form onSubmit={onLogin}>
          <p className="role-title">Sign in as:</p>
          <div className="role-card-grid" aria-label="Login role">
            {roleOptions.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.role}
                  type="button"
                  className={`role-card ${loginRole === item.role ? 'selected' : ''}`}
                  onClick={() => onRoleChange(item.role)}
                >
                  <Icon size={40} />
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              )
            })}
          </div>

          <div className="auth-divider" />
          <h2 className="login-form-title">
            {loginRole === 'student' && <GraduationCap size={24} />}
            {loginRole === 'teacher' && <UserRound size={24} />}
            {loginRole === 'admin' && <ShieldCheck size={24} />}
            {roleLabel(loginRole)} Login
          </h2>
          <AuthInput
            label={`${roleLabel(loginRole)} Email`}
            type="email"
            value={forms.login.email}
            onChange={(value) => onChange('login', 'email', value)}
            className="auth-field"
            leadingIcon={<Mail size={18} />}
            placeholder={loginRole === 'admin' ? 'admin@coaching.local' : `${loginRole}@example.com`}
            required
          />
          <AuthInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={forms.login.password}
            onChange={(value) => onChange('login', 'password', value)}
            className="auth-field"
            leadingIcon={<LockKeyhole size={18} />}
            trailingButton={
              <button type="button" onClick={() => setShowPassword((value) => !value)} title="Show password">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />
          <div className="auth-row">
            <label className="remember-check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button className="inline-link" type="button" onClick={() => onModeChange('forgot')}>
              Forgot Password?
            </button>
          </div>
          <AuthFeedback notice={notice} error={error} />
          <SubmitButton
            loading={loading}
            label={`Sign In as ${roleLabel(loginRole)}`}
            loadingLabel="Signing in..."
          />
          <p className="enroll-line">
            Don't have an account?{' '}
            <button type="button" onClick={() => onModeChange('register')}>Enroll Now</button>
          </p>
        </form>
      )}

      {authMode === 'register' && (
        <form onSubmit={onRegister}>
          <p className="auth-title">Create student account</p>
          <p className="auth-subtitle">Registration is available for students only.</p>
          <AuthInput
            label="Name"
            value={forms.register.name}
            onChange={(value) => onChange('register', 'name', value)}
            required
          />
          <AuthInput
            label="Email"
            type="email"
            value={forms.register.email}
            onChange={(value) => onChange('register', 'email', value)}
            required
          />
          <AuthInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={forms.register.password}
            onChange={(value) => onChange('register', 'password', value)}
            trailingButton={
              <button type="button" onClick={() => setShowPassword((value) => !value)} title="Show password">
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            }
            required
          />
          <PasswordRules password={activePassword} />
          <AuthFeedback notice={notice} error={error} />
          <SubmitButton loading={loading} label="Create account" loadingLabel="Creating..." />
          <button className="auth-link centered" type="button" onClick={() => onModeChange('login')}>
            Already have an account?
          </button>
        </form>
      )}

      {authMode === 'forgot' && (
        <form onSubmit={onForgot}>
          <p className="auth-title">Reset Password</p>
          <p className="auth-subtitle">Enter your email to generate a reset token.</p>
          <AuthInput
            label="Email"
            type="email"
            value={forms.forgot.email}
            onChange={(value) => onChange('forgot', 'email', value)}
            required
          />
          <AuthFeedback notice={notice} error={error} />
          <SubmitButton loading={loading} label="Send reset token" loadingLabel="Sending..." />
          <button className="auth-link centered" type="button" onClick={() => onModeChange('login')}>
            Back to login
          </button>
        </form>
      )}

      {authMode === 'reset' && (
        <form onSubmit={onReset}>
          <p className="auth-title">Reset Password</p>
          <AuthInput
            label="Reset token"
            value={forms.reset.token}
            onChange={(value) => onChange('reset', 'token', value)}
            required
          />
          <AuthInput
            label="New password"
            type={showPassword ? 'text' : 'password'}
            value={forms.reset.password}
            onChange={(value) => onChange('reset', 'password', value)}
            trailingButton={
              <button type="button" onClick={() => setShowPassword((value) => !value)} title="Show password">
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            }
            required
          />
          <PasswordRules password={activePassword} />
          <AuthFeedback notice={notice} error={error} />
          <SubmitButton loading={loading} label="Reset password" loadingLabel="Resetting..." />
          <button className="auth-link centered" type="button" onClick={() => onModeChange('login')}>
            Back to login
          </button>
        </form>
      )}
    </section>
  )
}

function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  className = '',
  leadingIcon,
  trailingButton
}) {
  return (
    <label className={className}>
      {label && <span>{label}</span>}
      <span className={leadingIcon || trailingButton ? 'input-with-action' : ''}>
        {leadingIcon && <span className="input-leading-icon">{leadingIcon}</span>}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
        {trailingButton}
      </span>
    </label>
  )
}

function AuthFeedback({ notice, error }) {
  if (!notice && !error) return null
  return <div className={`alert ${error ? 'error' : 'success'}`}>{error || notice}</div>
}

function SubmitButton({ loading, icon: Icon, label, loadingLabel }) {
  return (
    <button className="primary-action" type="submit" disabled={loading}>
      {Icon && <Icon size={18} />}
      {loading ? loadingLabel : label}
    </button>
  )
}

function PasswordRules({ password }) {
  const rules = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Lowercase', valid: /[a-z]/.test(password) },
    { label: 'Uppercase', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special', valid: /[^A-Za-z0-9]/.test(password) }
  ]

  return (
    <div className="password-rules">
      {rules.map((rule) => (
        <span key={rule.label} className={rule.valid ? 'valid' : ''}>
          {rule.label}
        </span>
      ))}
    </div>
  )
}

function roleLabel(role) {
  const labels = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student'
  }
  return labels[role] || 'User'
}

const roleOptions = [
  {
    role: 'student',
    icon: GraduationCap,
    label: 'Student',
    description: 'Access your courses and learning materials'
  },
  {
    role: 'teacher',
    icon: UserRound,
    label: 'Teacher',
    description: 'Manage courses and track student progress'
  },
  {
    role: 'admin',
    icon: ShieldCheck,
    label: 'Admin',
    description: 'Full system administration access'
  }
]

export default Login
