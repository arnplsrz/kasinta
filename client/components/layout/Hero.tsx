import Link from "next/link";
import { Button } from "../ui/button";
import Marquee from "@/components/ui/marquee";
import { Sparkles, Heart, Shield, Github } from "lucide-react";
import { Bricolage_Grotesque } from "next/font/google";
import Footer from "./Footer";
import { ModeToggle } from "../ThemeToggle";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function Hero() {
  const items = [
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
    "Kasinta",
    "•",
  ];

  const items2 = [
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
    "Join Today",
    "•",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky left-0 top-0 z-20 w-full border-b-2 border-border bg-main">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className={`text-3xl font-heading text-main-foreground hover:translate-x-1 hover:translate-y-1 transition-transform ${bricolageGrotesque.className}`}
          >
            KASINTA
          </Link>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="neutral">
              <Link href="/register">Create Account</Link>
            </Button>
            <ModeToggle />
            <Button asChild size="icon">
              <Link
                href="https://github.com/arnplsrz/kasinta"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='32' viewBox='0 0 48 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='0.4'%3E%3Cpath d='M27 32c0-3.314 2.686-6 6-6 5.523 0 10-4.477 10-10S38.523 6 33 6c-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 6.627 0 12 5.373 12 12s-5.373 12-12 12c-2.21 0-4 1.79-4 4h-2zm-6 0c0-3.314-2.686-6-6-6-5.523 0-10-4.477-10-10S9.477 6 15 6c3.314 0 6-2.686 6-6h-2c0 2.21-1.79 4-4 4C8.373 4 3 9.373 3 16s5.373 12 12 12c2.21 0 4 1.79 4 4h2z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            {/* Main Hero Content */}
            <div className="mb-12 rounded-base border-2 border-border bg-main p-8 shadow-shadow md:p-16 text-main-foreground">
              <h1
                className={`mb-6 text-5xl font-heading md:text-7xl lg:text-8xl ${bricolageGrotesque.className}`}
              >
                Find Your Perfect Match
              </h1>
              <p className="mb-8 text-xl font-base md:text-2xl">
                Connect with people who share your interests. Swipe, match, and
                start meaningful conversations.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" variant="reverse">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button asChild size="lg" variant="neutral">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            {/* Features Section */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-chart-1">
                  <Sparkles size={24} className="text-main-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-heading">Smart Matching</h3>
                <p className="font-base text-foreground">
                  Our algorithm finds compatible matches based on your
                  preferences and location.
                </p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-chart-2">
                  <Heart size={24} className="text-main-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-heading">Real Connections</h3>
                <p className="font-base text-foreground">
                  Chat instantly with your matches and build meaningful
                  relationships.
                </p>
              </div>
              <div className="rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-chart-4">
                  <Shield size={24} className="text-main-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-heading">Safe & Secure</h3>
                <p className="font-base text-foreground">
                  Your privacy matters. We protect your data with
                  industry-standard security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee - Full Width */}
      <div className="mb-12 w-full">
        <Marquee items={items} />
      </div>

      {/* Remaining Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          {/* How It Works Section */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-8 shadow-shadow md:p-12">
            <h2 className="mb-12 text-center text-3xl font-heading md:text-4xl">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-chart-2 text-2xl font-heading">
                  1
                </div>
                <h4 className="mb-2 font-heading">Create Profile</h4>
                <p className="text-sm font-base">
                  Sign up and set up your profile with photos and bio
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-chart-1 text-2xl font-heading">
                  2
                </div>
                <h4 className="mb-2 font-heading">Discover People</h4>
                <p className="text-sm font-base">
                  Swipe through potential matches in your area
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-chart-3 text-2xl font-heading">
                  3
                </div>
                <h4 className="mb-2 font-heading">Match & Connect</h4>
                <p className="text-sm font-base">
                  Get notified when someone likes you back
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-chart-4 text-2xl font-heading">
                  4
                </div>
                <h4 className="mb-2 font-heading">Start Chatting</h4>
                <p className="text-sm font-base">
                  Message your matches and build connections
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-base border-2 border-border bg-main p-8 text-center shadow-shadow md:p-12">
            <h2 className="mb-4 text-3xl font-heading md:text-4xl">
              Ready to Find Love?
            </h2>
            <p className="mb-8 text-lg font-base">
              Join thousands of people finding meaningful connections on Kasinta
            </p>
            <Button asChild size="lg" variant="reverse">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Marquee - Full Width */}
      <div className="w-full">
        <Marquee items={items2} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
