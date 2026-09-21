import type { Service } from '../entities';

/** Case-insensitive search: every word of the query must appear in the service's name, category or description. */
export const filterServices = (services: Service[], query: string): Service[] => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return services;
  return services.filter((s) => {
    const haystack = `${s.name} ${s.category} ${s.description ?? ''}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
};
