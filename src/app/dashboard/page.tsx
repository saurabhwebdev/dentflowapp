"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Users, 
  CalendarDays, 
  PlusCircle, 
  Settings as SettingsIcon, 
  Building2, 
  CreditCard, 
  Clock,
  Pill,
  Activity,
  Receipt,
  DollarSign,
  BarChart3,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Package
} from "lucide-react";
import { getPatients } from "@/lib/patientService";
import { getUserSettings } from "@/lib/settingsService";
import { getUpcomingAppointments } from "@/lib/appointmentService";
import { getInvoices, Invoice } from "@/lib/invoiceService";
import { getPrescriptions, Prescription } from "@/lib/prescriptionService";
import { getLowStockItems } from "@/lib/inventoryService";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";

// Helper function to safely convert any timestamp type to a Date
function toDate(timestamp: any): Date {
  if (!timestamp) {
    return new Date(0);
  }
  
  // Handle Firebase Timestamp objects
  if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Handle string or number timestamps
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Handle Date objects
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Default fallback
  return new Date(0);
}

// Format appointment date
function formatAppointmentDateTime(appointment: any): string {
  try {
    if (!appointment) return "N/A";
    
    // If appointment has date and time as separate fields
    if (appointment.date && appointment.time) {
      try {
        // Parse date string (format: YYYY-MM-DD)
        const [year, month, day] = appointment.date.split('-').map(Number);
        
        // Parse time string (format: HH:MM or HH:MM:SS)
        const timeParts = appointment.time.split(':').map(Number);
        const hours = timeParts[0] || 0;
        const minutes = timeParts[1] || 0;
        
        // Create a valid date object
        const dateObj = new Date(year, month - 1, day, hours, minutes);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          return `${appointment.date} at ${appointment.time}`;
        }
        
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(dateObj);
      } catch (e) {
        // If date parsing fails, just return the raw strings
        return `${appointment.date} at ${appointment.time}`;
      }
    }
    
    // If the appointment has a startTime field
    if (appointment.startTime) {
      try {
        const date = toDate(appointment.startTime);
        if (isNaN(date.getTime())) {
          return "Invalid date";
        }
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return "Invalid date";
      }
    }
    
    // Fallback for other formats
    return "N/A";
  } catch (error) {
    console.error('Error formatting appointment date:', error);
    return "Invalid date format";
  }
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [patientGrowth, setPatientGrowth] = useState(0);
  
  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          // Get patients
          const patients = await getPatients(user);
          setPatientCount(patients.length);
          
          // Calculate patient growth (this month vs last month)
          const now = new Date();
          const thisMonth = now.getMonth();
          const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
          const thisYear = now.getFullYear();
          const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
          
          const thisMonthPatients = patients.filter(p => {
            const date = toDate(p.createdAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
          });
          
          const lastMonthPatients = patients.filter(p => {
            const date = toDate(p.createdAt);
            return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
          });
          
          // Calculate growth percentage (handle case when lastMonth is 0)
          const growth = lastMonthPatients.length > 0 
            ? Math.round((thisMonthPatients.length - lastMonthPatients.length) / lastMonthPatients.length * 100) 
            : thisMonthPatients.length > 0 ? 100 : 0;
          
          setPatientGrowth(growth);
          
          // Sort patients by createdAt timestamp (newest first) and take the first 5
          const sortedPatients = [...patients].sort((a, b) => {
            const timeA = toDate(a.createdAt);
            const timeB = toDate(b.createdAt);
            return timeB.getTime() - timeA.getTime();
          });
          
          setRecentPatients(sortedPatients.slice(0, 5));
          
          // Get upcoming appointments
          const appointments = await getUpcomingAppointments(user, 5);
          setUpcomingAppointments(appointments);
          
          // Get invoices
          const fetchedInvoices = await getInvoices(user);
          setInvoices(fetchedInvoices);
          
          // Calculate monthly revenue
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          const currentMonthInvoices = fetchedInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate.getMonth() === currentMonth && 
                   invoiceDate.getFullYear() === currentYear;
          });
          
          const lastMonthInvoices = fetchedInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return invoiceDate.getMonth() === lastMonth && 
                   invoiceDate.getFullYear() === lastMonthYear;
          });
          
          const thisMonthRevenue = currentMonthInvoices.reduce((total, inv) => total + inv.total, 0);
          const lastMonthRevenue = lastMonthInvoices.reduce((total, inv) => total + inv.total, 0);
          
          // Calculate revenue change percentage
          const revChange = lastMonthRevenue > 0 
            ? Math.round((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) 
            : thisMonthRevenue > 0 ? 100 : 0;
          
          setMonthlyRevenue(thisMonthRevenue);
          setRevenueChange(revChange);
          
          // Get prescriptions
          const fetchedPrescriptions = await getPrescriptions(user);
          setPrescriptions(fetchedPrescriptions);
          
          // Get low stock inventory items
          const lowItems = await getLowStockItems(user);
          setLowStockItems(lowItems);
          
          // Get clinic settings
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (!loading && user) {
      fetchData();
    }
  }, [user, loading]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = toDate(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get active prescriptions count
  const getActivePrescriptionsCount = () => {
    return prescriptions.filter(p => p.status === 'active').length;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const currencyCode = clinicSettings?.financial?.currency || 'USD';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // If no user and not loading, we'll be redirected
  if (!user) {
    return null;
  }

  // Get today's date in a readable format
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Practice Dashboard</h1>
              <p className="text-muted-foreground text-sm">{today} • {clinicSettings?.clinic?.name || 'Dental Practice'}</p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8">
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Patients Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">Patients</CardTitle>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{patientCount}</div>
                <Badge variant="secondary" className={`ml-2 ${patientGrowth >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${patientGrowth < 0 ? 'rotate-180' : ''}`} />
                  {patientGrowth}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Total registered patients
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-0"
                onClick={() => router.push('/patients')}
              >
                View All Patients
              </Button>
            </CardFooter>
          </Card>

          {/* Appointments Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">Appointments</CardTitle>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <span className="text-sm ml-2 text-muted-foreground">today</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled appointments
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 px-0"
                onClick={() => router.push('/appointments')}
              >
                Manage Schedule
              </Button>
            </CardFooter>
          </Card>

          {/* Invoices Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">Invoices</CardTitle>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-md">
                  <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                <Badge variant="secondary" className={`ml-2 ${revenueChange >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${revenueChange < 0 ? 'rotate-180' : ''}`} />
                  {revenueChange}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue this month
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 px-0"
                onClick={() => router.push('/invoices')}
              >
                Manage Invoices
              </Button>
            </CardFooter>
          </Card>

          {/* Prescriptions Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">Prescriptions</CardTitle>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
                  <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{getActivePrescriptionsCount()}</div>
                <span className="text-sm ml-2 text-muted-foreground">active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Active prescriptions
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 px-0"
                onClick={() => router.push('/prescriptions')}
              >
                Manage Prescriptions
              </Button>
            </CardFooter>
          </Card>

          {/* Inventory Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700 dark:text-gray-300">Inventory</CardTitle>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                  <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <span className="text-sm ml-2 text-muted-foreground">items</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Low stock alerts
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 px-0"
                onClick={() => router.push('/inventory')}
              >
                Manage Inventory
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main Content Tabs and Cards */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Weekly Summary
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Monthly Analytics
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Financial Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Column 1: Upcoming Appointments */}
              <Card className="md:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Today's Schedule</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/appointments">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <div key={appointment.id} className="flex items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                          <div className="flex-shrink-0 mr-3">
                            <Avatar className="h-10 w-10 border">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {appointment.patientName?.charAt(0) || "P"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{appointment.patientName}</h4>
                              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'outline'}>
                                {appointment.status || 'Scheduled'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatAppointmentDateTime(appointment)}
                            </div>
                            <div className="text-sm mt-1">
                              {appointment.type || 'General Checkup'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-muted-foreground">
                      No appointments scheduled for today
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Column 2: Recent Patients */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Recent Patients</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/patients">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentPatients.length > 0 ? (
                    <div className="space-y-3">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Avatar className="h-9 w-9 mr-2 border">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {patient.firstName?.charAt(0) || patient.name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="font-medium text-sm">{patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.name || 'Unknown Patient'}</div>
                            <div className="text-xs text-muted-foreground">Added {formatDate(patient.createdAt)}</div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/patients/${patient.id}`)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-muted-foreground">
                      No recent patients
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => router.push('/patients?new=true')}>
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm">New Patient</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => router.push('/appointments?new=true')}>
                <CalendarDays className="h-5 w-5 mb-1" />
                <span className="text-sm">New Appointment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => router.push('/invoices?new=true')}>
                <Receipt className="h-5 w-5 mb-1" />
                <span className="text-sm">Create Invoice</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => router.push('/prescriptions?new=true')}>
                <Pill className="h-5 w-5 mb-1" />
                <span className="text-sm">Create Prescription</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => router.push('/inventory?new=true')}>
                <Package className="h-5 w-5 mb-1" />
                <span className="text-sm">New Inventory Item</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="patients">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>View and manage all your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium">Recent Patients</h3>
                    <Button asChild>
                      <Link href="/patients">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Patient
                      </Link>
                    </Button>
                  </div>
                  
                  {recentPatients.length > 0 ? (
                    <div className="space-y-4">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center p-3 rounded-lg border">
                          <Avatar className="h-10 w-10 mr-3 border">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {patient.firstName?.charAt(0) || patient.name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="font-medium">{patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.name || 'Unknown Patient'}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.email || 'No email'} • {patient.phone || 'No phone'}
                            </div>
                            {patient.dob && (
                              <div className="text-xs text-muted-foreground mt-1">
                                DOB: {new Date(patient.dob).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/patients/${patient.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No patients found
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/patients">
                    View All Patients
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Appointment Schedule</CardTitle>
                <CardDescription>View and manage upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium">Today's Schedule</h3>
                    <Button asChild>
                      <Link href="/appointments">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        New Appointment
                      </Link>
                    </Button>
                  </div>
                  
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-md mr-3">
                              {appointment.date ? (
                                <>
                                  <div className="text-sm font-bold">{new Date(appointment.date).getDate()}</div>
                                  <div className="text-xs uppercase">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm font-bold">--</div>
                                  <div className="text-xs uppercase">---</div>
                                </>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{appointment.patientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.time || '--:--'}
                                {appointment.duration && ` (${appointment.duration})`}
                              </div>
                              <div className="text-sm">
                                {appointment.type || 'Consultation'}
                              </div>
                            </div>
                          </div>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'outline'}>
                            {appointment.status || 'Scheduled'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No appointments scheduled for today
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 