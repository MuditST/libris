"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Blend,
  BookCheck,
  Bookmark,
  BookOpen,
  ChevronRight,
  Heart,
  Library,
  LogIn,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Import the stores
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useBookBlendStore } from "@/store/bookblendStore";

export function BookSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // Define the cleanup function
  const handleSignOutCleanup = () => {
    console.log("Performing cleanup via sign-out button click...");

    // Clear Zustand stores
    useBookshelfStore.getState().clearStore();
    useBookBlendStore.getState().clearSelectedBooks();
    useBookBlendStore.getState().clearRecommendations();

    // Clear Gookit chat history from localStorage
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("gookit-chat-")) {
          localStorage.removeItem(key);
          console.log(`Removed chat history: ${key}`);
        }
      });
    } catch (error) {
      console.error("Error clearing chat history from localStorage:", error);
    }
    console.log("Cleanup complete.");
  };

  return (
    <>
      <Sidebar className="font-sans ">
        <SidebarHeader className="flex h-16 justify-center p-6 bg-background">
          <div className="flex items-center justify-center space-x-2">
            <Link href="/">
              <span className="text-3xl font-semibold font-sans tracking-tight text-sidebar-foreground cursor-pointer">
                Gooks
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4 bg-background">
          {/* Explore Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/discover"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/discover">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="font-sans">Discover</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/search"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/search">
                      <Search className="mr-2 h-4 w-4" />
                      <span className="font-sans">Search</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bookshelf Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Bookshelf</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/bookshelf"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/bookshelf">
                      <Library className="mr-2 h-4 w-4" />
                      <span className="font-sans">My Library</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/willread"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/willread">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span className="font-sans">Want to Read</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/reading"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/reading">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span className="font-sans">Reading</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/finished"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/finished">
                      <BookCheck className="mr-2 h-4 w-4" />
                      <span className="font-sans">Finished</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/favorites"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      <span className="font-sans">Favorites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* AI Group */}
          <SidebarGroup>
            <SidebarGroupLabel>AI</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/gookit"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/gookit">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="font-sans">Gook It!</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/bookblend"}
                    onClick={handleLinkClick}
                  >
                    <Link href="/bookblend">
                      <Blend className="mr-2 h-4 w-4" />
                      <span className="font-sans">BookBlend</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 bg-background">
          {isSignedIn ? (
            <div className="flex items-center justify-between p-2 rounded-md">
              <div className="flex items-center gap-3 flex-grow min-w-0">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm ml-2 font-sans pointer-events-none truncate text-sidebar-foreground">
                  {user?.fullName || "Account"}
                </span>
              </div>
              <SignOutButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-2 rounded-md text-destructive hover:text-destructive"
                  aria-label="Sign out"
                  onClick={handleSignOutCleanup}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </SignOutButton>
            </div>
          ) : (
            <SignInButton mode="modal">
              <div className="flex items-center justify-between p-4 hover:bg-sidebar-accent cursor-pointer rounded-md">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-sans text-sidebar-foreground">
                    Sign In
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </SignInButton>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
