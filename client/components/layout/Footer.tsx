import Link from "next/link";
import { Heart, Github, Twitter, Mail } from "lucide-react";
import { Bricolage_Grotesque } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className={`inline-block text-2xl font-heading hover:translate-x-0.5 hover:translate-y-0.5 transition-transform ${bricolageGrotesque.className}`}
            >
              KASINTA
            </Link>
            <p className="font-base text-sm text-foreground">
              Find your perfect match and build meaningful connections.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 font-heading text-lg">Product</h3>
            <ul className="space-y-2 font-base text-sm">
              <li>
                <Link
                  href="/discover"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="/matches"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Matches
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-heading text-lg">Company</h3>
            <ul className="space-y-2 font-base text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:translate-x-0.5 inline-block transition-transform hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 font-heading text-lg">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="Twitter"
              >
                <Twitter size={20} className="text-main-foreground" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="GitHub"
              >
                <Github size={20} className="text-main-foreground" />
              </a>
              <a
                href="mailto:hello@kasinta.com"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="Email"
              >
                <Mail size={20} className="text-main-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-border pt-8 md:flex-row">
          <p className="font-base text-sm text-foreground">
            © {currentYear} Kasinta. All rights reserved.
          </p>
          <p className="flex items-center gap-2 font-base text-sm text-foreground">
            Made with{" "}
            <Heart size={16} className="text-chart-2" fill="currentColor" /> for
            meaningful connections
          </p>
        </div>
      </div>
    </footer>
  );
}
