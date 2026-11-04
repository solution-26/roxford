import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/auth";
import { Shell } from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Administration",
  // L'espace propriétaire ne doit jamais remonter dans les moteurs.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <Shell>{children}</Shell>
    </AdminGate>
  );
}
