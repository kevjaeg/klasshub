const faqs = [
  {
    question: "Ist KlassHub kostenlos?",
    answer:
      "Ja, KlassHub ist während der Beta komplett kostenlos. Alle Features, keine Limits, keine Kreditkarte nötig.",
  },
  {
    question: "Welche Schulplattformen werden unterstützt?",
    answer:
      "Aktuell unterstützt KlassHub WebUntis (verfügbar), Schulmanager, IServ, Moodle und Sdui (alle in Beta). Weitere Plattformen folgen.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer:
      "Ja. KlassHub ist Open Source, DSGVO-konform und speichert Daten ausschließlich in der EU. Passwörter werden nie gespeichert. Du kannst dein Konto jederzeit löschen.",
  },
  {
    question: "Kann ich mehrere Kinder verwalten?",
    answer:
      "Ja, du kannst beliebig viele Kinder hinzufügen – auch von verschiedenen Schulen mit verschiedenen Plattformen.",
  },
  {
    question: "Brauche ich einen Account zum Testen?",
    answer:
      "Nein, du kannst KlassHub in der Demo kostenlos und ohne Account ausprobieren.",
  },
];

export { faqs };

export function FAQStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
