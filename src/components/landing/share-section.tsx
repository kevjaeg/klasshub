"use client";

import { useState } from "react";
import { Share2, MessageCircle, Mail, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";
import { trackEvent } from "@/components/analytics";

const SHARE_URL = "https://klasshub.de?ref=share";
const SHARE_TEXT =
  "Hey, ich hab KlassHub gefunden \u2013 eine App die WebUntis, Schulmanager & Co. in einem Dashboard vereint. Schau mal:";

export function ShareSection() {
  const [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    trackEvent("share", { method: "whatsapp" });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}_whatsapp`)}`,
      "_blank"
    );
  }

  function shareEmail() {
    trackEvent("share", { method: "email" });
    window.open(
      `mailto:?subject=${encodeURIComponent("KlassHub \u2013 Alle Schul-Apps in einem Dashboard")}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}_email`)}`,
      "_blank"
    );
  }

  async function copyLink() {
    trackEvent("share", { method: "copy_link" });
    await navigator.clipboard.writeText(`${SHARE_URL}_link`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        <AnimatedSection className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Teile KlassHub mit anderen Eltern
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kennst du Eltern, die auch zwischen zu vielen Schul-Apps jonglieren?
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" onClick={shareWhatsApp} className="gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              E-Mail
            </Button>
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Kopiert!" : "Link kopieren"}
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
