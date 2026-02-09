import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export type TileColor = 'red' | 'black' | 'blue' | 'yellow';

export interface TileData {
    id: string;
    color: TileColor;
    value: number;
}

interface TileProps {
    data: TileData;
    x: number;
    y: number;
    scale?: number;
    isDraggable?: boolean;
    onDragStart?: (e: any) => void;
    onDragEnd?: (e: any) => void;
}

const COLOR_MAP: Record<TileColor, string> = {
    red: '#D50000',     // Vivid Red
    black: '#212121',   // Jet Black
    blue: '#1565C0',    // Rich Blue
    yellow: '#FFA000'   // Amber Gold
};

export const Tile: React.FC<TileProps> = ({ data, x, y, scale = 1, isDraggable = false, onDragStart, onDragEnd }) => {
    // Standard Okey Tile Ratios
    const width = 40 * scale;
    const height = 58 * scale;
    const thickness = 6 * scale; // 3D Depth
    const fontSize = 34 * scale;

    return (
        <Group
            x={x}
            y={y}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable={isDraggable}
        >
            {/* 1. Base Shadow (Drop Shadow) */}
            <Rect
                x={2}
                y={2}
                width={width}
                height={height + thickness}
                fill="black"
                opacity={0.3}
                cornerRadius={4}
                blurRadius={2}
            />

            {/* 2. 3D Thickness (Bottom Layer) */}
            <Rect
                x={0}
                y={thickness}
                width={width}
                height={height}
                fill="#BBB" // Darker grey/cream for side
                cornerRadius={4}
            />

            {/* 3. Main Face (Top Surface) */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="#FDFDF8" // Cream white
                cornerRadius={4}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={2}
                shadowOffset={{ x: 0, y: 1 }}
            />

            {/* 4. The Number */}
            <Text
                text={`${data.value}`}
                fontSize={fontSize}
                fontStyle="bold"
                fill={COLOR_MAP[data.color]}
                align="center"
                width={width}
                y={(height - fontSize) / 2}
                listening={false}
            />

            {/* 5. Minimal Gloss/Highlight (Static) */}
            <Rect
                x={2}
                y={2}
                width={width - 4}
                height={height / 3}
                fill="white"
                opacity={0.2}
                cornerRadius={[4, 4, 10, 10]}
                listening={false}
            />
        </Group>
    );
};
