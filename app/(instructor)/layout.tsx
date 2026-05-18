import { NoGameplayProtectedRoute } from '../auth-boundary';

export const dynamic = 'force-dynamic';

export default function InstructorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NoGameplayProtectedRoute expectedRole="instructor" routeLabel="instructor shell">
      {children}
    </NoGameplayProtectedRoute>
  );
}
