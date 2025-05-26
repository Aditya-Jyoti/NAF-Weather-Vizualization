import * as XLSX from "xlsx";

export async function parseExcelData(file: File): Promise<any[]> {
  const fileName = file.name.toLowerCase();

  return new Promise((resolve, reject) => {
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      reject(
        new Error(
          "Unsupported file format. Please upload an Excel file (.xlsx or .xls)"
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return reject(new Error("File read failed"));

      try {
        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Expected sheet names
        const expectedSheets = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
        const locationDataMap = new Map();

        // Process each day's sheet
        expectedSheets.forEach((sheetName, dayIndex) => {
          if (workbook.SheetNames.includes(sheetName)) {
            const sheetData = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetName],
              { defval: "" }
            );

            sheetData.forEach((row) => {
              // Normalize field names
              const normalized = { ...row };

              // Handle case variations in field names
              if (
                normalized.State !== undefined &&
                normalized.state === undefined
              )
                normalized.state = normalized.State;
              if (
                normalized.District !== undefined &&
                normalized.district === undefined
              )
                normalized.district = normalized.District;
              if (
                normalized.Block !== undefined &&
                normalized.block === undefined
              )
                normalized.block = normalized.Block;
              if (
                normalized.Village !== undefined &&
                normalized.village === undefined
              )
                normalized.village = normalized.Village;
              if (
                normalized.Latitude !== undefined &&
                normalized.latitude === undefined
              )
                normalized.latitude = normalized.Latitude;
              if (
                normalized.Longitude !== undefined &&
                normalized.longitude === undefined
              )
                normalized.longitude = normalized.Longitude;

              // Validate coordinates
              const lat = Number.parseFloat(String(normalized.latitude));
              const lng = Number.parseFloat(String(normalized.longitude));

              if (
                isNaN(lat) ||
                isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
              ) {
                return; // Skip invalid coordinates
              }

              // Create a unique key for the location
              const locationKey = `${normalized.state || ""}_${
                normalized.district || ""
              }_${normalized.block || ""}_${
                normalized.village || ""
              }_${lat}_${lng}`;

              // Get or create location data
              if (!locationDataMap.has(locationKey)) {
                locationDataMap.set(locationKey, {
                  state: normalized.state || "",
                  district: normalized.district || "",
                  block: normalized.block || "",
                  village: normalized.village || "",
                  latitude: String(lat),
                  longitude: String(lng),
                  dailyData: [],
                });
              }

              const locationData = locationDataMap.get(locationKey);

              // Add daily weather data
              locationData.dailyData[dayIndex] = {
                day: dayIndex + 1,
                rain: normalized.Rain || normalized.rain || "0",
                Tmax: normalized.Tmax || normalized.tmax || "0",
                Tmin: normalized.Tmin || normalized.tmin || "0",
                RH: normalized.RH || normalized.rh || "0",
                Wind_Speed:
                  normalized.Wind_Speed || normalized.wind_speed || "0",
              };
            });
          }
        });

        // Convert map to array and filter out incomplete data
        const processedData = Array.from(locationDataMap.values()).filter(
          (location) => {
            // Only include locations that have at least one day of data
            return (
              location.dailyData.length > 0 &&
              location.dailyData.some((day) => day !== undefined)
            );
          }
        );

        if (processedData.length > 0) {
          resolve(processedData);
        } else {
          reject(
            new Error(
              "Could not find valid location data in the Excel file. Please ensure it contains the expected sheets (Day 1, Day 2, etc.) with latitude and longitude columns."
            )
          );
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(new Error(`Error processing Excel file: ${error.message}`));
      }
    };

    reader.onerror = () =>
      reject(reader.error || new Error("File reading failed"));
    reader.readAsArrayBuffer(file);
  });
}

// Sample data for initial load with 5-day structure
export const sampleData = [
  {
    state: "Delhi",
    district: "Delhi",
    block: "Central Delhi",
    village: "Connaught Place",
    latitude: "28.6304",
    longitude: "77.2177",
    dailyData: [
      {
        day: 1,
        rain: "45",
        Tmax: "38",
        Tmin: "26",
        RH: "65",
        Wind_Speed: "12",
      },
      {
        day: 2,
        rain: "50",
        Tmax: "39",
        Tmin: "27",
        RH: "68",
        Wind_Speed: "10",
      },
      {
        day: 3,
        rain: "42",
        Tmax: "37",
        Tmin: "25",
        RH: "62",
        Wind_Speed: "14",
      },
      {
        day: 4,
        rain: "48",
        Tmax: "40",
        Tmin: "28",
        RH: "70",
        Wind_Speed: "11",
      },
      {
        day: 5,
        rain: "46",
        Tmax: "38",
        Tmin: "26",
        RH: "66",
        Wind_Speed: "13",
      },
    ],
  },
  {
    state: "Tamil Nadu",
    district: "Chennai",
    block: "Mylapore",
    village: "Mylapore",
    latitude: "13.0337",
    longitude: "80.2679",
    dailyData: [
      {
        day: 1,
        rain: "120",
        Tmax: "35",
        Tmin: "24",
        RH: "80",
        Wind_Speed: "8",
      },
      {
        day: 2,
        rain: "115",
        Tmax: "36",
        Tmin: "25",
        RH: "78",
        Wind_Speed: "9",
      },
      {
        day: 3,
        rain: "125",
        Tmax: "34",
        Tmin: "23",
        RH: "82",
        Wind_Speed: "7",
      },
      {
        day: 4,
        rain: "118",
        Tmax: "37",
        Tmin: "26",
        RH: "79",
        Wind_Speed: "10",
      },
      {
        day: 5,
        rain: "122",
        Tmax: "35",
        Tmin: "24",
        RH: "81",
        Wind_Speed: "8",
      },
    ],
  },
];
