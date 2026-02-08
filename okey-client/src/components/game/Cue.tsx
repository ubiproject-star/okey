import React, { useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Tile, type TileData } from './Tile';

interface CueProps {
    tiles: (TileData | null)[];
    x: number;
    y: number;
    width?: number;
    scale?: number;
    isMyTurn?: boolean; // Highlight if active
    onTileDragEnd?: (tileId: string, e: any) => void;
    onSort?: (type: 'series' | 'color') => void;
}

export const Cue: React.FC<CueProps> = ({ tiles, x, y, width = 800, scale = 1, isMyTurn = false, onTileDragEnd, onSort }) => {
    const height = 90 * scale;
    const depth = 20 * scale;

    return (
        <Group x={x} y={y}>
            {/* 1. Main Rack Body 3D - High Fidelity Wood Gradient */}
            <Rect
                width={width}
                height={height}
                fillPriority="linear-gradient"
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: height }}
                fillLinearGradientColorStops={[
                    0, '#4E342E',     // Highlight Top
                    0.2, '#3E2723',   // Mid
                    0.8, '#2D1B15',   // Deep Shadow
                    1, '#1B100D'      // Edge
                ]}
                cornerRadius={8}
                shadowBlur={15}
                shadowColor="black"
                shadowOpacity={0.8}
                shadowOffset={{ x: 0, y: 5 }}
            />

            {/* Gloss/Varnish Highlight Line Top */}
            <Rect
                x={0} y={0} width={width} height={height / 2}
                fillPriority="linear-gradient"
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: height / 2 }}
                fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.05)', 1, 'rgba(255,255,255,0)']}
                cornerRadius={[8, 8, 0, 0]}
            />

            {/* Rack Depth/Lip - Front Face */}
            <Rect
                y={height - 8}
                width={width}
                height={depth}
                fill="#1B0000"
                cornerRadius={[0, 0, 8, 8]}
                shadowBlur={5}
                shadowColor="black"
            />

            {/* Highlight/Active indicator - Glowing Border */}
            {isMyTurn && (
                <Rect
                    x={-4}
                    y={-4}
                    width={width + 8}
                    height={height + depth + 8}
                    stroke="rgba(255, 215, 0, 0.6)" // Gold glow
                    strokeWidth={4}
                    cornerRadius={12}
                    shadowColor="#FFD700"
                    shadowBlur={20}
                    listening={false}
                />
            )}

            {/* Sort Buttons (Floating above Cue) */}
            {isMyTurn && (
                <Group x={width - 160} y={-40}>
                    <Group
                        onClick={() => onSort && onSort('series')}
                        onTap={() => onSort && onSort('series')}
                    >
                        <Rect width={70} height={30} fill="#333" cornerRadius={15} opacity={0.8} shadowBlur={5} />
                        <Text text="123..." fill="white" fontSize={14} fontStyle="bold" x={15} y={8} />
                    </Group>

                    <Group
                        x={80}
                        onClick={() => onSort && onSort('color')}
                        onTap={() => onSort && onSort('color')}
                    >
                        <Rect width={70} height={30} fill="#333" cornerRadius={15} opacity={0.8} shadowBlur={5} />
                        <Text text="Renk" fill="white" fontSize={14} fontStyle="bold" x={18} y={8} />
                    </Group>
                </Group>
            )}

            {/* Render Tiles on Cue */}
            {tiles.map((tile, index) => {
                if (!tile) return null;

                const scaleVal = scale;
                const tileSpacing = 45 * scaleVal;
                const startX = 20;

                // Simple 2-row logic: 0-10 top, 11-21 bottom
                const row = Math.floor(index / 11);
                const col = index % 11;

                const tileX = startX + (col * tileSpacing);
                const tileY = 20 + (row * (60 * scaleVal));

                return (
                    <Tile
                        key={tile.id}
                        data={tile}
                        x={tileX}
                        y={tileY}
                        scale={scaleVal}
                        isDraggable={isMyTurn}
                        onDragEnd={(e) => onTileDragEnd && onTileDragEnd(tile.id, e)}
                    />
                );
            })}
        </Group>
    );
};

// Wrapper for Animation (Placeholder for now, implementing basic positioning first)
// Real Fly-in requires `useSpring` from `react - spring` or `Konva.Tween` in `useEffect`.
// Let's implement a simple `AnimatedTile` component in next step if user requests,
// for now we stick to solid positioning but with the new detailed Look.
