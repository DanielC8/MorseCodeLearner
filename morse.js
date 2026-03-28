// === Morse Code Data ===
const MORSE_MAP = {
  A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',
  F: '..-.',  G: '--.',   H: '....',  I: '..',    J: '.---',
  K: '-.-',   L: '.-..',  M: '--',    N: '-.',    O: '---',
  P: '.--.',  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
  U: '..-',   V: '...-',  W: '.--',   X: '-..-',  Y: '-.--',
  Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};

const REVERSE_MAP = {};
for (const [char, code] of Object.entries(MORSE_MAP)) {
  REVERSE_MAP[code] = char;
}

// Simple words for quizzes
const EASY_WORDS = [
  'CAT', 'DOG', 'SUN', 'HI', 'GO', 'RUN', 'FUN', 'BIG', 'RED', 'HAT',
  'SIT', 'CUP', 'MAP', 'PEN', 'BUS', 'TOY', 'YES', 'NO', 'HOP', 'JAM',
  'NET', 'LOG', 'BED', 'BOX', 'ZIP', 'WIN', 'MOM', 'DAD', 'PET', 'EAR'
];

// Simple phrases for quizzes
const EASY_PHRASES = [
  'GOOD JOB', 'WELL DONE', 'HI MOM', 'HI DAD', 'GO BIG', 'RED HAT',
  'BIG DOG', 'HOT SUN', 'RUN FAST', 'PET CAT', 'FUN DAY', 'YES SIR',
  'NO WAY', 'BUS STOP', 'RED BOX', 'TOP DOG', 'BIG WIN', 'GO HOME',
  'SIT DOWN', 'GET UP', 'COME IN', 'SAY HI', 'BE KIND', 'HAVE FUN'
];

// === Audio (Web Audio API) ===
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(duration, time) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 600;
  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration);
}

function playMorseAudio(morseStr, onDone) {
  const ctx = getAudioCtx();
  const dotLen = 0.1;
  let time = ctx.currentTime + 0.05;

  for (let i = 0; i < morseStr.length; i++) {
    const ch = morseStr[i];
    if (ch === '.') {
      playTone(dotLen, time);
      time += dotLen + dotLen; // symbol gap
    } else if (ch === '-') {
      playTone(dotLen * 3, time);
      time += dotLen * 3 + dotLen;
    } else if (ch === ' ') {
      time += dotLen * 3; // letter gap (total 3 extra units)
    } else if (ch === '/') {
      time += dotLen * 7; // word gap
    }
  }

  if (onDone) {
    setTimeout(onDone, (time - ctx.currentTime) * 1000 + 100);
  }
}

// === Utility ===
function textToMorse(text) {
  return text.toUpperCase().split('').map(ch => {
    if (ch === ' ') return '/';
    return MORSE_MAP[ch] || '';
  }).filter(Boolean).join(' ');
}

function morseToText(morse) {
  return morse.trim().split(/\s+/).map(code => {
    if (code === '/' || code === '|') return ' ';
    return REVERSE_MAP[code] || '?';
  }).join('');
}

function buildMorseVisual(morseStr) {
  const container = document.createElement('div');
  container.className = 'morse-visual';
  for (const ch of morseStr) {
    if (ch === '.') {
      const el = document.createElement('div');
      el.className = 'dot';
      container.appendChild(el);
    } else if (ch === '-') {
      const el = document.createElement('div');
      el.className = 'dash';
      container.appendChild(el);
    }
  }
  return container;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// === Navigation ===
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.section;
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(s => {
      s.classList.toggle('active', s.id === target);
    });
  });
});

// === Learn Section: Letter Grid ===
const letterGrid = document.getElementById('letter-grid');
const letterDisplay = document.getElementById('letter-display');
const displayLetter = document.getElementById('display-letter');
const displayMorse = document.getElementById('display-morse');
const displayVisual = document.getElementById('display-visual');
const playLetterBtn = document.getElementById('play-letter-btn');

let selectedLetterBtn = null;
let currentLetterMorse = '';

const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
for (const ch of allChars) {
  const btn = document.createElement('button');
  btn.textContent = ch;
  btn.addEventListener('click', () => {
    if (selectedLetterBtn) selectedLetterBtn.classList.remove('selected');
    btn.classList.add('selected');
    selectedLetterBtn = btn;

    const morse = MORSE_MAP[ch];
    currentLetterMorse = morse;
    displayLetter.textContent = ch;
    displayMorse.textContent = morse;
    displayVisual.innerHTML = '';
    displayVisual.appendChild(buildMorseVisual(morse));
    letterDisplay.classList.remove('hidden');
  });
  letterGrid.appendChild(btn);
}

playLetterBtn.addEventListener('click', () => {
  if (currentLetterMorse) playMorseAudio(currentLetterMorse);
});

// === Reference Chart ===
const refGrid = document.getElementById('ref-grid');
for (const [char, morse] of Object.entries(MORSE_MAP)) {
  const card = document.createElement('div');
  card.className = 'ref-card';
  card.innerHTML = `<div class="char">${char}</div><div class="morse">${morse}</div>`;
  card.addEventListener('click', () => playMorseAudio(morse));
  refGrid.appendChild(card);
}

// === Encode Section ===
const encodeInput = document.getElementById('encode-input');
const encodeBtn = document.getElementById('encode-btn');
const encodeOutput = document.getElementById('encode-output');
const encodePlayBtn = document.getElementById('encode-play-btn');
let lastEncodedMorse = '';

encodeBtn.addEventListener('click', () => {
  const text = encodeInput.value.trim();
  if (!text) return;
  lastEncodedMorse = textToMorse(text);
  encodeOutput.textContent = lastEncodedMorse;
  encodePlayBtn.classList.remove('hidden');
});

encodePlayBtn.addEventListener('click', () => {
  if (lastEncodedMorse) playMorseAudio(lastEncodedMorse);
});

// === Decode Section ===
const decodeInput = document.getElementById('decode-input');
const decodeBtn = document.getElementById('decode-btn');
const decodeOutput = document.getElementById('decode-output');

decodeBtn.addEventListener('click', () => {
  const morse = decodeInput.value.trim();
  if (!morse) return;
  decodeOutput.textContent = morseToText(morse);
});

// === Quiz Section ===
const quizModeBtns = document.querySelectorAll('.mode-btn');
const quizPrompt = document.getElementById('quiz-prompt');
const quizChoices = document.getElementById('quiz-choices');
const quizTextInput = document.getElementById('quiz-text-input');
const quizSubmit = document.getElementById('quiz-submit');
const quizFeedback = document.getElementById('quiz-feedback');
const quizNext = document.getElementById('quiz-next');
const quizCorrectEl = document.getElementById('quiz-correct');
const quizTotalEl = document.getElementById('quiz-total');
const quizStreakEl = document.getElementById('quiz-streak');
const streakFire = document.getElementById('streak-fire');

let quizMode = 'letter-to-morse';
let quizAnswer = '';
let quizCorrect = 0;
let quizTotal = 0;
let quizStreak = 0;

quizModeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    quizModeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    quizMode = btn.dataset.mode;
    quizCorrect = 0;
    quizTotal = 0;
    quizStreak = 0;
    updateQuizScore();
    generateQuiz();
  });
});

function updateQuizScore() {
  quizCorrectEl.textContent = quizCorrect;
  quizTotalEl.textContent = quizTotal;
  quizStreakEl.textContent = quizStreak;
  streakFire.classList.toggle('hidden', quizStreak < 3);
}

function generateQuiz() {
  quizFeedback.textContent = '';
  quizFeedback.className = 'quiz-feedback';
  quizNext.classList.add('hidden');
  quizChoices.innerHTML = '';
  quizTextInput.classList.add('hidden');
  quizSubmit.classList.add('hidden');
  quizTextInput.value = '';
  quizTextInput.disabled = false;

  const letters = Object.keys(MORSE_MAP);

  if (quizMode === 'letter-to-morse') {
    const letter = randomItem(letters);
    quizAnswer = MORSE_MAP[letter];
    quizPrompt.textContent = letter;
    quizPrompt.style.letterSpacing = '0';

    // Generate 4 choices
    const choices = [quizAnswer];
    while (choices.length < 4) {
      const c = MORSE_MAP[randomItem(letters)];
      if (!choices.includes(c)) choices.push(c);
    }
    renderChoices(shuffle(choices));

  } else if (quizMode === 'morse-to-letter') {
    const letter = randomItem(letters);
    quizAnswer = letter;
    quizPrompt.textContent = MORSE_MAP[letter];
    quizPrompt.style.letterSpacing = '6px';

    const choices = [letter];
    while (choices.length < 4) {
      const c = randomItem(letters);
      if (!choices.includes(c)) choices.push(c);
    }
    renderChoices(shuffle(choices));

  } else if (quizMode === 'word-to-morse') {
    const word = randomItem(EASY_WORDS);
    quizAnswer = textToMorse(word);
    quizPrompt.textContent = word;
    quizPrompt.style.letterSpacing = '4px';

    quizTextInput.classList.remove('hidden');
    quizSubmit.classList.remove('hidden');
    quizTextInput.placeholder = 'Type the Morse Code (use . and -)';
    setTimeout(() => quizTextInput.focus(), 0);

  } else if (quizMode === 'morse-to-word') {
    const word = randomItem(EASY_WORDS);
    quizAnswer = word;
    quizPrompt.textContent = textToMorse(word);
    quizPrompt.style.letterSpacing = '4px';

    quizTextInput.classList.remove('hidden');
    quizSubmit.classList.remove('hidden');
    quizTextInput.placeholder = 'Type the word';
    setTimeout(() => quizTextInput.focus(), 0);

  } else if (quizMode === 'phrase-to-morse') {
    const phrase = randomItem(EASY_PHRASES);
    quizAnswer = textToMorse(phrase);
    quizPrompt.textContent = phrase;
    quizPrompt.style.letterSpacing = '4px';

    quizTextInput.classList.remove('hidden');
    quizSubmit.classList.remove('hidden');
    quizTextInput.placeholder = 'Type the Morse Code (use . - and / for spaces)';
    setTimeout(() => quizTextInput.focus(), 0);

  } else if (quizMode === 'morse-to-phrase') {
    const phrase = randomItem(EASY_PHRASES);
    quizAnswer = phrase;
    quizPrompt.textContent = textToMorse(phrase);
    quizPrompt.style.letterSpacing = '4px';

    quizTextInput.classList.remove('hidden');
    quizSubmit.classList.remove('hidden');
    quizTextInput.placeholder = 'Type the phrase';
    setTimeout(() => quizTextInput.focus(), 0);
  }
}

function renderChoices(choices) {
  quizChoices.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'quiz-choice-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => checkQuizAnswer(choice, btn));
    quizChoices.appendChild(btn);
  });
}

function checkQuizAnswer(answer, btnEl) {
  quizTotal++;
  const isCorrect = answer.trim().toUpperCase().replace(/\s+/g, ' ') ===
                     quizAnswer.trim().toUpperCase().replace(/\s+/g, ' ');

  if (isCorrect) {
    quizCorrect++;
    quizStreak++;
    quizFeedback.textContent = randomItem(['Correct!', 'Great job!', 'Awesome!', 'You got it!', 'Perfect!']);
    quizFeedback.className = 'quiz-feedback correct';
    if (btnEl) btnEl.classList.add('correct');
  } else {
    quizStreak = 0;
    quizFeedback.textContent = `Not quite! The answer is: ${quizAnswer}`;
    quizFeedback.className = 'quiz-feedback wrong';
    if (btnEl) btnEl.classList.add('wrong');
    // Highlight the correct answer
    document.querySelectorAll('.quiz-choice-btn').forEach(b => {
      if (b.textContent === quizAnswer) b.classList.add('correct');
    });
  }

  // Disable all choice buttons
  document.querySelectorAll('.quiz-choice-btn').forEach(b => b.disabled = true);
  quizSubmit.classList.add('hidden');
  quizTextInput.disabled = true;

  updateQuizScore();
  quizNext.classList.remove('hidden');
  quizNext.focus();
}

quizSubmit.addEventListener('click', () => {
  if (quizTextInput.disabled) return;
  const val = quizTextInput.value.trim();
  if (!val) return;
  checkQuizAnswer(val, null);
});

quizTextInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!quizNext.classList.contains('hidden')) {
      generateQuiz();
    } else if (!quizTextInput.disabled) {
      const val = quizTextInput.value.trim();
      if (val) checkQuizAnswer(val, null);
    }
  }
});

quizNext.addEventListener('click', generateQuiz);

// Start first quiz
generateQuiz();

// === Listen Section ===
const listenPlayBtn = document.getElementById('listen-play');
const listenReplayBtn = document.getElementById('listen-replay');
const listenAnswer = document.getElementById('listen-answer');
const listenCheck = document.getElementById('listen-check');
const listenFeedback = document.getElementById('listen-feedback');
const listenReveal = document.getElementById('listen-reveal');
const listenNext = document.getElementById('listen-next');
const diffBtns = document.querySelectorAll('.diff-btn');

let listenDifficulty = 'easy';
let listenSecret = '';
let listenMorse = '';

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    listenDifficulty = btn.dataset.diff;
  });
});

function generateListenChallenge() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (listenDifficulty === 'easy') {
    listenSecret = letters[Math.floor(Math.random() * letters.length)];
  } else if (listenDifficulty === 'medium') {
    listenSecret = '';
    for (let i = 0; i < 3; i++) {
      listenSecret += letters[Math.floor(Math.random() * letters.length)];
    }
  } else {
    listenSecret = randomItem(EASY_WORDS);
  }
  listenMorse = textToMorse(listenSecret);
}

function resetListenUI() {
  listenFeedback.textContent = '';
  listenFeedback.className = 'quiz-feedback';
  listenAnswer.value = '';
  listenAnswer.disabled = false;
  listenReveal.classList.add('hidden');
  listenNext.classList.add('hidden');
  listenReplayBtn.classList.add('hidden');
}

listenPlayBtn.addEventListener('click', () => {
  generateListenChallenge();
  resetListenUI();
  playMorseAudio(listenMorse);
  listenReplayBtn.classList.remove('hidden');
  listenAnswer.focus();
});

listenReplayBtn.addEventListener('click', () => {
  playMorseAudio(listenMorse);
});

listenCheck.addEventListener('click', () => {
  if (!listenSecret) return;
  const guess = listenAnswer.value.trim().toUpperCase();
  if (!guess) return;

  if (guess === listenSecret) {
    listenFeedback.textContent = randomItem(['Correct!', 'Amazing ears!', 'You decoded it!', 'Great listening!']);
    listenFeedback.className = 'quiz-feedback correct';
  } else {
    listenFeedback.textContent = `Not quite! The answer was: ${listenSecret} (${listenMorse})`;
    listenFeedback.className = 'quiz-feedback wrong';
  }

  listenAnswer.disabled = true;
  listenReveal.classList.add('hidden');
  listenNext.classList.remove('hidden');
});

listenAnswer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!listenNext.classList.contains('hidden')) {
      listenPlayBtn.click();
    } else {
      listenCheck.click();
    }
  }
});

listenReveal.addEventListener('click', () => {
  listenFeedback.textContent = `The answer is: ${listenSecret} (${listenMorse})`;
  listenFeedback.className = 'quiz-feedback';
  listenAnswer.disabled = true;
  listenNext.classList.remove('hidden');
});

listenNext.addEventListener('click', () => {
  listenPlayBtn.click();
});

// Show reveal button after a delay when playing
const origPlay = listenPlayBtn.onclick;
listenPlayBtn.addEventListener('click', () => {
  setTimeout(() => {
    if (!listenAnswer.disabled) {
      listenReveal.classList.remove('hidden');
    }
  }, 3000);
});
