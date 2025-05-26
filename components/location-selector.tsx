"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationSelector({ weatherData, onLocationSelected }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  // Extract unique states, districts, blocks, and villages from the data
  useEffect(() => {
    if (weatherData && weatherData.length > 0) {
      // Get unique states
      const uniqueStates = [
        ...new Set(weatherData.map((item) => item.state).filter(Boolean)),
      ];
      setStates(uniqueStates.sort());

      // Reset selections when data changes
      setSelectedState("");
      setSelectedDistrict("");
      setSelectedBlock("");
      setSelectedVillage("");
    }
  }, [weatherData]);

  // Update districts when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = weatherData.filter(
        (item) => item.state === selectedState
      );
      const uniqueDistricts = [
        ...new Set(stateData.map((item) => item.district).filter(Boolean)),
      ];
      setDistricts(uniqueDistricts.sort());
      setSelectedDistrict("");
      setSelectedBlock("");
      setSelectedVillage("");
    } else {
      setDistricts([]);
    }
  }, [selectedState, weatherData]);

  // Update blocks when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const districtData = weatherData.filter(
        (item) =>
          item.state === selectedState && item.district === selectedDistrict
      );
      const uniqueBlocks = [
        ...new Set(districtData.map((item) => item.block).filter(Boolean)),
      ];
      setBlocks(uniqueBlocks.sort());
      setSelectedBlock("");
      setSelectedVillage("");
    } else {
      setBlocks([]);
    }
  }, [selectedDistrict, selectedState, weatherData]);

  // Update villages when block changes
  useEffect(() => {
    if (selectedBlock) {
      const blockData = weatherData.filter(
        (item) =>
          item.state === selectedState &&
          item.district === selectedDistrict &&
          item.block === selectedBlock
      );
      const uniqueVillages = [
        ...new Set(blockData.map((item) => item.village).filter(Boolean)),
      ];
      setVillages(uniqueVillages.sort());
      setSelectedVillage("");
    } else {
      setVillages([]);
    }
  }, [selectedBlock, selectedDistrict, selectedState, weatherData]);

  // Handle state selection
  const handleStateChange = (value) => {
    setSelectedState(value);
  };

  // Handle district selection
  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
  };

  // Handle block selection
  const handleBlockChange = (value) => {
    setSelectedBlock(value);
  };

  // Handle village selection
  const handleVillageChange = (value) => {
    setSelectedVillage(value);

    // Find the selected location data
    const selectedLocation = weatherData.find(
      (item) =>
        item.state === selectedState &&
        item.district === selectedDistrict &&
        item.block === selectedBlock &&
        item.village === value
    );

    if (selectedLocation) {
      onLocationSelected(selectedLocation);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>States</SelectLabel>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={selectedDistrict}
              onValueChange={handleDistrictChange}
              disabled={!selectedState || districts.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Districts</SelectLabel>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={selectedBlock}
              onValueChange={handleBlockChange}
              disabled={!selectedDistrict || blocks.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Blocks</SelectLabel>
                  {blocks.map((block) => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={selectedVillage}
              onValueChange={handleVillageChange}
              disabled={!selectedBlock || villages.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Villages</SelectLabel>
                  {villages.map((village) => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
