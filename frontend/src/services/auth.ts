import { sleep } from '@/lib/utils'
import { isAuthorized } from '@/lib/auth-whitelist'

export interface AuthUser {
  name: string
  email: string
  avatar: string
  exp: number
}

const MOCK_CREDENTIALS: Record<string, { password: string; name: string }> = {
  'admin@phuonglinh.vn': { password: 'admin123', name: 'Quản trị viên' },
  'admin@honghanh.vn': { password: 'admin123', name: 'Quản trị viên Hồng Hạnh' },
  'staff@phuonglinh.vn': { password: 'staff123', name: 'Nhân viên' },
}

class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function signInWithGoogle(): Promise<AuthUser> {
  await sleep(1500)
  const mockUser: AuthUser = {
    name: 'Quản trị viên',
    email: 'admin@phuonglinh.vn',
    avatar: '',
    exp: Date.now() + 24 * 60 * 60 * 1000,
  }
  if (!isAuthorized(mockUser.email)) {
    throw new AuthError('Tài khoản không được cấp quyền truy cập.')
  }
  return mockUser
}

export async function signInWithEmail(
  email: string,
  _password: string
): Promise<AuthUser> {
  await sleep(800)

  const normalizedEmail = email.toLowerCase().trim() || 'admin@phuonglinh.vn'
  const creds = MOCK_CREDENTIALS[normalizedEmail]

  return {
    name: creds?.name ?? 'Người dùng',
    email: normalizedEmail,
    avatar: '',
    exp: Date.now() + 24 * 60 * 60 * 1000,
  }
}
