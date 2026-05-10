import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Button } from './ui/button';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { env } from '@/config/env';

interface Location {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface GoogleMapProps {
  locations?: Location[];
  activities?: any[]; // Support for activities array from ItineraryDisplay
  height?: string;
  showRoute?: boolean;
  className?: string;
  zoom?: number;
  title?: string;
  focusedIndex?: number | null; // Index of the focused activity (for hover highlighting)
}

// Default center (Seoul)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Map options
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export function GoogleMap({
  locations,
  activities,
  height = '400px',
  showRoute = true,
  className = '',
  zoom = 13,
  title = 'Google Map',
  focusedIndex = null
}: GoogleMapProps) {
  const apiKey = env.googleMapsApiKey;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [geocodedLocations, setGeocodedLocations] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Convert activities to locations if provided
  const mapLocations: Location[] = useMemo(() => {
    if (activities) {
      return activities.map(activity => ({
        name: activity.activity || activity.name,
        address: activity.location || activity.address,
        lat: activity.lat,
        lng: activity.lng,
      }));
    }
    return locations || [];
  }, [activities, locations]);

  // Geocode addresses to get coordinates
  useEffect(() => {
    if (!isLoaded || mapLocations.length === 0) return;

    const geocodeLocations = async () => {
      setIsGeocoding(true);
      const geocoder = new google.maps.Geocoder();
      const results: Array<{ lat: number; lng: number; name: string }> = [];

      for (const loc of mapLocations) {
        // If coordinates already exist, use them
        if (loc.lat && loc.lng) {
          results.push({ lat: loc.lat, lng: loc.lng, name: loc.name });
          continue;
        }

        // Otherwise geocode the address
        try {
          const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode(
              { address: `${loc.address || loc.name}, South Korea` },
              (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results);
                } else {
                  reject(new Error(`Geocoding failed: ${status}`));
                }
              }
            );
          });

          if (response[0]) {
            results.push({
              lat: response[0].geometry.location.lat(),
              lng: response[0].geometry.location.lng(),
              name: loc.name,
            });
          }
        } catch (error) {
          console.warn(`Failed to geocode: ${loc.address || loc.name}`);
        }
      }

      setGeocodedLocations(results);
      setIsGeocoding(false);
    };

    geocodeLocations();
  }, [isLoaded, mapLocations]);

  // Get directions between locations
  useEffect(() => {
    if (!isLoaded || geocodedLocations.length < 2 || !showRoute) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    const origin = geocodedLocations[0];
    const destination = geocodedLocations[geocodedLocations.length - 1];
    const waypoints = geocodedLocations.slice(1, -1).map(loc => ({
      location: new google.maps.LatLng(loc.lat, loc.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: google.maps.TravelMode.TRANSIT,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          console.warn('Directions request failed:', status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, geocodedLocations, showRoute]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (!map || geocodedLocations.length === 0) return;

    // If a specific location is focused, center on it
    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < geocodedLocations.length) {
      const focused = geocodedLocations[focusedIndex];
      map.panTo({ lat: focused.lat, lng: focused.lng });
      map.setZoom(zoom + 2);
      return;
    }

    // Otherwise fit all markers
    if (geocodedLocations.length === 1) {
      map.setCenter({ lat: geocodedLocations[0].lat, lng: geocodedLocations[0].lng });
      map.setZoom(zoom);
    } else {
      const bounds = new google.maps.LatLngBounds();
      geocodedLocations.forEach(loc => {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, geocodedLocations, focusedIndex, zoom]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Generate Google Maps directions URL for external link
  const getDirectionsUrl = () => {
    if (mapLocations.length === 0) return '#';

    if (mapLocations.length === 1) {
      const query = encodeURIComponent(mapLocations[0].address || mapLocations[0].name);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    const waypoints = mapLocations.map(loc =>
      encodeURIComponent(loc.address || loc.name)
    ).join('/');

    return `https://www.google.com/maps/dir/${waypoints}`;
  };

  // Loading state
  if (!isLoaded || isGeocoding) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
          <p className="text-gray-600 font-bold text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-red-400" />
          <p className="text-gray-600 font-bold">Failed to load map</p>
        </div>
      </div>
    );
  }

  // No locations state
  if (mapLocations.length === 0) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-gray-600 font-bold">No locations to display</p>
        </div>
      </div>
    );
  }

  // Calculate center
  const center = geocodedLocations.length > 0
    ? { lat: geocodedLocations[0].lat, lng: geocodedLocations[0].lng }
    : DEFAULT_CENTER;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Show markers */}
        {geocodedLocations.map((loc, index) => (
          <Marker
            key={index}
            position={{ lat: loc.lat, lng: loc.lng }}
            label={{
              text: String(index + 1),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
            icon={
              focusedIndex === index
                ? {
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(48, 48),
                  }
                : {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                  }
            }
            title={loc.name}
            zIndex={focusedIndex === index ? 1000 : index}
          />
        ))}

        {/* Show route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // We're using custom markers
              polylineOptions: {
                strokeColor: '#000000',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMapComponent>

      {/* Open in Google Maps Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          asChild
          size="sm"
          className="bg-white text-black hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
        >
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open in Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
