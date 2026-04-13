export const SOUNDS = {
  wave: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3',
  waterdrop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  digital: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  crystal: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  minimal: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
};

export const SoundService = {
  playNotification: () => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') === 'true';
    if (!isEnabled) return;
    
    const selectedSound = localStorage.getItem('proph_notifications_sound_id') || 'waterdrop';
    const soundUrl = SOUNDS[selectedSound as keyof typeof SOUNDS] || SOUNDS.waterdrop;
    
    const audio = new Audio(soundUrl);
    audio.volume = 0.2;
    // Make waterdrop high pitched as requested
    if (selectedSound === 'waterdrop') {
      audio.playbackRate = 1.5;
    }
    audio.play().catch(() => {});
  },
  playSound: (soundId: keyof typeof SOUNDS) => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') === 'true';
    if (!isEnabled) return;

    const soundUrl = SOUNDS[soundId];
    const audio = new Audio(soundUrl);
    audio.volume = 0.2;
    if (soundId === 'waterdrop') {
      audio.playbackRate = 1.5;
    }
    audio.play().catch(() => {});
  },
  playWaterDrop: () => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') === 'true';
    if (!isEnabled) return;

    const audio = new Audio(SOUNDS.waterdrop);
    audio.volume = 0.3;
    audio.playbackRate = 1.5; // High pitch
    audio.play().catch(() => {});
  },
  playWave: () => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') === 'true';
    if (!isEnabled) return;

    const audio = new Audio(SOUNDS.wave);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }
};
