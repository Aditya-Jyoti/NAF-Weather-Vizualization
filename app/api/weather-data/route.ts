import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Helper function to check if two locations are duplicates
// We consider locations duplicates if they have the same latitude and longitude
function isDuplicate(location1, location2) {
  // Parse latitude and longitude as numbers for comparison
  const lat1 = Number.parseFloat(location1.latitude)
  const lng1 = Number.parseFloat(location1.longitude)
  const lat2 = Number.parseFloat(location2.latitude)
  const lng2 = Number.parseFloat(location2.longitude)

  // Check if coordinates are the same (with some tolerance for floating point comparison)
  const isSameCoordinates = Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lng1 - lng2) < 0.0001

  // If coordinates match, we can also check district/block/village for extra certainty
  if (isSameCoordinates) {
    const isSameLocation =
      location1.district === location2.district &&
      location1.block === location2.block &&
      location1.village === location2.village

    return isSameLocation
  }

  return false
}

// GET handler to fetch all weather data
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("weather-data")
    const weatherCollection = db.collection("locations")

    const data = await weatherCollection.find({}).toArray()

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

// POST handler to upload new weather data
export async function POST(request: Request) {
  try {
    const { newData } = await request.json()

    if (!newData || !Array.isArray(newData) || newData.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("weather-data")
    const weatherCollection = db.collection("locations")

    // Fetch existing data
    const existingData = await weatherCollection.find({}).toArray()

    // Filter out duplicates from new data
    const uniqueNewData = newData.filter((newLocation) => {
      return !existingData.some((existingLocation) => isDuplicate(newLocation, existingLocation))
    })

    // If there are unique new locations, insert them
    let result = { acknowledged: true, insertedCount: 0 }
    if (uniqueNewData.length > 0) {
      result = await weatherCollection.insertMany(uniqueNewData)
    }

    return NextResponse.json({
      success: true,
      message: `Added ${uniqueNewData.length} new locations. Skipped ${
        newData.length - uniqueNewData.length
      } duplicates.`,
      insertedCount: uniqueNewData.length,
      totalCount: existingData.length + uniqueNewData.length,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to upload weather data" }, { status: 500 })
  }
}

// DELETE handler to clear all weather data (for testing/admin purposes)
export async function DELETE() {
  try {
    const client = await clientPromise
    const db = client.db("weather-data")
    const weatherCollection = db.collection("locations")

    const result = await weatherCollection.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} locations.`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete weather data" }, { status: 500 })
  }
}
