"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithGoogle } from '@/lib/auth';

export default function Home() {
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Optional: Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
        
        {/* Hero content */}
        <div className="container relative mx-auto px-4 py-24 md:py-32 flex flex-col items-center justify-center text-center z-20">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            DentFlow Pro
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-2">
            Modern Dental Practice Management
          </p>
          <p className="max-w-[700px] text-base md:text-lg text-muted-foreground mb-10">
            Streamline your workflows, enhance patient care, and grow your practice with our all-in-one dental management solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-8"
              onClick={handleSignIn}
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8">
              <Link href="/services">
                Learn More
              </Link>
            </Button>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 md:mt-24 w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-primary mb-2">3,500+</span>
              <span className="text-sm text-muted-foreground">Dental Practices</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</span>
              <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</span>
              <span className="text-sm text-muted-foreground">Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
