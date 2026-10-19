import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { patient } from '@/data/people';

type Address = { text: string; source: 'device' | 'home' };

/**
 * The street address of the device, falling back to the patient's home address
 * while locating, or when permission is denied or the lookup fails.
 */
export function useCurrentAddress(): Address {
  const [address, setAddress] = useState<Address>({ text: patient.homeAddress, source: 'home' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = position.coords;
        let text = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (place) {
            const street = [place.streetNumber, place.street].filter(Boolean).join(' ');
            const parts = [street || place.name, place.city, [place.region, place.postalCode].filter(Boolean).join(' ')];
            const formatted = parts.filter(Boolean).join(', ');
            if (formatted) text = formatted;
          }
        } catch {
          // Reverse geocoding isn't available everywhere (e.g. web); keep coordinates.
        }
        if (!cancelled) setAddress({ text, source: 'device' });
      } catch {
        // Location unavailable; keep the home address.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return address;
}
