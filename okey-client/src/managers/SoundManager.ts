import { Howl } from 'howler';

class SoundManager {
    private sounds: Record<string, Howl> = {};
    private enabled: boolean = true;

    constructor() {
        this.loadSounds();
    }

    private loadSounds() {
        // We will assume sounds are in /sounds/ folder in public
        // You generally want to use a sprite or individual files
        this.sounds = {
            click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.5 }),
            deal: new Howl({ src: ['/sounds/deal.mp3'], volume: 0.4 }),
            draw: new Howl({ src: ['/sounds/draw.mp3'], volume: 0.6 }),
            discard: new Howl({ src: ['/sounds/discard.mp3'], volume: 0.6 }),
            win: new Howl({ src: ['/sounds/win.mp3'], volume: 0.8 }),
            lose: new Howl({ src: ['/sounds/lose.mp3'], volume: 0.8 }),
            alert: new Howl({ src: ['/sounds/alert.mp3'], volume: 0.7 }),
            bgm: new Howl({ src: ['/sounds/bgm.mp3'], volume: 0.2, loop: true }),
        };
    }

    public play(soundName: string) {
        if (!this.enabled) return;
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }

    public toggleMute() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            Howler.mute(true);
        } else {
            Howler.mute(false);
        }
        return this.enabled;
    }
}

export const soundManager = new SoundManager();
