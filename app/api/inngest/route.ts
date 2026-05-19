import { serve } from 'inngest/next';

import { inngest, monthAdvanceRequestedFunction } from '../../infrastructure/inngest/month-advance';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [monthAdvanceRequestedFunction],
});
