/**
 * Email whitelist for authorized access.
 * Replace with backend API call when real auth is integrated.
 */
export const ALLOWED_EMAILS: string[] = [
  'admin@phuonglinh.vn',
  'admin@honghanh.vn',
  'staff@phuonglinh.vn',
  'staff@honghanh.vn',
]

export function isAuthorized(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim())
}
