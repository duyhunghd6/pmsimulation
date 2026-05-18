'use client';

import { useFormStatus } from 'react-dom';

export function CreateClassSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? 'Creating class...' : 'Create class receipt'}
    </button>
  );
}
