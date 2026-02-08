import React, { useRef, useEffect } from 'react';
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
    const thickness = 6 * scale;
    const fontSize = 34 * scale;

    const groupRef = useRef<any>(null);

    // Simple "Fly-in" effect using Konva native transition
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.to({
                scaleX: scale,
                scaleY: scale,
                duration: 0.3,
                easing: 'BackEaseOut'
            });
        }
    }, [scale]);

    return (
        <Group
            ref={groupRef}
            x={x}
            y={y}
            scaleX={0} // Start small for pop effect
            scaleY={0}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* 1. Shadow (Drop Shadow for depth on table) */}
            <Rect
                x={2}
                y={2}
                width={width}
                height={height}
                fill="rgba(0,0,0,0.4)"
                cornerRadius={4}
                blurRadius={2}
            />

            {/* 2. 3D Side/Thickness (The plastic body) */}
            <Rect
                x={0}
                y={thickness} // Shifted down
                width={width}
                height={height}
                fill="#E0E0E0" // Darker cream for side
                cornerRadius={4}
            />

            {/* 3. Main Face (The Top Surface) */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
                fillRadialGradientEndRadius={width}
                fillRadialGradientColorStops={[0, '#FFFFFF', 1, '#F5F5F0']} // Subtle gradient: White Center -> Cream Edge
                cornerRadius={4}
                shadowColor="rgba(0,0,0,0.1)"
                shadowBlur={2}
                shadowOffset={{ x: 0, y: 1 }}
            />

            {/* 4. The Number (High Contrast, Bold) */}
            <Text
                text={`${data.value}`}
                fontSize={fontSize}
                fontStyle="bold"
                fontFamily="Arial, sans-serif" // Video uses a standard clean sans
                fill={COLOR_MAP[data.color]}
                align="center"
                width={width}
                y={(height - fontSize) / 2 - 2} // Vertically centered visually
                listening={false}
            />

            {/* 5. Shine / Gloss Highlight (Top half reflection) */}
            <Rect
                x={2}
                y={2}
                width={width - 4}
                height={height / 3}
                fill="white"
                opacity={0.15} // Glassy look
                cornerRadius={[4, 4, 10, 10]}
                listening={false}
            />

            {/* 6. Subtle Bottom ID (Optional, for realism if video has small markings) */}
            {/* <Rect x={(width-8)/2} y={height-6} width={8} height={2} fill={COLOR_MAP[data.color]} opacity={0.5} /> */}
        </Group>
    );
};
