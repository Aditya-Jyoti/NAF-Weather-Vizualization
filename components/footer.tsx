import Link from "next/link"
import { Mail, Phone, Globe, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white py-6 dark:bg-card">
      <div className="container mx-auto px-4">
        {/* Main heading at the top */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">National Agro Foundation</h2>
        </div>

        {/* Three columns below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Address Column */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-lg font-semibold mb-3">Address</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
              <address className="not-italic text-muted-foreground">
                River Side, 2, River View Road,
                <br />
                Kotturpuram, Chennai - 600 085,
                <br />
                Tamil Nadu, India
              </address>
            </div>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+914422542598" className="hover:underline">
                  +91 4422542598
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:naf@nationalagro.org" className="hover:underline">
                  naf@nationalagro.org
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a
                  href="https://www.nationalagro.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  www.nationalagro.org
                </a>
              </p>
            </div>
          </div>

          {/* About Column */}
          <div className="flex flex-col items-end text-right">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-muted-foreground max-w-xs">
              National Agro Foundation is dedicated to bringing prosperity to rural India through scientific agriculture
              and sustainable development.
            </p>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-center">
            <p>developed by</p>
            <Link
              href="https://adityajyoti.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Aditya Jyoti
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Copyright ©2024-25 All rights reserved. National Agro Foundation</p>
        </div>
      </div>
    </footer>
  )
}
