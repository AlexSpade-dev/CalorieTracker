import { createAudioPlayer } from 'expo-audio';

let player = null;
let last = 0;

// short chime; ignores calls within 800ms so a toast + bell update don't double-ring
export function playNotify() {
  const now = Date.now();
  if (now - last < 800) return;
  last = now;
  try {
    if (!player) player = createAudioPlayer(require('../../assets/sounds/notify.wav'));
    player.seekTo(0);
    player.play();
  } catch (e) { /* sound is optional, never crash the app */ }
}