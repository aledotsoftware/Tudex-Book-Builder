
const AudioController = (function() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.1;

    function playTone(freq, type, duration, slide=0) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if(slide !== 0) {
            osc.frequency.exponentialRampToValueAtTime(freq + slide, audioCtx.currentTime + duration);
        }

        oscGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    return {
        playStart: () => {
            playTone(400, 'sine', 0.1);
            setTimeout(() => playTone(600, 'sine', 0.2), 100);
        },
        playLose: () => {
            playTone(300, 'sawtooth', 0.3, -100);
            setTimeout(() => playTone(150, 'sawtooth', 0.4, -50), 200);
        },
        playScore: () => playTone(800, 'sine', 0.1, 100),
        playBounce: () => playTone(200, 'square', 0.05, -50),
        playClick: () => playTone(500, 'triangle', 0.05)
    };
})();
