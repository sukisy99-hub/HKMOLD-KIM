// 한국몰드 AI 오피스 — 업무 현황 시뮬레이션 (실제 데이터·AI 연동 없음)

const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const hm = d => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const md = d => `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`;

// ---------- 팀 · AI 직원 ----------
const TEAMS = [
  {
    id: 'admin', floor: 4, name: '관리팀', color: '#2557d6', soft: 'rgba(37,87,214,.16)', equip: 'cabinet',
    desc: '회사 운영 전반 · 일정 · 보고 총괄',
    person: { id: 'lee', name: '이은미', short: '은미', role: '전체 관리' },
    tasks: ['주간 업무 보고 취합', '팀별 일정 조율', '근태 현황 점검', '경영 지표 업데이트', '회의록 정리', '결재 문서 검토', '거래처 계약서 확인'],
  },
  {
    id: 'dev', floor: 3, name: '개발팀', color: '#7c4dff', soft: 'rgba(124,77,255,.16)', equip: 'screen',
    desc: '신규 금형 개발 · 설계 검토 · 시사출 관리',
    person: { id: 'kgw', name: '김건우', short: '건우', role: '개발관리' },
    tasks: ['신규 금형 사양 검토', '3D 모델링 검토', '시사출(T0) 결과 분석', '설계 변경(ECO) 관리', '개발 일정 관리', '고객 요구사항 정리', '금형 구조 DR 준비'],
  },
  {
    id: 'qc', floor: 2, name: '품질팀', color: '#0f9d8a', soft: 'rgba(15,157,138,.18)', equip: 'cmm',
    desc: '금형 · 제품 품질 검사 및 개선',
    person: { id: 'kms', name: '김민성', short: '민성', role: '품질관리' },
    tasks: ['금형 치수 측정 결과 검토', '수입 검사 데이터 분석', '불량 원인 분석 (8D)', '품질 성적서 작성', '고객 클레임 대응', '공정 능력(Cpk) 점검', '시사출 샘플 검사'],
  },
  {
    id: 'prod', floor: 1, name: '생산관리팀', color: '#e2457a', soft: 'rgba(226,69,122,.16)', equip: 'rack',
    desc: '생산 계획 · 설비 · 납기 관리',
    person: { id: 'kkh', name: '김강현', short: '강현', role: '생산관리' },
    tasks: ['주간 생산 계획 수립', '설비 가동률 모니터링', '납기 일정 점검', '자재 소요량 확인', '작업 지시서 발행', '금형 수정 일정 조율', '외주 가공 진행 확인'],
  },
];
const byTeam = Object.fromEntries(TEAMS.map(t => [t.id, t]));
const byPerson = Object.fromEntries(TEAMS.map(t => [t.person.id, t]));

const COLLABS = [
  ['prod', 'qc', '시사출 일정 협의'],
  ['dev', 'prod', '설계 변경 반영 일정 협의'],
  ['qc', 'dev', '치수 불량 개선 회의'],
  ['admin', 'prod', '납기 현황 보고'],
  ['admin', 'dev', '신규 프로젝트 킥오프'],
  ['admin', 'qc', '고객 품질 감사 준비'],
];

const DETAILS = {
  '품질 성적서 작성': ['측정 데이터 기반 성적서 초안 작성', '규격 대비 합격 판정 기준 확인', '고객 제출 양식으로 변환 완료'],
  '불량 원인 분석 (8D)': ['불량 현상 및 발생 공정 확인', '근본 원인 후보 도출 (게이트 위치 · 냉각 불균형 · 이젝터 핀 마모)', '임시 조치 및 재발 방지 대책 초안 작성'],
  '금형 치수 측정 결과 검토': ['3차원 측정 데이터 확인', '공차 이탈 부위 표시', '개발팀 수정 요청 항목 정리'],
  '주간 생산 계획 수립': ['수주 잔량 및 납기 기준 우선순위 정렬', '설비별 가동 계획 배정', '외주 가공 필요 항목 분리'],
  '설비 가동률 모니터링': ['사출기별 가동률 집계', '비가동 사유 분류', '개선 필요 설비 선정'],
  '납기 일정 점검': ['프로젝트별 납기 대비 진행률 확인', '지연 위험 프로젝트 표시', '고객 일정 조정 필요 여부 검토'],
  '시사출(T0) 결과 분석': ['성형 조건 및 샘플 외관 검토', '미성형 · 버(burr) 발생 부위 확인', '금형 수정 항목 리스트 작성'],
  '설계 변경(ECO) 관리': ['접수된 변경 요청 검토', '영향 부품 및 일정 영향 분석', '관련 부서 공유 완료'],
  '신규 금형 사양 검토': ['제품 도면 및 수지 사양 확인', '캐비티 수 · 게이트 방식 검토', '견적 및 일정 초안 작성'],
  '주간 업무 보고 취합': ['팀별 주간 실적 취합', '지연 업무 및 이슈 정리', '다음 주 주요 일정 정리'],
  '경영 지표 업데이트': ['월 누적 매출 · 수주 현황 반영', '부서별 KPI 달성률 업데이트', '전월 대비 변동 요인 메모'],
  '회의록 정리': ['회의 안건 및 결정 사항 정리', '담당자별 후속 조치 지정', '전 직원 공유 완료'],
};
const GENERIC = ['관련 데이터 확인 및 정리', '이상 항목 검토 및 조치 사항 도출', '관련 부서 공유 완료'];

// ---------- 상태 ----------
TEAMS.forEach(t => {
  Object.assign(t.person, {
    queue: shuffle(t.tasks), status: 'work', progress: 10 + Math.random() * 40,
    done: [], until: 0, note: '', withTeam: null,
  });
  t.person.current = t.person.queue.shift();
});

const state = {
  route: 'monitor', floor: null, chatTab: 'talk', voice: false,
  doneCount: 0, chat: [], qa: [], reports: [], openReport: null, lastEvent: '',
};

// 예시 일정 (오늘 기준)
const SCHEDULE = [
  { d: 0, s: '16:00', e: '17:00', title: '신규 금형 설계 검토(DR) 회의', team: 'dev' },
  { d: 1, s: '10:00', e: '12:00', title: 'T1 시사출 및 샘플 채취', team: 'prod' },
  { d: 2, s: '14:00', e: '15:00', title: 'T1 샘플 치수 측정 결과 공유', team: 'qc' },
  { d: 3, s: '09:00', e: '10:00', title: '주간 생산 · 납기 점검 회의', team: 'admin' },
  { d: 6, s: '13:00', e: '17:00', title: '고객사 품질 감사 대응', team: 'qc' },
  { d: 8, s: '10:00', e: '11:00', title: '금형 출하 전 최종 검수', team: 'prod' },
  { d: 9, s: '15:00', e: '16:00', title: '월간 경영 실적 보고', team: 'admin' },
].map(x => {
  const date = new Date(); date.setDate(date.getDate() + x.d);
  return { ...x, date };
});
const nextSchedule = teamId => SCHEDULE.find(s => !teamId || s.team === teamId);
const dday = d => (d === 0 ? 'D-DAY' : `D-${d}`);

// ---------- 이벤트 ----------
function say(text) {
  if (!state.voice || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  speechSynthesis.speak(u);
}

function chat(from, text, delay = 0) {
  setTimeout(() => {
    state.chat.push({ from, text, time: new Date() });
    if (state.chat.length > 120) state.chat.shift();
    if (state.route === 'office' && state.chatTab === 'talk') renderChat(true);
  }, delay);
}

function event(text) { state.lastEvent = text; }

function makeReport(team, task, time = new Date()) {
  const p = team.person;
  const r = {
    id: Math.random().toString(36).slice(2), title: `${task} 보고`, team, author: p.name, time,
    files: 1 + Math.floor(Math.random() * 3), read: false,
    summary: `${team.name} ${p.name}님이 「${task}」 업무를 완료했습니다.`,
    points: DETAILS[task] || GENERIC,
    next: p.queue[0] || p.current,
  };
  state.reports.unshift(r);
  return r;
}

function finishTask(t) {
  const p = t.person;
  p.done.push({ task: p.current, time: new Date() });
  state.doneCount++;
  const withReport = Math.random() < 0.5;
  if (withReport) makeReport(t, p.current);
  chat(p.id, `「${p.current}」 완료했습니다.${withReport ? ' 보고서는 보고함에 올려두었습니다 📎' : ''}`);
  event(`${p.name} → ${t.floor}F ${t.name} · ${p.current} 완료`);
  say(`${p.name}님, ${p.current} 완료`);
  if (!p.queue.length) p.queue = shuffle(t.tasks.filter(x => x !== p.current));
  p.current = p.queue.shift();
  p.progress = 0;
}

function startMeeting(a, b, topic, now) {
  const until = now + 12000 + Math.random() * 10000;
  [[a, b], [b, a]].forEach(([x, y]) => Object.assign(x.person, { status: 'meet', note: topic, until, withTeam: y.id }));
  chat(a.person.id, `${b.person.name}님, ${topic} 관련해서 잠깐 이야기 나눌 수 있을까요?`);
  chat(b.person.id, pick(['네, 지금 바로 가능합니다.', '좋습니다. 회의실로 갈게요.', '네! 자료 챙겨서 갈게요.']), 1800);
  event(`${a.person.name} → ${b.person.name} · ${topic}`);
  say(`${a.person.name}님과 ${b.person.name}님, ${topic} 회의 시작`);
}

function tick() {
  const now = Date.now();
  TEAMS.forEach(t => {
    const p = t.person;
    if (p.status !== 'work') {
      if (now >= p.until) {
        if (p.status === 'meet' && p.withTeam && TEAMS.indexOf(t) < TEAMS.indexOf(byTeam[p.withTeam])) {
          chat(p.id, `회의 내용은 정리해서 공유드리겠습니다. (${p.note})`);
        }
        Object.assign(p, { status: 'work', note: '', withTeam: null });
      }
      return;
    }
    p.progress = Math.min(100, p.progress + 0.8 + Math.random() * 2.6);
    if (p.progress >= 100) finishTask(t);
    else if (Math.random() < 0.004) {
      Object.assign(p, { status: 'rest', note: '커피 타임', until: now + 8000 + Math.random() * 6000 });
      if (Math.random() < 0.5) chat(p.id, pick(['잠깐 커피 한 잔 하고 올게요 ☕', '5분만 쉬었다 올게요!']));
    }
  });

  if (Math.random() < 0.018) {
    const free = COLLABS.filter(([a, b]) => byTeam[a].person.status === 'work' && byTeam[b].person.status === 'work');
    if (free.length) {
      const [a, b, topic] = pick(free);
      startMeeting(byTeam[a], byTeam[b], topic, now);
    }
  }
  render();
}

// ---------- 공통 렌더 ----------
const STATUS = { work: '업무 중', meet: '회의 중', rest: '휴식 중' };
const statusText = p => (p.status === 'work' ? p.current : p.status === 'meet' ? `${byTeam[p.withTeam].person.name}님과 ${p.note}` : '잠깐 휴식');
const avatar = (t, cls = '') => `<span class="avatar ${cls}" style="--c:${t.color}">${t.person.short}</span>`;

function render() {
  $('#clock').textContent = new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const unread = state.reports.filter(r => !r.read).length;
  $('#rep-badge').textContent = unread || '';
  if (state.route === 'monitor') renderMonitor();
  if (state.route === 'office') updateOffice();
  if (state.route === 'reports') renderReportList();
  if ($('#person-dlg').open) fillPerson($('#person-dlg').dataset.team);
}

// ---------- 모니터링 ----------
function renderMonitor() {
  const meeting = TEAMS.find(t => t.person.status === 'meet');
  const lead = meeting || TEAMS.reduce((a, b) => (b.person.progress > a.person.progress ? b : a));
  const lp = lead.person;
  $('#hero').innerHTML = meeting
    ? `<div class="kicker">지금 진행 중 · 회의</div>
       <h2>${esc(lp.note)}</h2>
       <p>${lp.name} · ${byTeam[lp.withTeam].person.name} · <b>${lead.floor}F ${lead.name}</b> 회의실</p>
       <div class="hero-actions"><button class="btn primary" onclick="goFloor('${lead.id}')">오피스에서 보기</button>
       <button class="btn" onclick="openPerson('${lead.id}')">자세히</button></div>`
    : `<div class="kicker">지금 진행 중</div>
       <h2>${esc(lp.current)} · ${Math.floor(lp.progress)}%</h2>
       <p>${lp.name} ${lp.role} · <b>${lead.floor}F ${lead.name}</b> · 오늘 완료 ${lp.done.length}건</p>
       <div class="hero-actions"><button class="btn primary" onclick="goFloor('${lead.id}')">오피스에서 보기</button>
       <button class="btn" onclick="openPerson('${lead.id}')">자세히</button></div>`;

  const working = TEAMS.filter(t => t.person.status === 'work').length;
  const meetings = TEAMS.filter(t => t.person.status === 'meet').length / 2;
  const ns = nextSchedule();
  const unread = state.reports.filter(r => !r.read).length;
  $('#stats').innerHTML = `
    <div class="card stat"><small>업무 중</small><b>${working} <span>/ 4</span></b><p>회의 ${meetings}건 진행 중</p></div>
    <div class="card stat"><small>오늘 완료</small><b>${state.doneCount} <span>건</span></b><p>AI 직원 전체 누적</p></div>
    <div class="card stat"><small>다음 일정</small><b>${dday(ns.d)}</b><p>${esc(ns.title)}</p></div>
    <div class="card stat"><small>보고함</small><b>${state.reports.length} <span>건</span></b><p>새 보고서 ${unread}건</p></div>`;

  $('#teams').innerHTML = TEAMS.map(t => {
    const p = t.person;
    const s = nextSchedule(t.id);
    const recent = p.done.slice(-2).reverse();
    return `<div class="team" style="--c:${t.color}">
      <div class="team-head"><span class="floor-badge">${t.floor}F</span>
        <div><b>${t.name}</b><small>${t.desc}</small></div>
        <span class="chip ${p.status}">${STATUS[p.status]}</span></div>
      <p class="now">${esc(statusText(p))}</p>
      <div class="member">${avatar(t)}<div><b>${p.name}</b> <span>${p.role} · AI 직원</span></div></div>
      <div class="prog"><div class="bar"><i style="width:${p.status === 'work' ? p.progress : 0}%"></i></div>업무 ${Math.floor(p.status === 'work' ? p.progress : 0)}%</div>
      ${recent.length ? `<ul class="done-list">${recent.map(d => `<li>${esc(d.task)}</li>`).join('')}</ul>` : ''}
      ${s ? `<div class="next"><span class="dday">${dday(s.d)}</span>${md(s.date)} ${s.s} · ${esc(s.title)}</div>` : ''}
      <button class="go" onclick="goFloor('${t.id}')">오피스 ${t.floor}층 보기 →</button>
    </div>`;
  }).join('');

  let lastDay = null;
  $('#schedule').innerHTML = SCHEDULE.map(s => {
    const t = byTeam[s.team];
    const head = s.d !== lastDay ? `<div class="sched-day">${md(s.date)}<span>${s.d === 0 ? '오늘' : `D-${s.d}`}</span></div>` : '';
    lastDay = s.d;
    return `${head}<div class="sched ${s.d === 0 ? 'today' : ''}" style="--c:${t.color}">
      <time>${s.s}<small>${s.e}</small></time>
      <div><b>${esc(s.title)}</b><span>${t.floor}F ${t.name} · ${t.person.name}</span></div></div>`;
  }).join('');

  $('#people').innerHTML = TEAMS.map(t => {
    const p = t.person;
    const where = p.status === 'work' ? `${t.floor}F 자리` : p.status === 'meet' ? '회의 중' : '휴게실';
    return `<button class="person-row" onclick="openPerson('${t.id}')">${avatar(t, 'lg')}
      <div class="meta"><div><b>${p.name}</b><span class="where ${p.status}">● ${where}</span></div>
      <p>${t.name} ${p.role} · ${esc(statusText(p))}</p></div></button>`;
  }).join('');
}

function openPerson(teamId) {
  const dlg = $('#person-dlg');
  dlg.dataset.team = teamId;
  fillPerson(teamId);
  if (!dlg.open) dlg.showModal();
}
function fillPerson(teamId) {
  const t = byTeam[teamId], p = t.person;
  const list = (items, empty) => (items.length ? `<ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p style="color:var(--muted);margin:0">${empty}</p>`);
  $('#person-body').innerHTML = `
    <button class="x" onclick="this.closest('dialog').close()" aria-label="닫기">×</button>
    <div class="member" style="--c:${t.color}">${avatar(t, 'lg')}<div><b style="font-size:18px">${p.name}</b><br><span>${t.floor}F ${t.name} · ${p.role}</span></div></div>
    <h4>현재 상태 · ${STATUS[p.status]}</h4>
    <p style="margin:0 0 8px">${esc(statusText(p))}</p>
    <div class="prog" style="--c:${t.color}"><div class="bar"><i style="width:${p.status === 'work' ? p.progress : 0}%"></i></div>${Math.floor(p.status === 'work' ? p.progress : 0)}%</div>
    <h4>대기 중인 업무</h4>${list(p.queue.slice(0, 4), '대기 업무 없음')}
    <h4>오늘 완료한 업무</h4>${list(p.done.slice().reverse().map(d => `${hm(d.time)} ${d.task}`), '아직 완료한 업무가 없습니다')}`;
}

// ---------- 오피스 타워 (아이소메트릭 SVG) ----------
const S = 16, W = 12, D = 8, H = 9, SLAB = 0.6, CX = 383, CY = 690;
const P = (x, y, z) => [CX + (x - y) * 0.866 * S, CY + (x + y) * 0.5 * S - z * S];
const pts = (...ps) => ps.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const poly = (ps, fill, extra = '') => `<polygon points="${pts(...ps)}" fill="${fill}" ${extra}/>`;

const makeBox = Pf => (x, y, z, w, d, h, [top, left, right]) => {
  const a = Pf(x, y, z + h), b = Pf(x + w, y, z + h), c = Pf(x + w, y + d, z + h), e = Pf(x, y + d, z + h);
  const f = Pf(x, y + d, z), g = Pf(x + w, y + d, z), k = Pf(x + w, y, z);
  return poly([e, c, g, f], left) + poly([b, c, g, k], right) + poly([a, b, c, e], top);
};
const box = makeBox(P);
function isoCircle(cx, cy, z, r, fill, extra = '') {
  const ps = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ps.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z)); }
  return poly(ps, fill, extra);
}
const plant = (x, y, z) => {
  const [px, py] = P(x + 0.3, y + 0.3, z + 1.1);
  return box(x, y, z, 0.6, 0.6, 0.5, ['#c08a5c', '#9b6b43', '#b07a4e']) +
    `<circle cx="${px}" cy="${py}" r="9" fill="#2f9d63"/><circle cx="${px - 4}" cy="${py + 3}" r="6" fill="#3bb574"/>`;
};
const desk = (x, y, z, screen) => box(x, y, z, 2, 1, 0.75, ['#f6f7fa', '#aab4c3', '#cdd4de']) +
  box(x + 0.5, y + 0.15, z + 0.75, 1, 0.12, 0.7, ['#3a4252', screen, '#2a3140']);
const chair = (x, y, z) => box(x, y, z, 0.6, 0.6, 0.45, ['#4a5466', '#323a48', '#3d4656']);

function equipment(kind, color, z) {
  if (kind === 'cabinet') return [0, 1, 2].map(i => box(6 + i * 0.9, 0.5, z, 0.8, 0.7, 1.5, ['#e9edf3', '#9aa5b5', '#bcc5d2'])).join('');
  if (kind === 'screen') return box(6, 0.4, z, 0.3, 0.3, 1.2, ['#555', '#333', '#444']) + box(5.2, 0.4, z + 1.2, 2, 0.12, 1.3, ['#333', color, '#2a3140']);
  if (kind === 'cmm') return box(5.8, 0.6, z, 2.6, 1.6, 0.9, ['#7d8696', '#4b5361', '#646d7c']) +
    box(5.9, 0.7, z + 0.9, 0.2, 0.2, 1.4, ['#ddd', '#aaa', '#bbb']) + box(8.1, 0.7, z + 0.9, 0.2, 0.2, 1.4, ['#ddd', '#aaa', '#bbb']) +
    box(5.9, 0.7, z + 2.3, 2.4, 0.25, 0.25, [color, color, color]);
  return box(5.8, 0.4, z, 3, 0.9, 1.8, ['#b9c1cd', '#7e8899', '#98a2b2']) +
    [0, 1, 2].map(i => box(6 + i * 0.95, 0.5, z + 0.6, 0.7, 0.6, 0.45, [color, '#8a5a2b', '#a46c36'])).join('');
}

// 층 안의 자리 (층 기준 좌표)
const SPOTS = { work: [3, 5.1], meet: [8.6, 7.1], rest: [10.6, 3.2] };
const floorZ = t => (t.floor - 1) * H + SLAB;

function avatarPos(t) {
  const [x, y] = SPOTS[t.person.status];
  return P(x, y, floorZ(t));
}

function buildTower() {
  // 결정적 난수 (배경 고정)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let bg = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1430"/><stop offset="1" stop-color="#1b3263"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
    <rect width="820" height="860" fill="url(#sky)"/>`;
  for (let i = 0; i < 60; i++) bg += `<circle cx="${rnd() * 820}" cy="${rnd() * 300}" r="${rnd() * 1.2 + .3}" fill="#fff" opacity="${rnd() * .6 + .2}"/>`;
  [[0.55, '#16264a', 260, 520], [0.85, '#1e3260', 160, 380]].forEach(([op, col, minH, maxH]) => {
    let x = -10;
    while (x < 830) {
      const w = 40 + rnd() * 50, h = minH + rnd() * (maxH - minH), top = 860 - h;
      bg += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${col}" opacity="${op}"/>`;
      for (let wy = top + 10; wy < 850; wy += 14) for (let wx = x + 6; wx < x + w - 6; wx += 10) {
        const r = rnd();
        if (r < 0.32) bg += `<rect ${r < 0.06 ? 'class="win-lit"' : ''} x="${wx}" y="${wy}" width="4" height="6" fill="${r < 0.12 ? '#ffd76a' : '#7fa6ff'}" opacity="${0.35 + r}"/>`;
      }
      x += w + 4 + rnd() * 10;
    }
  });
  // 지면
  bg += poly([P(-3, -3, 0), P(W + 3, -3, 0), P(W + 3, D + 3, 0), P(-3, D + 3, 0)], '#0d1730', 'opacity=".9"');

  const floors = TEAMS.slice().sort((a, b) => a.floor - b.floor).map(t => {
    const z0 = (t.floor - 1) * H, z = z0 + SLAB;
    let g = box(0, 0, z0, W, D, SLAB, ['#e8edf4', '#8592a6', '#aeb9c9']);
    g += poly([P(1, 3.6, z), P(7.4, 3.6, z), P(7.4, 7.6, z), P(1, 7.6, z)], t.soft);
    g += equipment(t.equip, t.color, z);
    g += box(10, 0.6, z, 1.4, 1, 1.1, ['#d9dee6', '#8f99a8', '#b3bcc9']) + box(10.3, 0.8, z + 1.1, 0.4, 0.4, 0.3, ['#fff', '#ccc', '#ddd']);
    g += plant(0.5, 0.6, z) + plant(11.2, 4.6, z);
    [[1.4, 3.2], [4, 3.2]].forEach(([x, y], i) => { g += desk(x, y, z, i === 0 ? t.color : '#1b2230'); });
    [[1.4, 5.6], [4, 5.6]].forEach(([x, y]) => { g += desk(x, y, z, '#1b2230'); });
    g += chair(2.7, 4.4, z) + chair(4.7, 4.4, z) + chair(2.1, 6.8, z) + chair(4.7, 6.8, z);
    g += isoCircle(8.6, 5.6, z + 0.75, 1.3, '#f4f1ea', 'stroke="#c9c2b4"') + box(8.45, 5.45, z, 0.3, 0.3, 0.75, ['#999', '#666', '#777']);
    g += chair(7.1, 5.3, z) + chair(9.9, 5.3, z) + chair(8.3, 3.9, z);
    g += plant(0.5, 7.0, z);

    // 아바타
    const [ax, ay] = avatarPos(t);
    g += `<g class="av" id="av-${t.id}" style="transform:translate(${ax}px,${ay}px)">
      <ellipse cx="0" cy="0" rx="9" ry="4" fill="#000" opacity=".25"/>
      <g class="bob">
        <rect x="-7" y="-20" width="14" height="18" rx="6" fill="${t.color}"/>
        <circle class="ring" cx="0" cy="-27" r="8.5" fill="#f6d2b3" stroke="#16a34a" stroke-width="2.5"/>
        <path d="M-8 -29a8 8 0 0 1 16 0c-3-3-13-3-16 0z" fill="#2a2420"/>
        <g transform="translate(0 -48)">
          <rect x="-20" y="-9" width="40" height="17" rx="8.5" fill="${t.color}" stroke="#fff" stroke-width="1.5"/>
          <text x="0" y="3.5" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${t.person.short}</text>
        </g>
        <text class="emo" x="16" y="-30" font-size="12">💻</text>
      </g></g>`;

    // 유리 기둥
    const zTop = z0 + H;
    [[W, D], [W, 0], [0, D]].forEach(([x, y]) => {
      const [x1, y1] = P(x, y, z), [x2, y2] = P(x, y, zTop);
      g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5ee1ff" stroke-width="1.4" opacity=".75"/>`;
    });
    const [g1, g2, g3] = [P(0, D, zTop - 0.05), P(W, D, zTop - 0.05), P(W, 0, zTop - 0.05)];
    g += `<polyline points="${pts(g1, g2, g3)}" fill="none" stroke="#5ee1ff" stroke-width="1" opacity=".5"/>`;

    // 층 라벨
    const [lx, ly] = P(W, D * 0.55, z + 2.2);
    const label = `${t.floor}F ${t.name}`;
    g += `<g class="floor-label" onclick="enterFloor('${t.id}')" transform="translate(${lx + 10} ${ly})">
      <rect x="0" y="-13" width="${label.length * 11 + 92}" height="26" rx="13" fill="#1b2230" stroke="rgba(255,255,255,.25)"/>
      <circle cx="14" cy="0" r="4" fill="${t.color}"/>
      <text x="24" y="4.5" font-size="12" font-weight="800" fill="#fff">${label}<tspan font-weight="500" font-size="10.5" fill="#c7d2e5">  들어가 보기 →</tspan></text></g>`;
    return `<g class="floor" data-team="${t.id}">${g}</g>`;
  }).join('');

  // 지붕
  const zr = 4 * H;
  let roof = box(0, 0, zr, W, D, SLAB, ['#e8edf4', '#8592a6', '#aeb9c9']);
  roof += box(1, 1, zr + SLAB, W - 2, D - 2, 1.8, ['#3f74e6', '#1f4bb5', '#2d5fd0']);
  roof += box(3, 2.5, zr + SLAB + 1.8, 5, 3, 1, ['#5b8def', '#2753c4', '#3666d8']);
  const [ax1, ay1] = P(5.5, 4, zr + SLAB + 2.8), [ax2, ay2] = P(5.5, 4, zr + SLAB + 6);
  roof += `<line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="#b9c6dd" stroke-width="2"/><circle cx="${ax2}" cy="${ay2}" r="3" fill="#ff5a5a"/>`;
  const [tx, ty] = P(1.6, D - 1, zr + SLAB + 0.55);
  roof += `<text transform="matrix(0.866 0.5 0 1 ${tx} ${ty})" font-size="13" font-weight="800" letter-spacing="2" fill="#fff" opacity=".9">HANKOOK MOLD</text>`;

  $('#tower-svg').innerHTML = bg + floors + `<g>${roof}</g>`;

  $('#floor-chips').innerHTML = `<button class="fchip" data-floor="">🏢 전체 타워</button>` +
    TEAMS.map(t => `<button class="fchip" data-floor="${t.id}" style="--c:${t.color}"><i></i>${t.floor}F ${t.name}</button>`).join('');
  $('#floor-chips').addEventListener('click', e => {
    const b = e.target.closest('.fchip');
    if (b) enterFloor(b.dataset.floor || null);
  });
}

// ---------- 층 내부 사무실 (확대 아이소메트릭) ----------
const FS = 34, FW = 16, FD = 11, FWALL = 5.6, FOX = 476, FOY = 250;
const FP = (x, y, z) => [FOX + (x - y) * 0.866 * FS, FOY + (x + y) * 0.5 * FS - z * FS];
const fbox = makeBox(FP);
const onWallY = (x, z) => { const [X, Y] = FP(x, 0, z); return `matrix(0.866 0.5 0 1 ${X.toFixed(1)} ${Y.toFixed(1)})`; };
const onWallX = (y, z) => { const [X, Y] = FP(0, y, z); return `matrix(-0.866 0.5 0 1 ${X.toFixed(1)} ${Y.toFixed(1)})`; };
const fellipse = (cx, cy, z, rx, ry, fill, extra = '') => {
  const ps = [];
  for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; ps.push(FP(cx + rx * Math.cos(a), cy + ry * Math.sin(a), z)); }
  return poly(ps, fill, extra);
};

const WORKFLOW = {
  admin: ['MANAGEMENT WORKFLOW', ['수집', '검토', '결재', '공유']],
  dev: ['DEVELOPMENT WORKFLOW', ['사양 검토', '설계', '시사출', '수정']],
  qc: ['QUALITY WORKFLOW', ['측정', '분석', '판정', '성적서']],
  prod: ['PRODUCTION WORKFLOW', ['계획', '작업 지시', '생산', '출하']],
};
const FSPOTS = { work: [6.4, 5.0], meet: [4.2, 9.2], rest: [2.0, 3.2], guest: [6.6, 6.8] };
const WHITE = ['#f3f5f9', '#a7b1c0', '#cbd2dc'];
const DARK = ['#3b4352', '#262c37', '#30374430'];

function cityPanel(width, rnd) {
  const h = FWALL * FS;
  let s = `<rect x="0" y="${-h}" width="${width}" height="${h}" fill="url(#fsky)"/>`;
  let u = 0;
  while (u < width) {
    const bw = 18 + rnd() * 30, bh = 50 + rnd() * (h - 40);
    s += `<rect x="${u}" y="${-bh}" width="${bw}" height="${bh}" fill="${rnd() < .5 ? '#0e1934' : '#13224a'}"/>`;
    for (let wy = -bh + 6; wy < -4; wy += 8) for (let wx = u + 3; wx < u + bw - 3; wx += 6) {
      const r = rnd();
      if (r < .4) s += `<rect x="${wx}" y="${wy}" width="2.6" height="3.6" fill="${r < .15 ? '#ffd27a' : '#7eb0ff'}" opacity="${.4 + r}"/>`;
    }
    u += bw + 2;
  }
  for (let m = 0; m <= width; m += 46) s += `<rect x="${m}" y="${-h}" width="2.5" height="${h}" fill="#26324a"/>`;
  return s + `<rect x="0" y="${-h}" width="${width}" height="5" fill="#26324a"/><rect x="0" y="-3" width="${width}" height="3" fill="#3d7bff"/>`;
}

function fplant(x, y) {
  const [px, py] = FP(x + 0.35, y + 0.35, 1.6);
  return fbox(x, y, 0, 0.7, 0.7, 0.7, ['#e5e7eb', '#9ca3af', '#c4c9d1']) +
    `<circle cx="${px}" cy="${py + 6}" r="18" fill="#22804f"/><circle cx="${px - 9}" cy="${py}" r="12" fill="#2f9d63"/>
     <circle cx="${px + 8}" cy="${py - 6}" r="11" fill="#3bb574"/><circle cx="${px}" cy="${py - 14}" r="9" fill="#46c17f"/>`;
}
const fchair = (x, y) => fbox(x, y, 0, 0.6, 0.6, 0.45, ['#e4e7ec', '#8a94a3', '#b3bbc6']) + fbox(x, y, 0.45, 0.6, 0.1, 0.55, ['#d7dbe2', '#7c8696', '#a2abb8']);
const laptop = (x, y) => fbox(x, y, 0.76, 0.8, 0.5, 0.04, ['#c9ced6', '#8b93a0', '#a9b0bb']) +
  fbox(x, y - 0.02, 0.8, 0.8, 0.06, 0.5, ['#333', '#4f8dff', '#22293a']);

function fequip(t) {
  const c = t.color;
  if (t.equip === 'cabinet') return [0, 1, 2, 3].map(i => fbox(11.6 + i * 0.95, 0.3, 0, 0.85, 0.75, 1.9, ['#eef1f5', '#9aa5b5', '#c2cad6'])).join('') +
    fbox(11.8, 0.4, 1.9, 0.5, 0.4, 0.3, [c, c, c]) + fbox(13.7, 0.4, 1.9, 0.6, 0.4, 0.25, ['#f6c453', '#d9a632', '#e8b742']);
  if (t.equip === 'screen') return fbox(11.6, 0.4, 0, 1.5, 1.3, 2.4, ['#eef1f5', '#97a3b4', '#bdc6d3']) +
    fbox(11.75, 0.5, 0.5, 1.2, 1.25, 1.5, ['#1d3157', '#1d3157', '#2b4a80']) + fbox(12.15, 0.8, 0.9, 0.4, 0.4, 0.4, [c, c, c]) +
    fbox(13.6, 0.3, 0, 1.9, 0.7, 2.4, ['#dfe4ea', '#8592a6', '#aab5c4']) +
    [0, 1, 2].map(i => fbox(13.8 + i * 0.55, 0.4, 0.8 + (i % 2) * 0.7, 0.4, 0.4, 0.35, ['#c8ced8', '#7d8899', '#a1abba'])).join('');
  if (t.equip === 'cmm') return fbox(11.6, 0.5, 0, 3.4, 2, 0.95, ['#636b78', '#3a404b', '#4b525e']) +
    fbox(11.8, 0.6, 0.95, 0.25, 0.25, 1.7, ['#e5e7eb', '#a3aab5', '#c3c9d1']) + fbox(14.5, 0.6, 0.95, 0.25, 0.25, 1.7, ['#e5e7eb', '#a3aab5', '#c3c9d1']) +
    fbox(11.8, 0.6, 2.65, 2.95, 0.3, 0.3, [c, c, c]) + fbox(13.1, 0.6, 1.6, 0.2, 0.3, 1.05, ['#ddd', '#999', '#bbb']) +
    fbox(12.8, 1.2, 0.95, 0.9, 0.7, 0.4, ['#9aa3b0', '#6b7482', '#808a98']);
  return fbox(11.6, 0.3, 0, 3.8, 0.9, 2.4, ['#cfd5dd', '#7e8899', '#9ea8b7']) +
    [0.25, 1.05, 1.85].map(z => [0, 1, 2, 3].map(i => fbox(11.75 + i * 0.92, 0.4, z, 0.7, 0.65, 0.45, [i % 2 ? c : '#9aa6b8', '#5d6878', '#77839a'])).join('')).join('');
}

function personSVG(t, id, withBubble, spot) {
  const c = t.color, p = t.person;
  const [sx, sy] = FP(...spot, 0);
  return `<g class="fav" id="${id}" data-team="${t.id}" style="transform:translate(${sx}px,${sy}px)">
    <ellipse rx="20" ry="8" fill="${c}" opacity=".3"/><ellipse class="fring" rx="20" ry="8" fill="none" stroke="#16a34a" stroke-width="2.5"/>
    <g class="bob">
      <rect x="-7" y="-26" width="6" height="26" rx="2" fill="#1e2533"/><rect x="1" y="-26" width="6" height="26" rx="2" fill="#1e2533"/>
      <rect x="-12" y="-56" width="24" height="33" rx="9" fill="${c}"/>
      <rect x="-16" y="-53" width="5" height="24" rx="2.5" fill="${c}" opacity=".85"/><rect x="11" y="-53" width="5" height="24" rx="2.5" fill="${c}" opacity=".85"/>
      <path d="M-4 -56l4 7 4-7z" fill="#fff"/>
      <circle cx="0" cy="-67" r="12" fill="#f6d2b3"/>
      <path d="M-12 -69a12 12 0 0 1 24 0c-5-5-19-5-24 0z" fill="#2a2420"/>
      <circle cx="-4" cy="-66" r="1.4" fill="#222"/><circle cx="4" cy="-66" r="1.4" fill="#222"/>
    </g>
    <g transform="translate(0 -98)">
      <rect x="-62" y="-13" width="124" height="26" rx="13" fill="#141b2b" stroke="rgba(255,255,255,.3)"/>
      <circle cx="-48" cy="0" r="9" fill="${c}"/><text x="-48" y="3" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff">${p.short}</text>
      <text x="-35" y="4.5" font-size="12" font-weight="800" fill="#fff">${p.name}<tspan font-size="10" font-weight="500" fill="#c7d2e5"> ${t.name}</tspan></text>
      <circle class="fdot" cx="52" cy="0" r="4" fill="#16a34a"/>
    </g>
    ${withBubble ? `<g class="fbubble" transform="translate(0 -130)"><rect y="-14" height="28" rx="14" fill="#fff"/><text y="4.5" text-anchor="middle" font-size="12" font-weight="600" fill="#1b2230"></text></g>` : ''}
  </g>`;
}

function buildFloor(teamId) {
  const t = byTeam[teamId];
  let seed = t.floor * 97;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const [title, steps] = WORKFLOW[t.id];
  let s = `<defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#091228"/><stop offset="1" stop-color="#1a2f5e"/></linearGradient>
    <radialGradient id="fbg" cx=".5" cy=".55" r=".7"><stop offset="0" stop-color="#141e38"/><stop offset="1" stop-color="#05080f"/></radialGradient>
    <filter id="fglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <rect width="1100" height="760" fill="url(#fbg)"/>`;

  // 바닥 슬래브 + 네온 테두리
  s += fbox(0, 0, -0.5, FW, FD, 0.5, ['#e3e8ef', '#141b2e', '#1b2440']);
  for (let i = 2; i < FW; i += 2) { const [a, b] = [FP(i, 0, 0), FP(i, FD, 0)]; s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#c9d1dc" stroke-width=".6"/>`; }
  for (let i = 2; i < FD; i += 2) { const [a, b] = [FP(0, i, 0), FP(FW, i, 0)]; s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#c9d1dc" stroke-width=".6"/>`; }
  const edge = pts(FP(0, FD, -0.5), FP(FW, FD, -0.5), FP(FW, 0, -0.5));
  s += `<polyline points="${edge}" fill="none" stroke="#3d7bff" stroke-width="7" filter="url(#fglow)"/><polyline points="${edge}" fill="none" stroke="#7fb0ff" stroke-width="2"/>`;

  // 왼쪽 유리벽 (도시 야경)
  s += `<g transform="${onWallX(0, 0)}">${cityPanel(FD * FS, rnd)}</g>`;
  // 뒷벽: 유리 + 디스플레이 월 + 사인
  s += `<g transform="${onWallY(0, 0)}">${cityPanel(3.4 * FS, rnd)}
    <rect x="${3.4 * FS}" y="${-FWALL * FS}" width="${(FW - 3.4) * FS}" height="${FWALL * FS}" fill="#e6eaf0"/>
    <rect x="${3.4 * FS}" y="${-FWALL * FS}" width="${(FW - 3.4) * FS}" height="6" fill="#cfd6e0"/>
    <rect x="${3.4 * FS}" y="-3" width="${(FW - 3.4) * FS}" height="3" fill="#3d7bff"/>
    <rect x="135" y="-168" width="215" height="104" rx="4" fill="#0b1631" stroke="#3d7bff" stroke-width="2"/>
    <text x="242" y="-148" text-anchor="middle" font-size="10.5" font-weight="800" letter-spacing="1" fill="#fff">${title}</text>
    ${steps.map((st, i) => `<circle class="wf-step" cx="${162 + i * 54}" cy="-112" r="14" fill="none" stroke="#6fb1ff" stroke-width="2"/>
      <text x="${162 + i * 54}" y="-108" text-anchor="middle" font-size="10" font-weight="800" fill="#cfe2ff">${i + 1}</text>
      <text x="${162 + i * 54}" y="-84" text-anchor="middle" font-size="9" fill="#cfe2ff">${st}</text>
      ${i < 3 ? `<path d="M${180 + i * 54} -112h18" stroke="#6fb1ff" stroke-width="1.5" marker-end=""/>` : ''}`).join('')}
    <text x="374" y="-140" font-size="17" font-weight="900" fill="#1f3fae" opacity=".25" filter="url(#fglow)">HANKOOK MOLD</text>
    <text x="374" y="-140" font-size="17" font-weight="900" fill="#1f3fae">HANKOOK MOLD</text>
    <text x="374" y="-118" font-size="14" font-weight="800" fill="${t.color}">${t.floor}F ${t.name}</text>
    <rect x="374" y="-106" width="150" height="2" fill="${t.color}" opacity=".6"/></g>`;

  // 가구 (뒤 → 앞 순서)
  const items = [];
  const add = (depth, svg) => items.push([depth, svg]);
  // 팬트리
  add(1.2, fbox(0.25, 0.2, 0, 1, 0.9, 2.7, ['#d4dbe4', '#2a3d5c', '#9fb0c7']));
  add(3.0, fbox(0.25, 1.3, 0, 1, 3.4, 1.05, ['#f1f3f6', '#aab3c0', '#ccd3dd']) + fbox(0.45, 2.1, 1.05, 0.5, 0.5, 0.55, ['#2f3542', '#1f242e', '#292f3a']) +
    fbox(0.5, 3.4, 1.05, 0.3, 0.3, 0.25, ['#fff', '#d6d9de', '#e6e8ec']) + fbox(0.5, 3.9, 1.05, 0.3, 0.3, 0.25, ['#fff', '#d6d9de', '#e6e8ec']));
  // 팀 장비
  add(12.5, fequip(t));
  // 리더 데스크 (모니터 3대)
  add(7.6, fbox(4.6, 3.0, 0, 3.6, 1.1, 0.78, WHITE) +
    [0, 1, 2].map(i => fbox(4.8 + i * 1.1, 3.15, 0.78, 0.95, 0.08, 0.62, ['#333', i === 1 ? t.color : '#4f8dff', '#22293a'])).join(''));
  add(9.1, fchair(6.1, 4.3));
  // 업무 데스크 2열 × 3
  [[9.2, 5.2], [11.4, 5.2], [13.6, 5.2], [9.2, 7.9], [11.4, 7.9], [13.6, 7.9]].forEach(([x, y]) => {
    add(x + y + 0.5, fbox(x, y, 0, 1.9, 1.0, 0.76, WHITE) + laptop(x + 0.55, y + 0.25));
    add(x + y + 1.9, fchair(x + 0.65, y + 1.2));
  });
  // 회의 테이블
  const chairsAround = [[1.0, 6.3], [2.4, 5.6], [3.9, 5.6], [5.3, 6.6], [4.3, 8.6], [2.7, 8.9], [1.2, 8.2]];
  chairsAround.filter(([x, y]) => y < 7.2).forEach(([x, y]) => add(x + y, fchair(x, y)));
  add(10.4, fbox(3.05, 7.05, 0, 0.4, 0.4, 0.7, ['#9aa3b0', '#5f6876', '#7b8492']) +
    fellipse(3.25, 7.25, 0.68, 2.5, 1.35, '#c8ced8') + fellipse(3.25, 7.25, 0.76, 2.5, 1.35, '#f7f8fa', 'stroke="#d5dae2"') +
    fbox(3.0, 7.0, 0.76, 0.5, 0.35, 0.05, ['#1f2937', '#111', '#222']));
  chairsAround.filter(([x, y]) => y >= 7.2).forEach(([x, y]) => add(x + y + 0.8, fchair(x, y)));
  // 화분
  [[0.4, 10.0], [15.1, 0.4], [15.1, 9.9], [9.0, 0.4]].forEach(([x, y]) => add(x + y + 0.3, fplant(x, y)));

  items.sort((a, b) => a[0] - b[0]).forEach(([, svg]) => { s += svg; });
  s += personSVG(byTeam.admin === t ? byTeam.dev : byTeam.admin, 'fav-guest', false, FSPOTS.guest).replace('class="fav"', 'class="fav" opacity="0"');
  s += personSVG(t, 'fav-main', true, FSPOTS[t.person.status]);
  $('#floor-svg').innerHTML = s;
  $('#floor-svg').dataset.team = teamId;
}

function updateFloor() {
  const t = byTeam[state.floor], p = t.person;
  if ($('#floor-svg').dataset.team !== t.id) buildFloor(t.id);
  const main = $('#fav-main'), guest = $('#fav-guest');
  const [x, y] = FP(...FSPOTS[p.status], 0);
  main.style.transform = `translate(${x}px,${y}px)`;
  $('.fring', main).setAttribute('stroke', RING[p.status]);
  $('.fdot', main).setAttribute('fill', RING[p.status]);
  const label = `${EMO[p.status]} ${statusText(p)}`;
  const b = $('.fbubble', main);
  if ($('text', b).textContent !== label) {
    $('text', b).textContent = label;
    const w = Math.min(320, label.length * 12 + 28);
    $('rect', b).setAttribute('x', -w / 2);
    $('rect', b).setAttribute('width', w);
  }
  // 회의 상대가 이 층으로 방문
  const meetingHere = p.status === 'meet' && p.withTeam;
  if (meetingHere && guest.dataset.team !== p.withTeam) {
    guest.outerHTML = personSVG(byTeam[p.withTeam], 'fav-guest', false, FSPOTS.guest).replace('class="fav"', 'class="fav" opacity="0"');
  }
  $('#fav-guest').setAttribute('opacity', meetingHere ? 1 : 0);
  // 워크플로 진행 단계 표시
  const step = p.status === 'work' ? Math.min(3, Math.floor(p.progress / 25)) : -1;
  document.querySelectorAll('#floor-svg .wf-step').forEach((c, i) => {
    c.setAttribute('fill', i < step ? 'rgba(111,177,255,.25)' : i === step ? t.color : 'none');
    c.setAttribute('stroke', i === step ? '#fff' : '#6fb1ff');
  });
}

const RING = { work: '#16a34a', meet: '#ea8a0c', rest: '#8a94a6' };
const EMO = { work: '💻', meet: '💬', rest: '☕' };

function updateOffice() {
  TEAMS.forEach(t => {
    const el = document.getElementById('av-' + t.id);
    const [x, y] = avatarPos(t);
    el.style.transform = `translate(${x}px,${y}px)`;
    $('.ring', el).setAttribute('stroke', RING[t.person.status]);
    $('.emo', el).textContent = EMO[t.person.status];
  });
  document.querySelectorAll('.fchip').forEach(b => b.classList.toggle('on', (b.dataset.floor || null) === state.floor));
  $('#ticker').innerHTML = `<b>지금</b>${esc(state.lastEvent || 'AI 직원 4명 근무 중')}`;
  $('#tower-svg').toggleAttribute('hidden', !!state.floor);
  $('#floor-svg').toggleAttribute('hidden', !state.floor);
  $('#tower').classList.toggle('inside', !!state.floor);

  const card = $('#floor-card');
  if (!state.floor) {
    card.hidden = true;
    $('#chat-title').textContent = '한국몰드 AI 오피스 단톡방';
    $('#chat-sub').textContent = 'AI 직원 4명 · 실시간';
    return;
  }
  updateFloor();
  const t = byTeam[state.floor], p = t.person;
  $('#chat-title').textContent = `${t.floor}F ${t.name}`;
  $('#chat-sub').textContent = `${p.name} ${p.role} · 전체 단톡방 연결`;
  card.hidden = false;
  card.innerHTML = `<button class="x" onclick="enterFloor(null)" aria-label="타워로 돌아가기">×</button>
    <h4><span class="floor-badge" style="--c:${t.color};background:${t.color}">${t.floor}F</span>${t.name}</h4>
    <div class="member" style="--c:${t.color}">${avatar(t)}<div><b>${p.name}</b> <span>${p.role} · ${STATUS[p.status]}</span></div></div>
    <p>${esc(statusText(p))}</p>
    <div class="prog" style="--c:${t.color}"><div class="bar"><i style="width:${p.status === 'work' ? p.progress : 0}%"></i></div>${Math.floor(p.status === 'work' ? p.progress : 0)}%</div>
    <div class="label">오늘 완료 ${p.done.length}건</div>
    <ul class="done-list" style="margin-top:6px">${p.done.slice(-3).reverse().map(d => `<li>${esc(d.task)}</li>`).join('') || '<li style="list-style:none">아직 없음</li>'}</ul>`;
}

function enterFloor(id) { state.floor = id; updateOffice(); }
function goFloor(id) { state.floor = id; location.hash = '#/office'; if (state.route === 'office') updateOffice(); }

// ---------- 단톡방 · 자료 · AI에게 묻기 ----------
function renderChat(stick) {
  const body = $('#chat-body');
  const nearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 80;
  body.classList.toggle('plain', state.chatTab !== 'talk');
  $('#chat-foot').style.display = state.chatTab === 'files' ? 'none' : '';
  $('#chat-input').placeholder = state.chatTab === 'ask' ? '예: 김민성 지금 뭐 해?' : '메시지 입력…';

  if (state.chatTab === 'talk') {
    body.innerHTML = state.chat.map(m => {
      if (m.from === 'sys') return `<div class="msg sys"><div class="txt">${esc(m.text)}</div></div>`;
      if (m.from === 'me') return `<div class="msg me"><div class="row"><time>${hm(m.time)}</time><div class="txt">${esc(m.text)}</div></div></div>`;
      const t = byPerson[m.from];
      return `<div class="msg">${avatar(t)}<div class="col"><div class="who">${t.person.name}</div>
        <div class="row"><div class="txt">${esc(m.text)}</div><time>${hm(m.time)}</time></div></div></div>`;
    }).join('');
  } else if (state.chatTab === 'files') {
    body.innerHTML = state.reports.length
      ? state.reports.map(r => `<button class="file" onclick="openReport('${r.id}')">📄<div><b>${esc(r.title)}</b>
          <span>${r.author} · ${md(r.time)} ${hm(r.time)} · 첨부 ${r.files}</span></div></button>`).join('')
      : '<p style="color:var(--muted)">아직 공유된 자료가 없습니다.</p>';
  } else {
    body.innerHTML = `<div class="qa a">오피스 현황 데이터를 바탕으로 답변합니다. (시뮬레이션)</div>
      <div class="suggest">${['지금 누가 회의 중이야?', '오늘 완료한 업무', '김민성 지금 뭐 해?', '다음 일정 알려줘', '최근 보고서'].map(q => `<button onclick="ask('${q}')">${q}</button>`).join('')}</div>` +
      state.qa.map(x => `<div class="qa ${x.role}">${esc(x.text)}</div>`).join('');
  }
  if (stick === true ? nearBottom : true) body.scrollTop = body.scrollHeight;
}

function answer(q) {
  const t = TEAMS.find(t => q.includes(t.person.name) || q.includes(t.person.short) || q.includes(t.name));
  if (t) {
    const p = t.person;
    return `${p.name} (${t.floor}F ${t.name} · ${p.role})\n상태: ${STATUS[p.status]}\n${p.status === 'work' ? `현재 업무: ${p.current} (${Math.floor(p.progress)}%)` : `내용: ${statusText(p)}`}\n오늘 완료: ${p.done.length}건${p.done.length ? ' — ' + p.done.slice(-3).map(d => d.task).join(', ') : ''}\n다음 업무: ${p.queue[0]}`;
  }
  if (/회의/.test(q)) {
    const m = TEAMS.filter(t => t.person.status === 'meet');
    return m.length ? m.filter((t, i) => m.findIndex(x => x.id === t.person.withTeam) > i || !m.some(x => x.id === t.person.withTeam))
      .map(t => `• ${t.person.name} ↔ ${byTeam[t.person.withTeam].person.name}: ${t.person.note}`).join('\n') : '지금 진행 중인 회의는 없습니다.';
  }
  if (/완료|오늘/.test(q)) {
    return `오늘 완료한 업무는 총 ${state.doneCount}건입니다.\n` + TEAMS.map(t => `• ${t.person.name}: ${t.person.done.length}건${t.person.done.length ? ` (최근: ${t.person.done[t.person.done.length - 1].task})` : ''}`).join('\n');
  }
  if (/일정|스케줄/.test(q)) {
    return SCHEDULE.slice(0, 4).map(s => `• ${md(s.date)} ${s.s} ${s.title} — ${byTeam[s.team].name} (${dday(s.d)})`).join('\n');
  }
  if (/보고/.test(q)) {
    return state.reports.length ? `보고함에 ${state.reports.length}건이 있습니다.\n` + state.reports.slice(0, 4).map(r => `• ${r.title} — ${r.author}`).join('\n') : '보고함이 비어 있습니다.';
  }
  return '지금 오피스 현황입니다.\n' + TEAMS.map(t => `• ${t.person.name} (${t.name}): ${STATUS[t.person.status]} · ${statusText(t.person)}`).join('\n');
}

function ask(q) {
  state.qa.push({ role: 'q', text: q }, { role: 'a', text: answer(q) });
  renderChat();
}

function send() {
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  if (state.chatTab === 'ask') return ask(text);
  state.chat.push({ from: 'me', text, time: new Date() });
  renderChat();
  const t = TEAMS.find(t => text.includes(t.person.name) || text.includes(t.person.short)) || byTeam.admin;
  const p = t.person;
  const reply = p.status === 'work' ? `네, 지금 「${p.current}」 진행 중입니다 (${Math.floor(p.progress)}%). 확인 후 답변드릴게요.`
    : p.status === 'meet' ? `지금 ${p.note} 회의 중이라 끝나고 바로 확인하겠습니다.` : '잠깐 쉬는 중이었어요. 바로 확인하겠습니다!';
  chat(p.id, reply, 1200);
}

// ---------- 보고함 ----------
function renderReportList() {
  $('#rep-list').innerHTML = state.reports.map(r => `<button class="rep ${state.openReport === r.id ? 'on' : ''}" onclick="openReport('${r.id}')">
    <b>${esc(r.title)}${r.read ? '' : '<span class="new">NEW</span>'}</b>
    <span>${r.team.floor}F ${r.team.name} · ${r.author} · ${md(r.time)} ${hm(r.time)} · 📎 ${r.files}</span></button>`).join('') ||
    '<p style="color:var(--muted);margin:0">아직 보고서가 없습니다.</p>';
}

function openReport(id) {
  const r = state.reports.find(x => x.id === id);
  if (!r) return;
  r.read = true;
  state.openReport = id;
  if (state.route !== 'reports') location.hash = '#/reports';
  $('#viewer').innerHTML = `<h2>${esc(r.title)}</h2>
    <div class="meta">${avatar(r.team)}<span>${r.team.floor}F ${r.team.name} · ${r.author} · ${md(r.time)} ${hm(r.time)}</span></div>
    <h4>요약</h4><p style="margin:0">${esc(r.summary)}</p>
    <h4>주요 내용</h4><ul>${r.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h4>다음 단계</h4><p style="margin:0">${esc(r.next)}</p>
    <h4>첨부</h4><div class="files">${Array.from({ length: r.files }, (_, i) => `<span>📎 ${esc(r.title.split(' ')[0])}_${i + 1}.xlsx</span>`).join('')}</div>`;
  render();
}

// ---------- 라우팅 ----------
function route() {
  const r = (location.hash.match(/^#\/(\w+)/) || [])[1];
  state.route = ['monitor', 'office', 'reports'].includes(r) ? r : 'monitor';
  document.querySelectorAll('.view').forEach(v => { v.hidden = v.id !== 'view-' + state.route; });
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.route === state.route));
  if (state.route === 'office') renderChat();
  render();
}

document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.route; }));
$('#chat-tabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  state.chatTab = b.dataset.tab;
  document.querySelectorAll('#chat-tabs button').forEach(x => x.classList.toggle('on', x === b));
  renderChat();
});
$('#chat-send').addEventListener('click', send);
$('#chat-input').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) send(); });
$('#voice').addEventListener('click', () => {
  state.voice = !state.voice;
  $('#voice').classList.toggle('on', state.voice);
  $('#voice').textContent = state.voice ? '🔊 음성 알림 켜짐' : '🔈 음성 알림';
  if (state.voice) say('음성 알림을 켰습니다');
});
window.addEventListener('hashchange', route);

// ---------- 시작 ----------
const ago = m => new Date(Date.now() - m * 60000);
makeReport(byTeam.admin, '주간 업무 보고 취합', ago(95)).read = true;
makeReport(byTeam.dev, '시사출(T0) 결과 분석', ago(40));
state.chat.push({ from: 'sys', text: `${md(new Date())} AI 직원 4명 출근`, time: new Date() });
chat('lee', '좋은 아침입니다! 오늘 일정은 모니터링 화면에 올려두었습니다.');
chat('kgw', `오늘 ${SCHEDULE[0].s} ${SCHEDULE[0].title} 있습니다. 자료 준비 중이에요.`, 300);
chat('kkh', `${byTeam.prod.person.current} 진행하고 있습니다.`, 600);
chat('kms', '어제 시사출 샘플 측정 데이터 정리해서 공유드릴게요.', 900);
buildTower();
route();
setInterval(tick, 1000);
