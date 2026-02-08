export type Color = 'red' | 'black' | 'blue' | 'orange';

export interface Tile {
    id: string;
    value: number; // 1-13, 0 for Fake Okey logic placeholder (visuals handle it)
    color: Color | null; // null for fake okey if strictly defined, but usually assigned a color backend-wise for ID
    isFakeOkey?: boolean;
    isWildcard?: boolean; // Runtime flag for logic
}

export class OkeyEngine {

    // --- Deck Creation ---

    static createDeck(): Tile[] {
        const colors: Color[] = ['red', 'black', 'blue', 'orange'];
        const deck: Tile[] = [];

        // 2 sets of 1-13
        colors.forEach(color => {
            for (let i = 1; i <= 13; i++) {
                deck.push({ id: `${color}-${i}-1`, value: i, color });
                deck.push({ id: `${color}-${i}-2`, value: i, color });
            }
        });

        // 2 Fake Okeys (Represented as special tiles)
        // In real play, these have a distinct image. Logic-wise we track them.
        deck.push({ id: 'fake-1', value: 0, color: null, isFakeOkey: true });
        deck.push({ id: 'fake-2', value: 0, color: null, isFakeOkey: true });

        return this.shuffle(deck);
    }

    private static shuffle(array: Tile[]): Tile[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Game Logic ---

    // Determine 'Okey' (Wildcard) based on Indicator
    static getOkeyTile(indicator: Tile): { value: number, color: Color } {
        if (indicator.isFakeOkey) {
            // Very rare edge case: Indicator is Fake Okey? 
            // Standard rules usually re-draw or specific rule applies. 
            // For MVP: assume standard tile.
            return { value: 1, color: 'red' };
        }

        let okeyValue = indicator.value + 1;
        if (okeyValue > 13) okeyValue = 1;

        return { value: okeyValue, color: indicator.color! };
    }

    // Distribute
    static distribute(deck: Tile[]) {
        const hands: Tile[][] = [[], [], [], []];
        // 15 to Dealer (Player 0)
        for (let i = 0; i < 15; i++) hands[0].push(deck.pop()!);
        // 14 to others
        for (let p = 1; p < 4; p++) {
            for (let i = 0; i < 14; i++) hands[p].push(deck.pop()!);
        }

        // Indicator is usually picked before distribute or last card of deck.
        // Let's pick random from remaining for Indicator
        const indicatorIndex = Math.floor(Math.random() * deck.length);
        const indicator = deck.splice(indicatorIndex, 1)[0];

        return {
            hands,
            drawPile: deck,
            indicator
        };
    }

    // --- Win Validation ---

    // Main checks if a hand (14 tiles) is winning.
    // Logic: Can we partition 14 tiles into valid sets (Groups or Runs)?
    // Validates a flat hand array (with nulls as separators)
    static validateHand(hand: (Tile | null)[], indicator: Tile): boolean {
        const groups = this.parseGroups(hand);

        // Detailed log for debugging
        // console.log("Validating groups:", JSON.stringify(groups));

        // 1. Basic Count Check: Total tiles must be 14 (or 15 if shooting for finish?)
        // Usually 'Finish' action implies discarding the 15th tile and showing 14. 
        // Or showing 14 valid tiles + 1 extra that is discarded?
        // Standard online flow: Discard the 15th tile to "Finish", server checks remaining 14.

        const totalTiles = groups.reduce((acc, g) => acc + g.length, 0);
        if (totalTiles !== 14) return false;

        const okeyIdentity = this.getOkeyTile(indicator);

        return groups.every(group => this.isValidSet(group, okeyIdentity));
    }

    private static parseGroups(hand: (Tile | null)[]): Tile[][] {
        const groups: Tile[][] = [];
        let currentGroup: Tile[] = [];

        hand.forEach(tile => {
            if (tile) {
                currentGroup.push(tile);
            } else if (currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        });
        if (currentGroup.length > 0) groups.push(currentGroup);

        return groups;
    }

    // Checks if a single group of tiles is a valid Set (Group) or Run (Series)
    static isValidSet(group: Tile[], okeyIdentity: { value: number, color: Color }): boolean {
        if (group.length < 3) return false;

        // Transform Hand: Replace Jokers (Real Okey) with 'Wildcard' marker
        // and Fake Okeys with the value of the Joker.
        // Actually, for validation, we just need to know "This tile can be anything".

        const wildcards = group.filter(t =>
            (t.value === okeyIdentity.value && t.color === okeyIdentity.color) || t.isWildcard
        ).length;

        const fixedTiles = group.filter(t =>
            !(t.value === okeyIdentity.value && t.color === okeyIdentity.color) && !t.isWildcard
        );

        // If all are wildcards, it's valid (e.g. 3 Okeys)
        if (fixedTiles.length === 0) return true;

        // Strategy: Try to validate as Group (Colors different, Values same)
        // Then try as Run (Colors same, Values consecutive)

        // --- Check 1: Group (Same Value) ---
        // All fixed tiles must have same value (handle Fake Okey explicitly if needed)
        // Fake Okey Logic:
        // If a tile is "Fake Okey", its value is effectively the "Image" value (which is 0 in our data?).
        // Wait, in `createDeck`: `deck.push({ id: 'fake-1', value: 0, color: null, isFakeOkey: true });`
        // We need to treat Fake Okey as the "Real value of Okey".
        // Example: Indicator Red 5 -> Okey is Red 6. Fake Okey represents Red 6.

        // Let's resolve "Effective Value" and "Effective Color" for every tile.

        const resolvedGroup = group.map(t => {
            // Is it the Okey (Joker)? -> Wildcard
            if (t.value === okeyIdentity.value && t.color === okeyIdentity.color) {
                return { value: -1, color: 'wild', isWild: true }; // -1 = any
            }
            // Is it Fake Okey? -> Represents Okey Identity
            if (t.isFakeOkey) {
                return { value: okeyIdentity.value, color: okeyIdentity.color, isWild: false };
            }
            // Regular Tile
            return { value: t.value, color: t.color, isWild: false };
        });

        if (this.canBeGroup(resolvedGroup)) return true;
        if (this.canBeRun(resolvedGroup)) return true;

        return false;
    }

    private static canBeGroup(tiles: any[]): boolean {
        // Rule: Values must be same. Colors must be different.
        const nonWilds = tiles.filter(t => !t.isWild);
        if (nonWilds.length === 0) return true;

        const targetValue = nonWilds[0].value;
        const usedColors = new Set<string>();

        for (const t of nonWilds) {
            if (t.value !== targetValue) return false;
            if (usedColors.has(t.color)) return false; // Duplicate color in group
            usedColors.add(t.color!);
        }

        return true;
    }

    private static canBeRun(tiles: any[]): boolean {
        // Rule: Colors must be same. Values must be consecutive.
        // Challenge: 12-13-1 is valid.

        const nonWilds = tiles.filter(t => !t.isWild);
        if (nonWilds.length === 0) return true;

        const targetColor = nonWilds[0].color;
        // All must have targetColor
        if (nonWilds.some(t => t.color !== targetColor)) return false;

        // Check sequences via brute-force wildcard placement or gap checking?
        // Since we have wildcards, it's easier to:
        // 1. Sort non-wilds
        // 2. Check gaps. total_gaps must be <= wildcards_count.

        // Sorting needs care for 13-1 wrapping. 
        // We handle 1 as 1 AND 14? 
        // Okey Rules: 1 can be after 13. (12-13-1). But 13-1-2 is NOT valid usually.
        // "13'ten sonra 1 gelebilir, ancak 1'den sonra 2 gelemez." (Standard)

        const values = nonWilds.map(t => t.value).sort((a, b) => a - b);

        // If we have distinct values?
        // Runs cannot have duplicates.
        if (new Set(values).size !== values.length) return false;

        // Helper to check standard sequence
        const gapsNeeded = (sortedVals: number[]) => {
            let gaps = 0;
            for (let i = 0; i < sortedVals.length - 1; i++) {
                let diff = sortedVals[i + 1] - sortedVals[i];
                // diff=1 -> 0 gap. diff=2 (e.g. 5,7) -> 1 gap (needs 6).
                gaps += (diff - 1);
            }
            return gaps;
        };

        // Case A: Standard 1-13 range
        let gapsStandard = gapsNeeded(values);
        let wildcardsCount = tiles.length - nonWilds.length;

        if (gapsStandard <= wildcardsCount) return true;

        // Case B: 12-13-1 wrapping
        // Convert 1 to 14 if present?
        // If we have 1, try treating it as 14.
        if (values.includes(1)) {
            const valuesWithHighAce = values.map(v => v === 1 ? 14 : v).sort((a, b) => a - b);
            let gapsWrapped = gapsNeeded(valuesWithHighAce);
            if (gapsWrapped <= wildcardsCount) return true;
        }

        return false;
    }
}
