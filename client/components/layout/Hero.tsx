import Link from "next/link";
import { Button } from "../ui/button";
import Marquee from "@/components/ui/marquee";
import { Sparkles, Heart, Shield, Github, Menu } from "lucide-react";
import { Bricolage_Grotesque } from "next/font/google";
import Footer from "./Footer";
import { ModeToggle } from "../ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { KasintaLogo } from "../ui/kasinta-logo";

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

  const testimonials = [
    {
      names: "Maria & Juan",
      testimonial:
        "Kasinta helped us find each other when we least expected it. We've been together for 2 years now and couldn't be happier!",
      image: "/testimonial-1.jpg",
    },
    {
      names: "Sofia & Miguel",
      testimonial:
        "Nagkita kami dahil pareho kaming mahilig sa hiking. Mula sa chat, naging lakad, hanggang sa amin na talaga. ❤️ Salamat sa app na ‘to — legit na may forever online.",
      image: "/testimonial-2.jpg",
    },
    {
      names: "Isabel & Carlos",
      testimonial:
        "From our first conversation to our wedding day, Kasinta made it all possible. Thank you for bringing us together!",
      image: "/testimonial-3.jpg",
    },
    {
      names: "Ana & Roberto",
      testimonial:
        "Ginamit ko lang ‘tong app kasi bored ako sa ECQ, pero ngayon engaged na ako! 😂 Sobrang solid — hindi lang match ang nahanap ko, pati ninang at ninong namin sa comment section!",
      image: "/testimonial-4.jpg",
    },
    {
      names: "Carmen & Diego",
      testimonial:
        "I told myself, ‘Just trying it out.’ But three months later, I was holding hands with someone at UP Sunken Garden! 😍 Who knew true love was just one swipe away?",
      image: "/testimonial-5.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky left-0 top-0 z-20 w-full border-b-2 border-border bg-main">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo with Favicon */}
          <Link
            href="/"
            className={`flex items-center gap-2 text-3xl font-heading text-main-foreground hover:translate-x-1 hover:translate-y-1 transition-transform ${bricolageGrotesque.className}`}
          >
            <Image
              src="/logo.svg"
              alt="Kasinta Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <KasintaLogo size="md" />
          </Link>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Menu */}
          <div className="md:hidden flex gap-2">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 [&>button]:hidden border-0 border-l-2"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access login, registration, and other navigation options
                </SheetDescription>
                <div className="flex flex-col gap-4 mt-8 px-4">
                  <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="neutral" className="w-full">
                    <Link href="/register">Create Account</Link>
                  </Button>
                  <Button asChild variant="noShadow" className="w-full">
                    <Link
                      href="https://github.com/arnplsrz/kasinta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="relative min-h-[600px] md:min-h-[700px] flex items-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='32' viewBox='0 0 48 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='0.1'%3E%3Cpath d='M27 32c0-3.314 2.686-6 6-6 5.523 0 10-4.477 10-10S38.523 6 33 6c-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 6.627 0 12 5.373 12 12s-5.373 12-12 12c-2.21 0-4 1.79-4 4h-2zm-6 0c0-3.314-2.686-6-6-6-5.523 0-10-4.477-10-10S9.477 6 15 6c3.314 0 6-2.686 6-6h-2c0 2.21-1.79 4-4 4C8.373 4 3 9.373 3 16s5.373 12 12 12c2.21 0 4 1.79 4 4h2z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="container mx-auto px-4 w-full">
          <div className="mx-auto max-w-4xl">
            {/* Main Hero Content */}
            <div className="text-center py-8">
              <h1
                className={`mb-6 text-4xl font-heading md:text-6xl lg:text-7xl ${bricolageGrotesque.className}`}
              >
                Find your real{" "}
                <span className="bg-chart-1 bg-clip-text text-transparent">
                  <strong className="text-stroke-2">kasinta</strong>
                </span>
                han sa <em className="italic">buhay!</em>
              </h1>
              <p className="mb-8 text-lg font-base md:text-xl max-w-xl mx-auto">
                Connect with people who share your interests. Swipe, match, and
                start meaningful conversations.
              </p>
              <Button
                asChild
                size="lg"
                variant="reverse"
                className="text-lg px-8"
              >
                <Link href="/register">
                  Join{" "}
                  <span
                    className={`font-heading text-shadow-main-foreground ${bricolageGrotesque.className}`}
                  >
                    Kasinta
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee - Full Width */}
      <div className="mb-12 w-full">
        <Marquee items={items} />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 min-h-[400px] flex items-center">
        <div className="mx-auto max-w-5xl w-full">
          <h2 className="mb-12 text-center text-3xl font-heading md:text-4xl">
            Why Choose Kasinta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-base border-2 border-border bg-secondary-background p-6 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-chart-1">
                <Sparkles size={24} className="text-main-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-heading">Smart Matching</h3>
              <p className="font-base text-foreground">
                Our algorithm finds compatible matches based on your preferences
                and location.
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

      {/* Remaining Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {/* How Kasinta Works Section */}
          <div className="rounded-base border-2 border-border bg-secondary-background p-8 shadow-shadow md:p-12 min-h-[450px] flex flex-col justify-center">
            <h2 className="mb-12 text-center text-3xl font-heading md:text-4xl">
              How Kasinta Works
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

          {/* Testimonials Section */}
          <div className="mt-16 min-h-[500px] flex flex-col justify-center">
            <h2 className="mb-8 text-center text-3xl font-heading md:text-4xl">
              Kasinta Stories
            </h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto px-12 md:px-0"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <div className="rounded-base border-2 border-border bg-secondary-background p-4 md:p-6 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all h-full min-h-[200px] flex flex-col">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          {/* Image */}
                          <div className="shrink-0 mx-auto md:mx-0">
                            <div className="w-16 h-16 md:w-16 md:h-16 rounded-base border-2 border-border bg-chart-1 overflow-hidden">
                              <Image
                                src={testimonial.image}
                                alt={testimonial.names}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="mb-2 text-base md:text-lg font-heading">
                              {testimonial.names}
                            </h3>
                            <p className="text-xs md:text-sm font-base text-foreground line-clamp-4">
                              "{testimonial.testimonial}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-base border-2 border-border bg-main p-8 text-center shadow-shadow md:p-12 text-main-foreground min-h-[300px] flex flex-col justify-center">
            <h2 className="mb-4 text-3xl font-heading md:text-4xl">
              Ready to Find Love?
            </h2>
            <p className="mb-8 text-lg font-base">
              Join thousands of people finding meaningful connections on Kasinta
            </p>
            <Button asChild size="lg" variant="reverse" className="mx-auto">
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
