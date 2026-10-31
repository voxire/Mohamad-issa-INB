import type { ReactNode } from "react";
import { en } from "@/content/en";
import { Document, buildMetadata } from "@/components/Document";

export { viewport } from "@/components/Document";
export const metadata = buildMetadata(en);

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <Document t={en}>{children}</Document>;
}
