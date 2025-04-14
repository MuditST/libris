import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([ '/bookshelf(.*)',     // Bookshelf route and all subroutes
  '/favorites(.*)',     // Favorites route
  '/willread(.*)',      // Will Read route
  '/reading(.*)',       // Reading route
  '/finished(.*)',      // Finished route
  
  '/bookblend(.*)',     // AI Suggested books route
  '/gookit(.*)',])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};