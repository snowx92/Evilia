'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error);
    }
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="grid min-h-[60vh] place-items-center p-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive-soft text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div className="space-y-1.5">
            <p className="text-base font-semibold">Something went wrong</p>
            <p className="text-xs text-muted-foreground">
              {this.state.error?.message ?? 'Unexpected error'}
            </p>
          </div>
          <Button onClick={this.reset} size="sm" variant="outline" className="gap-1.5">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
