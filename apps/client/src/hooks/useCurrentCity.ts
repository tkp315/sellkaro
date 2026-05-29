import { useState, useCallback } from 'react';

interface UseCurrentCityReturn {
  city: string | null;
  isLoading: boolean;
  error: string | null;
  detect: () => void;
  clear: () => void;
}

export function useCurrentCity(): UseCurrentCityReturn {
  const [city, setCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
          );
          if (!res.ok) throw new Error();
          const data = await res.json() as { address?: Record<string, string> };
          const detected =
            data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            data.address?.county ??
            data.address?.state_district ??
            null;
          if (detected) setCity(detected);
          else setError('Could not determine city from your location');
        } catch {
          setError('Failed to fetch location data');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) setError('Location access denied. Please allow location in browser settings.');
        else setError('Could not get your location. Try again.');
      },
      { timeout: 10000 },
    );
  }, []);

  const clear = useCallback(() => {
    setCity(null);
    setError(null);
  }, []);

  return { city, isLoading, error, detect, clear };
}
