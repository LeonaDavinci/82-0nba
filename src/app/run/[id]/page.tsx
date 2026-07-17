import type { Metadata } from "next";
import SharePage from "@/views/SharePage";

export const metadata: Metadata = {
  title: "Shared 82-0 Run — NBA Team Builder",
  description:
    "Check out this 82-0 NBA team builder run and try to beat the score in the 82-0 game.",
  // Shared runs are stored client-side per device; not stable/indexable.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SharePage />;
}
