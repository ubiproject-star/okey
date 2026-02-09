import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Tile, type TileData } from './Tile';
import useImage from 'use-image';
import woodSrc from '../../assets/premium/wood_rack.svg';

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
    const [woodImage] = useImage('/assets/premium/wood_rack.svg');

    return (
        <Group x={x} y={y}>
            {/* 1. Main Rack Body 3D - Rich Wood Texture */}
            <Rect
                width={width}
                height={height}
                fill="#4E342E" // Fallback
                fillPatternImage={woodImage}
                fillPatternScale={{ x: 1, y: 1 }} // Adjust scale if needed
                cornerRadius={12}
                shadowBlur={10}
                shadowColor="black"
                shadowOpacity={0.6}
                shadowOffset={{ x: 0, y: 8 }}
            />

            {/* Wood Grain / Groove Effect (Subtle Horizontal Lines) - Keep for depth */}
            <Rect
                x={10}
                y={height / 2 - 2}
                width={width - 20}
                height={4}
                fill="#271815"
                opacity={0.3}
                cornerRadius={2}
                listening={false}
            />

            {/* Rack Depth/Lip - Front Face with Highlight */}
            <Rect
                y={height - 12}
                width={width}
                height={depth}
                fill="#3E2723" // Keep solid for side/lip to distinguish
                fillPatternImage={woodImage} // Optional: use texture here too but might look flat if same offset
                fillPatternOffset={{ x: 0, y: -height }} // Offset to match
                cornerRadius={[0, 0, 12, 12]}
                stroke="#5D4037"
                strokeWidth={1}
                strokeHitEnabled={false}
            />

            {/* Side Metal Accents (Gold Caps) */}
            <Rect
                x={0} y={10} width={12} height={height - 20}
                fill="linear-gradient(to right, #FFD700, #FFA000)"
                cornerRadius={[4, 0, 0, 4]}
                shadowColor="black" shadowBlur={2}
            />
            <Rect
                x={width - 12} y={10} width={12} height={height - 20}
                fill="linear-gradient(to left, #FFD700, #FFA000)"
                cornerRadius={[0, 4, 4, 0]}
                shadowColor="black" shadowBlur={2}
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
