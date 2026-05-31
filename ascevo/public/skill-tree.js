
const urlParams = new URLSearchParams(window.location.search);
const pillar = urlParams.get('pillar');
const pillarInfo = {
  "mental-health": { name: "Mental Health", emoji: "🧠" },
  "relationships": { name: "Relationships", emoji: "💬" },
  "career": { name: "Career", emoji: "💼" },
  "fitness": { name: "Fitness", emoji: "💪" },
  "finance": { name: "Finance", emoji: "💰" },
  "hobbies": { name: "Hobbies", emoji: "🎨" }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pillar-title').textContent = `${pillarInfo[pillar]?.emoji || '📚'} ${pillarInfo[pillar]?.name || pillar}`;
  renderSkillTree();
});

function goBack() {
  window.location.href = 'pillars.html';
}

function renderSkillTree() {
  const lessons = allLessons[pillar] || [];
  const container = document.getElementById('skill-tree');
  container.innerHTML = '';
  const line = document.createElement('div');
  line.className = 'tree-line';
  container.appendChild(line);

  let lastUnit = null;
  lessons.forEach((lesson, index) => {
    if (lesson.unit !== lastUnit) {
      lastUnit = lesson.unit;
      const divider = document.createElement('div');
      divider.className = 'unit-divider';
      divider.textContent = `Unit ${lesson.unit}: ${lesson.unitName}`;
      container.appendChild(divider);
    }

    const node = document.createElement('div');
    node.className = 'lesson-node';
    node.onclick = () => openLesson(index);

    const state = getLessonState(pillar, lesson.id);
    const isUnlocked = isLessonUnlocked(pillar, index);

    const circle = document.createElement('div');
    if (state.completed) circle.className = 'node-circle node-completed';
    else if (isUnlocked) circle.className = 'node-circle node-unlocked';
    else circle.className = 'node-circle node-locked';
    circle.textContent = index + 1;
    node.appendChild(circle);

    const title = document.createElement('div');
    title.className = 'lesson-title';
    title.textContent = lesson.title;
    node.appendChild(title);

    if (state.completed && state.stars > 0) {
      const starsDiv = document.createElement('div');
      starsDiv.className = 'node-stars';
      starsDiv.textContent = '⭐'.repeat(state.stars);
      node.appendChild(starsDiv);
    }
    container.appendChild(node);
  });
}

function openLesson(index) {
  const lessons = allLessons[pillar] || [];
  if (!lessons[index]) return;
  if (!isLessonUnlocked(pillar, index)) {
    alert('Complete previous lesson first!');
    return;
  }
  window.location.href = `lesson-runner.html?pillar=${pillar}&index=${index}`;
}
