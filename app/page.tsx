"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Footer } from "@/components/footer";
import FileUploadButton from "@/components/file-upload-button";
import LocationSelector from "@/components/location-selector";
import { Toaster } from "@/components/toaster";
import { Loader2 } from "lucide-react"; // Import Loader2 to fix the undeclared variable error

// Import the map component dynamically to avoid SSR issues with Leaflet
const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-md bg-muted flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapRef, setMapRef] = useState(null);

  // Fetch data from MongoDB on initial load
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/weather-data");
        if (response.ok) {
          const { data } = await response.json();
          if (data && data.length > 0) {
            setWeatherData(data);
          }
        } else {
          console.error("Failed to fetch data from MongoDB");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle data loaded from file upload
  const handleDataLoaded = (data) => {
    console.log("Data loaded:", data);
    setWeatherData(data);
    setSelectedLocation(null); // Reset selected location when new data is loaded
  };

  // Handle location selection from dropdown
  const handleLocationSelected = (location) => {
    setSelectedLocation(location);

    // Update map view if we have a map reference
    if (mapRef) {
      const lat = Number.parseFloat(location.latitude);
      const lng = Number.parseFloat(location.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.setView([lat, lng], 12); // Zoom level 12 for village level
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container w-[80%] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Logo" className="h-12 w-12 w-auto" />
            <h1 className="text-lg font-semibold">
              India Weather Data Visualization
            </h1>
          </div>
          <FileUploadButton onDataLoaded={handleDataLoaded} />
        </div>
      </header>

      <div className="container w-[80%] mx-auto flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {isLoading ? (
          <div className="w-full flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading data...</span>
          </div>
        ) : (
          <>
            {/* Location Selector Dropdowns */}
            <div className="w-full relative z-10">
              <h2 className="text-lg font-medium mb-2">Select Location</h2>
              <LocationSelector
                weatherData={weatherData}
                onLocationSelected={handleLocationSelected}
              />
            </div>

            <div className="grid md:grid-cols-5 gap-6 relative z-0">
              <div className="space-y-4 md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search locations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {selectedLocation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedLocation.village || selectedLocation.block},{" "}
                        {selectedLocation.district}
                      </CardTitle>
                      <CardDescription>
                        {selectedLocation.domain}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="weather">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="weather">Weather</TabsTrigger>
                          <TabsTrigger value="location">Location</TabsTrigger>
                        </TabsList>
                        <TabsContent value="weather" className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Rainfall
                              </span>
                              <span className="text-2xl font-bold">
                                {selectedLocation.rain} mm
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Max Temp
                              </span>
                              <span className="text-2xl font-bold">
                                {selectedLocation.Tmax}°C
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Min Temp
                              </span>
                              <span className="text-2xl font-bold">
                                {selectedLocation.Tmin}°C
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Humidity
                              </span>
                              <span className="text-2xl font-bold">
                                {selectedLocation.RH}%
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1 col-span-2">
                              <span className="text-sm text-muted-foreground">
                                Wind Speed
                              </span>
                              <span className="text-2xl font-bold">
                                {selectedLocation.Wind_Speed} km/h
                              </span>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="location"
                          className="space-y-4 pt-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                District
                              </span>
                              <span className="font-medium">
                                {selectedLocation.district}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Block
                              </span>
                              <span className="font-medium">
                                {selectedLocation.block}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Village
                              </span>
                              <span className="font-medium">
                                {selectedLocation.village}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Domain
                              </span>
                              <span className="font-medium">
                                {selectedLocation.domain}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Latitude
                              </span>
                              <span className="font-medium">
                                {selectedLocation.latitude}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-muted-foreground">
                                Longitude
                              </span>
                              <span className="font-medium">
                                {selectedLocation.longitude}
                              </span>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Weather Information</CardTitle>
                      <CardDescription>
                        Select a location from the dropdown or click on any
                        marker on the map to view detailed weather data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-8 text-muted-foreground">
                        No location selected
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="md:col-span-3">
                <WeatherMap
                  onSelectLocation={setSelectedLocation}
                  searchQuery={searchQuery}
                  weatherData={weatherData}
                  setMapRef={setMapRef}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
      <Toaster />
    </main>
  );
}
