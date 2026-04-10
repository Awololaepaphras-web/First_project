export const SoundService = {
  playNotification: () => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') !== 'false';
    if (!isEnabled) return;
    
    // Wave sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  },
  playWaterDrop: () => {
    const isEnabled = localStorage.getItem('proph_notifications_sound_enabled') !== 'false';
    if (!isEnabled) return;

    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  playWave: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }
};
