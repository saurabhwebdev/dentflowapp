"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Calendar, Phone, Building, MapPin, Briefcase, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSettings, AppSettings, defaultSettings } from "@/lib/settingsService";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    ...defaultSettings,
    userId: '',
  });

  useEffect(() => {
    async function loadSettings() {
      if (user && !loading) {
        try {
          const userSettings = await getUserSettings(user);
          setSettings(userSettings);
        } catch (error) {
          console.error("Error fetching settings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (!loading) {
      if (user) {
        loadSettings();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full my-2" />
              <Skeleton className="h-4 w-full my-2" />
              <Skeleton className="h-4 w-2/3 my-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-4">You need to be signed in to view your profile</h2>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.displayName || 'User Name'}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email || 'user@example.com'}
                    </div>
                  </CardDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">Dental Professional</Badge>
                    {settings.staff.practiceType && (
                      <Badge variant="secondary">{settings.staff.practiceType}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-1">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{settings.clinic.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Joined {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}</span>
                  </div>
                  {settings.staff.licenseNumber && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>License: {settings.staff.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium text-lg mb-3">Clinic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{settings.clinic.name}</p>
                      <p className="text-sm text-muted-foreground">{settings.staff.primaryDoctor} {settings.staff.primaryDoctorCredentials}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                    <div>
                      <p>{settings.clinic.address}</p>
                      <p>{settings.clinic.city}, {settings.clinic.state} {settings.clinic.zip}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Hours: {settings.preferences.workingHoursStart} - {settings.preferences.workingHoursEnd}</span>
                  </div>
                  {settings.clinic.website && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={settings.clinic.website.startsWith('http') ? settings.clinic.website : `https://${settings.clinic.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {settings.clinic.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 