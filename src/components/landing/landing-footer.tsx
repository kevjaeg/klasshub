import Link from "next/link";
import { GraduationCap, Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span className="font-medium">KlassHub</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="https://github.com/kevjaeg/klasshub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <span className="text-border">&middot;</span>
          <Link href="/datenschutz" className="transition-colors hover:text-foreground">
            Datenschutz
          </Link>
          <span className="text-border">&middot;</span>
          <Link href="/impressum" className="transition-colors hover:text-foreground">
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  );
}
