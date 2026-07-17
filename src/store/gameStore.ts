import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftSlot, Player, SimulationResult, RunRecord } from "../types";
import { generateDraftSlots, rerollTeam, rerollEra } from "../engine/draft";
import { simulateTeam } from "../engine/simulation";

interface GameState {
  slots: DraftSlot[];
  selectedPlayers: (Player | null)[];
  currentSlotIndex: number;
  result: SimulationResult | null;
  runId: string | null;
  recentRuns: RunRecord[];
  isDailyChallenge: boolean;

  // Actions
  startNewGame: (daily?: boolean) => void;
  selectPlayer: (player: Player) => void;
  deselectPlayer: (slotIndex: number) => void;
  setCurrentSlot: (index: number) => void;
  rerollSlotTeam: (slotIndex: number) => void;
  rerollSlotEra: (slotIndex: number) => void;
  finishDraft: () => string;
  reset: () => void;
  loadRun: (id: string) => RunRecord | null;
}

function generateRunId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      slots: [],
      selectedPlayers: [null, null, null, null, null],
      currentSlotIndex: 0,
      result: null,
      runId: null,
      recentRuns: [],
      isDailyChallenge: false,

      startNewGame: (daily = false) => {
        const slots = generateDraftSlots();
        set({
          slots,
          selectedPlayers: [null, null, null, null, null],
          currentSlotIndex: 0,
          result: null,
          runId: null,
          isDailyChallenge: daily,
        });
      },

      selectPlayer: (player: Player) => {
        const { currentSlotIndex, selectedPlayers } = get();
        const updated = [...selectedPlayers];
        updated[currentSlotIndex] = player;

        // Auto-advance to next empty slot
        const nextEmpty = updated.findIndex((p, i) => i > currentSlotIndex && p === null);
        const fallback = updated.findIndex((p) => p === null);
        const newIndex = nextEmpty !== -1 ? nextEmpty : fallback !== -1 ? fallback : currentSlotIndex;

        set({ selectedPlayers: updated, currentSlotIndex: newIndex });
      },

      deselectPlayer: (slotIndex: number) => {
        const { selectedPlayers } = get();
        const updated = [...selectedPlayers];
        updated[slotIndex] = null;
        set({ selectedPlayers: updated, currentSlotIndex: slotIndex });
      },

      setCurrentSlot: (index: number) => {
        set({ currentSlotIndex: index });
      },

      rerollSlotTeam: (slotIndex: number) => {
        const { slots } = get();
        const slot = slots[slotIndex];
        if (!slot || slot.teamRerolled) return;
        const newTeam = rerollTeam(slot);
        const updated = slots.map((s, i) =>
          i === slotIndex ? { ...s, team: newTeam, teamRerolled: true } : s
        );
        set({ slots: updated });
      },

      rerollSlotEra: (slotIndex: number) => {
        const { slots } = get();
        const slot = slots[slotIndex];
        if (!slot || slot.eraRerolled) return;
        const newEra = rerollEra(slot);
        const updated = slots.map((s, i) =>
          i === slotIndex ? { ...s, decade: newEra, eraRerolled: true } : s
        );
        set({ slots: updated });
      },

      finishDraft: () => {
        const { slots, selectedPlayers, recentRuns } = get();
        const players = selectedPlayers.filter(Boolean) as Player[];

        if (players.length !== 5) throw new Error("Must select all 5 players");

        const result = simulateTeam(players);
        const runId = generateRunId();

        const run: RunRecord = {
          id: runId,
          createdAt: new Date().toISOString(),
          slots,
          selectedPlayers: players,
          result,
        };

        const updatedRuns = [run, ...recentRuns].slice(0, 20);
        set({ result, runId, recentRuns: updatedRuns });
        return runId;
      },

      reset: () => {
        set({
          slots: [],
          selectedPlayers: [null, null, null, null, null],
          currentSlotIndex: 0,
          result: null,
          runId: null,
          isDailyChallenge: false,
        });
      },

      loadRun: (id: string) => {
        const { recentRuns } = get();
        return recentRuns.find((r) => r.id === id) ?? null;
      },
    }),
    {
      name: "82-0-game-store",
      partialize: (state) => ({ recentRuns: state.recentRuns }),
    }
  )
);
