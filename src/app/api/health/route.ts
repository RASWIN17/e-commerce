import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholderUrl = supabaseUrl.includes('placeholder-project');

  const config = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: Boolean(supabaseUrl) && !isPlaceholderUrl,
      hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder'),
      hasSupabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasCashfreeAppId: Boolean(process.env.CASHFREE_APP_ID),
      hasCashfreeSecretKey: Boolean(process.env.CASHFREE_SECRET_KEY),
      cashfreeEnvironment: process.env.CASHFREE_ENVIRONMENT || 'SANDBOX',
      hasQikinkClientId: Boolean(process.env.QIKINK_CLIENT_ID),
      hasQikinkClientSecret: Boolean(process.env.QIKINK_CLIENT_SECRET),
      qikinkApiUrl: process.env.QIKINK_API_URL || 'not set',
    },
  };

  const isReady =
    config.environment.hasSupabaseUrl &&
    config.environment.hasSupabaseAnonKey &&
    config.environment.hasSupabaseServiceRoleKey;

  return NextResponse.json({
    ...config,
    productionDatabaseConnected: isReady,
    actionRequired: isReady
      ? 'All core environment variables configured.'
      : 'Add missing environment variables in Vercel Dashboard (Settings > Environment Variables).',
  });
}

