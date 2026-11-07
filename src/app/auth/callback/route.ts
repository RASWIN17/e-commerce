import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Safe redirect path validation
  let next = searchParams.get('next') ?? '/account';
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/account';
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session?.user) {
      const user = data.session.user;

      // Ensure profile and customer role exist in Supabase
      const adminSupabase = createAdminClient();
      if (adminSupabase) {
        await adminSupabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Member',
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        await adminSupabase.from('user_roles').upsert(
          {
            user_id: user.id,
            role: 'customer',
          },
          { onConflict: 'user_id,role' }
        );
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
