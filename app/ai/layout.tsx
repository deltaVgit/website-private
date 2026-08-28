import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Engineering",
  description:
    "Named AI specialists for the jobs your SME already runs — HR, review, finance. Files you keep. Your people still decide.",
  openGraph: {
    title: "AI Engineering · Delta V",
    description:
      "Named AI specialists for HR, review, and finance — files you keep, people still decide.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
