import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | Libris",
  description: "Terms and conditions for using the Libris application",
};

export default function TermsOfServicePage() {
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
        Terms of Service
      </h1>

      <div className="prose prose-slate max-w-none font-sans text-foreground">
        <p className="text-lg leading-relaxed mb-8">
          By accessing or using the Libris application, you agree to be bound by
          the following Terms of Service:
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. Account Creation and Authentication
            </h2>
            <ul className="space-y-2">
              <li>
                You may need to create an account using your Google credentials.
                You will provide your Google OAuth token for bookshelf
                management within the app.
              </li>
              <li>
                You agree to the storage of your Google OAuth token and
                acknowledge that we will use it to interact with Google Books on
                your behalf for managing your bookshelf.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Bookshelf Management
            </h2>
            <p>
              You are responsible for managing your bookshelf. Libris will
              access your bookshelf on Google Books, add, update, and organize
              your books based on your interactions with the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. Use of AI Features
            </h2>
            <p>
              The Book Talk and Book Blend features require access to your book
              data for generating personalized recommendations and insights. By
              using these features, you consent to our use of your book data for
              AI processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p>
              While we make efforts to protect your data, we cannot guarantee
              the security of data transmitted over the internet. You are
              responsible for keeping your account credentials safe and
              notifying us of any suspicious activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              Libris is provided "as-is" without any warranties. We are not
              liable for any damages resulting from the use or inability to use
              the app, including but not limited to data loss, disruptions, or
              unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to Libris
              at our discretion, including if you violate these Terms of
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
            <p>
              We may update or change these Terms of Service at any time. All
              changes will be reflected here, and continued use of the app
              signifies your agreement to the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
