import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Arc, Star, Image as KonvaImage } from 'react-konva';
import { Cue } from './Cue';
import type { TileData } from './Tile';
import { useGameStore } from '../../store/gameStore';
import useImage from 'use-image';
import { Chat } from './Chat';
// ...
const [goldFrameImage] = useImage('/assets/premium/gold_frame.svg');
import { socketService } from '../../services/socket';
import { soundManager } from '../../managers/SoundManager';

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

    // Load Assets
    const [goldFrameImage] = useImage('/assets/gold_frame.png');

    // Avatar Component (VIP Style)
    const PlayerAvatar: React.FC<{ player?: any, index: number, isActive: boolean, pos: { x: number, y: number } }> = ({ player, index, isActive, pos }) => {
        const isMe = index === myPlayerIndex; // Identifying self might need logic fix, but for now relying on index passed

        return (
            <Group x={pos.x} y={pos.y}>
                {/* 1. Active Turn Halo (Spinning Gold Glow) */}
                {isActive && (
                    <Circle
                        radius={52}
                        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                        fillRadialGradientStartRadius={30}
                        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                        fillRadialGradientEndRadius={55}
                        fillRadialGradientColorStops={[0, 'rgba(255, 215, 0, 0.6)', 1, 'rgba(255, 215, 0, 0)']}
                        opacity={0.8}
                    />
                )}

                {/* 2. Avatar Frame (Gold/VIP Look - Image Asset) */}
                {goldFrameImage ? (
                    <KonvaImage
                        image={goldFrameImage}
                        width={84}
                        height={84}
                        offsetX={42}
                        offsetY={42}
                        shadowColor="black"
                        shadowBlur={5}
                    />
                ) : (
                    // Fallback while loading
                    <Circle
                        radius={38}
                        stroke="#FFD700"
                        strokeWidth={4}
                        fill={AVATAR_COLORS[index % 4]}
                        shadowColor="black"
                        shadowBlur={5}
                    />
                )}

                {/* Avatar Circle (Masked inside?) - For now just circle on top of background but under frame? 
                    Actually frame should be on top.
                    Let's put avatar image/color UNDER the frame. 
                */}
                <Circle
                    radius={32}
                    fill={AVATAR_COLORS[index % 4]}
                // stroke="rgba(255,255,255,0.8)" // Frame handles border now
                // strokeWidth={2}
                />

                {/* Glossy Overlay on Avatar */}
                <Arc
                    innerRadius={0}
                    outerRadius={38}
                    angle={180}
                    rotation={-45}
                    fill="linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)"
                    opacity={0.3}
                    listening={false}
                />

                {/* 3. Timer Indicator (Ring Progress) */}
                <Arc
                    innerRadius={42}
                    outerRadius={46}
                    angle={360}
                    fill="#333"
                    opacity={0.5}
                />
                {isActive && (
                    <Arc
                        innerRadius={42}
                        outerRadius={46}
                        angle={360 * (timer / 30)}
                        fill={timer < 10 ? "#FF1744" : "#00E676"} // Red/Green
                        rotation={-90}
                        shadowColor={timer < 10 ? "red" : "green"}
                        shadowBlur={10}
                    />
                )}

                {/* 4. Initials / Image Placeholder */}
                <Text
                    text={player?.name?.substring(0, 2).toUpperCase() || "P"}
                    x={-20} y={-10} width={40} align="center"
                    fontSize={24} fontStyle="bold" fill="white"
                    shadowColor="black" shadowBlur={3}
                />

                {/* 5. Level Badge (Star) */}
                <Group x={25} y={-25}>
                    {/* Star Shape - using native Star component instead of Image */}
                    <Star
                        numPoints={5}
                        innerRadius={8}
                        outerRadius={16}
                        fill="#FFD700"
                        stroke="#E65100"
                        strokeWidth={2}
                        shadowBlur={2}
                    />
                    <Text
                        text={player?.level ? `${player.level}` : "1"}
                        fontSize={12} fontStyle="bold" fill="#BF360C"
                        x={-14} y={-6} width={28} align="center"
                    />
                </Group>

                {/* 6. Name Plate (VIP Badge Style) */}
                <Group y={45}>
                    {/* Background Plate */}
                    <Rect
                        x={-60}
                        width={120}
                        height={28}
                        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                        fillLinearGradientEndPoint={{ x: 0, y: 28 }}
                        fillLinearGradientColorStops={[0, '#424242', 1, '#212121']}
                        cornerRadius={14}
                        stroke="#FFD700"
                        strokeWidth={2}
                        shadowColor="black"
                        shadowBlur={4}
                    />
                    <Text
                        text={player?.name || "Waiting..."}
                        y={7} width={120} x={-60} align="center"
                        fontSize={14} fontStyle="bold" fill="#FFD700" // Gold Text
                        shadowColor="black" shadowBlur={1}
                    />
                </Group>

                {/* 7. Money/Chips Display */}
                <Group y={75}>
                    <Rect x={-40} width={80} height={20} fill="rgba(0,0,0,0.5)" cornerRadius={10} />
                    <Text
                        text={player?.score ? `${player.score} ` : "0"}
                        y={4} width={80} x={-40} align="center"
                        fontSize={11} fill="#FFF"
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

    if (!isInGame) return <div className="text-white flex items-center justify-center h-full font-bold text-xl tracking-widest animate-pulse">CONNECTING TO ROOM...</div>;

    return (
        <div className="relative w-full h-full bg-pattern-felt overflow-hidden">
            {/* CSS Wood Border (Top/Bottom) - More realistic than Canvas Rect */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-wood shadow-lg z-10 border-b border-black/50"></div>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-wood shadow-lg z-10 border-t border-black/50"></div>


            <Stage width={stageSize.width} height={stageSize.height} style={{ background: 'transparent' }}>
                <Layer>

                    {/* ISOLATION MODE: Commenting out everything else to verify Canvas works */}

                    {/* 2. Center Area (Deck & Indicator) */}
                    <Group x={centerX} y={centerY}>
                        {/* Deck - 3D Stack Look */}
                        <Group x={-60} y={-50} onClick={handleDrawTile} onTap={handleDrawTile}>
                            {/* Shadow */}
                            <Rect x={4} y={4} width={50} height={70} fill="black" opacity={0.3} cornerRadius={4} blurRadius={4} />

                            {/* Stack effect */}
                            <Rect x={2} y={-2} width={50} height={70} fill="#4E342E" stroke="#3E2723" strokeWidth={1} cornerRadius={4} />
                            <Rect x={1} y={-1} width={50} height={70} fill="#5D4037" stroke="#4E342E" strokeWidth={1} cornerRadius={4} />

                            {/* Top Card */}
                            <Rect width={50} height={70} fill="linear-gradient(to bottom right, #6D4C41, #3E2723)" cornerRadius={4} shadowBlur={2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                            {/* Pattern/Logo on Deck */}
                            <Rect x={10} y={15} width={30} height={40} stroke="rgba(0,0,0,0.2)" strokeWidth={2} cornerRadius={2} />
                            <Text text="OKEY" fill="rgba(255,255,255,0.4)" fontSize={10} fontStyle="bold" x={10} y={30} width={30} align="center" />
                        </Group>

                        {/* Indicator */}
                        <Group x={20} y={-50}>
                            {/* Shadow */}
                            <Rect x={4} y={4} width={50} height={70} fill="black" opacity={0.3} cornerRadius={4} blurRadius={4} />

                            {/* Tile Base */}
                            <Rect width={50} height={70} fill="#F5F5F0" cornerRadius={4} shadowBlur={2} />
                            {centerTile && (
                                <>
                                    <Text
                                        text={`${centerTile.value}`}
                                        fontSize={32}
                                        fontStyle="bold"
                                        fill={centerTile.color === 'red' ? '#D50000' : centerTile.color === 'black' ? '#212121' : centerTile.color === 'blue' ? '#1565C0' : '#FFA000'}
                                        x={0} y={12} width={50} align="center"
                                        shadowColor="rgba(0,0,0,0.1)" shadowBlur={1} shadowOffset={{ x: 0, y: 1 }}
                                    />
                                    <Rect x={10} y={50} width={30} height={4} fill={centerTile.color === 'red' ? '#D50000' : centerTile.color === 'black' ? '#212121' : centerTile.color === 'blue' ? '#1565C0' : '#FFA000'} cornerRadius={2} opacity={0.5} />
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
                        y={stageSize.height - 130}
                        width={stageSize.width}
                        scale={cueScale}
                        isMyTurn={isMyTurn}
                        onTileDragEnd={handleTileDragEnd}
                        onSort={sortHand}
                    />

                    {/* 5. Turn Indicator Message */}
                    {
                        isMyTurn && (
                            <Group x={centerX} y={centerY + 90}>
                                <Rect
                                    x={-100} y={-20} width={200} height={40}
                                    fill="rgba(0,0,0,0.6)" cornerRadius={20}
                                    shadowBlur={10} shadowColor="black"
                                />
                                <Text
                                    text="SIRA SİZDE"
                                    fontSize={24} fontStyle="bold"
                                    fill="#FFD700"
                                    width={200} x={-100} y={-10} align="center"
                                    shadowColor="#FF6F00" shadowBlur={10}
                                />
                            </Group>
                        )
                    }
                </Layer >
            </Stage >
        </div>
    );
};
