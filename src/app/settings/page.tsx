"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { 
  getUserSettings, 
  saveSettings, 
  updateSettingsCategory,
  defaultSettings,
  AppSettings,
  ClinicSettings,
  FinancialSettings,
  StaffSettings,
  PreferenceSettings
} from "@/lib/settingsService";
import { Loader2 } from "lucide-react";

// Mock data for countries and currencies
const countriesWithCurrencies = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "$" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Settings state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clinic, setClinic] = useState<ClinicSettings>(defaultSettings.clinic);
  const [financial, setFinancial] = useState<FinancialSettings>(defaultSettings.financial);
  const [staff, setStaff] = useState<StaffSettings>(defaultSettings.staff);
  const [preferences, setPreferences] = useState<PreferenceSettings>(defaultSettings.preferences);
  
  // Fetch settings from Firebase
  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        setIsLoading(true);
        try {
          const settings = await getUserSettings(user);
          
          setClinic(settings.clinic);
          setFinancial(settings.financial);
          setStaff(settings.staff);
          setPreferences(settings.preferences);
        } catch (error) {
          console.error("Error fetching settings:", error);
          toast({
            title: "Error",
            description: "Failed to load settings. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading && user) {
      fetchSettings();
    }
  }, [user, authLoading]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);
  
  // Save settings
  const handleSaveClinic = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateSettingsCategory(user, 'clinic', clinic);
      toast({
        title: "Success",
        description: "Clinic settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving clinic settings:", error);
      toast({
        title: "Error",
        description: "Failed to save clinic settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveFinancial = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateSettingsCategory(user, 'financial', financial);
      toast({
        title: "Success",
        description: "Financial settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving financial settings:", error);
      toast({
        title: "Error",
        description: "Failed to save financial settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveStaff = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateSettingsCategory(user, 'staff', staff);
      toast({
        title: "Success",
        description: "Staff settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving staff settings:", error);
      toast({
        title: "Error",
        description: "Failed to save staff settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateSettingsCategory(user, 'preferences', preferences);
      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle clinic info changes
  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClinic(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle country change (and update currency)
  const handleCountryChange = (value: string) => {
    const country = countriesWithCurrencies.find(c => c.code === value);
    setClinic(prev => ({ ...prev, country: value }));
    if (country) {
      setFinancial(prev => ({ ...prev, currency: country.currency }));
    }
  };
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your clinic settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="clinic" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-6">
          <TabsTrigger value="clinic">Clinic Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="staff">Staff & Licenses</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        {/* Clinic Details Tab */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                Basic information about your dental practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input 
                    id="clinicName" 
                    name="name" 
                    value={clinic.name} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Email Address</Label>
                  <Input 
                    id="clinicEmail" 
                    type="email" 
                    name="email" 
                    value={clinic.email} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Phone Number</Label>
                  <Input 
                    id="clinicPhone" 
                    name="phone" 
                    value={clinic.phone} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={clinic.website} 
                    onChange={handleClinicChange}
                  />
                </div>
              </div>
              
              <Separator />
              <h3 className="text-lg font-medium">Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={clinic.address} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={clinic.city} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input 
                    id="state" 
                    name="state" 
                    value={clinic.state} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal/ZIP Code</Label>
                  <Input 
                    id="zip" 
                    name="zip" 
                    value={clinic.zip} 
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={clinic.country} 
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesWithCurrencies.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveClinic} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>
                Manage your financial preferences and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={financial.currency} 
                    onValueChange={(value: string) => setFinancial(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesWithCurrencies.map((country) => (
                        <SelectItem key={country.currency} value={country.currency}>
                          {country.currency} ({country.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    value={financial.taxRate} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, taxRate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                  <Input 
                    id="paymentTerms" 
                    type="number" 
                    value={financial.paymentTerms} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch 
                    id="onlinePayments" 
                    checked={financial.enableOnlinePayments}
                    onCheckedChange={(checked: boolean) => setFinancial(prev => ({ ...prev, enableOnlinePayments: checked }))}
                  />
                  <Label htmlFor="onlinePayments">Enable Online Payments</Label>
                </div>
              </div>
              
              <Separator />
              <h3 className="text-lg font-medium">Banking Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    value={financial.bankName} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input 
                    id="accountName" 
                    value={financial.accountName} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    value={financial.accountNumber} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input 
                    id="routingNumber" 
                    value={financial.routingNumber} 
                    onChange={(e) => setFinancial(prev => ({ ...prev, routingNumber: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFinancial} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Staff & Licenses Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff & Professional Information</CardTitle>
              <CardDescription>
                Manage practitioner details and professional licenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryDoctor">Primary Doctor Name</Label>
                  <Input 
                    id="primaryDoctor" 
                    value={staff.primaryDoctor} 
                    onChange={(e) => setStaff(prev => ({ ...prev, primaryDoctor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credentials">Credentials</Label>
                  <Input 
                    id="credentials" 
                    value={staff.primaryDoctorCredentials} 
                    onChange={(e) => setStaff(prev => ({ ...prev, primaryDoctorCredentials: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceType">Practice Type</Label>
                  <Select 
                    value={staff.practiceType} 
                    onValueChange={(value: string) => setStaff(prev => ({ ...prev, practiceType: value }))}
                  >
                    <SelectTrigger id="practiceType">
                      <SelectValue placeholder="Select practice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Dentistry">General Dentistry</SelectItem>
                      <SelectItem value="Orthodontics">Orthodontics</SelectItem>
                      <SelectItem value="Periodontics">Periodontics</SelectItem>
                      <SelectItem value="Endodontics">Endodontics</SelectItem>
                      <SelectItem value="Oral Surgery">Oral Surgery</SelectItem>
                      <SelectItem value="Pediatric Dentistry">Pediatric Dentistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Professional License Number</Label>
                  <Input 
                    id="licenseNumber" 
                    value={staff.licenseNumber} 
                    onChange={(e) => setStaff(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID Number</Label>
                  <Input 
                    id="taxId" 
                    value={staff.taxId} 
                    onChange={(e) => setStaff(prev => ({ ...prev, taxId: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStaff} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize how DentFlow Pro works for your practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Appointments</h3>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="appointmentReminders" 
                      checked={preferences.appointmentReminders}
                      onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, appointmentReminders: checked }))}
                    />
                    <Label htmlFor="appointmentReminders">Send appointment reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoConfirm" 
                      checked={preferences.autoConfirmAppointments}
                      onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, autoConfirmAppointments: checked }))}
                    />
                    <Label htmlFor="autoConfirm">Auto-confirm appointments</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Appointment Duration (minutes)</Label>
                    <Select 
                      value={preferences.defaultAppointmentDuration} 
                      onValueChange={(value: string) => setPreferences(prev => ({ ...prev, defaultAppointmentDuration: value }))}
                    >
                      <SelectTrigger id="defaultDuration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Working Hours</h3>
                  <div className="space-y-2">
                    <Label htmlFor="workStart">Working Hours Start</Label>
                    <Input 
                      id="workStart" 
                      type="time" 
                      value={preferences.workingHoursStart} 
                      onChange={(e) => setPreferences(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workEnd">Working Hours End</Label>
                    <Input 
                      id="workEnd" 
                      type="time" 
                      value={preferences.workingHoursEnd} 
                      onChange={(e) => setPreferences(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Date & Time Format</h3>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={preferences.dateFormat} 
                      onValueChange={(value: string) => setPreferences(prev => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select 
                      value={preferences.timeFormat} 
                      onValueChange={(value: string) => setPreferences(prev => ({ ...prev, timeFormat: value }))}
                    >
                      <SelectTrigger id="timeFormat">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 