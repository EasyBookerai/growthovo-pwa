
const urlParams = new URLSearchParams(window.location.search);
const pillar = urlParams.get('pillar');
const index = parseInt(urlParams.get('index'));
const lessons = allLessons[pillar] || [];
const lesson = lessons[index];

let currentExercise = 0;
let hearts = 3;
let selectedAnswer = null;
let xpThisLesson = 0;

document.addEventListener('DOMContentLoaded', () => {
  if (!lesson) {
    window.location.href = 'pillars.html';
    return;
  }
  renderExercise();
  updateProgress();
});

function goBack() {
  if (confirm('Quit lesson?')) {
    window.location.href = `skill-tree.html?pillar=${pillar}`;
  }
}

function goToTree() {
  window.location.href = `skill-tree.html?pillar=${pillar}`;
}

function updateProgress() {
  const progress = (currentExercise / lesson.exercises.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
  let heartsStr = '';
  for (let i = 0; i < 3; i++) {
    heartsStr += i < hearts ? '❤️' : '🖤';
  }
  document.getElementById('hearts').textContent = heartsStr;
}

function renderExercise() {
  if (currentExercise >= lesson.exercises.length) {
    showCompletion();
    return;
  }
  const ex = lesson.exercises[currentExercise];
  const container = document.getElementById('exercise-container');
  let html = `<div class="exercise-label">${ex.type.toUpperCase()}</div><div class="question-text">${ex.question}</div>`;

  if (ex.type === 'multiple-choice' || ex.type === 'scenario') {
    html += '<div class="options-grid">';
    ex.options.forEach((opt, i) => {
      html += `<button class="option-btn" onclick="selectAnswer(${i})" id="option-${i}">${opt}</button>`;
    });
    html += '</div>';
  } else if (ex.type === 'true-false') {
    html += '<div class="options-grid">';
    html += `<button class="option-btn" onclick="selectAnswer(true)" id="option-true">True</button>`;
    html += `<button class="option-btn" onclick="selectAnswer(false)" id="option-false">False</button>`;
    html += '</div>';
  } else if (ex.type === 'fill-blank') {
    html += `<input type="text" class="text-input" id="text-answer" placeholder="Type your answer..." oninput="textAnswerChanged()">`;
  } else if (ex.type === 'reflection') {
    html += `<textarea class="text-input" id="text-answer" placeholder="Type your thoughts... (min ${ex.minChars || 50} characters)" oninput="textAnswerChanged()"></textarea>`;
  } else if (ex.type === 'reorder') {
    html += '<div class="options-grid" id="reorder-grid">';
    for (let i = 0; i < ex.items.length; i++) {
      html += `<button class="option-btn" id="reorder-${i}" draggable="true">${ex.items[i]}</button>`;
    }
    html += '</div><p style="color:#aaa;font-size:14px">Drag to reorder (simple click for now)</p>';
  }
  container.innerHTML = html;
  selectedAnswer = null;
  document.getElementById('check-btn').disabled = true;
}

function selectAnswer(index) {
  selectedAnswer = index;
  if (typeof index === 'boolean') {
    document.getElementById('option-true').classList.remove('selected');
    document.getElementById('option-false').classList.remove('selected');
    document.getElementById(`option-${index}`).classList.add('selected');
  } else {
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`option-${index}`).classList.add('selected');
  }
  document.getElementById('check-btn').disabled = false;
}

let userTextAnswer = '';
function textAnswerChanged() {
  userTextAnswer = document.getElementById('text-answer').value;
  const ex = lesson.exercises[currentExercise];
  const minChars = ex.minChars || 0;
  document.getElementById('check-btn').disabled = userTextAnswer.trim().length < minChars;
}

let userReorder = [];
function checkAnswer() {
  const ex = lesson.exercises[currentExercise];
  let isCorrect = false;

  if (ex.type === 'multiple-choice' || ex.type === 'scenario') {
    isCorrect = selectedAnswer === ex.correct;
  } else if (ex.type === 'true-false') {
    isCorrect = selectedAnswer === ex.correct;
  } else if (ex.type === 'fill-blank') {
    isCorrect = ex.correct.some(c => userTextAnswer.toLowerCase().trim() === c.toLowerCase().trim());
  } else if (ex.type === 'reflection') {
    isCorrect = true;
  } else if (ex.type === 'reorder') {
    isCorrect = true; // For simplicity
  }

  if (!isCorrect) {
    hearts--;
    updateProgress();
    showFeedback(false, ex.explanation || 'Not quite!');
    if (hearts <= 0) {
      setTimeout(() => alert('Out of hearts! Try again!'), 1000);
    }
  } else {
    xpThisLesson += 10;
    showFeedback(true, ex.explanation || 'Nice work!');
  }
}

function showFeedback(correct, text) {
  const banner = document.getElementById('feedback-banner');
  const heading = document.getElementById('feedback-heading');
  const textEl = document.getElementById('feedback-text');

  banner.className = 'feedback-banner show ' + (correct ? 'feedback-correct' : 'feedback-wrong');
  heading.textContent = correct ? 'Nice! 🎉' : 'Not quite!';
  textEl.textContent = text;

  if (!correct) {
    const ex = lesson.exercises[currentExercise];
    if (ex.type === 'multiple-choice' || ex.type === 'scenario') {
      document.querySelectorAll('.option-btn').forEach((btn, idx) => {
        if (idx === ex.correct) btn.classList.add('correct');
        else if (idx === selectedAnswer) btn.classList.add('incorrect');
      });
    }
  }
}

function nextExercise() {
  document.getElementById('feedback-banner').classList.remove('show');
  currentExercise++;
  updateProgress();
  renderExercise();
}

function showCompletion() {
  document.getElementById('exercise-container').style.display = 'none';
  document.getElementById('check-btn').style.display = 'none';
  document.getElementById('completion-screen').style.display = 'block';
  const stars = hearts === 3 ? 3 : hearts === 2 ? 2 : 1;
  const totalXP = xpThisLesson + (stars === 3 ? 50 : 0);

  document.getElementById('xp-earned').textContent = `+${totalXP} XP`;
  document.getElementById('stars-earned').textContent = '⭐'.repeat(stars);
  document.getElementById('rex-take').innerHTML = `<p><strong>Rex's Take:</strong> Great job! Keep building that momentum!</p>`;

  addXP(totalXP);
  updateLessonState(pillar, lesson.id, { completed: true, stars, xpEarned: totalXP });
  markActiveToday();
}

document.getElementById('check-btn').onclick = checkAnswer;
