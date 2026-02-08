"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PLATFORMS } from "@/lib/platforms/registry";
import type { PlatformId, PlatformInfo } from "@/lib/platforms/types";

const platformList = Object.values(PLATFORMS);

export default function AddChildPage() {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [platformConfig, setPlatformConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const selectedPlatformInfo: PlatformInfo | null = selectedPlatform
    ? PLATFORMS[selectedPlatform]
    : null;

  function handlePlatformFieldChange(key: string, value: string) {
    setPlatformConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlatformSelect(id: PlatformId) {
    setSelectedPlatform(id);
    setPlatformConfig({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Du bist nicht angemeldet.");
      setLoading(false);
      return;
    }

    // Build insert data
    const insertData: Record<string, unknown> = {
      user_id: user.id,
      name,
      school_name: schoolName,
      class_name: className || null,
      platform: selectedPlatform,
      platform_config: selectedPlatform ? platformConfig : null,
    };

    // Legacy WebUntis columns for backwards compatibility
    if (selectedPlatform === "webuntis") {
      insertData.webuntis_server = platformConfig.server || null;
      insertData.webuntis_school = platformConfig.school || null;
    }

    const { data, error } = await supabase.from("children").insert(insertData).select().single();

    if (error) {
      toast.error("Kind konnte nicht hinzugefügt werden.");
      setLoading(false);
      return;
    }

    toast.success(`${name} wurde hinzugefügt!`);
    router.push(`/children/${data.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/children"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Kind hinzufügen</CardTitle>
          <CardDescription>
            Gib die Daten deines Kindes ein und wähle die Schulplattform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name des Kindes *</Label>
              <Input
                id="name"
                placeholder="z.B. Lena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Schule *</Label>
              <Input
                id="school"
                placeholder="z.B. Gymnasium Musterstadt"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Klasse</Label>
              <Input
                id="class"
                placeholder="z.B. 7b"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label>Schulplattform</Label>
              <div className="grid grid-cols-2 gap-2">
                {platformList.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformSelect(platform.id)}
                    className={`relative rounded-lg border p-3 text-left transition-all ${
                      selectedPlatform === platform.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-muted-foreground/30"
                    }`}
                  >
                    {selectedPlatform === platform.id && (
                      <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{platform.name}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {platform.description}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Optional. Du kannst die Plattform auch später einrichten.
              </p>
            </div>

            {/* Platform-specific fields */}
            {selectedPlatformInfo && selectedPlatformInfo.fields.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">{selectedPlatformInfo.name}-Verbindung</h3>
                  <p className="text-xs text-muted-foreground">
                    Diese Daten werden für die Synchronisation benötigt.
                  </p>
                </div>
                {selectedPlatformInfo.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`platform-${field.key}`}>
                      {field.label}
                      {field.required && " *"}
                    </Label>
                    <Input
                      id={`platform-${field.key}`}
                      placeholder={field.placeholder}
                      type={field.type}
                      value={platformConfig[field.key] || ""}
                      onChange={(e) =>
                        handlePlatformFieldChange(field.key, e.target.value)
                      }
                      required={field.required}
                    />
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kind hinzufügen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
