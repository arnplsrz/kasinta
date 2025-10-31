import Link from "next/link";
import { Github, Mail, Linkedin } from "lucide-react";
import { KasintaLogo } from "@/components/ui/kasinta-logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Brand Section - Larger */}
          <div className="space-y-6">
            <Link
              href="/"
              className="hover:translate-x-0.5 hover:translate-y-0.5 transition-transform inline-block"
            >
              <KasintaLogo size="xl" />
            </Link>
            <p className="font-base text-base text-foreground max-w-md">
              Find your perfect match and build meaningful connections. Join
              thousands of people finding love on Kasinta.
            </p>
          </div>

          {/* Connect Section - Right Side */}
          <div className="md:ml-auto">
            <h3 className="mb-4 font-heading text-lg">Connect With Us</h3>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/arnplsrz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-main-foreground" />
              </a>
              <a
                href="https://github.com/arnplsrz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="GitHub"
              >
                <Github size={20} className="text-main-foreground" />
              </a>
              <a
                href="mailto:ar.suarez.ph@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                aria-label="Email"
              >
                <Mail size={20} className="text-main-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
          <p className="font-base text-sm text-foreground">
            © {currentYear} Kasinta. All rights reserved.
          </p>
          <p className="font-base text-sm text-foreground">
            Made by{" "}
            <Link
              href="https://arnplsrz.com"
              className="underline transform transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Aaron Paul Suarez
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
