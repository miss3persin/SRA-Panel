
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UploadCloud, LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';


interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: '/upload', label: 'Upload Data', icon: UploadCloud },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

   useEffect(() => {
    // For desktop, keep it open by default, for mobile, closed.
    // This state is managed internally by SidebarProvider for its `open` prop if not controlled.
    // Here, we explicitly control it for initial render consistency.
    if (typeof window !== 'undefined') { // Ensure this runs client-side
       setSidebarOpen(!isMobile);
    }
  }, [isMobile]);


  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"} className="z-40 md:z-30">
        <SidebarRail />
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
            <Image 
              src="/mapoly-logo.png"
              alt="Mapoly Logo"
              width={40}
              height={40}
              className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
              priority
            />
            <h1 className="text-2xl font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Mapoly SRA</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, className: "group-data-[collapsible=icon]:block hidden" }}
                    onClick={() => isMobile && setSidebarOpen(false)} // Close sidebar on mobile after navigation
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
           <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
           <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            &copy; {new Date().getFullYear()} Mapoly SRA
           </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-2">
             <SidebarTrigger /> {/* Removed md:hidden to allow toggle on desktop */}
             <h2 className="text-xl font-semibold">
                {navItems.find(item => item.href === pathname)?.label || 'Mapoly SRA'}
             </h2>
          </div>
          {/* Placeholder for global actions */}
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
