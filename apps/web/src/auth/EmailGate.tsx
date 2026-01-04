import React from 'react'
import {
  Button,
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  PasswordInput,
  PinInput,
  Tabs,
  Alert,
  Divider,
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useAuth, type User } from './store'
import {
  emailSignup,
  emailLogin,
  sendVerificationCode,
  resetPassword,
} from '../api/server'
import { toast } from '../ui/toast'

const REDIRECT_STORAGE_KEY = 'tapcanvas_login_redirect'

function normalizeRedirect(raw: string | null): string | null {
  if (!raw || typeof window === 'undefined') return null
  try {
    const url = new URL(raw, window.location.origin)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString()
    }
    return null
  } catch {
    return null
  }
}

function captureRedirectFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const redirectFromQuery = normalizeRedirect(url.searchParams.get('redirect'))
    if (redirectFromQuery) {
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, redirectFromQuery)
      url.searchParams.delete('redirect')
      window.history.replaceState({}, '', url.toString())
    }
    return sessionStorage.getItem(REDIRECT_STORAGE_KEY)
  } catch {
    return null
  }
}

function readStoredRedirect(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(REDIRECT_STORAGE_KEY)
}

function clearStoredRedirect() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
}

function appendAuthToRedirect(target: string, token: string, user: User | null | undefined): string | null {
  try {
    const url = new URL(target)
    url.searchParams.set('tap_token', token)
    if (user) {
      url.searchParams.set('tap_user', JSON.stringify(user))
    }
    return url.toString()
  } catch {
    return null
  }
}

type SignupStep = 'email' | 'code' | 'password' | 'complete'

export default function EmailGate({ children, className }: { children: React.ReactNode; className?: string }) {
  const token = useAuth((s: any) => s.token)
  const user = useAuth((s: any) => s.user)
  const setAuth = useAuth((s: any) => s.setAuth)
  const [hasRedirect, setHasRedirect] = React.useState(() => !!readStoredRedirect())
  const redirectingRef = React.useRef(false)

  // Login state
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loginLoading, setLoginLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState('')

  // Signup state
  const [signupStep, setSignupStep] = React.useState<SignupStep>('email')
  const [signupEmail, setSignupEmail] = React.useState('')
  const [signupCode, setSignupCode] = React.useState('')
  const [signupPassword, setSignupPassword] = React.useState('')
  const [signupPassword2, setSignupPassword2] = React.useState('')
  const [signupName, setSignupName] = React.useState('')
  const [signupLoading, setSignupLoading] = React.useState(false)
  const [signupError, setSignupError] = React.useState('')

  // Reset password state
  const [resetEmail, setResetEmail] = React.useState('')
  const [resetCode, setResetCode] = React.useState('')
  const [resetPassword_, setResetPassword_] = React.useState('')
  const [resetPassword2, setResetPassword2] = React.useState('')
  const [resetLoading, setResetLoading] = React.useState(false)
  const [resetError, setResetError] = React.useState('')

  React.useEffect(() => {
    captureRedirectFromLocation()
    setHasRedirect(true)
  }, [])

  const redirectIfNeeded = React.useCallback((authToken: string, authUser: User | null | undefined) => {
    if (redirectingRef.current) return
    const target = readStoredRedirect()
    if (!target) {
      setHasRedirect(false)
      return
    }
    const next = appendAuthToRedirect(target, authToken, authUser)
    if (!next) {
      clearStoredRedirect()
      setHasRedirect(false)
      return
    }
    redirectingRef.current = true
    clearStoredRedirect()
    window.location.href = next
  }, [])

  React.useEffect(() => {
    if (token && hasRedirect) {
      redirectIfNeeded(token, user)
    }
  }, [token, user, hasRedirect, redirectIfNeeded])

  // Login handlers
  const handleLogin = React.useCallback(async () => {
    if (!email || !password) {
      setLoginError('请输入邮箱和密码')
      return
    }
    setLoginLoading(true)
    setLoginError('')
    try {
      const { token: t, user: uinfo } = await emailLogin(email, password)
      setAuth(t, uinfo)
      redirectIfNeeded(t, uinfo)
    } catch (error) {
      console.error('Login failed', error)
      setLoginError(error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoginLoading(false)
    }
  }, [email, password, setAuth, redirectIfNeeded])

  // Signup handlers
  const handleSendSignupCode = React.useCallback(async () => {
    if (!signupEmail) {
      setSignupError('请输入邮箱')
      return
    }
    setSignupLoading(true)
    setSignupError('')
    try {
      await sendVerificationCode(signupEmail, 'signup')
      setSignupStep('code')
      toast('验证码已发送', 'success')
    } catch (error) {
      console.error('Send code failed', error)
      setSignupError(error instanceof Error ? error.message : '发送失败')
    } finally {
      setSignupLoading(false)
    }
  }, [signupEmail])

  const handleSignupCodeSubmit = React.useCallback(() => {
    if (signupCode.length !== 6) {
      setSignupError('验证码需6位')
      return
    }
    setSignupStep('password')
    setSignupError('')
  }, [signupCode])

  const handleCompleteSignup = React.useCallback(async () => {
    if (!signupPassword || !signupPassword2) {
      setSignupError('请输入密码')
      return
    }
    if (signupPassword !== signupPassword2) {
      setSignupError('密码不一致')
      return
    }
    if (signupPassword.length < 8) {
      setSignupError('密码至少8字符')
      return
    }

    setSignupLoading(true)
    setSignupError('')
    try {
      const { token: t, user: uinfo } = await emailSignup(
        signupEmail,
        signupPassword,
        signupCode,
        signupName || undefined
      )
      setAuth(t, uinfo)
      setSignupStep('complete')
      setTimeout(() => {
        redirectIfNeeded(t, uinfo)
      }, 1000)
    } catch (error) {
      console.error('Signup failed', error)
      setSignupError(error instanceof Error ? error.message : '注册失败')
    } finally {
      setSignupLoading(false)
    }
  }, [signupEmail, signupPassword, signupPassword2, signupCode, signupName, setAuth, redirectIfNeeded])

  // Reset password handlers
  const handleSendResetCode = React.useCallback(async () => {
    if (!resetEmail) {
      setResetError('请输入邮箱')
      return
    }
    setResetLoading(true)
    setResetError('')
    try {
      await sendVerificationCode(resetEmail, 'reset')
      toast('重置码已发送', 'success')
    } catch (error) {
      console.error('Send reset code failed', error)
      setResetError(error instanceof Error ? error.message : '发送失败')
    } finally {
      setResetLoading(false)
    }
  }, [resetEmail])

  const handleCompleteReset = React.useCallback(async () => {
    if (!resetCode || resetCode.length !== 6) {
      setResetError('重置码需6位')
      return
    }
    if (!resetPassword_ || !resetPassword2) {
      setResetError('请输入密码')
      return
    }
    if (resetPassword_ !== resetPassword2) {
      setResetError('密码不一致')
      return
    }
    if (resetPassword_.length < 8) {
      setResetError('密码至少8字符')
      return
    }

    setResetLoading(true)
    setResetError('')
    try {
      await resetPassword(resetEmail, resetCode, resetPassword_)
      toast('重置成功', 'success')
      setResetEmail('')
      setResetCode('')
      setResetPassword_('')
      setResetPassword2('')
    } catch (error) {
      console.error('Reset password failed', error)
      setResetError(error instanceof Error ? error.message : '重置失败')
    } finally {
      setResetLoading(false)
    }
  }, [resetEmail, resetCode, resetPassword_, resetPassword2])

  const gateClassName = ['email-gate', className].filter(Boolean).join(' ')

  if (token) {
    return <div className={gateClassName}>{children}</div>
  }

  return (
    <div className={gateClassName}>
      <Paper p="xl" radius="md" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <Tabs defaultValue="login" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="login">登录</Tabs.Tab>
            <Tabs.Tab value="signup">注册</Tabs.Tab>
            <Tabs.Tab value="reset">重置</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pl="lg">
            <Stack>
              <Title order={3}>邮箱登录</Title>
              {loginError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {loginError}
                </Alert>
              )}
              <TextInput 
                label="邮箱" 
                placeholder="user@email.com" 
                type="email" 
                value={email} 
                onChange={(e: any) => setEmail(e.currentTarget.value)} 
                disabled={loginLoading} 
              />
              <PasswordInput 
                label="密码" 
                placeholder="至少8字符" 
                value={password} 
                onChange={(e: any) => setPassword(e.currentTarget.value)} 
                disabled={loginLoading} 
              />
              <Button onClick={handleLogin} loading={loginLoading} fullWidth>登录</Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="signup" pl="lg">
            <Stack>
              <Title order={3}>邮箱注册</Title>
              {signupError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {signupError}
                </Alert>
              )}
              {signupStep === 'email' && (
                <>
                  <TextInput 
                    label="邮箱" 
                    placeholder="user@email.com" 
                    type="email" 
                    value={signupEmail} 
                    onChange={(e: any) => setSignupEmail(e.currentTarget.value)} 
                    disabled={signupLoading} 
                  />
                  <Button onClick={handleSendSignupCode} loading={signupLoading} fullWidth>
                    获取验证码
                  </Button>
                </>
              )}
              {signupStep === 'code' && (
                <>
                  <Text size="sm" c="dimmed">邮箱: {signupEmail}</Text>
                  <div>
                    <Text size="sm" mb="xs">验证码</Text>
                    <PinInput 
                      length={6} 
                      type="number" 
                      value={signupCode} 
                      onChange={setSignupCode} 
                      disabled={signupLoading} 
                    />
                  </div>
                  <Button 
                    onClick={handleSignupCodeSubmit} 
                    disabled={signupCode.length !== 6 || signupLoading} 
                    fullWidth
                  >
                    下一步
                  </Button>
                </>
              )}
              {signupStep === 'password' && (
                <>
                  <TextInput 
                    label="昵称（可选）" 
                    placeholder="用户名" 
                    value={signupName} 
                    onChange={(e: any) => setSignupName(e.currentTarget.value)} 
                    disabled={signupLoading} 
                  />
                  <PasswordInput 
                    label="密码" 
                    placeholder="至少8字符" 
                    value={signupPassword} 
                    onChange={(e: any) => setSignupPassword(e.currentTarget.value)} 
                    disabled={signupLoading} 
                  />
                  <PasswordInput 
                    label="确认密码" 
                    placeholder="再次输入" 
                    value={signupPassword2} 
                    onChange={(e: any) => setSignupPassword2(e.currentTarget.value)} 
                    disabled={signupLoading} 
                  />
                  <Button onClick={handleCompleteSignup} loading={signupLoading} fullWidth>
                    完成注册
                  </Button>
                </>
              )}
              {signupStep === 'complete' && (
                <Stack align="center" spacing="lg">
                  <div 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: '#d3f9d8', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <IconCheck size={36} color="#51cf66" />
                  </div>
                  <Text fw={500}>注册成功！</Text>
                  <Text size="sm" c="dimmed">正在跳转...</Text>
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="reset" pl="lg">
            <Stack>
              <Title order={3}>重置密码</Title>
              {resetError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {resetError}
                </Alert>
              )}
              <TextInput 
                label="邮箱" 
                placeholder="user@email.com" 
                type="email" 
                value={resetEmail} 
                onChange={(e: any) => setResetEmail(e.currentTarget.value)} 
                disabled={resetLoading} 
              />
              <Button onClick={handleSendResetCode} loading={resetLoading} fullWidth variant="light">
                获取重置码
              </Button>
              {resetEmail && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" mb="xs">重置码</Text>
                    <PinInput 
                      length={6} 
                      type="number" 
                      value={resetCode} 
                      onChange={setResetCode} 
                      disabled={resetLoading} 
                    />
                  </div>
                  <PasswordInput 
                    label="新密码" 
                    placeholder="至少8字符" 
                    value={resetPassword_} 
                    onChange={(e: any) => setResetPassword_(e.currentTarget.value)} 
                    disabled={resetLoading} 
                  />
                  <PasswordInput 
                    label="确认密码" 
                    placeholder="再次输入" 
                    value={resetPassword2} 
                    onChange={(e: any) => setResetPassword2(e.currentTarget.value)} 
                    disabled={resetLoading} 
                  />
                  <Button onClick={handleCompleteReset} loading={resetLoading} fullWidth color="orange">
                    重置密码
                  </Button>
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  )
}
