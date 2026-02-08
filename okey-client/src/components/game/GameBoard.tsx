import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Arc, Image as KonvaImage } from 'react-konva';
import { Cue } from './Cue';
import type { TileData } from './Tile';
import { useGameStore } from '../../store/gameStore';
import { Chat } from './Chat';
import { socketService } from '../../services/socket';
import { soundManager } from '../../managers/SoundManager';
import useImage from 'use-image';

// --- Assets & Constants ---
const TABLE_COLOR = '#1A4D2E'; // Pro Felt Green
const AVATAR_COLORS = ['#FF5252', '#448AFF', '#69F0AE', '#FFD740'];

// Helper for Layout
const getRelativePos = (myIndex: number, targetIndex: number, total: number = 4) => {
    return (targetIndex - myIndex + total) % total;
};

export const GameBoard: React.FC = () => {
    const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Global State
    const { myHand, turn, centerTile, players, myPlayerId, moveTile, sortHand, isInGame } = useGameStore();

    // Local State
    const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
    // Timer state for "Tension"
    const [timer, setTimer] = useState(30);

    // Dervied
    const myPlayerIndex = players?.findIndex(p => p.id === myPlayerId) || 0;
    const isMyTurn = turn === myPlayerId;

    // Resize Handler
    useEffect(() => {
        const handleResize = () => setStageSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Layout Constants
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const cueWidth = 800;
    const cueScale = Math.min(1, stageSize.width / 850); // Responsive Cue
    const cueX = centerX - (cueWidth * cueScale) / 2;
    const cueY = stageSize.height - (120 * cueScale);

    // --- Sound Effects ---
    useEffect(() => {
        if (isInGame && myHand.length > 0) {
            soundManager.play('deal'); // Play deal sound when game starts/hand populates
        }
    }, [isInGame, myHand.length]);

    // --- Actions ---
    const handleDrawTile = () => {
        if (!isMyTurn) return;
        soundManager.play('click');
        socketService.emit('draw_tile', { roomId: useGameStore.getState().roomId, source: 'center' });
    };

    const handleTileDragStart = (e: any) => {
        setDraggedTileId(e.target.attrs.name); // We need to set name on tile
    };

    const handleTileDragEnd = (tileId: string, e: any) => {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // 1. Check Drop on Cue (Snap to Grid)
        // Convert to Cue Local coords
        // Cue is at cueX, cueY
        const localX = (pointer.x - cueX) / cueScale;
        const localY = (pointer.y - cueY) / cueScale;

        // Cue Layout Logic (must match Cue.tsx)
        // Row 1: y=20, Row 2: y=80. Spacing 45.
        // Hittest roughly
        if (localX > 0 && localX < cueWidth && localY > 0 && localY < 150) {
            // Find closest slot
            let bestIndex = -1;
            let minDirectDist = Infinity;

            for (let i = 0; i < 22; i++) {
                const row = Math.floor(i / 11);
                const col = i % 11;
                const slotX = 20 + col * 45;
                const slotY = 20 + row * 60;

                const dist = Math.sqrt(Math.pow(localX - slotX, 2) + Math.pow(localY - slotY, 2));
                if (dist < 40) { // Within 40px radius
                    if (dist < minDirectDist) {
                        minDirectDist = dist;
                        bestIndex = i;
                    }
                }
            }

            if (bestIndex !== -1) {
                // Find source index
                const sourceIndex = myHand.findIndex(t => t?.id === tileId);
                if (sourceIndex !== -1 && sourceIndex !== bestIndex) {
                    moveTile(tileId, bestIndex);
                    // Visual Snap is handled by React re-render of Cue
                }
                // Reset drag visual managed by Konva is tricky. 
                // We rely on component re-render to put tile in new place.
                // But Konva node might stay offset. We usually need to reset position.
                e.target.position({ x: 0, y: 0 }); // Relative to group? Tile is in Group?
                // Actually Tile is child of Cue Group. 
                // If we move it in array, it gets new props (x, y). 
                // We just need to zero the drag offset? 
                e.target.x(0); e.target.y(0); // Reset local drag
            }
        }

        // 2. Check Drop on Finish (Center)
        const distToCenter = Math.sqrt(Math.pow(pointer.x - centerX, 2) + Math.pow(pointer.y - centerY, 2));
        if (distToCenter < 100) {
            if (isMyTurn) {
                soundManager.play('discard');
                // Finish Logic
                const remainingHand = myHand.map(t => (t && t.id === tileId) ? null : t);
                socketService.emit('finish_game', { roomId: useGameStore.getState().roomId, hand: remainingHand });
            }
        }

        soundManager.play('click'); // Generic click for drop
        setDraggedTileId(null);
    };

    // --- Sub-Components (Inline for simplicity or split later) ---

    // Avatar Component
    const PlayerAvatar: React.FC<{ player?: any, index: number, isActive: boolean, pos: { x: number, y: number } }> = ({ player, index, isActive, pos }) => {
        return (
            <Group x={pos.x} y={pos.y}>
                {/* Active Turn Glow */}
                {isActive && (
                    <Circle
                        radius={42}
                        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                        fillRadialGradientStartRadius={20}
                        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                        fillRadialGradientEndRadius={45}
                        fillRadialGradientColorStops={[0, 'rgba(255, 215, 0, 0.2)', 1, 'rgba(255, 215, 0, 0)']}
                    />
                )}

                {/* 2. Timer Ring (Counts down from 30s) - Visual Only for now */}
                {/* We need a real timer sync. For now, using static visual or simple local countdown */}
                {/* Center Timer Text */}
                <Group>
                    <Arc
                        innerRadius={55}
                        outerRadius={65}
                        angle={360 * (timer / 30)}
                        fill={timer < 10 ? "#ff0000" : "#ffd700"}
                        opacity={0.8}
                        rotation={-90}
                        shadowBlur={timer < 10 ? 20 : 0}
                        shadowColor="red"
                    />
                    {/* Heartbeat Animation for Low Time */}
                    {timer < 10 && (
                        <Arc
                            innerRadius={55}
                            outerRadius={70}
                            angle={360}
                            fill="red"
                            opacity={0.2}
                            rotation={-90}
                            listening={false}
                        />
                    )}
                </Group>


                {/* Ring Timer Background */}
                <Arc
                    innerRadius={36}
                    outerRadius={40}
                    angle={360}
                    fill="rgba(255,255,255,0.1)"
                    rotation={0}
                    listening={false}
                />

                {/* Active Ring Timer (Progress) - Reference Video Style */}
                {isActive && (
                    <Arc
                        innerRadius={36}
                        outerRadius={40}
                        angle={300} // Mock progress (should decrease over time)
                        fill="#FFD700" // Gold
                        rotation={-90}
                        shadowColor="#FFD700"
                        shadowBlur={10}
                        listening={false}
                    />
                )}

                {/* Avatar Circle (Glassy Look) */}
                <Circle
                    radius={32}
                    fill={AVATAR_COLORS[index % 4]}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={2}
                    shadowColor="black"
                    shadowBlur={5}
                />

                {/* Initials */}
                <Text
                    text={player?.name?.substring(0, 2).toUpperCase() || "P"}
                    x={-15} y={-10} width={30} align="center"
                    fontSize={20} fontStyle="bold" fill="white"
                    shadowColor="black" shadowBlur={2}
                />

                {/* Glass UI Name Tag */}
                <Group y={40}>
                    <Rect
                        x={-50}
                        width={100}
                        height={24}
                        fill="rgba(0,0,0,0.6)"
                        cornerRadius={12}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                    />
                    <Text
                        text={player?.name || "Waiting..."}
                        y={6} width={100} x={-50} align="center"
                        fontSize={12} fill="#EEE"
                        fontFamily="Arial"
                    />
                </Group>

                {/* Score Bubble */}
                <Group x={30} y={-30}>
                    <Circle radius={12} fill="#D32F2F" stroke="white" strokeWidth={1} shadowBlur={2} />
                    <Text
                        text={player?.score ? `${player.score} ` : "0"}
                        x={-12} y={-5} width={24} align="center"
                        fontSize={10} fontStyle="bold" fill="white"
                    />
                </Group>
            </Group>
        );
    };

    // Render Players based on relative position
    const renderPlayers = () => {
        // defined positions for 4 players: Bottom (Me), Right, Top, Left
        // But Me is handled separately via Cue. We only render avatars for Opponents? 
        // Or render myself too? Small avatar for me is good.

        // Positions relative to center
        const radius = Math.min(stageSize.width, stageSize.height) / 2 - 60;
        const positions = [
            { x: centerX, y: stageSize.height - 60 }, // Bottom (Me)
            { x: stageSize.width - 60, y: centerY }, // Right
            { x: centerX, y: 60 },           // Top
            { x: 60, y: centerY }            // Left
        ];

        return players.map((p, i) => {
            const relIndex = getRelativePos(myPlayerIndex, i, 4);
            const isTurn = p.id === turn;

            // Don't render "Me" avatar if we want just Cue? 
            // Let's render "Me" avatar to visual feedback of turn/score
            // Adjust Bottom position to Left-Bottom to avoid Cue
            if (relIndex === 0) positions[0] = { x: 80, y: stageSize.height - 80 };

            return (
                <PlayerAvatar
                    key={p.id}
                    player={p}
                    index={i}
                    isActive={isTurn}
                    pos={positions[relIndex]}
                />
            );
        });
    };

    // Shake Effect state
    const [shake, setShake] = useState(0);

    // Global Event Listener for Errors
    useEffect(() => {
        const handleError = (data: any) => {
            // Trigger Shake
            setShake(5);
            setTimeout(() => setShake(-5), 50);
            setTimeout(() => setShake(5), 100);
            setTimeout(() => setShake(0), 150);

            // Show Toast (TODO)
            console.log("Error:", data.message);
        };

        socketService.on('error', handleError);
        return () => {
            socketService.off('error', handleError);
        };
    }, []);

    // ... existing timer logic ...
    useEffect(() => {
        let interval: any;
        if (isMyTurn && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (!isMyTurn) {
            setTimer(30);
        }
        return () => clearInterval(interval);
    }, [isMyTurn, timer]);

    if (!isInGame) return <div className="text-white flex items-center justify-center h-full">Connecting...</div>;

    return (
        <Stage width={stageSize.width} height={stageSize.height}>
            <Layer>
                {/* 1. Pro Table Background */}
                <Rect width={stageSize.width} height={stageSize.height} fill="#0e0e0e" />

                {/* Felt Texture Pattern */}
                <Rect
                    width={stageSize.width}
                    height={stageSize.height}
                    fillRadialGradientStartPoint={{ x: centerX, y: centerY }}
                    fillRadialGradientStartRadius={100}
                    fillRadialGradientEndPoint={{ x: centerX, y: centerY }}
                    fillRadialGradientEndRadius={stageSize.width * 0.8}
                    fillRadialGradientColorStops={[0, '#1B5E20', 0.8, '#0A3311', 1, '#051A09']}
                />

                {/* Wood Frame Border */}
                <Rect
                    x={0} y={0} width={stageSize.width} height={20} fill="#3E2723"
                    shadowBlur={10}
                />
                <Rect
                    x={0} y={stageSize.height - 20} width={stageSize.width} height={20} fill="#3E2723"
                    shadowBlur={10}
                />

                {/* 2. Center Area (Deck & Indicator) */}
                <Group x={centerX} y={centerY}>
                    {/* Deck */}
                    <Group x={-60} y={-40} onClick={handleDrawTile} onTap={handleDrawTile}>
                        <Rect width={60} height={80} fill="#3E2723" cornerRadius={4} shadowBlur={5} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                        <Rect width={60} height={80} fill="#5D4037" cornerRadius={4} x={-4} y={-2} shadowBlur={5} />
                        <Text text="DECK" fill="beige" fontSize={12} x={5} y={30} opacity={0.5} />
                    </Group>

                    {/* Indicator */}
                    <Group x={20} y={-40}>
                        <Rect width={50} height={70} fill="#FAFAFA" cornerRadius={4} shadowBlur={5} />
                        {centerTile && (
                            <>
                                <Text text={`${centerTile.value} `} fontSize={30} fontStyle="bold" fill={centerTile.color === 'red' ? '#E53935' : centerTile.color === 'black' ? '#212121' : centerTile.color === 'blue' ? '#1E88E5' : '#FBC02D'} x={10} y={15} />
                                <Text text="GÖSTERGE" fontSize={10} fill="gray" x={-5} y={75} width={60} align="center" />
                            </>
                        )}
                    </Group>
                </Group>

                {/* 3. Players */}
                {renderPlayers()}

                {/* 4. My Cue (Istaka) */}
                <Cue
                    tiles={myHand}
                    x={cueX}
                    y={stageSize.height - 130} // 130px from bottom logic ?
                    // Actually we set proper positions in Cue component or pass props
                    width={stageSize.width}
                    scale={1}
                    isMyTurn={isMyTurn}
                    onTileDragEnd={handleTileDragEnd}
                    onSort={sortHand}
                />

                {/* 5. Turn Indicator Text */}
                {
                    isMyTurn && (
                        <Text
                            text="SIRA SİZDE"
                            fontSize={32} fontStyle="bold"
                            fill="white" stroke="black" strokeWidth={1}
                            x={centerX - 100} y={centerY + 80}
                            shadowColor="#4CAF50" shadowBlur={20}
                            opacity={0.9}
                        />
                    )
                }
            </Layer >
        </Stage >
    );
};
