import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

type VercelCronConfig = {
  crons?: Array<{
    path?: string;
    schedule?: string;
  }>;
};

function readVercelConfig(): VercelCronConfig {
  return JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as VercelCronConfig;
}

describe('vercel cron configuration', () => {
  it('declares the UTC+7 midnight auto month-advance trigger', () => {
    const config = readVercelConfig();

    expect(config.crons).toEqual([
      {
        path: '/api/cron/month-advance',
        schedule: '0 17 * * *',
      },
    ]);
  });

  it('keeps the platform trigger on the safe scheduled route without query payloads', () => {
    const [cron] = readVercelConfig().crons ?? [];

    expect(cron?.path).toBe('/api/cron/month-advance');
    expect(cron?.path).not.toContain('?');
  });
});
