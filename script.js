let isPlaying = false;
let step = 0;

// 音源設定
const clickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" }
}).toDestination();

const hihat = new Tone.NoiseSynth({
    volume: -10,
    envelope: { decay: 0.05 }
}).toDestination();

// 8分音符単位でループを回す
const loop = new Tone.Loop((time) => {
    const isJazzMode = document.getElementById('jazzMode').checked;
    
    // stepは 0, 1, 2, 3, 4, 5, 6, 7 (1小節に8分音符が8個)
    if (isJazzMode) {
        // 8分音符の「2番目」と「4番目」を強調する場合
        if (step === 1 || step === 3 || step === 5|| step === 7) {
            clickSynth.triggerAttackRelease("C3", "32n", time, 1.0); // 強音
            hihat.triggerAttackRelease("32n", time);
        } else {
            clickSynth.triggerAttackRelease("G2", "32n", time, 0.2); // 弱音
        }
    } else {
        // 通常モード（4分音符の頭だけ鳴らす）
        if (step % 2 === 0) {
            clickSynth.triggerAttackRelease("G2", "32n", time, 0.6);
        }
    }

    // ビジュアル更新（ドットを8個にするか、計算で4個に割り振る）
    Tone.Draw.schedule(() => {
        const dots = document.querySelectorAll('.beat-dot');
        dots.forEach(d => d.classList.remove('active', 'accent'));
        
        // 8分音符のインデックスを4つのドットにマッピング
        const dotIndex = Math.floor(step / 2);
        const dot = document.getElementById(`dot-${dotIndex}`);
        if (step === 1 || step === 3 || step === 5|| step === 7) {
            dot.classList.add('accent');
        } else if (step % 2 === 0) {
            dot.classList.add('active');
        }
    }, time);

    step = (step + 1) % 8; // 8カウントでリセット
}, "8n"); // ここを 8分音符(8n) に変更

// コントロール
const startBtn = document.getElementById('startBtn');
const bpmSlider = document.getElementById('bpmSlider');
const bpmValue = document.getElementById('bpmValue');

bpmSlider.addEventListener('input', (e) => {
    const bpm = e.target.value;
    bpmValue.innerText = bpm;
    Tone.Transport.bpm.value = bpm;
});

startBtn.addEventListener('click', async () => {
    if (!isPlaying) {
        await Tone.start(); // AudioContextの開始
        step = 0;
        Tone.Transport.start();
        loop.start(0);
        startBtn.innerText = "STOP";
        startBtn.classList.add('stop');
        isPlaying = true;
    } else {
        Tone.Transport.stop();
        loop.stop();
        startBtn.innerText = "START";
        startBtn.classList.remove('stop');
        isPlaying = false;
        document.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active', 'accent'));
    }
});