import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <h1 className="mb-6 text-3xl font-bold">Datenschutzerklärung</h1>

      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">1. Verantwortlicher</h2>
        <p>Kevin Jägle<br />Eschbach 8, 77716 Fischerbach<br />info@klasshub.de</p>

        <h2 className="text-lg font-semibold text-foreground">2. Welche Daten wir erheben</h2>
        <p>Wir erheben und verarbeiten folgende Daten:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>E-Mail-Adresse und Name (für deinen Account)</li>
          <li>Namen und Schulinformationen deiner Kinder</li>
          <li>Stundenplandaten und Vertretungen (von verbundenen Schulplattformen)</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Zugangsdaten für Schulplattformen</h2>
        <p>
          <strong>Wir speichern NIEMALS Passwörter oder Zugangsdaten für Drittplattformen
          (z.B. WebUntis).</strong> Wenn du einen Sync durchführst, werden deine Zugangsdaten
          nur für die Dauer der Datenabfrage verwendet und sofort danach verworfen.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Datenspeicherung</h2>
        <p>
          Alle Daten werden in der Europäischen Union gespeichert (Supabase, EU-Region).
          Es findet keine Datenübertragung in Drittländer statt.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Deine Rechte (DSGVO)</h2>
        <p>Du hast jederzeit das Recht auf:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Du kannst dein Konto und alle Daten jederzeit in den Einstellungen
          vollständig löschen.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Minderjährige</h2>
        <p>
          KlassHub richtet sich an Eltern und Erziehungsberechtigte.
          Schülerdaten werden nur im Auftrag und mit Einwilligung der Eltern verarbeitet.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Kontakt</h2>
        <p>
          Bei Fragen zum Datenschutz kontaktiere uns unter: info@klasshub.de
        </p>
      </div>
    </div>
  );
}
