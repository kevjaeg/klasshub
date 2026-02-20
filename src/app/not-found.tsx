import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Seite nicht gefunden</h2>
        <p className="text-muted-foreground text-sm">
          Die angeforderte Seite existiert nicht.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Zum Dashboard
        </Link>
      </div>
    </div>
  );
}
