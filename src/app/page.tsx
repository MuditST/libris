"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  Library,
  Search,
  Bookmark,
  BookCheck,
  Heart,
  Sparkles,
  MessageSquare,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserButton, SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="mx-auto container">
      <div className="flex min-h-screen flex-col bg-background">
        <header
          className={`sticky top-0 z-50 w-full  transition-all duration-200 ${
            scrolled
              ? "bg-background/95 backdrop-blur-sm shadow-sm"
              : "bg-background"
          }`}
        >
          {/* Container centers the header content */}
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight font-sans">
                Libris
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#discover"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Discover
              </Link>
              <Link
                href="#ai"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                AI Tools
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/bookshelf">My Library</Link>
                  </Button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <Button size="sm" asChild>
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Section 1 */}
          <section className="relative overflow-hidden py-20  bg-gradient-to-b from-background to-muted/20">
            {/* Container centers the section content */}
            <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 md:grid-cols-2 items-center">
                <div className="flex flex-col gap-6 text-center md:text-left">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-sans text-foreground">
                    {isSignedIn
                      ? "Continue Your Book Journey"
                      : "Your Library, Reimagined."}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
                    {isSignedIn
                      ? "Your personal bookshelf is waiting. Pick up where you left off or discover your next favorite read."
                      : "From dog-eared paperbacks to digital reads, organize your world of books in one beautiful, intelligent space. Track, discover, and fall in love with reading all over again."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button size="lg" asChild>
                      <Link href={isSignedIn ? "/bookshelf" : "/sign-up"}>
                        {isSignedIn ? "Go to My Library" : "Start Your Shelf"}
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="#features">Learn More</Link>
                    </Button>
                  </div>
                </div>
                {/* Visuals - Use square aspect ratio */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border shadow-inner group">
                  <Image
                    src="/TheCozyReader.png"
                    alt="Illustration of a person reading comfortably in a cozy setting"
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out"
                    priority
                    sizes="(max-width: 768px) 90vw, 40vw"
                  />
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/5 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 (Features) - Simplified Cards */}
          <section id="features" className="py-20 md:py-28 bg-background">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3 font-sans text-foreground">
                  Your Reading Life, Categorized
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
                  Effortlessly organize every book you own, are reading, or hope
                  to read. Your personal shelf, neatly stacked and always with
                  you.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Card 1: Want to Read  */}
                <Card className="bg-card border-border/60 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Bookmark className="mx-auto h-8 w-8 text-primary mb-4" />
                    <CardTitle className="font-sans text-lg">
                      Want to Read
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground font-sans">
                      Keep track of books on your wishlist.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2: Currently Reading  */}
                <Card className="bg-card border-border/60 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-primary mb-4" />
                    <CardTitle className="font-sans text-lg">
                      Currently Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground font-sans">
                      See what you're currently immersed in.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 3: Finished */}
                <Card className="bg-card border-border/60 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <BookCheck className="mx-auto h-8 w-8 text-primary mb-4" />
                    <CardTitle className="font-sans text-lg">
                      Finished
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground font-sans">
                      Celebrate the books you've completed.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 4: Favorites*/}
                <Card className="bg-card border-border/60 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Heart className="mx-auto h-8 w-8 text-primary mb-4" />
                    <CardTitle className="font-sans text-lg">
                      Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground font-sans">
                      Mark the stories that truly resonated.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="discover" className="py-20 md:py-28 bg-muted/30">
            {/* Container centers the section content */}
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 font-sans text-foreground">
                    Books You Know. Books You’ll Love.
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 font-sans">
                    Find what’s trending, search what you’re craving, or simply
                    explore. Add any book to your personal stack with a click.
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/discover">Discover Titles</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/search">Search Books</Link>
                    </Button>
                  </div>
                </div>
                {/* Visuals - Use square aspect ratio */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border shadow-inner group">
                  <Image
                    src="/MultipleBooks.png"
                    alt="Illustration of various books stacked and arranged"
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 768px) 90vw, 40vw"
                  />
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/5 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="ai"
            className="py-20 md:py-28 bg-background relative overflow-hidden"
          >
            {/* Container for main content */}
            <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3 font-sans text-foreground">
                  Meet Your Literary Sidekick
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
                  Unlock deeper insights and find perfect recommendations with
                  AI-powered tools built for book lovers.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Book Talk Card */}
                <Card className="bg-card/95 backdrop-blur-sm border-border/60 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <CardTitle className="font-sans text-xl">
                        Book Talk!
                      </CardTitle>
                    </div>
                    <CardDescription className="font-sans text-base">
                      "Talk to your book. Literally."
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground font-sans mb-4">
                      Chat with the content of any book on your shelves. Ask
                      questions about plot, characters, themes, or context and
                      get insightful answers from our AI assistant.
                    </p>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href="/booktalk">Try Libris It →</Link>
                    </Button>
                  </CardContent>
                </Card>
                {/* Book Blend Card */}
                <Card className="bg-card/95 backdrop-blur-sm border-border/60 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <CardTitle className="font-sans text-xl">
                        BookBlend
                      </CardTitle>
                    </div>
                    <CardDescription className="font-sans text-base">
                      "Pick 5. Get 5 back. Literary magic."
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground font-sans mb-4">
                      Select up to five books that capture your current reading
                      vibe. Our AI analyzes the blend and recommends five new
                      titles tailored to your unique taste.
                    </p>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href="/bookblend">Create a Blend →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="about" className="py-20 md:py-28 bg-muted/30">
            {/* Container centers the section content */}
            <div className="container px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 font-sans text-foreground">
                About Libris
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-sans">
                Libris started as a passion project to create the perfect
                digital bookshelf—a place to not only track reading but to
                rediscover the joy of books through smart organization and
                discovery tools.
              </p>
              <blockquote className="mt-10 italic text-muted-foreground font-sans border-l-4 border-primary pl-4 max-w-xl mx-auto text-left">
                "Some books change your life. Libris helps you remember every
                one."
              </blockquote>
            </div>
          </section>
        </main>

        <footer className="py-8 border-t border-border/40 bg-background">
          {/* Container centers the footer content */}
          <div className="container px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground font-sans">
            © {new Date().getFullYear()} Libris. All rights reserved. Built with
            passion.
          </div>
        </footer>
      </div>
    </main>
  );
}
