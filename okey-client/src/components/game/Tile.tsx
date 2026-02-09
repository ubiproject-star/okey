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
    // Standard Okey Tile Ratios (Chunky)
    const width = 42 * scale; // Slightly wider
    const height = 60 * scale; // Slightly taller
    const thickness = 8 * scale; // Deeper 3D effect
    const fontSize = 38 * scale; // Bigger, bolder font

    return (
        <Group
            x={x}
            y={y}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            draggable={isDraggable}
        >
            {/* 1. Base Shadow (Deep Drop Shadow) */}
            <Rect
                x={4}
                y={4}
                width={width}
                height={height + thickness}
                fill="black"
                opacity={0.4}
                cornerRadius={5}
                blurRadius={4}
            />

            {/* 2. 3D Bevel/Thickness (Darker Cream) */}
            <Rect
                x={0}
                y={thickness}
                width={width}
                height={height}
                fill="#D7CCC8" // Wood-like/Dark Cream side
                cornerRadius={5}
                stroke="#A1887F"
                strokeWidth={1}
            />

            {/* 3. Main Face (Warm Cream Gradient) */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fillPriority="linear-gradient"
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: width, y: height }}
                fillLinearGradientColorStops={[0, '#FFFFFF', 1, '#FFF3E0']} // White to Warm Cream
                cornerRadius={5}
                stroke="#EFEBE9" // Subtle highlight edge
                strokeWidth={1}
                shadowColor="black"
                shadowBlur={2}
                shadowOpacity={0.2}
            />

            {/* 4. The Number (Chunky & High Contrast) */}
            <Text
                text={`${data.value}`}
                fontSize={fontSize}
                fontStyle="900" // Extra Bold
                fontFamily="Arial Black, Impact, sans-serif"
                fill={COLOR_MAP[data.color]}
                align="center"
                width={width}
                y={(height - fontSize) / 2 - 2} // Optical center
                listening={false}
                shadowColor="rgba(255,255,255,0.5)"
                shadowBlur={0}
                shadowOffset={{ x: 0.5, y: 0.5 }} // Slight emboss
            />

            {/* 5. Surface Gloss (Plastic Shine) */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={height / 2}
                fill="white"
                opacity={0.15}
                cornerRadius={[5, 5, 20, 20]} // Curver bottom for gloss
                listening={false}
            />
        </Group>
    );
};
