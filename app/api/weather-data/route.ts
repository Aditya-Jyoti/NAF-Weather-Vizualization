import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Helper function to check if two locations are duplicates
function isDuplicate(location1, location2) {
  // Parse latitude and longitude as numbers for comparison
  const lat1 = Number.parseFloat(location1.latitude);
  const lng1 = Number.parseFloat(location1.longitude);
  const lat2 = Number.parseFloat(location2.latitude);
  const lng2 = Number.parseFloat(location2.longitude);

  // Check if coordinates are the same (with some tolerance for floating point comparison)
  const isSameCoordinates =
    Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lng1 - lng2) < 0.0001;

  // If coordinates match, check other location identifiers
  if (isSameCoordinates) {
    const isSameLocation =
      location1.state === location2.state &&
      location1.district === location2.district &&
      location1.block === location2.block &&
      location1.village === location2.village;

    return isSameLocation;
  }

  return false;
}

// GET handler to fetch all weather data
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("weather-data");
    const weatherCollection = db.collection("locations");

    const data = await weatherCollection.find({}).toArray();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

// POST handler to upload new weather data
export async function POST(request: Request) {
  try {
    const { newData } = await request.json();

    if (!newData || !Array.isArray(newData) || newData.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("weather-data");
    const weatherCollection = db.collection("locations");

    // Fetch existing data
    const existingData = await weatherCollection.find({}).toArray();

    // Process new data - either update existing locations or insert new ones
    let updatedCount = 0;
    let insertedCount = 0;

    for (const newLocation of newData) {
      // Check if this location already exists
      const existingLocation = existingData.find((existing) =>
        isDuplicate(newLocation, existing)
      );

      if (existingLocation) {
        // Update existing location with new daily data
        // Merge the daily data arrays, preferring new data for overlapping days
        const mergedDailyData = [...(existingLocation.dailyData || [])];

        newLocation.dailyData.forEach((newDay) => {
          if (newDay) {
            const existingDayIndex = mergedDailyData.findIndex(
              (day) => day && day.day === newDay.day
            );
            if (existingDayIndex >= 0) {
              mergedDailyData[existingDayIndex] = newDay; // Replace existing day data
            } else {
              mergedDailyData[newDay.day - 1] = newDay; // Add new day data
            }
          }
        });

        // Update the document in MongoDB
        await weatherCollection.updateOne(
          { _id: existingLocation._id },
          {
            $set: {
              dailyData: mergedDailyData,
              // Update other fields in case they've changed
              state: newLocation.state,
              district: newLocation.district,
              block: newLocation.block,
              village: newLocation.village,
            },
          }
        );
        updatedCount++;
      } else {
        // Insert new location
        await weatherCollection.insertOne(newLocation);
        insertedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${insertedCount} new locations and updated ${updatedCount} existing locations.`,
      insertedCount,
      updatedCount,
      totalProcessed: newData.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to upload weather data" },
      { status: 500 }
    );
  }
}

// DELETE handler to clear all weather data (for testing/admin purposes)
export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("weather-data");
    const weatherCollection = db.collection("locations");

    const result = await weatherCollection.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} locations.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete weather data" },
      { status: 500 }
    );
  }
}
