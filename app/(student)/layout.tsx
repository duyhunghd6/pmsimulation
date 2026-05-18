import { NoGameplayProtectedRoute } from '../auth-boundary';

export const dynamic = 'force-dynamic';

export default function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NoGameplayProtectedRoute expectedRole="student" routeLabel="student shell">
      {children}
    </NoGameplayProtectedRoute>
  );
}
