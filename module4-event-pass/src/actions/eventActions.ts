'use server';

import { revalidatePath } from 'next/cache';
import {
  createEventSchema,
  type FormState,
  type CreateEventInput,
  type FormValues,
} from '@/types/event';
import {
  createEvent as createEventInDb,
  updateEvent as updateEventInDb,
  deleteEvent as deleteEventInDb,
  registerForEvent as registerInDb,
  getEventById,
} from '@/data/events';

// =============================================================================
// CREAR EVENTO
// =============================================================================

export async function createEventAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const formValues: FormValues = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    status: formData.get('status') as string,
    date: formData.get('date') as string,
    endDate: formData.get('endDate') as string,
    location: formData.get('location') as string,
    address: formData.get('address') as string,
    capacity: formData.get('capacity') as string,
    price: formData.get('price') as string,
    imageUrl: formData.get('imageUrl') as string,
    organizerName: formData.get('organizerName') as string,
    organizerEmail: formData.get('organizerEmail') as string,
    tags: formData.get('tags') as string,
  };

  const rawData = {
    title: formValues.title,
    description: formValues.description,
    category: formValues.category,
    status: formValues.status,
    date: formValues.date,
    endDate: formValues.endDate || undefined,
    location: formValues.location,
    address: formValues.address,
    capacity: Number(formValues.capacity),
    price: Number(formValues.price),
    imageUrl: formValues.imageUrl || undefined,
    organizerName: formValues.organizerName,
    organizerEmail: formValues.organizerEmail,
    tags: (formValues.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };

  const validationResult = createEventSchema.safeParse(rawData);

  if (!validationResult.success) {
    const errors: Record<string, string[]> = {};

    for (const issue of validationResult.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return {
      success: false,
      message: 'Por favor, corrige los errores en el formulario',
      errors,
      values: formValues,
    };
  }

  const event = await createEventInDb(validationResult.data);

  revalidatePath('/events');
  revalidatePath('/');

  return {
    success: true,
    message: 'Evento creado correctamente',
    data: event,
  };
}

// =============================================================================
// ACTUALIZAR EVENTO
// =============================================================================

export async function updateEventAction(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData: Record<string, unknown> = {};

  const title = formData.get('title') as string;
  if (title) rawData.title = title;

  const description = formData.get('description') as string;
  if (description) rawData.description = description;

  const category = formData.get('category') as string;
  if (category) rawData.category = category;

  const status = formData.get('status') as string;
  if (status) rawData.status = status;

  const date = formData.get('date') as string;
  if (date) rawData.date = date;

  const endDate = formData.get('endDate') as string;
  if (endDate) rawData.endDate = endDate;

  const location = formData.get('location') as string;
  if (location) rawData.location = location;

  const address = formData.get('address') as string;
  if (address) rawData.address = address;

  const capacity = formData.get('capacity') as string;
  if (capacity) rawData.capacity = Number(capacity);

  const price = formData.get('price') as string;
  if (price !== null && price !== '') rawData.price = Number(price);

  const imageUrl = formData.get('imageUrl') as string;
  if (imageUrl) rawData.imageUrl = imageUrl;

  const organizerName = formData.get('organizerName') as string;
  if (organizerName) rawData.organizerName = organizerName;

  const organizerEmail = formData.get('organizerEmail') as string;
  if (organizerEmail) rawData.organizerEmail = organizerEmail;

  const tags = formData.get('tags') as string;
  if (tags) {
    rawData.tags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const validationResult = createEventSchema.partial().safeParse(rawData);

  if (!validationResult.success) {
    const errors: Record<string, string[]> = {};

    for (const issue of validationResult.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return {
      success: false,
      message: 'Por favor, corrige los errores en el formulario',
      errors,
    };
  }

  const event = await updateEventInDb(
    id,
    validationResult.data as Partial<CreateEventInput>
  );

  if (!event) {
    return {
      success: false,
      message: 'No se encontró el evento a actualizar',
    };
  }

  revalidatePath('/events');
  revalidatePath(`/events/${id}`);
  revalidatePath('/');

  return {
    success: true,
    message: 'Evento actualizado correctamente',
    data: event,
  };
}

// =============================================================================
// ELIMINAR EVENTO
// =============================================================================

export async function deleteEventAction(id: string): Promise<FormState> {
  const deleted = await deleteEventInDb(id);

  if (!deleted) {
    return {
      success: false,
      message: 'No se encontró el evento a eliminar',
    };
  }

  revalidatePath('/events');
  revalidatePath('/');

  return {
    success: true,
    message: 'Evento eliminado correctamente',
  };
}

// =============================================================================
// REGISTRARSE EN EVENTO
// =============================================================================

export async function registerForEventAction(id: string): Promise<FormState> {
  try {
    const existingEvent = await getEventById(id);

    if (!existingEvent) {
      return {
        success: false,
        message: 'El evento no existe.',
      };
    }

    if (existingEvent.status !== 'publicado') {
      return {
        success: false,
        message: 'El evento no está disponible.',
      };
    }

    if (existingEvent.registeredCount >= existingEvent.capacity) {
      return {
        success: false,
        message: 'El evento ya está lleno.',
      };
    }

    const updatedEvent = await registerInDb(id);

    if (!updatedEvent) {
      return {
        success: false,
        message:
          'No se pudo completar el registro. El evento puede estar lleno o no disponible.',
      };
    }

    revalidatePath('/events');
    revalidatePath(`/events/${id}`);
    revalidatePath('/');

    return {
      success: true,
      message: '¡Te has registrado correctamente!',
      data: updatedEvent,
    };
  } catch (error) {
    console.error('Error en registerForEventAction:', error);

    return {
      success: false,
      message: 'Ocurrió un error al registrar. Intenta nuevamente.',
    };
  }
}