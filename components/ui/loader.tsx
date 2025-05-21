import { Loader2 } from "lucide-react"

export function Loader({ className = "h-4 w-4", text = "" }) {
  return (
    <div className="flex items-center">
      <Loader2 className={`${className} animate-spin`} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  )
}
