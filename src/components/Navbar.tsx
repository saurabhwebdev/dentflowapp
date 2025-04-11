"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, LayoutDashboard, Users, CalendarDays, Settings, Pill, Receipt, Package, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Navigation items for authenticated users
  const appNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: '/patients', label: 'Patients', icon: <Users className="h-4 w-4 mr-2" /> },
    { href: '/appointments', label: 'Appointments', icon: <CalendarDays className="h-4 w-4 mr-2" /> },
    { href: '/prescriptions', label: 'Prescriptions', icon: <Pill className="h-4 w-4 mr-2" /> },
    { href: '/invoices', label: 'Invoices', icon: <Receipt className="h-4 w-4 mr-2" /> },
    { href: '/inventory', label: 'Inventory', icon: <Package className="h-4 w-4 mr-2" /> },
  ];

  // Navigation items for non-authenticated users (public site)
  const publicNavItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 flex">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="text-xl font-bold">DentFlow Pro</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4">
            {!loading && user ? (
              // App navigation for authenticated users
              <>
                {appNavItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            ) : (
              // Public navigation for non-authenticated users
              <>
                {publicNavItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.displayName || user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Avatar className="h-4 w-4 mr-2">
                          <AvatarFallback className="text-[10px]">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleSignIn}>Sign in</Button>
              )
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="py-6">
              <SheetHeader className="text-left pb-4 border-b">
                <SheetTitle>DentFlow Pro</SheetTitle>
              </SheetHeader>
              
              {!loading && user ? (
                // Authenticated user mobile menu
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-3 p-4 mb-2 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.displayName || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col px-2 py-4 gap-0.5">
                    {appNavItems.map((item) => (
                      <Link 
                        key={item.href}
                        href={item.href} 
                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <Link 
                      href="/profile" 
                      className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-4 w-4 mr-2">
                        <AvatarFallback className="text-[10px]">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut} 
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                // Public navigation for non-authenticated users (mobile)
                <div className="flex flex-col h-full">
                  <div className="flex flex-col px-2 py-4 gap-0.5">
                    {publicNavItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 border-t">
                    <Button 
                      onClick={handleSignIn} 
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
} 