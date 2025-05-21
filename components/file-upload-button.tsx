"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { parseExcelData } from "@/lib/excel-parser"
import { toast } from "@/components/ui/use-toast"

export default function FileUploadButton({ onDataLoaded }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Parse the Excel file
      const parsedData = await parseExcelData(file)

      if (!parsedData || parsedData.length === 0) {
        throw new Error("No valid data found in the file")
      }

      // First, fetch existing data from MongoDB
      const response = await fetch("/api/weather-data")
      if (!response.ok) {
        throw new Error("Failed to fetch existing data")
      }

      const { data: existingData } = await response.json()

      // Upload the new data to MongoDB
      const uploadResponse = await fetch("/api/weather-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newData: parsedData }),
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload data to database")
      }

      const result = await uploadResponse.json()

      // Combine existing and new data for the UI
      // If there were new items added, we'll use the combined data
      // Otherwise, we'll just use the existing data
      const combinedData = result.insertedCount > 0 ? [...existingData, ...parsedData] : existingData

      // Update the UI with the combined data
      onDataLoaded(combinedData)

      toast({
        title: "Data processed successfully",
        description: result.message,
      })
    } catch (err) {
      console.error("Error processing file:", err)
      toast({
        variant: "destructive",
        title: "Error processing data",
        description: err.message || "Failed to process the Excel file.",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Excel
          </>
        )}
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
    </>
  )
}
