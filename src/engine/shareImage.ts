import type { RunRecord } from "../types";

const POS_COLORS: Record<string, string> = {
  PG: "#1D428A",
  SG: "#6D28D9",
  SF: "#15803D",
  PF: "#E56A2C",
  C: "#C8102E",
};

const CREAM = "#F3EEE3";
const PAPER = "#FBF8F1";
const INK = "#201E1A";
const MUTED = "#6B6557";
const BORDER = "#E5DBC8";
const NBA_BLUE = "#1D428A";
const NBA_RED = "#C8102E";
const ORANGE = "#E56A2C";

function recordColor(wins: number): string {
  if (wins >= 70) return ORANGE;
  if (wins >= 55) return NBA_BLUE;
  if (wins >= 40) return "#15803D";
  return MUTED;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function lastName(name: string): string {
  return name;
}

/** Render the run as a branded portrait share card and trigger a PNG download. */
export async function downloadShareImage(run: RunRecord): Promise<void> {
  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }

  const W = 1080;
  const H = 1350;
  const PAD = 72;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { result, selectedPlayers, slots } = run;
  const wins = result.wins;
  const losses = result.losses;

  // ── Background ──
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Top NBA accent bar (blue → red split)
  ctx.fillStyle = NBA_BLUE;
  ctx.fillRect(0, 0, W / 2, 14);
  ctx.fillStyle = NBA_RED;
  ctx.fillRect(W / 2, 0, W / 2, 14);

  ctx.textAlign = "center";

  // ── Wordmark ──
  const grad = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0);
  grad.addColorStop(0, NBA_BLUE);
  grad.addColorStop(0.45, NBA_BLUE);
  grad.addColorStop(1, NBA_RED);
  ctx.fillStyle = grad;
  ctx.font = "900 110px Inter, sans-serif";
  ctx.fillText("82-0", W / 2, 150);

  ctx.fillStyle = MUTED;
  ctx.font = "700 24px Inter, sans-serif";
  ctx.save();
  ctx.translate(W / 2, 196);
  ctx.fillText("N B A   T E A M   B U I L D E R", 0, 0);
  ctx.restore();

  // ── Record ──
  ctx.fillStyle = MUTED;
  ctx.font = "800 26px Inter, sans-serif";
  ctx.fillText("SEASON RECORD", W / 2, 296);

  ctx.fillStyle = recordColor(wins);
  ctx.font = "900 184px Inter, sans-serif";
  ctx.fillText(`${wins}-${losses}`, W / 2, 470);

  // ── Analysis (wrapped, up to 2 lines) ──
  ctx.fillStyle = INK;
  ctx.font = "italic 500 26px Inter, sans-serif";
  const words = result.analysis.split(" ");
  const allLines: string[] = [];
  let line = "";
  const maxW = W - PAD * 2 - 40;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      allLines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) allLines.push(line);
  const shown = allLines.slice(0, 2);
  const isTruncated = allLines.length > 2;
  shown.forEach((l, i) => {
    const text = i === shown.length - 1 && isTruncated ? l + "…" : l;
    ctx.fillText(text, W / 2, 540 + i * 38);
  });

  // ── Roster panel ──
  const panelY = 640;
  const panelH = 470;
  ctx.fillStyle = PAPER;
  roundRect(ctx, PAD, panelY, W - PAD * 2, panelH, 28);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = "800 24px Inter, sans-serif";
  ctx.fillText("STARTING FIVE", PAD + 40, panelY + 56);

  const rowStartY = panelY + 104;
  const rowH = 70;
  selectedPlayers.forEach((p, i) => {
    if (!p) return;
    const y = rowStartY + i * rowH;
    const pos = slots[i]?.position ?? p.position;
    const color = POS_COLORS[pos] ?? NBA_BLUE;

    // Position chip
    ctx.fillStyle = color;
    roundRect(ctx, PAD + 40, y - 30, 64, 44, 10);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pos, PAD + 72, y - 1);

    // Name
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "800 30px Inter, sans-serif";
    ctx.fillText(lastName(p.name), PAD + 128, y - 4);

    // Team · decade
    ctx.fillStyle = MUTED;
    ctx.font = "500 20px Inter, sans-serif";
    ctx.fillText(`${p.team} · ${p.decade}`, PAD + 128, y + 22);

    // MVP star
    let rightX = W - PAD - 40;
    ctx.textAlign = "right";
    ctx.fillStyle = INK;
    ctx.font = "800 30px Inter, sans-serif";
    ctx.fillText(String(p.overall), rightX, y + 6);
    rightX -= 64;
    if (result.mvp.id === p.id) {
      ctx.fillStyle = ORANGE;
      ctx.font = "800 22px Inter, sans-serif";
      ctx.fillText("MVP", rightX, y + 4);
    }
  });

  // ── Stats row (OFF / DEF / CHE) ──
  const statY = panelY + panelH + 86;
  const stats: [string, number][] = [
    ["OFFENSE", result.stats.offense],
    ["DEFENSE", result.stats.defense],
    ["CHEMISTRY", result.stats.chemistry],
  ];
  const colW = (W - PAD * 2) / 3;
  stats.forEach(([label, val], i) => {
    const cx = PAD + colW * i + colW / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = i === 0 ? NBA_BLUE : i === 1 ? NBA_RED : ORANGE;
    ctx.font = "900 68px Inter, sans-serif";
    ctx.fillText(String(val), cx, statY);
    ctx.fillStyle = MUTED;
    ctx.font = "700 22px Inter, sans-serif";
    ctx.fillText(label, cx, statY + 36);
  });

  // ── Footer ──
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = "500 22px Inter, sans-serif";
  const date = new Date(run.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  ctx.fillText(date, PAD, H - 56);

  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = "800 22px Inter, sans-serif";
  ctx.fillText(`MVP · ${result.mvp.name}`, W - PAD, H - 56);

  // ── Download ──
  const fileName = `82-0-${wins}-${losses}.png`;
  const triggerDownload = (href: string, revoke: boolean) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  if (typeof canvas.toBlob === "function") {
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(URL.createObjectURL(blob), true);
        else triggerDownload(canvas.toDataURL("image/png"), false);
        resolve();
      }, "image/png");
    });
  } else {
    triggerDownload(canvas.toDataURL("image/png"), false);
  }
}
