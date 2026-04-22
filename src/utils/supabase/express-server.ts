import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Request, Response } from 'express'

export function createExpressClient(req: Request, res: Response) {
  return createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies?.[name]
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookie(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
        },
        remove(name: string, options: CookieOptions) {
          res.clearCookie(name, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
        },
      },
    }
  )
}
