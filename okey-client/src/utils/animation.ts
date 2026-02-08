import Konva from 'konva';

export const animeteFlyIn = (node: Konva.Node, targetX: number, targetY: number, delay: number) => {
    // Start from center (approx 0,0 relative to stage, but node is in Group?)
    // If node is in Cue Group, 0,0 is Cue Top-Left.
    // Center of stage relative to Cue:
    // CueX, CueY are known. Center is (StageW/2, StageH/2).
    // LocalCenter = (StageW/2 - CueX, StageH/2 - CueY).

    // We assume node starts at "somewhere else" and tweens to targetX, targetY.
    // For React-Konva, we usually use refs.

    node.to({
        x: targetX,
        y: targetY,
        opacity: 1,
        duration: 0.5,
        easing: Konva.Easings.BackEaseOut,
        delay: delay
    });
};
