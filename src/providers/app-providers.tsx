'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AuthBridge } from './auth-bridge';
import { FirebaseAuthBridge } from './firebase-auth-bridge';
import { DirectionProvider } from './direction-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <DirectionProvider>
        <FirebaseAuthBridge>
          <AuthBridge>
            <TooltipProvider delayDuration={150}>
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthBridge>
        </FirebaseAuthBridge>
      </DirectionProvider>
    </QueryProvider>
  );
}
