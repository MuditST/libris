import BookshelfInitializer from "@/components/BookshelfInitializer";
import { BookSidebar } from "@/components/Sidebar";
import StoreCleanup from "@/components/StoreCleanup";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <BookshelfInitializer />
      <StoreCleanup /> 
      <BookSidebar />
      <SidebarInset>
        <div className="size-16 grid place-items-center">
          <SidebarTrigger className="p-5" />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
