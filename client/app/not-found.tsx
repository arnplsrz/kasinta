import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="text-foreground max-h-dvh h-dvh portrait:max-h-dvh portrait:h-dvh w-full flex items-center justify-center bg-background p-5">
      <div className="flex flex-col items-center text-center max-w-2xl w-full bg-secondary-background border-2 border-border rounded-base shadow-shadow p-8 md:p-12">
        <div className="text-8xl md:text-9xl font-heading">404</div>
        <h1 className="text-3xl md:text-5xl font-heading mb-4">Page Not Found</h1>
        <p className="leading-snug font-base text-lg md:text-xl mb-8 max-w-md">
          Oops! Looks like this page went on a date and never came back. 🥀
        </p>
        <Link
          className="flex items-center font-base gap-2.5 w-max text-main-foreground rounded-base border-2 border-border bg-main md:px-10 px-4 md:py-3 py-2 md:text-[22px] text-base shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
          href={"/"}
        >
          Return home
          <ArrowUpRight className="md:size-7.5 size-5" />
        </Link>
      </div>
    </div>
  );
}
