/* الوضع الليلي */
function toggleDark() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark', document.body.classList.contains('dark-mode'));
}
if (localStorage.getItem('dark') === 'true') {
  document.body.classList.add('dark-mode');
}

/* تسجيل الدخول / إنشاء حساب */
document.getElementById('loginBtn').addEventListener('click', login);

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (!u || !p) return alert('الحقول مطلوبة');

  let users = JSON.parse(localStorage.getItem('users') || '{}');

  if (!users[u]) {
    // إنشاء حساب جديد
    users[u] = { password: p };
    alert('تم إنشاء حساب جديد!');
  } else if (users[u].password !== p) {
    return alert('كلمة المرور غير صحيحة');
  }

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('user', u);
  proceedToApp(u);
}

/* الانتقال للواجهة الرئيسية */
function proceedToApp(user) {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('main-nav').classList.remove('hidden');
  ['server-info', 'quiz', 'leaderboard', 'comments']
    .forEach(id => document.getElementById(id).classList.remove('hidden'));

  currentIndex = 0;
  score = 0;
  showQuestion();
  loadLeaderboard();
  loadComments();
}

/* الأسئلة */
const questions = [
  { text: "ما اسم العالم الجديد الذي أضيف في تحديث Caves and Cliffs؟", opts: ["The End","The Nether","The Void","لم يُضاف عالم جديد"], ans: 3 },
  { text: "ما هي آلية عمل Beacon؟", opts: ["يصدر ضوءًا لاصطياد الوحوش","يمنح تأثيرات إيجابية عند بناء هرم البازلت","يمنح تأثيرات إيجابية عند بناء هرم المعادن","يطير لالتقاط الموارد"], ans: 2 },
  { text: "كم تحتاج من الزجاج لصنع End Crystal؟", opts: ["7","5","3","4"], ans: 3 },
  { text: "أي من الأدوات التالية يحتاج إلى تصليح بواسطة Repair Anvil؟", opts: ["مطرقة","فأس","سيف","معول"], ans: 2 },
  { text: "ما هو اسم الكائن الذي يحرس Stronghold؟", opts: ["Enderman","Silverfish","Zombie","Skeleton"], ans: 1 },
];

let currentIndex = 0;
let score = 0;

function showQuestion() {
  if (currentIndex >= questions.length) {
    endQuiz();
    return;
  }
  const q = questions[currentIndex];
  document.getElementById('question').textContent = q.text;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    optionsDiv.appendChild(btn);
  });
  document.getElementById('feedback').textContent = '';
  document.getElementById('score').textContent = `النقاط: ${score}`;
  document.getElementById('endMessage').textContent = '';
}

function checkAnswer(i) {
  const q = questions[currentIndex];
  if (i === q.ans) {
    score++;
    document.getElementById('feedback').textContent = 'إجابة صحيحة! 🎉';
  } else {
    document.getElementById('feedback').textContent = 'إجابة خاطئة.';
  }
  currentIndex++;
  document.getElementById('score').textContent = `النقاط: ${score}`;
  setTimeout(showQuestion, 1000);
}

function endQuiz() {
  document.getElementById('question').textContent = '';
  document.getElementById('options').innerHTML = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('endMessage').textContent = `انتهت الأسئلة! حصلت على ${score} من ${questions.length} نقاط.`;
  updateLeaderboard(localStorage.getItem('user'), score);
}

/* لوحة المتصدرين */
function loadLeaderboard() {
  const leadersList = document.getElementById('leadersList');
  leadersList.innerHTML = '';
  let leaders = JSON.parse(localStorage.getItem('leaders') || '[]');
  // فرز تنازلي للنقاط
  leaders.sort((a,b) => b.score - a.score);
  leaders.slice(0,5).forEach(entry => {
    const li = document.createElement('li');
    const avatarUrl = `https://mc-heads.net/avatar/${entry.username}/32`;
    li.innerHTML = `<img class="avatar" src="${avatarUrl}" alt="Avatar"> <span>${entry.username} - ${entry.score} نقطة</span>`;
    leadersList.appendChild(li);
  });
}

function updateLeaderboard(user, score) {
  let leaders = JSON.parse(localStorage.getItem('leaders') || '[]');
  const foundIndex = leaders.findIndex(e => e.username === user);
  if (foundIndex === -1) {
    leaders.push({username: user, score});
  } else if (leaders[foundIndex].score < score) {
    leaders[foundIndex].score = score;
  }
  localStorage.setItem('leaders', JSON.stringify(leaders));
  loadLeaderboard();
}

/* التعليقات */
function loadComments() {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '';
  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  comments.forEach(c => {
    const li = document.createElement('li');
    const avatarUrl = `https://mc-heads.net/avatar/${c.username}/32`;
    const date = new Date(c.time).toLocaleString('ar-EG');
    li.innerHTML = `<img class="avatar" src="${avatarUrl}" alt="Avatar"> <div><strong>${c.username}</strong> <br><small>${date}</small><br>${escapeHTML(c.text)}</div>`;
    commentsList.appendChild(li);
  });
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[m]);
  });
}

document.getElementById('postCommentBtn').addEventListener('click', () => {
  const text = document.getElementById('commentText').value.trim();
  if (!text) return alert('يرجى كتابة تعليق!');
  const user = localStorage.getItem('user');
  if (!user) return alert('يرجى تسجيل الدخول!');
  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  comments.push({username: user, text, time: Date.now()});
  localStorage.setItem('comments', JSON.stringify(comments));
  document.getElementById('commentText').value = '';
  loadComments();
});
