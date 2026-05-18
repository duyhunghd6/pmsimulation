'use client';

import { useFormStatus } from 'react-dom';

export function SubmitTaraOrderButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? 'Submitting order...' : 'Submit TARA order'}
    </button>
  );
}
