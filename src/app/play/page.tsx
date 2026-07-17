import type { Metadata } from "next";
import PlayPage from "@/views/PlayPage";

export const metadata: Metadata = {
  title: "Play 82-0 — Draft Your NBA Roster",
  description:
    "Draft five NBA legends under random team and era constraints in the 82-0 game, then simulate your season.",
  alternates: { canonical: "/play" },
  openGraph: {
    url: "/play",
    title: "Play 82-0 — Draft Your NBA Roster",
    description:
      "Draft five NBA legends under random team and era constraints in the 82-0 game, then simulate your season.",
  },
};

export default function Page() {
  return <PlayPage />;
}
