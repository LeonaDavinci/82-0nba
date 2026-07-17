import type { Metadata } from "next";
import ResultPage from "@/views/ResultPage";

export const metadata: Metadata = {
  title: "Your 82-0 Result — NBA Season Simulation",
  description:
    "See how your drafted NBA squad performs in the 82-0 game — wins, offense, defense, chemistry, and MVP.",
  // Per-run result is user-specific; keep it out of the index.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ResultPage />;
}
