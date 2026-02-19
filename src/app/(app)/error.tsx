"use client";

import { useRouter } from "next/navigation";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Etwas ist schiefgelaufen</h2>
        <p className="text-muted-foreground text-sm">
          Beim Laden dieser Seite ist ein Fehler aufgetreten.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Erneut versuchen
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Zur Übersicht
          </button>
        </div>
      </div>
    </div>
  );
}
