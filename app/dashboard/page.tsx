'use client';

import { useEffect, useState } from 'react';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/navigation';
import DAODashboard from '@/app/components/DAODashboard';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to home page if not logged in
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show dashboard only if logged in
  if (!isLoggedIn) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <DAODashboard />
    </div>
  );
}
