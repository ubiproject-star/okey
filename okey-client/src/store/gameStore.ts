import { create } from 'zustand';
import type { TileData } from '../components/game/Tile';

export type PlayerPosition = 'bottom' | 'right' | 'top' | 'left';

export interface Player {
    id: string;
    name: string;
    score: number;
    position: PlayerPosition;
    socketId: string;
}

interface GameState {
    roomId: string | null;
    myPlayerId: string | null;
    players: Player[];
    myHand: (TileData | null)[];
    turn: string | null; // Player ID who has turn
    centerTile: TileData | null;
    indicator: TileData | null;
    discards: TileData[][]; // 4 separate piles

    // Actions
    setRoomId: (id: string) => void;
    setMyPlayerId: (id: string) => void;
    setPlayers: (players: Player[]) => void;
    updateHand: (hand: TileData[]) => void;
    setTurn: (playerId: string) => void;
    moveTile: (tileId: string, newIndex: number) => void;
    sortHand: (type: 'series' | 'color') => void;
    setGameData: (data: any) => void;

    // UI
    isInGame: boolean;
    setInGame: (status: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
    roomId: null,
    myPlayerId: null,
    players: [],
    myHand: [],
    turn: null,
    centerTile: null,
    indicator: null,
    discards: [[], [], [], []], // 0: Me, 1: Right, 2: Top, 3: Left (relative usually, but backend sends absolute index)
    isInGame: false,

    setRoomId: (id) => set({ roomId: id }),
    setMyPlayerId: (id) => set({ myPlayerId: id }),
    setPlayers: (players) => set({ players }),
    updateHand: (hand) => {
        // We need to keep the 22-slot structure for the Cue
        // The backend sends 14/15 tiles. We map them to the first available slots if not dragging.
        // For simple sync, we just overwrite for now.
        // Ideally we merge based on IDs to keep positions.
        // Filler nulls:
        const filled = [...hand, ...Array(22 - hand.length).fill(null)];
        set({ myHand: filled });
    },
    setTurn: (playerId) => set({ turn: playerId }),
    setInGame: (status) => set({ isInGame: status }),

    moveTile: (tileId: string, newIndex: number) => set((state) => {
        if (!state.myHand) return state;
        const hand = [...state.myHand];
        const currentIndex = hand.findIndex(t => t && t.id === tileId);
        if (currentIndex === -1) return state;

        const [movedTile] = hand.splice(currentIndex, 1);
        // Simple insert at new index
        hand.splice(newIndex, 0, movedTile);

        return { myHand: hand };
    }),

    sortHand: (type: 'series' | 'color') => set((state) => {
        if (!state.myHand) return state;
        const validTiles = state.myHand.filter(t => t !== null) as TileData[];
        const emptySlots = state.myHand.length - validTiles.length;

        // Sort Logic
        validTiles.sort((a, b) => {
            if (type === 'series') {
                // By Color then Value
                if (a.color !== b.color) return a.color.localeCompare(b.color);
                return a.value - b.value;
            } else {
                // By Value then Color (Pairs logic)
                if (a.value !== b.value) return a.value - b.value;
                return a.color.localeCompare(b.color);
            }
        });

        // Reconstruct hand (fill with nulls at end or keep compacted)
        const newHand = [...validTiles, ...Array(emptySlots).fill(null)];
        return { myHand: newHand };
    }),

    setGameData: (data) => {
        // Bulk update from 'game_start' or 'reconnect'
        // Data has: { roomId, myHand, indicator, players, turn, ... }

        // Logic to map players to relative positions (Right, Top, Left)
        // If I am index X in backend 'players' array:
        // Right is (X+1)%4, Top is (X+2)%4, Left is (X+3)%4

        // Logic to prep hand (22 slots)
        const rawHand = data.myHand || [];
        const filledHand = [...rawHand, ...Array(Math.max(0, 22 - rawHand.length)).fill(null)];

        set((state) => ({
            roomId: data.roomId,
            indicator: data.indicator,
            centerTile: data.indicator,
            turn: data.turn,
            players: data.players || [],
            myHand: filledHand,
            isInGame: true
        }));
    }
}));
