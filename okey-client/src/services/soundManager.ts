import { Howl } from 'howler';

class SoundManager {
    private sounds: { [key: string]: Howl } = {};
    private muted: boolean = false;

    constructor() {
        this.loadSounds();
    }

    private loadSounds() {
        // High quality placeholders from mixkit (free license)
        this.sounds['click'] = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'] });
        this.sounds['distribute'] = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'] });
        this.sounds['discard'] = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'] });
        this.sounds['win'] = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] });
    }

    play(soundName: string) {
        if (this.muted) return;
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        Howler.mute(this.muted);
        return this.muted;
    }
}

export const soundManager = new SoundManager();
