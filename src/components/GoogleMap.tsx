import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

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
  title?: string; // Optional title for iframe fallback
}

export function GoogleMap({
  locations,
  activities,
  height = '400px',
  showRoute = true,
  className = '',
  zoom = 13,
  title = 'Google Map'
}: GoogleMapProps) {
  // Convert activities to locations if provided
  const mapLocations: Location[] = activities
    ? activities.map(activity => ({
        name: activity.activity || activity.name,
        address: activity.location || activity.address,
      }))
    : locations || [];

  // Generate Google Maps embed URL
  const generateEmbedUrl = () => {
    if (mapLocations.length === 0) return '';

    if (mapLocations.length === 1) {
      const query = encodeURIComponent(`${mapLocations[0].address || mapLocations[0].name}, South Korea`);
      return `https://maps.google.com/maps?q=${query}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    }

    // Multiple locations - create directions
    const origin = encodeURIComponent(mapLocations[0].address || mapLocations[0].name);
    const destination = encodeURIComponent(mapLocations[mapLocations.length - 1].address || mapLocations[mapLocations.length - 1].name);
    const waypoints = mapLocations
      .slice(1, -1)
      .map(loc => encodeURIComponent(loc.address || loc.name))
      .join('+to:');

    if (waypoints) {
      return `https://maps.google.com/maps?saddr=${origin}&daddr=${waypoints}+to:${destination}&output=embed`;
    } else {
      return `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&output=embed`;
    }
  };

  // Generate Google Maps directions URL
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

  return (
    <div className={`relative h-full ${className}`}>
      <iframe
        width="100%"
        height="100%"
        frameBorder={0}
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={generateEmbedUrl()}
        className="w-full h-full"
        style={{ height }}
        title={title}
        loading="lazy"
      />

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
