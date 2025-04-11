"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill } from "lucide-react";

// Custom Tooth SVG icon
function ToothIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 5.5C16.5 5.5 16.5 3 16.5 3C16.5 3 16.5 1 15 1C13.5 1 12 3 12 3C12 3 10.5 1 9 1C7.5 1 7.5 3 7.5 3C7.5 3 7.5 5.5 12 5.5Z" />
      <path d="M7.5 5.5C5 5.5 4 7.5 4 10C4 14.5 4.5 18.5 6 20.5C7.5 22.5 9 23 9 23C9 23 7.5 15 9 13C10.5 11 12 13 12 13C12 13 13.5 11 15 13C16.5 15 15 23 15 23C15 23 16.5 22.5 18 20.5C19.5 18.5 20 14.5 20 10C20 7.5 19 5.5 16.5 5.5" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center text-center max-w-xl">
        <div className="relative mb-6">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary opacity-10">
            <ToothIcon className="h-64 w-64" />
          </div>
          
          <div className="relative z-10 flex items-center justify-center">
            <span className="text-9xl font-bold text-primary">4</span>
            <div className="rounded-full bg-primary/10 p-4 mx-1">
              <Pill className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <span className="text-9xl font-bold text-primary">4</span>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          We couldn't find what you're looking for
        </h1>
        
        <div className="mb-8 space-y-2">
          <p className="text-muted-foreground">
            The page you're looking for might have been moved, deleted, or never existed.
          </p>
          <p className="text-muted-foreground">
            Just like a missing tooth, we can help you find a replacement!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/patients">
              View Patients
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>If you believe this is a technical error, please contact your system administrator.</p>
          <p>Error code: DNT-404</p>
        </div>
      </div>
    </div>
  );
} 