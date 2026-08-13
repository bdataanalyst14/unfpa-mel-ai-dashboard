import { NextResponse } from 'next/server';

import packageJson from '../../../../package.json';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      application: 'unfpa-mel-dashboard',
      version: packageJson.version,
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
