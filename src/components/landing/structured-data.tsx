export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KlassHub",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "Alle Schul-Apps in einem Dashboard. Stundenplan, Vertretungen und Ausfälle deiner Kinder – zentral an einem Ort.",
    url: "https://klasshub.de",
    author: {
      "@type": "Person",
      name: "Kevin Jägle",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
