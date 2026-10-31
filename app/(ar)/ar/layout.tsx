import type { ReactNode } from "react";
import { ar } from "@/content/ar";
import { Document, buildMetadata } from "@/components/Document";

export { viewport } from "@/components/Document";
export const metadata = buildMetadata(ar);

export default function ArabicLayout({ children }: { children: ReactNode }) {
  return <Document t={ar}>{children}</Document>;
}
