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

// 1. 音源を金属音専用の MetalSynth に変更
const accentSynth = new Tone.MetalSynth({
    frequency: 200,      // 基本の高さ
    envelope: {
        attack: 0.001,   // 立ち上がりを最速にして「キーン」とさせる
        decay: 0.1,      // 余韻の長さ
        release: 0.1
    },
    harmonicity: 5.1,    // 倍音の複雑さ（金属感のキモ）
    modulationIndex: 32, // ギラつき具合
    resonance: 4000,     // 響く周波数（高くすると鋭くなる）
    octaves: 1.5
}).toDestination();

// 2. 通常の拍（弱拍）用のクリック音（少し控えめな金属音）
const lowSynth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    oscillator: { type: "sine" },
    volume: -10
}).toDestination();

// 3. ループ内の鳴らし分け
const loop = new Tone.Loop((time) => {
    const isJazzMode = document.getElementById('jazzMode').checked;
    
    // step 0-7 (8分音符カウント)
    if (isJazzMode) {
        if (step % 2 === 0) {
            // 表拍はコンコンと低めに
            lowSynth.triggerAttackRelease("G2", "32n", time, 0.3);
        }else{
            // 2・4拍目の裏などで「キーン！」と鳴らす
            accentSynth.triggerAttackRelease("C4", "32n", time, 1.0);
        }
    }else {
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
        if (step % 2 === 0) {
            dot.classList.add('active');
        }else{
            dot.classList.add('accent');
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