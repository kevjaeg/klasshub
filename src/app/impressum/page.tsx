import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Impressum</h1>

      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
        <p>[Dein vollständiger Name]<br />[Straße und Hausnummer]<br />[PLZ und Ort]</p>

        <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
        <p>E-Mail: [deine@email.de]</p>

        <h2 className="text-lg font-semibold text-foreground">Haftungsausschluss</h2>
        <p>
          KlassHub ist ein unabhängiges Produkt und steht in keiner Verbindung
          zu WebUntis, Untis GmbH oder anderen Schulplattform-Anbietern.
        </p>
      </div>
    </div>
  );
}
