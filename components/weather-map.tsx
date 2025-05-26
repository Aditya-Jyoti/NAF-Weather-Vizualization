"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issues in Next.js
const markerIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom component to set map view based on bounds
function SetMapBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);

  return null;
}

// Custom component to handle search
function SearchControl({ locations, searchQuery }) {
  const map = useMap();

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) return;

    const filteredLocations = locations.filter(
      (loc) =>
        loc.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.block?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLocations.length > 0) {
      const firstMatch = filteredLocations[0];
      map.setView(
        [
          Number.parseFloat(firstMatch.latitude),
          Number.parseFloat(firstMatch.longitude),
        ],
        10
      );
    }
  }, [searchQuery, locations, map]);

  return null;
}

// Component to expose the map reference
function MapController({ setMapRef }) {
  const map = useMap();

  useEffect(() => {
    if (map && setMapRef) {
      setMapRef(map);
    }

    return () => {
      if (setMapRef) {
        setMapRef(null);
      }
    };
  }, [map, setMapRef]);

  return null;
}

export default function WeatherMap({
  onSelectLocation,
  searchQuery,
  weatherData,
  setMapRef,
}) {
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    // Calculate bounds for India based on the data
    if (weatherData && weatherData.length > 0) {
      try {
        const lats = weatherData
          .map((item) => {
            const lat = Number.parseFloat(item.latitude);
            return isNaN(lat) ? 0 : lat;
          })
          .filter((lat) => lat !== 0);

        const lngs = weatherData
          .map((item) => {
            const lng = Number.parseFloat(item.longitude);
            return isNaN(lng) ? 0 : lng;
          })
          .filter((lng) => lng !== 0);

        if (lats.length > 0 && lngs.length > 0) {
          const southWest = [Math.min(...lats) - 1, Math.min(...lngs) - 1];
          const northEast = [Math.max(...lats) + 1, Math.max(...lngs) + 1];
          setMapBounds([southWest, northEast]);
        }
      } catch (error) {
        console.error("Error calculating map bounds:", error);
      }
    }
  }, [weatherData]);

  // Default center of India
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden border relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {weatherData &&
          weatherData.map((location, index) => {
            // Ensure we have valid coordinates
            const lat = Number.parseFloat(location.latitude);
            const lng = Number.parseFloat(location.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            // Calculate average values for popup display
            const validDays = location.dailyData?.filter((day) => day) || [];

            if (validDays.length === 0) return null;

            const avgRain = (
              validDays.reduce(
                (sum, day) => sum + Number.parseFloat(day.rain || 0),
                0
              ) / validDays.length
            ).toFixed(1);

            const avgTmax = (
              validDays.reduce(
                (sum, day) => sum + Number.parseFloat(day.Tmax || 0),
                0
              ) / validDays.length
            ).toFixed(1);

            const avgTmin = (
              validDays.reduce(
                (sum, day) => sum + Number.parseFloat(day.Tmin || 0),
                0
              ) / validDays.length
            ).toFixed(1);

            const avgRH = (
              validDays.reduce(
                (sum, day) => sum + Number.parseFloat(day.RH || 0),
                0
              ) / validDays.length
            ).toFixed(1);

            const avgWindSpeed = (
              validDays.reduce(
                (sum, day) => sum + Number.parseFloat(day.Wind_Speed || 0),
                0
              ) / validDays.length
            ).toFixed(1);

            return (
              <Marker
                key={index}
                position={[lat, lng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    onSelectLocation(location);
                  },
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <p className="font-semibold mb-1">
                      {location.village || location.block || "Unknown"},{" "}
                      {location.district || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {location.state}
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Rainfall:
                        </span>
                        <span className="font-medium">{avgRain} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Max Temp:
                        </span>
                        <span className="font-medium">{avgTmax}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Min Temp:
                        </span>
                        <span className="font-medium">{avgTmin}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Humidity:
                        </span>
                        <span className="font-medium">{avgRH}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Wind Speed:
                        </span>
                        <span className="font-medium">{avgWindSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {mapBounds && <SetMapBounds bounds={mapBounds} />}
        <SearchControl
          locations={weatherData || []}
          searchQuery={searchQuery}
        />
        <MapController setMapRef={setMapRef} />
      </MapContainer>
    </div>
  );
}
