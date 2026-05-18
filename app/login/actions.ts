'use server';

import { redirect } from 'next/navigation';

import { createAuthTenancySupabaseServerClient } from '../infrastructure/auth-tenancy/supabase-server';

function loginStatusUrl(status: string): string {
  return `/login?status=${encodeURIComponent(status)}`;
}

export async function signInWithEmail(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (email.length === 0) {
    redirect(loginStatusUrl('missing-email'));
  }

  const supabase = await createAuthTenancySupabaseServerClient();
  if (!supabase.ok) {
    redirect(loginStatusUrl(supabase.code));
  }

  const { error } = await supabase.client.auth.signInWithOtp({ email });
  if (error) {
    redirect(loginStatusUrl('auth-error'));
  }

  redirect(loginStatusUrl('check-email'));
}

export async function signOut(): Promise<void> {
  const supabase = await createAuthTenancySupabaseServerClient();
  if (supabase.ok) {
    await supabase.client.auth.signOut();
  }

  redirect(loginStatusUrl('signed-out'));
}
