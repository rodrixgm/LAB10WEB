'use client';

import * as React from 'react';
import { useOptimistic, useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { registerForEventAction } from '@/actions/eventActions';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterButtonProps {
  eventId: string;
  availableSpots: number;
  isAvailable: boolean;
}

export function RegisterButton({
  eventId,
  availableSpots,
  isAvailable,
}: RegisterButtonProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  const [hasRegistered, setHasRegistered] = useState(false);
  const [baseSpots, setBaseSpots] = useState(availableSpots);

  useEffect(() => {
    setBaseSpots(availableSpots);
  }, [availableSpots]);

  const [optimisticSpots, addOptimistic] = useOptimistic(
    baseSpots,
    (currentSpots: number, action: 'register' | 'reset') => {
      if (action === 'register') {
        return Math.max(0, currentSpots - 1);
      }

      return currentSpots;
    }
  );

  const isFull = optimisticSpots <= 0;
  const canRegister = isAvailable && !isFull && !hasRegistered && !isPending;

  function handleRegister(): void {
    if (!canRegister) return;

    setFeedback({ type: null, message: '' });

    const previousSpots = baseSpots;

    startTransition(async () => {
      addOptimistic('register');

      const result = await registerForEventAction(eventId);

      if (!result.success) {
        setBaseSpots(previousSpots);

        setFeedback({
          type: 'error',
          message: result.message,
        });
        return;
      }

      setBaseSpots((prev) => Math.max(0, prev - 1));
      setHasRegistered(true);

      setFeedback({
        type: 'success',
        message: result.message,
      });
    });
  }

  if (hasRegistered) {
    return (
      <div className="space-y-2">
        <Button variant="secondary" disabled className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          ¡Registrado!
        </Button>

        {feedback.message && (
          <p className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {feedback.message}
          </p>
        )}
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <Button variant="secondary" disabled className="w-full">
        No disponible
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Evento Agotado
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleRegister}
        disabled={!canRegister}
        className={cn('w-full gap-2', isPending && 'cursor-wait')}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Registrando...
          </>
        ) : (
          `Registrarme (${optimisticSpots} plazas)`
        )}
      </Button>

      {feedback.type === 'error' && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {feedback.message}
        </p>
      )}
    </div>
  );
}