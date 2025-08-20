
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
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { UploadCloud, LayoutDashboard, BarChart3, TestTube2, Table2, Sigma, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../core/ThemeToggle';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: '/upload', label: 'Upload Data', icon: UploadCloud },
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    subItems: [
      { href: '/dashboard?view=performance', label: 'Performance', icon: BarChart3 },
      { href: '/dashboard?view=charts', label: 'Charts', icon: TestTube2 },
      { href: '/dashboard?view=datatable', label: 'Data Table', icon: Table2 },
      { href: '/dashboard?view=insights', label: 'AI Insights', icon: Sigma },
    ]
  },
  { href: '/about', label: 'About', icon: Info },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       setSidebarOpen(!isMobile);
    }
  }, [isMobile]);

  const currentView = searchParams.get('view');
  
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
            <Accordion type="multiple" className="w-full group-data-[collapsible=icon]:hidden" defaultValue={['dashboard']}>
              <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                  <Link href="/upload" legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === '/upload'}
                      tooltip={{ children: 'Upload Data', className: "group-data-[collapsible=icon]:block hidden" }}
                      onClick={() => isMobile && setSidebarOpen(false)}
                    >
                      <UploadCloud />
                      <span>Upload Data</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <AccordionItem value="dashboard" className="border-none">
                    <div className="flex items-center w-full">
                       <Link href="/dashboard" legacyBehavior passHref>
                          <SidebarMenuButton
                            isActive={pathname === '/dashboard' && !currentView}
                            className="flex-1 justify-start pr-1"
                          >
                            <LayoutDashboard />
                            <span>Dashboard</span>
                          </SidebarMenuButton>
                        </Link>
                        <AccordionTrigger className='p-2 hover:no-underline [&>svg]:h-4 [&>svg]:w-4'/>
                    </div>

                  <AccordionContent className="p-0 pl-7">
                    <SidebarMenuSub>
                      {navItems.find(item => item.href === '/dashboard')?.subItems?.map(subItem => (
                        <SidebarMenuItem key={subItem.href}>
                           <Link href={subItem.href} legacyBehavior passHref>
                              <SidebarMenuSubButton
                                isActive={pathname === '/dashboard' && currentView === subItem.href.split('=')[1]}
                                onClick={() => isMobile && setSidebarOpen(false)}
                                className="w-full"
                              >
                                <subItem.icon/>
                                <span>{subItem.label}</span>
                              </SidebarMenuSubButton>
                           </Link>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  </AccordionContent>
                </AccordionItem>
                <SidebarMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === '/about'}
                      tooltip={{ children: 'About', className: "group-data-[collapsible=icon]:block hidden" }}
                      onClick={() => isMobile && setSidebarOpen(false)}
                    >
                      <Info />
                      <span>About</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </Accordion>
            
            {/* Icon-only view for collapsed sidebar */}
            <div className="hidden group-data-[collapsible=icon]:block">
              <SidebarMenu className="gap-2">
                 <SidebarMenuItem>
                    <Link href="/upload" legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={pathname === '/upload'}
                        tooltip={{ children: 'Upload Data' }}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <UploadCloud />
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard" legacyBehavior passHref>
                        <SidebarMenuButton
                          isActive={pathname === '/dashboard'}
                          tooltip={{ children: 'Dashboard Overview' }}
                        >
                            <LayoutDashboard />
                        </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/about" legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={pathname === '/about'}
                        tooltip={{ children: 'About' }}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <Info />
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
              </SidebarMenu>
            </div>


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
             <SidebarTrigger />
             <h2 className="text-xl font-semibold">
                {navItems.find(item => item.href === pathname)?.subItems?.find(sub => `?view=${currentView}` === sub.href.replace('/dashboard', ''))?.label || navItems.find(item => item.href === pathname)?.label || 'Mapoly SRA'}
             </h2>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
