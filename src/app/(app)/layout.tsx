import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { InstallPrompt } from "@/components/install-prompt";
import { NotificationPrompt } from "@/components/notification-prompt";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Nutzer";

  return (
    <AppShell userName={name} userEmail={user.email || ""}>
      {children}
      <InstallPrompt />
      <NotificationPrompt />
    </AppShell>
  );
}
