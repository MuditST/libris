import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | Libris",
  description: "How Libris collects and protects your personal information",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
      <Button
        variant="ghost"
        size="sm"
        className="mb-8 text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8 font-sans text-foreground">
        Privacy Policy
      </h1>

      <div className="prose prose-slate max-w-none font-sans text-foreground">
        <p className="text-lg leading-relaxed mb-8">
          Libris is committed to protecting your privacy. This privacy policy
          outlines how we collect, use, and protect your personal information.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Data Collection</h2>
        <ul className="space-y-2 mb-6">
          <li>
            <strong>Google OAuth Token:</strong> To use the app, users are
            required to authenticate via Google OAuth. This allows Libris to
            access and manage your bookshelf information on Google Books.
          </li>
          <li>
            <strong>Personal Information:</strong> When you log in, we store
            your authentication details to sync and manage your bookshelf across
            devices. We do not share or sell your personal information.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          How We Use Your Data
        </h2>
        <ul className="space-y-2 mb-6">
          <li>
            <strong>Bookshelf Management:</strong> We use your Google OAuth
            token to fetch, update, and manage your bookshelves in Google Books,
            enabling you to organize your personal collection.
          </li>
          <li>
            <strong>AI Features:</strong> The Book Talk and Book Blend features
            utilize your book data for generating personalized recommendations,
            providing a customized experience.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Data Protection</h2>
        <p className="mb-6">
          All personal information and OAuth tokens are securely stored and
          handled. We take reasonable measures to protect your data from
          unauthorized access or disclosure.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Data Retention</h2>
        <p className="mb-8">
          Your data will be retained only as long as you use Libris. If you
          choose to delete your account, all related data will be removed from
          our system, except for any data retained by Google Books through their
          own policies.
        </p>

        
      </div>
    </div>
  );
}
