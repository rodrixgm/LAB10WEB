'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EVENT_CATEGORIES,
  CATEGORY_LABELS,
  EVENT_STATUSES,
  STATUS_LABELS,
  type EventCategory,
  type EventStatus,
} from '@/types/event';

interface EventFiltersFormProps {
  currentFilters: {
    search?: string;
    category?: EventCategory;
    status?: EventStatus;
    priceMax?: number;
  };
}

export function EventFiltersForm({
  currentFilters,
}: EventFiltersFormProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentFilters.search ?? '');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const isFirstRender = useRef(true);

  const categoryValue = currentFilters.category ?? '';
  const statusValue = currentFilters.status ?? '';
  const priceMaxValue = currentFilters.priceMax?.toString() ?? '';

  const hasFilters = Boolean(
    currentFilters.search ||
      currentFilters.category ||
      currentFilters.status ||
      currentFilters.priceMax !== undefined
  );

  const buildQueryString = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const updateFilter = (key: string, value: string) => {
    router.replace(buildQueryString({ [key]: value || undefined }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    router.replace(pathname);
  };

  useEffect(() => {
    setSearchTerm(currentFilters.search ?? '');
  }, [currentFilters.search]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    router.replace(
      buildQueryString({
        search: debouncedSearch.trim() || undefined,
      })
    );
  }, [debouncedSearch]);

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {hasFilters && (
          <Button type="button" variant="outline" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryValue}
          onChange={(e) => updateFilter('category', e.target.value)}
          className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            categoryValue ? 'border-primary text-primary' : 'border-input'
          }`}
        >
          <option value="">Todas las categorías</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        <select
          value={statusValue}
          onChange={(e) => updateFilter('status', e.target.value)}
          className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            statusValue ? 'border-primary text-primary' : 'border-input'
          }`}
        >
          <option value="">Todos los estados</option>
          {EVENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={priceMaxValue}
          onChange={(e) => updateFilter('priceMax', e.target.value)}
          className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            priceMaxValue ? 'border-primary text-primary' : 'border-input'
          }`}
        >
          <option value="">Cualquier precio</option>
          <option value="0">Gratis</option>
          <option value="25">Hasta $25</option>
          <option value="50">Hasta $50</option>
          <option value="100">Hasta $100</option>
          <option value="200">Hasta $200</option>
        </select>
      </div>

      {/* Filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {currentFilters.search && (
            <button
              type="button"
              onClick={() => updateFilter('search', '')}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Búsqueda: {currentFilters.search}
              <X className="h-3 w-3" />
            </button>
          )}

          {currentFilters.category && (
            <button
              type="button"
              onClick={() => updateFilter('category', '')}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Categoría: {CATEGORY_LABELS[currentFilters.category]}
              <X className="h-3 w-3" />
            </button>
          )}

          {currentFilters.status && (
            <button
              type="button"
              onClick={() => updateFilter('status', '')}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Estado: {STATUS_LABELS[currentFilters.status]}
              <X className="h-3 w-3" />
            </button>
          )}

          {currentFilters.priceMax !== undefined && (
            <button
              type="button"
              onClick={() => updateFilter('priceMax', '')}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              Precio: {currentFilters.priceMax === 0 ? 'Gratis' : `Hasta $${currentFilters.priceMax}`}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}