import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { MapPin, DollarSign, ExternalLink, Footprints, Train, Car } from 'lucide-react';

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  googleMapsUrl?: string;
  isEvent?: boolean;
  transportMode?: 'walking' | 'transit' | 'driving';
  transportDuration?: number;  // 분
  transportDistance?: number;  // km
  transportDetails?: string;   // 환승 정보
  transportCost?: string;      // 이동 비용
}

interface ItineraryMapProps {
  activities: Activity[];
  activeIndex: number | null;
  onMarkerClick?: (index: number) => void;
}

interface RouteSegment {
  segmentIndex: number;
  directions: google.maps.DirectionsResult | null;
  transportMode: 'walking' | 'transit' | 'driving';
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Seoul center as default
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Route colors by transport mode
const ROUTE_COLORS: Record<string, string> = {
  walking: '#3B82F6', // Blue
  transit: '#10B981', // Green
  driving: '#EF4444', // Red
};

// Custom numbered marker SVG
const createNumberedMarkerIcon = (number: number, isActive: boolean) => {
  const color = isActive ? '#000000' : '#ffffff';
  const bgColor = isActive ? '#fbbf24' : '#000000';
  const size = isActive ? 44 : 36;

  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="${isActive ? '#000' : '#fff'}" stroke-width="3"/>
        <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif" font-size="${isActive ? 18 : 14}" font-weight="bold">${number}</text>
        <path d="M${size/2} ${size} L${size/2 - 6} ${size - 8} L${size/2 + 6} ${size - 8} Z" fill="${bgColor}"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(size, size + 12),
    anchor: new google.maps.Point(size / 2, size + 12),
  };
};

// Parse coordinates from Google Maps URL (format: https://maps.google.com/?q=lat,lng)
function parseCoordinatesFromUrl(url?: string): { lat: number; lng: number } | null {
  if (!url) return null;

  const match = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }
  return null;
}

// Map transport mode to Google Maps TravelMode
function getTravelMode(mode?: string): google.maps.TravelMode {
  switch (mode) {
    case 'walking':
      return google.maps.TravelMode.WALKING;
    case 'driving':
      return google.maps.TravelMode.DRIVING;
    case 'transit':
    default:
      return google.maps.TravelMode.TRANSIT;
  }
}

// Get icon for transport mode
function TransportIcon({ mode }: { mode?: string }) {
  switch (mode) {
    case 'walking':
      return <Footprints className="h-3 w-3" style={{ color: ROUTE_COLORS.walking }} />;
    case 'driving':
      return <Car className="h-3 w-3" style={{ color: ROUTE_COLORS.driving }} />;
    case 'transit':
    default:
      return <Train className="h-3 w-3" style={{ color: ROUTE_COLORS.transit }} />;
  }
}

export function ItineraryMap({ activities, activeIndex, onMarkerClick }: ItineraryMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Initialize services when map loads
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    directionsServiceRef.current = new google.maps.DirectionsService();
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    directionsServiceRef.current = null;
  }, []);

  // Parse coordinates from URLs or geocode locations
  useEffect(() => {
    if (!isLoaded || activities.length === 0) return;

    const parseLocations = async () => {
      const newMarkers: { lat: number; lng: number }[] = [];
      const geocoder = new google.maps.Geocoder();

      for (const activity of activities) {
        // First try to parse coordinates from URL
        const coords = parseCoordinatesFromUrl(activity.googleMapsUrl);
        if (coords) {
          newMarkers.push(coords);
          continue;
        }

        // Fallback to geocoding
        try {
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode(
              { address: `${activity.location}, South Korea` },
              (results, status) => {
                if (status === 'OK' && results) {
                  resolve(results);
                } else {
                  reject(status);
                }
              }
            );
          });

          if (result[0]?.geometry?.location) {
            newMarkers.push({
              lat: result[0].geometry.location.lat(),
              lng: result[0].geometry.location.lng(),
            });
          } else {
            newMarkers.push(DEFAULT_CENTER);
          }
        } catch {
          newMarkers.push(DEFAULT_CENTER);
        }
      }

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (map && newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker));
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    };

    parseLocations();
  }, [isLoaded, activities, map]);

  // Calculate routes between consecutive markers
  useEffect(() => {
    if (!directionsServiceRef.current || markers.length < 2) {
      setRouteSegments([]);
      return;
    }

    const calculateRoutes = async () => {
      setIsLoadingRoutes(true);
      const segments: RouteSegment[] = [];

      for (let i = 0; i < markers.length - 1; i++) {
        const origin = markers[i];
        const destination = markers[i + 1];
        const transportMode = activities[i + 1]?.transportMode || 'walking';

        try {
          console.log(`[ItineraryMap] Requesting route ${i + 1}: `, {
            origin,
            destination,
            mode: transportMode,
          });

          const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsServiceRef.current!.route(
              {
                origin,
                destination,
                travelMode: getTravelMode(transportMode),
                region: 'KR', // Bias results to Korea
              },
              (res, status) => {
                if (status === 'OK' && res) {
                  resolve(res);
                } else {
                  reject(status);
                }
              }
            );
          });

          segments.push({
            segmentIndex: i,
            directions: result,
            transportMode,
          });
        } catch (error) {
          // Skip failed routes - don't add to segments
          console.warn(`[ItineraryMap] Route ${i + 1} failed:`, error);
        }
      }

      setRouteSegments(segments);
      setIsLoadingRoutes(false);
    };

    calculateRoutes();
  }, [markers, activities]);

  // Pan to active marker when activeIndex changes
  useEffect(() => {
    if (map && activeIndex !== null && markers[activeIndex]) {
      map.panTo(markers[activeIndex]);
      map.setZoom(15);
      setSelectedMarker(activeIndex);
    }
  }, [map, activeIndex, markers]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Failed to load map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markers[0] || DEFAULT_CENTER}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Route segments with DirectionsRenderer */}
        {routeSegments
          .filter((segment) => segment.directions !== null)
          .map((segment) => (
            <DirectionsRenderer
              key={`route-${segment.segmentIndex}`}
              directions={segment.directions!}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: ROUTE_COLORS[segment.transportMode] || ROUTE_COLORS.transit,
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                },
                preserveViewport: true,
              }}
            />
          ))}

        {/* Markers */}
        {markers.map((position, index) => (
          <Marker
            key={index}
            position={position}
            icon={createNumberedMarkerIcon(index + 1, activeIndex === index)}
            onClick={() => {
              setSelectedMarker(index);
              onMarkerClick?.(index);
            }}
            animation={activeIndex === index ? google.maps.Animation.BOUNCE : undefined}
            zIndex={activeIndex === index ? 1000 : index}
          />
        ))}

        {/* Info window for selected marker */}
        {selectedMarker !== null && markers[selectedMarker] && (
          <InfoWindow
            position={markers[selectedMarker]}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -40),
            }}
          >
            <div className="p-2 min-w-[200px] max-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
                  {activities[selectedMarker]?.time}
                </span>
                {activities[selectedMarker]?.isEvent && (
                  <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                    EVENT
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm mb-1">{activities[selectedMarker]?.activity}</h3>
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                {activities[selectedMarker]?.location}
              </p>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {activities[selectedMarker]?.description}
              </p>

              {/* Transport info from previous location */}
              {selectedMarker > 0 && activities[selectedMarker]?.transportMode && (
                <div
                  className="mb-2 px-2 py-2 rounded text-xs"
                  style={{
                    backgroundColor: `${ROUTE_COLORS[activities[selectedMarker].transportMode!]}15`,
                    borderLeft: `3px solid ${ROUTE_COLORS[activities[selectedMarker].transportMode!]}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TransportIcon mode={activities[selectedMarker].transportMode} />
                    <span className="font-semibold">
                      {activities[selectedMarker].transportMode === 'walking' && 'Walking'}
                      {activities[selectedMarker].transportMode === 'transit' && 'Public Transit'}
                      {activities[selectedMarker].transportMode === 'driving' && 'Driving'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600">
                    {activities[selectedMarker].transportDuration && (
                      <span>{activities[selectedMarker].transportDuration} min</span>
                    )}
                    {activities[selectedMarker].transportDistance && (
                      <span>{activities[selectedMarker].transportDistance} km</span>
                    )}
                    {activities[selectedMarker].transportCost && (
                      <span className="font-medium text-gray-700">{activities[selectedMarker].transportCost}</span>
                    )}
                  </div>
                  {activities[selectedMarker].transportDetails && (
                    <div className="mt-1 text-gray-500 italic">
                      {activities[selectedMarker].transportDetails}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  <DollarSign className="h-3 w-3 inline" />
                  {activities[selectedMarker]?.estimatedCost}
                </span>
                {activities[selectedMarker]?.googleMapsUrl && (
                  <a
                    href={activities[selectedMarker].googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Directions <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Route legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <div className="font-semibold mb-2">Route Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: ROUTE_COLORS.walking }}></div>
            <Footprints className="h-3 w-3" style={{ color: ROUTE_COLORS.walking }} />
            <span>Walking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: ROUTE_COLORS.transit }}></div>
            <Train className="h-3 w-3" style={{ color: ROUTE_COLORS.transit }} />
            <span>Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: ROUTE_COLORS.driving }}></div>
            <Car className="h-3 w-3" style={{ color: ROUTE_COLORS.driving }} />
            <span>Driving</span>
          </div>
        </div>
      </div>

      {/* Loading indicator for routes */}
      {isLoadingRoutes && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-xs flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
          <span>Loading routes...</span>
        </div>
      )}
    </div>
  );
}
