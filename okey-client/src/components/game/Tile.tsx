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
    const fontSize = 34 * scale;

    return (
        <Group
            x={x}
            y={y}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable={isDraggable}
        >
            {/* Simple Background */}
            <Rect
                width={width}
                height={height}
                fill="#F5F5F0"
                cornerRadius={4}
                stroke="black"
                strokeWidth={1}
            />

            {/* The Number */}
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
        </Group>
    );
};
