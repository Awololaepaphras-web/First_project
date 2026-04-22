
import { createServerClient } from "@supabase/ssr";

export const createExpressClient = (req: any, res: any) => {
  return createServerClient(
    process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return req.cookies?.[name];
        },
        set(name: string, value: string, options: any) {
          if (res.cookie) {
            res.cookie(name, value, options);
          }
        },
        remove(name: string, options: any) {
          if (res.clearCookie) {
            res.clearCookie(name, options);
          }
        },
      },
    }
  );
};
