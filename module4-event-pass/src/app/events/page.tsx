// =============================================================================
// PÁGINA DE EVENTOS - Module 4: Event Pass
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventList } from '@/components/EventList';
import { EventFiltersForm } from './EventFiltersForm';
import { getEvents } from '@/data/events';
import type { EventCategory, EventStatus } from '@/types/event';

export const metadata: Metadata = {
  title: 'Explorar Eventos',
  description: 'Descubre y filtra eventos por categoría, fecha, precio y más.',
};

interface EventsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    status?: string;
    priceMax?: string;
  };
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps): Promise<React.ReactElement> {

  // Construcción de filtros desde URL
  const filters = {
    search: searchParams.search || undefined,
    category: searchParams.category as EventCategory | undefined,
    status: searchParams.status as EventStatus | undefined,
    priceMax: searchParams.priceMax
      ? Number(searchParams.priceMax)
      : undefined,
  };

  // Fetch en servidor (clave del lab)
  const events = await getEvents(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Explorar Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
          </p>
        </div>

        <Button asChild>
          <Link href="/events/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Evento
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <EventFiltersForm currentFilters={filters} />
      </div>

      {/* Lista */}
      <EventList
        events={events}
        emptyMessage="No se encontraron eventos con los filtros seleccionados"
      />
    </div>
  );
}