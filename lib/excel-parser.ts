import * as XLSX from "xlsx"

export async function parseExcelData(file: File): Promise<any[]> {
  const fileName = file.name.toLowerCase()

  return new Promise((resolve, reject) => {
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      reject(new Error("Unsupported file format. Please upload an Excel file (.xlsx or .xls)"))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const result = event.target?.result
      if (!result) return reject(new Error("File read failed"))

      try {
        const data = new Uint8Array(result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheet = workbook.SheetNames[0]
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: "" })

        // Normalize field names to ensure consistency
        const normalizedData = sheetData.map((row) => {
          const normalized = { ...row }

          // Normalize field names (handle case variations)
          if (normalized.Latitude !== undefined && normalized.latitude === undefined)
            normalized.latitude = normalized.Latitude

          if (normalized.Longitude !== undefined && normalized.longitude === undefined)
            normalized.longitude = normalized.Longitude

          if (normalized.District !== undefined && normalized.district === undefined)
            normalized.district = normalized.District

          if (normalized.Block !== undefined && normalized.block === undefined) normalized.block = normalized.Block

          if (normalized.Village !== undefined && normalized.village === undefined)
            normalized.village = normalized.Village

          if (normalized.Domain !== undefined && normalized.domain === undefined) normalized.domain = normalized.Domain

          // Ensure all required fields have at least empty string values
          normalized.district = normalized.district || ""
          normalized.block = normalized.block || ""
          normalized.village = normalized.village || ""
          normalized.domain = normalized.domain || ""
          normalized.rain = normalized.rain || normalized.Rain || "0"
          normalized.Tmax = normalized.Tmax || normalized.tmax || "0"
          normalized.Tmin = normalized.Tmin || normalized.tmin || "0"
          normalized.RH = normalized.RH || normalized.rh || "0"
          normalized.Wind_Speed = normalized.Wind_Speed || normalized.wind_speed || "0"

          return normalized
        })

        // Filter out any rows without valid coordinates
        const validData = normalizedData.filter((row) => {
          const lat = Number.parseFloat(String(row.latitude))
          const lng = Number.parseFloat(String(row.longitude))
          return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
        })

        if (validData.length > 0) {
          resolve(validData)
        } else {
          reject(
            new Error(
              "Could not find valid location data in the Excel file. Please ensure it contains latitude and longitude columns.",
            ),
          )
        }
      } catch (error) {
        console.error("Error processing Excel file:", error)
        reject(new Error(`Error processing Excel file: ${error.message}`))
      }
    }

    reader.onerror = () => reject(reader.error || new Error("File reading failed"))
    reader.readAsArrayBuffer(file)
  })
}
