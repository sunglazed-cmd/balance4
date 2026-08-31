/* ===================== DATA ===================== */
const FOOD_DB: FoodRow[] = [
["Куриная грудка",165],["Куриное бедро",185],["Куриные крылышки",203],["Говядина",250],["Свинина",260],
["Индейка филе",190],["Фарш говяжий",254],["Фарш куриный",143],["Лосось",208],["Тунец консерв.",116],
["Треска",82],["Креветки",99],["Яйцо куриное",155],["Творог 5%",121],["Творог обезжиренный",71],
["Йогурт натуральный",60],["Йогурт греческий",59],["Молоко 3.2%",60],["Молоко 1.5%",44],["Кефир 1%",40],
["Сыр твёрдый",350],["Сыр моцарелла",280],["Сыр фета",264],["Рис белый варёный",130],["Рис бурый варёный",111],
["Гречка варёная",92],["Овсянка варёная",88],["Овсяные хлопья сухие",342],["Макароны варёные",131],
["Киноа варёная",120],["Картофель варёный",82],["Картофель жареный",312],["Картофель фри",312],
["Хлеб белый",265],["Хлеб чёрный",250],["Хлеб цельнозерновой",247],["Батон",264],["Лаваш",236],
["Банан",89],["Яблоко",52],["Апельсин",43],["Виноград",69],["Груша",57],["Клубника",33],["Черника",57],
["Киви",61],["Манго",60],["Авокадо",160],["Помидор",18],["Огурец",15],["Морковь",41],["Капуста белокочанная",25],
["Брокколи",34],["Шпинат",23],["Лук репчатый",40],["Чеснок",149],["Перец болгарский",27],
["Фасоль варёная",127],["Чечевица варёная",116],["Нут варёный",164],["Грибы шампиньоны",27],
["Орехи грецкие",654],["Миндаль",579],["Арахис",567],["Кешью",553],["Фисташки",560],["Семечки подсолнечные",584],
["Мёд",304],["Сахар",387],["Оливковое масло",884],["Сливочное масло",717],["Подсолнечное масло",884],
["Шоколад молочный",535],["Шоколад тёмный",546],["Мороженое",207],["Пицца Маргарита",266],["Бургер",295],
["Суши/роллы (микс)",150],["Паста Карбонара",195],["Плов",200],["Борщ",49],["Куриный суп",55],
["Кофе с молоком",40],["Пиво",43],["Вино красное",85],["Кола",42],["Апельсиновый сок",45],
["Тофу",76],["Хумус",166],["Оливки",115],["Гранола",471],["Хлопья кукурузные",357],["Печенье овсяное",437],
["Пельмени",275],["Сосиски",266],["Колбаса варёная",257],["Бекон",541],["Икра красная",245]
];

const WORKOUT_DB: WorkoutRow[] = [
["Ходьба в среднем темпе",3.5],["Быстрая ходьба",4.3],["Бег 8 км/ч",8.3],["Бег 10 км/ч",9.8],
["Бег 12 км/ч",11.8],["Велосипед — умеренно",7.5],["Велосипед — интенсивно",10.0],["Плавание",7.0],
["Силовая тренировка",5.0],["Кроссфит",8.0],["Йога",2.5],["Пилатес",3.0],["Прыжки на скакалке",11.0],
["Футбол",7.0],["Баскетбол",6.5],["Теннис",7.0],["Танцы",4.8],["Гребной тренажёр",7.0],
["Эллиптический тренажёр",5.0],["Бокс",9.0],["Хайкинг / поход",6.0],["Растяжка",2.3],["Домашняя уборка",3.0]
];

/* ===================== TYPES =====================
   The app keeps everything in localStorage as plain JSON, so these interfaces describe
   the actual on-disk shapes. They are what makes a typo like `day.step` or a forgotten
   field fail at compile time instead of quietly rendering NaN. */

/** Row of the built-in food table: [название, ккал на 100 г]. */
type FoodRow = [string, number];
/** Row of the workout table: [название, MET]. */
type WorkoutRow = [string, number];

/** One eaten item inside a day's record. */
interface FoodEntry {
  id: string;
  name: string;
  grams: number;
  kcal100g: number;
  kcal: number;
  time: string;
}

/** One workout inside a day's record. `minutes` is null when kcal were entered by hand. */
interface WorkoutEntry {
  id: string;
  name: string;
  minutes: number | null;
  kcal: number;
  time: string;
}

/** Everything stored under the `day:YYYY-MM-DD` key. */
interface DayData {
  foods: FoodEntry[];
  workouts: WorkoutEntry[];
  steps?: number;
  /** Время в движении, миллисекунды: сумма промежутков между соседними шагами. */
  walkMs?: number;
  /**
   * Что показывал датчик, когда его цифры в последний раз применили к этому дню.
   * Нужно, чтобы правка руками пережила следующий опрос: дальше прибавляется только
   * прирост датчика, а не его полное значение, которое затёрло бы поправку.
   */
  sensorSteps?: number;
  sensorWalkMs?: number;
}

/** User profile, stored under the `profile` key. */
interface Profile {
  gender: 'm' | 'f';
  age: number;
  weight: number;
  height: number;
  activity: number;
  goal: 'lose' | 'maintain' | 'gain';
}

/** Что человек уже ел: имя, калорийность и последняя порция — из этого строятся подсказки. */
interface FoodHistoryEntry {
  name: string;
  kcal100g: number;
  grams: number;   // сколько взяли в прошлый раз
  count: number;   // сколько раз добавляли
  last: number;    // время последнего добавления
}

/** То же для тренировок. met = null, если калории вводили руками. */
interface WorkoutHistoryEntry {
  name: string;
  met: number | null;
  minutes: number | null;
  kcal: number;
  count: number;
  last: number;
}

/** A food the user added by hand, so it shows up in search next time. */
interface CustomFood {
  name: string;
  kcal100g: number;
}

/** Cached per-day totals for the calendar: c — съедено, b — сожжено, bud — бюджет. */
interface DaySummary {
  c: number;
  b: number;
  bud: number;
}

/** Totals for one day, as shown on the main screen. */
interface DayTotals {
  consumed: number;
  burned: number;
  budget: number;
  remaining: number;
}

/* ===================== STATE ===================== */
let profile: Profile | null = null;
let customFoods: CustomFood[] = [];
let foodHistory: FoodHistoryEntry[] = [];        // всё, что уже добавляли, для подсказок
let workoutHistory: WorkoutHistoryEntry[] = [];  // то же по тренировкам
let today: DayData = { foods: [], workouts: [], steps: 0, walkMs: 0 };
let currentDayKey: string | null = null; // date key that `today` currently holds data for
let historyCache: Record<string, DayData> = {};   // dateKey -> day record
let currentTab = 'today';
let genderVal: Profile['gender'] = 'm', activityVal = 1.375, goalVal: Profile['goal'] = 'maintain';
let foodSelectedName: string | null = null;
let workoutSelectedName: string | null = null;
let workoutMode = 'met'; // 'met' | 'manual'
let historySubtab = 'week';
let monthSummaryCache: Record<string, Record<string, DaySummary>> = {}; // 'summary:YYYY-MM' -> {"01":{c,b,bud}, ...}
let viewMonth = new Date(); viewMonth.setDate(1); // month currently shown in calendar
let viewYear = new Date().getFullYear();
let selectedDayKey: string | null = null;
let dayEditor: { key: string; data: DayData } | null = null;          // {key:'YYYY-MM-DD', data:{foods,workouts,steps}} — a past day open for editing
let editingFoodId: string | null = null;      // set while the food modal is editing an existing entry rather than adding a new one
let editingWorkoutId: string | null = null;   // same, for the workout modal

/* ---- pedometer state ---- */
let pedoActive = false;        // sensor listener currently attached
let pedoPending = false;       // wants to run but blocked (needs a tap, e.g. iOS permission gesture)
let pedoGravity = 9.81;        // running low-pass estimate of gravity magnitude
let pedoLastStepTime = 0;
let pedoLastStepAt = 0;        // отметка времени предыдущего шага — из неё копится время ходьбы
let pedoAboveThreshold = false;
let pedoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let pedoUnsavedSteps = 0;      // steps accumulated since last persisted save
let pedoAnyMotionReceived = false; // did we get at least one raw devicemotion event since starting?
let pedoWatchGen = 0;          // bumped on every start/stop so stale silence-timeouts can no-op
let pedoSilent = false;        // true once we've concluded the sensor isn't delivering events

/* ===================== HELPERS ===================== */
/**
 * `document.getElementById`, typed. The DOM library returns a bare `HTMLElement`, which has
 * no `.value` — and every lookup in this file is either a form control or a container we
 * write `.innerHTML`/`.style` into, so one intersection type covers the lot without
 * sprinkling casts through 60 call sites. Misspelled *properties* are still caught.
 */
type AnyEl = HTMLElement & HTMLInputElement & HTMLSelectElement;
function el(id: string): AnyEl {
  return document.getElementById(id) as unknown as AnyEl;
}
function pad(n){ return String(n).padStart(2,'0'); }
function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function todayKey(){ return dateKey(new Date()); }
function fmt(n){ return Math.round(n).toLocaleString('ru-RU'); }
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(msg: string){
  const t = el('toast');
  t.textContent = msg; t.classList.add('show');
  if(toastTimer !== null) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2200);
}
async function storeGet(key){
  try{
    const v = localStorage.getItem('cal_'+key);
    return v!==null ? JSON.parse(v) : null;
  }catch(e){ return null; }
}
async function storeSet(key, val){
  try{ localStorage.setItem('cal_'+key, JSON.stringify(val)); }catch(e){ console.error('storage set failed', e); }
}

/* ===================== TDEE ===================== */
function calcBMR(p){
  const s = p.gender === 'm' ? 5 : -161;
  return 10*p.weight + 6.25*p.height - 5*p.age + s;
}
function calcTDEE(p){ return calcBMR(p) * p.activity; }
function calcGoalCalories(p){
  const tdee = calcTDEE(p);
  if(p.goal === 'lose') return tdee * 0.8;
  if(p.goal === 'gain') return tdee * 1.12;
  return tdee;
}

/* ===================== VIEW SWITCH ===================== */
async function switchView(tab){
  await checkDayRollover();
  currentTab = tab;
  document.querySelectorAll<HTMLElement>('.view').forEach(v=>v.hidden = true);
  el('view-'+tab).hidden = false;
  el('view-'+tab).scrollTop = 0;   // у каждой вкладки теперь свой скролл — открываем её сверху
  document.querySelectorAll<HTMLElement>('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  if(tab === 'today') renderToday();
  if(tab === 'history') renderHistorySubtab();
  if(tab === 'profile') fillProfileForm();
}

/* ===================== PEDOMETER MATH ===================== */
function strideMeters(profile){
  const heightCm = profile ? profile.height : 175;
  return heightCm * 0.414 / 100; // common walking-stride approximation
}
function stepsDistanceM(steps, profile){ return steps * strideMeters(profile); }
/** Сколько человек тратит в минуту, просто существуя. Из обмена покоя за сутки. */
function restingKcalPerMinute(): number {
  const bmr = profile ? calcBMR(profile) : 1700;
  return bmr / 1440;
}

/**
 * Прогулка длится примерно столько, если время не измерено: 110 шагов в минуту —
 * обычный темп. Нужно, чтобы вычесть обмен покоя у дней без записанного времени.
 */
const STEPS_PER_MINUTE = 110;

/**
 * Калории за шаги — ЧИСТЫЕ, сверх обмена покоя.
 *
 * Формула шага (вес × 0,00057) даёт валовый расход: в него входит и то, что тело
 * потратило бы за это же время лёжа. Обмен покоя уже сидит в дневном бюджете, поэтому
 * без вычитания одни и те же калории считались дважды: 14 370 шагов за 124 минуты
 * давали 737 ккал вместо честных ~580.
 *
 * Время берётся измеренное, если оно есть, иначе оценивается по числу шагов.
 */
function stepsKcal(steps: number, weightKg: number, walkMs?: number): number {
  const w = weightKg || 70;
  const gross = steps * w * 0.00057;
  const minutes = walkMs && walkMs > 0 ? walkMs / 60000 : steps / STEPS_PER_MINUTE;
  return Math.max(0, gross - restingKcalPerMinute() * minutes);
}

/* ===================== TODAY RENDER ===================== */
function computeTotalsFor(dayObj){
  const consumed = dayObj.foods.reduce((s,f)=>s+f.kcal,0);
  const workoutBurn = dayObj.workouts.reduce((s,w)=>s+w.kcal,0);
  const walkBurn = stepsKcal(dayObj.steps||0, profile ? profile.weight : 70, dayObj.walkMs);
  const burned = workoutBurn + walkBurn;
  const goalCalories = profile ? calcGoalCalories(profile) : 2000;
  const budget = goalCalories + burned;
  const remaining = budget - consumed;
  return {consumed, burned, goalCalories, budget, remaining};
}
function computeTotals(){ return computeTotalsFor(today); }

async function checkDayRollover(){
  const key = todayKey();
  if(currentDayKey !== null && key !== currentDayKey){
    // date has rolled over while the app was open — archive old key stays as-is in storage,
    // load (or create) a fresh entry for the new day.
    const saved = await storeGet('day:'+key);
    today = saved || {foods:[], workouts:[], steps:0};
    today.steps = today.steps || 0;
    currentDayKey = key;
    historyCache = {}; // stale, dates shifted
    if(currentTab === 'today') renderToday();
    if(currentTab === 'history') renderHistorySubtab();
    return true;
  }
  currentDayKey = key;
  return false;
}

function renderToday(){
  const d = new Date();
  const dateStr = d.toLocaleDateString('ru-RU', {weekday:'long', day:'numeric', month:'long'});
  el('today-date').textContent = dateStr.charAt(0).toUpperCase()+dateStr.slice(1);

  const {consumed, burned, budget, remaining} = computeTotals();
  const pct = budget > 0 ? consumed / budget : 0;

  const r = 94, circ = 2*Math.PI*r;
  const ring = el('ring-fg');
  const shown = Math.min(pct, 1);
  ring.style.strokeDasharray = String(circ);
  ring.style.strokeDashoffset = String(circ * (1 - shown));

  let grad = 'url(#gradGood)', statusText = 'Всё по плану', statusColor = 'rgba(143,209,79,0.18)', statusFg = 'var(--good)';
  if(pct >= 0.8 && pct < 1.0){ grad='url(#gradWarn)'; statusText='Почти у цели'; statusColor='rgba(255,138,98,0.16)'; statusFg='var(--burn)'; }
  if(pct >= 1.0){ grad='url(#gradOver)'; statusText='Перебор бюджета'; statusColor='rgba(255,92,122,0.16)'; statusFg='var(--over)'; }
  ring.style.stroke = grad;

  const big = el('ring-big');
  const lbl = el('ring-lbl');
  if(remaining >= 0){ big.textContent = fmt(remaining); lbl.textContent = 'осталось ккал'; }
  else{ big.textContent = fmt(Math.abs(remaining)); lbl.textContent = 'перебор, ккал'; }
  const st = el('ring-status');
  st.textContent = statusText; st.style.background = statusColor; st.style.color = statusFg;

  el('chip-budget').textContent = fmt(budget);
  el('chip-eaten').textContent = fmt(consumed);
  el('chip-burned').textContent = fmt(burned);

  renderPedometer();

  renderFoodList(el('food-list'), today.foods, 'today');
  renderWorkoutList(el('workout-list'), today.workouts, 'today');
}

function renderFoodList(container, foods, mode){
  if(foods.length===0){
    container.innerHTML = `<div class="empty-hint">Пока ничего не добавлено. Нажми «Добавить», чтобы записать первый приём пищи.</div>`;
    return;
  }
  container.innerHTML = foods.slice().reverse().map(f=>`
    <div class="entry food" onclick="editFoodEntry('${f.id}','${mode}')">
      <div class="ico">🍽️</div>
      <div class="info">
        <div class="name">${escapeHtml(f.name)}</div>
        <div class="sub">${f.grams} г · ${f.time}</div>
      </div>
      <div class="kcal">${fmt(f.kcal)}</div>
      <button class="del" onclick="event.stopPropagation(); deleteFood('${f.id}')">✕</button>
    </div>`).join('');
}

function renderWorkoutList(container, workouts, mode){
  if(workouts.length===0){
    container.innerHTML = `<div class="empty-hint">Тренировок пока нет. Добавь активность, чтобы расширить бюджет.</div>`;
    return;
  }
  container.innerHTML = workouts.slice().reverse().map(w=>`
    <div class="entry workout" onclick="editWorkoutEntry('${w.id}','${mode}')">
      <div class="ico">🔥</div>
      <div class="info">
        <div class="name">${escapeHtml(w.name)}</div>
        <div class="sub">${w.minutes ? w.minutes+' мин · ' : ''}${w.time}</div>
      </div>
      <div class="kcal">-${fmt(w.kcal)}</div>
      <button class="del" onclick="event.stopPropagation(); deleteWorkout('${w.id}')">✕</button>
    </div>`).join('');
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ===================== PEDOMETER ===================== */
function renderPedometer(){
  const steps = today.steps || 0;
  const dist = stepsDistanceM(steps, profile);
  const kcal = stepsKcal(steps, profile ? profile.weight : 70, today.walkMs);
  el('pedo-steps').textContent = fmt(steps);
  el('pedo-distance').textContent = (dist/1000).toLocaleString('ru-RU', {minimumFractionDigits:1, maximumFractionDigits:1}) + ' км';
  el('pedo-kcal').textContent = fmt(kcal) + ' ккал';
  // Время появляется только когда оно есть: «0 мин» рядом с нулём шагов — лишний шум.
  const minutes = walkMinutes(today);
  el('pedo-time').textContent = minutes + ' мин';
  el('pedo-time').hidden = minutes <= 0;
  el('pedo-time-sep').hidden = minutes <= 0;

  const dot = el('pedo-dot');
  const lbl = el('pedo-toggle-lbl');
  const note = el('pedo-note');
  dot.classList.remove('active','pending');
  // Подсказка остаётся только там, где от человека что-то требуется. Когда всё работает,
  // состояние и так видно по кнопке, а лишний текст только занимает экран.
  note.hidden = false;
  if(pedoActive && pedoNative){
    dot.classList.add('active');
    lbl.textContent = 'Остановить';
    note.textContent = '';
    note.hidden = true;
  } else if(pedoActive && pedoSilent){
    dot.classList.add('pending');
    lbl.textContent = 'Остановить';
    note.textContent = 'Датчик не отвечает. Открой настройки сайта в браузере → Датчики движения → Разрешить, затем перезапусти шагомер.';
  } else if(pedoActive){
    dot.classList.add('active');
    lbl.textContent = 'Остановить';
    note.textContent = 'Шагомер активен — считает шаги, пока приложение открыто на экране.';
  } else if(pedoPending){
    dot.classList.add('pending');
    lbl.textContent = 'Возобновить';
    note.textContent = 'Нажми, чтобы возобновить подсчёт (нужно одно касание для разрешения на датчики движения).';
  } else if(nativePedometerAvailable()){
    lbl.textContent = 'Запустить';
    note.textContent = 'Запусти, чтобы шагомер считал шаги в фоне — даже при выключенном экране и закрытом приложении.';
  } else {
    lbl.textContent = 'Запустить';
    note.textContent = 'Считает шаги, пока приложение открыто на экране. Полный фоновый подсчёт недоступен веб-приложениям на Android.';
  }
}

/** Пауза длиннее этого — уже не одна прогулка: во «время в движении» не идёт. */
const WALK_GAP_MS = 10000;
/** Ходьба среднего темпа, MET — по нему считаются калории за время без телефона. */
const WALK_MET = 3.5;
const WALK_MANUAL_NAME = 'Ходьба (без телефона)';

/** Копит время ходьбы из промежутков между шагами. */
function registerWalkTime(target: DayData): void {
  const now = Date.now();
  if(pedoLastStepAt > 0){
    const gap = now - pedoLastStepAt;
    if(gap > 0 && gap <= WALK_GAP_MS) target.walkMs = (target.walkMs || 0) + gap;
  }
  pedoLastStepAt = now;
}

function walkMinutes(day: DayData): number {
  return Math.round((day.walkMs || 0) / 60000);
}

/**
 * Калории за ходьбу по времени — тоже чистые: из расхода по MET вычитается обмен покоя
 * за те же минуты, иначе прогулка без телефона считалась бы щедрее, чем та же прогулка
 * с телефоном в кармане.
 */
function walkTimeKcal(minutes: number): number {
  const weight = profile ? profile.weight : 70;
  const gross = WALK_MET * 3.5 * weight / 200 * minutes;
  return Math.max(0, Math.round(gross - restingKcalPerMinute() * minutes));
}

function pedoRegisterStep(){
  today.steps = (today.steps||0) + 1;
  registerWalkTime(today);
  pedoUnsavedSteps++;
  // Update the live numbers immediately for responsiveness...
  el('pedo-steps').textContent = fmt(today.steps);
  const dist = stepsDistanceM(today.steps, profile);
  const kcal = stepsKcal(today.steps, profile ? profile.weight : 70, today.walkMs);
  el('pedo-distance').textContent = (dist/1000).toLocaleString('ru-RU', {minimumFractionDigits:1, maximumFractionDigits:1}) + ' км';
  el('pedo-kcal').textContent = fmt(kcal) + ' ккал';
  // ...but only refresh the ring/chips + persist to storage every few steps (throttled) to avoid excess writes.
  if(pedoUnsavedSteps >= 5){ pedoFlush(); }
  else {
    clearTimeout(pedoSaveTimer);
    pedoSaveTimer = setTimeout(pedoFlush, 3000);
  }
}

async function pedoFlush(){
  clearTimeout(pedoSaveTimer);
  pedoSaveTimer = null;
  pedoUnsavedSteps = 0;
  await checkDayRollover();
  await storeSet('day:'+todayKey(), today);
  await updateMonthSummaryForDate(currentDayKey, computeTotals());
  renderToday(); // full refresh: ring/budget need to reflect the extra burned calories too
}

function pedoHandleMotion(event){
  const acc = event.accelerationIncludingGravity;
  if(!acc || acc.x===null || acc.x===undefined) return;
  const mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
  if(!mag || isNaN(mag)) return;
  pedoAnyMotionReceived = true;
  pedoGravity = pedoGravity*0.85 + mag*0.15; // slow-moving low-pass estimate of "gravity baseline"
  const delta = mag - pedoGravity;
  const now = Date.now();
  const STEP_THRESHOLD = 1.15;      // m/s^2 above baseline to register the peak of a step
  const RESET_THRESHOLD = 0.55;     // must dip back below this before the next step can count
  const MIN_STEP_INTERVAL = 280;    // ms — debounce so one physical step isn't counted twice

  if(delta > STEP_THRESHOLD && !pedoAboveThreshold && (now - pedoLastStepTime) > MIN_STEP_INTERVAL){
    pedoAboveThreshold = true;
    pedoLastStepTime = now;
    pedoRegisterStep();
  } else if(delta < RESET_THRESHOLD){
    pedoAboveThreshold = false;
  }
}

/* ---- native bridge: when this app is wrapped with Capacitor (a real installed Android app,
   not just a browser tab), a native plugin gives us TRUE background step counting via the
   phone's hardware sensor + a foreground service. A plain browser/PWA can never do this — see
   pedoHandleMotion() below for the best-effort fallback used everywhere else. ---- */
function nativePedometerAvailable(){
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.Pedometer);
}
let pedoNative = false;
let pedoPollTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Забирает у нативного сервиса то, что он насчитал с прошлого опроса.
 *
 * Раньше показания датчика просто подменяли число в дне, и поправка руками жила
 * ровно до следующего опроса — пять секунд. Теперь день хранит последнее применённое
 * показание (sensorSteps), и к нему прибавляется только прирост. Уменьшил шаги —
 * поправка остаётся, а новые шаги продолжают считаться поверх неё.
 */
async function pedoNativePoll(){
  try{
    const { steps, walkMs } = await window.Capacitor.Plugins.Pedometer.getSteps();
    let changed = false;

    if(typeof steps === 'number'){
      if(typeof today.sensorSteps !== 'number'){
        // Первый опрос за этот день (или запись из старой версии): просто принимаем счётчик.
        today.steps = steps;
      } else if(steps > today.sensorSteps){
        today.steps = Math.max(0, (today.steps || 0) + (steps - today.sensorSteps));
      }
      changed = changed || today.sensorSteps !== steps;
      today.sensorSteps = steps;
    }

    if(typeof walkMs === 'number'){
      if(typeof today.sensorWalkMs !== 'number'){
        today.walkMs = walkMs;
      } else if(walkMs > today.sensorWalkMs){
        today.walkMs = Math.max(0, (today.walkMs || 0) + (walkMs - today.sensorWalkMs));
      }
      changed = changed || today.sensorWalkMs !== walkMs;
      today.sensorWalkMs = walkMs;
    }

    if(changed){
      pedoUnsavedSteps++;
      renderPedometer();
      if(currentTab === 'today'){
        el('chip-burned').textContent = fmt(computeTotals().burned);
      }
      await pedoFlush();
    }
  }catch(e){ /* plugin call failed — next poll will retry */ }
}

async function startPedometer(){
  if(pedoActive) return;

  if(nativePedometerAvailable()){
    try{
      const perm = await window.Capacitor.Plugins.Pedometer.requestPermissions();
      if(!perm.granted){
        showToast('Доступ к датчику шагов не разрешён в настройках телефона');
        return;
      }
      await window.Capacitor.Plugins.Pedometer.start();
      pedoActive = true;
      pedoNative = true;
      pedoPending = false;
      pedoSilent = false;
      localStorage.setItem('cal_pedo_enabled', 'true');
      renderPedometer();
      clearInterval(pedoPollTimer);
      pedoPollTimer = setInterval(pedoNativePoll, 5000);
      pedoNativePoll();
    }catch(e){
      showToast('Не удалось запустить фоновый шагомер');
    }
    return;
  }

  // --- Browser/PWA fallback: foreground-only accelerometer heuristic ---
  if(typeof DeviceMotionEvent === 'undefined'){
    showToast('Датчики движения недоступны на этом устройстве');
    return;
  }
  // iOS 13+ requires an explicit permission prompt fired from a real user gesture.
  // `requestPermission` only exists on iOS Safari, so it is not part of the standard DOM
  // typings — narrow it here instead of casting at every use.
  const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
  };
  if(typeof motionEvent.requestPermission === 'function'){
    try{
      const res = await motionEvent.requestPermission();
      if(res !== 'granted'){
        pedoPending = false; pedoActive = false;
        localStorage.setItem('cal_pedo_enabled', 'false');
        renderPedometer();
        showToast('Доступ к датчикам движения не разрешён');
        return;
      }
    }catch(e){
      // requestPermission threw — most likely called without a user gesture (e.g. auto-resume on load).
      pedoPending = true; pedoActive = false;
      renderPedometer();
      return;
    }
  }
  window.addEventListener('devicemotion', pedoHandleMotion);
  pedoActive = true;
  pedoNative = false;
  pedoPending = false;
  pedoGravity = 9.81;
  pedoAboveThreshold = false;
  pedoAnyMotionReceived = false;
  pedoSilent = false;
  localStorage.setItem('cal_pedo_enabled', 'true');
  renderPedometer();

  // If the browser never delivers a single devicemotion event within a few seconds,
  // the sensor is almost certainly blocked (site permission, OS-level toggle, or unsupported
  // browser) — let the person know instead of leaving them staring at a counter that never moves.
  const startedAtGen = ++pedoWatchGen;
  setTimeout(()=>{
    if(pedoWatchGen !== startedAtGen) return; // pedometer was stopped/restarted since — ignore stale check
    if(pedoActive && !pedoAnyMotionReceived){
      pedoSilent = true;
      showToast('Датчик движения не отвечает — проверь разрешение «Датчики движения» для сайта в настройках браузера');
      renderPedometer();
    }
  }, 4000);
}

function stopPedometer(){
  if(pedoNative && nativePedometerAvailable()){
    window.Capacitor.Plugins.Pedometer.stop().catch(()=>{});
    clearInterval(pedoPollTimer);
    pedoPollTimer = null;
  }
  window.removeEventListener('devicemotion', pedoHandleMotion);
  pedoActive = false;
  pedoNative = false;
  pedoPending = false;
  pedoWatchGen++;
  localStorage.setItem('cal_pedo_enabled', 'false');
  if(pedoUnsavedSteps > 0) pedoFlush();
  renderPedometer();
}

function togglePedometer(){
  if(pedoActive) stopPedometer();
  else startPedometer();
}

async function saveTodayAndRender(){
  await checkDayRollover();
  await storeSet('day:'+todayKey(), today);
  await updateMonthSummaryForDate(currentDayKey, computeTotals());
  renderToday();
}

async function updateMonthSummaryForDate(dateKeyStr, totals){
  const [y,m,dd] = dateKeyStr.split('-');
  const monthKey = `summary:${y}-${m}`;
  let summary = monthSummaryCache[monthKey];
  if(!summary){ summary = (await storeGet(monthKey)) || {}; }
  const dayObj = dateKeyStr===currentDayKey ? today : (dayEditor && dayEditor.key===dateKeyStr ? dayEditor.data : null);
  const hasEntries = dayObj ? (dayObj.foods.length>0 || dayObj.workouts.length>0 || (dayObj.steps||0)>0) : true;
  if(!hasEntries){
    delete summary[dd];
  } else {
    summary[dd] = {c: Math.round(totals.consumed), b: Math.round(totals.burned), bud: Math.round(totals.budget)};
  }
  monthSummaryCache[monthKey] = summary;
  await storeSet(monthKey, summary);
}

async function getMonthSummary(y, m){ // m: 1-12
  const monthKey = `summary:${y}-${pad(m)}`;
  if(monthSummaryCache[monthKey]) return monthSummaryCache[monthKey];
  const s = (await storeGet(monthKey)) || {};
  monthSummaryCache[monthKey] = s;
  return s;
}

/* ---- shared add-target: lets the same food/workout modals write into either
   today's live data, or an arbitrary past day opened in the day editor ---- */
let addTargetMode = 'today'; // 'today' | 'dayeditor'
function currentAddTarget(){
  return addTargetMode === 'dayeditor' && dayEditor ? dayEditor.data : today;
}
async function persistAddTarget(){
  forgetFirstFoodDay();
  if(addTargetMode === 'dayeditor' && dayEditor){
    await saveDayEditorAndRender();
  } else {
    await saveTodayAndRender();
  }
}

function deleteFood(id){
  const t = currentAddTarget();
  t.foods = t.foods.filter(f=>f.id!==id);
  persistAddTarget();
}
function deleteWorkout(id){
  const t = currentAddTarget();
  t.workouts = t.workouts.filter(w=>w.id!==id);
  persistAddTarget();
}

/* ===================== HISTORY ===================== */
function setHistorySubtab(tab){
  historySubtab = tab;
  ['week','month','year'].forEach(t=>{
    el('hsub-'+t).classList.toggle('on', t===tab);
    el('hist-'+t+'-view').style.display = (t===tab) ? 'block' : 'none';
  });
  const eyebrow = {week:'неделя', month:'месяц', year:'год'}[tab];
  el('hist-eyebrow').textContent = eyebrow;
  renderHistorySubtab();
}

/**
 * День первой записи еды — от него ведётся вся история. Раньше него смотреть не на что:
 * пустые дни до начала ведения дневника не «экономия», а просто отсутствие данных.
 * Ищем по месячным сводкам: в них у каждого дня лежит съеденное (c), и c > 0 бывает
 * только когда еда записана — шаги и тренировки в эту графу не попадают.
 */
let firstFoodDayCache: string | null = null;

/** Сбрасывается при любой записи: первая запись могла появиться раньше известной. */
function forgetFirstFoodDay(): void {
  firstFoodDayCache = null;
}

async function firstFoodDayKey(): Promise<string | null> {
  if(firstFoodDayCache) return firstFoodDayCache;
  const monthKeys: string[] = [];
  for(let i = 0; i < localStorage.length; i++){
    const raw = localStorage.key(i);
    if(raw && raw.startsWith('cal_summary:')) monthKeys.push(raw.slice('cal_'.length));
  }
  monthKeys.sort();
  for(const monthKey of monthKeys){
    const summary: Record<string, DaySummary> = (await storeGet(monthKey)) || {};
    const days = Object.keys(summary).filter(d => (summary[d] && summary[d].c > 0)).sort();
    if(days.length > 0){
      firstFoodDayCache = monthKey.slice('summary:'.length) + '-' + days[0];
      return firstFoodDayCache;
    }
  }
  // Первая запись может быть сделана только что и ещё не попасть в сводку.
  if(today.foods.length > 0 && currentDayKey){
    firstFoodDayCache = currentDayKey;
    return firstFoodDayCache;
  }
  return null;
}

/**
 * Килокалорий в килограмме жира — по этому числу дефицит переводится в вес.
 * 7 700 — общепринятая оценка для жировой ткани.
 */
const KCAL_PER_KG = 7700;

/**
 * Дефицит или профицит одним числом, со знаком с точки зрения тела:
 * минус — съедено меньше бюджета (вес уходит), плюс — больше (вес приходит).
 *
 * Внутри день считается остатком бюджета (сколько ещё можно съесть), и там плюс
 * означает ровно обратное. Разворачиваем знак один раз здесь, чтобы во всей истории
 * он читался одинаково.
 */
function balanceFromRemaining(remaining: number): number {
  return -remaining;
}

/** Цвет по смыслу: для похудения и удержания хорош дефицит, для набора — профицит. */
function balanceColor(balance: number): string {
  const wantsSurplus = profile ? profile.goal === 'gain' : false;
  const good = wantsSurplus ? balance > 0 : balance < 0;
  if(balance === 0) return 'var(--text)';
  return good ? 'var(--good)' : 'var(--over)';
}

/** «−1 234» или «+1 234»: знак ставим всегда, иначе не видно, в какую сторону. */
function signedKcal(balance: number): string {
  return (balance > 0 ? '+' : balance < 0 ? '−' : '') + fmt(Math.abs(balance));
}

/** Сумма всех дневных остатков с первого дня записей: сколько всего сэкономлено или перебрано. */
async function renderHistoryTotal(): Promise<void> {
  const startKey = await firstFoodDayKey();
  const valueEl = el('hist-total-value');
  const labelEl = el('hist-total-label');
  const periodEl = el('hist-total-period');

  if(!startKey){
    valueEl.textContent = '—';
    valueEl.style.color = 'var(--text)';
    labelEl.textContent = 'за всё время';
    periodEl.textContent = 'Записей пока нет — добавь первый приём пищи';
    return;
  }

  const todayK = todayKey();
  let total = 0, daysCounted = 0;
  const start = new Date(startKey);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date();
  while(cursor <= last){
    const summary = await getMonthSummary(cursor.getFullYear(), cursor.getMonth() + 1);
    for(const dd of Object.keys(summary)){
      const key = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${dd}`;
      if(key < startKey || key > todayK) continue;
      // Сегодняшний день берём из живых данных: в сводку он попадает только после сохранения.
      if(key === todayK) continue;
      const day = summary[dd];
      total += day.bud - day.c;
      daysCounted++;
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  if(todayK >= startKey && (today.foods.length > 0 || today.workouts.length > 0 || (today.steps || 0) > 0)){
    total += computeTotals().remaining;
    daysCounted++;
  }

  const balance = balanceFromRemaining(total);
  valueEl.textContent = signedKcal(balance) + ' ккал';
  valueEl.style.color = balanceColor(balance);
  labelEl.textContent = balance === 0 ? 'ровно по бюджету' : balance < 0 ? 'суммарный дефицит' : 'суммарный профицит';

  const kg = Math.abs(balance) / KCAL_PER_KG;
  const kgText = kg >= 0.05 ? '≈ ' + kg.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' кг · ' : '';
  const startDate = new Date(startKey);
  periodEl.textContent = kgText + 'с ' + startDate.getDate() + ' ' + MONTH_NAMES_GENITIVE[startDate.getMonth()] +
    ' · ' + daysCounted + ' ' + pluralDays(daysCounted);
}

const MONTH_NAMES_GENITIVE = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

function pluralDays(n: number): string {
  const tail = n % 100;
  if(tail >= 11 && tail <= 14) return 'дней';
  const last = n % 10;
  if(last === 1) return 'день';
  if(last >= 2 && last <= 4) return 'дня';
  return 'дней';
}
function renderHistorySubtab(){
  renderHistoryTotal();
  if(historySubtab === 'week') renderWeekView();
  if(historySubtab === 'month') renderMonthView();
  if(historySubtab === 'year') renderYearView();
}

async function renderWeekView(){
  const container = el('week-bars');
  // История начинается с первой записи еды: дни до неё — не «идеальные», а просто
  // не прожитые в дневнике, и рисовать по ним столбики было бы враньём.
  const startKey = await firstFoodDayKey();
  const days: Date[] = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    if(startKey && dateKey(d) < startKey) continue;
    days.push(d);
  }
  if(days.length === 0) days.push(new Date());
  const goalCalories = profile ? calcGoalCalories(profile) : 2000;
  const results = [];
  for(const d of days){
    const key = dateKey(d);
    let data;
    if(key === todayKey()) data = today;
    else if(historyCache[key]) data = historyCache[key];
    else { data = (await storeGet('day:'+key)) || {foods:[],workouts:[],steps:0}; historyCache[key]=data; }
    const consumed = (data.foods||[]).reduce((s,f)=>s+f.kcal,0);
    const burned = (data.workouts||[]).reduce((s,w)=>s+w.kcal,0) + stepsKcal(data.steps||0, profile ? profile.weight : 70, data.walkMs);
    const budget = goalCalories + burned;
    // День без единой записи — это не «сэкономленный дневной бюджет», а пропуск:
    // засчитывать его в средний баланс значило бы хвалить себя за невнесённые данные.
    const logged = (data.foods||[]).length > 0 || (data.workouts||[]).length > 0 || (data.steps||0) > 0;
    results.push({d, consumed, burned, budget, remaining: budget-consumed, logged});
  }

  const maxAbs = Math.max(...results.map(r=>Math.abs(r.remaining)), goalCalories*0.15, 200);
  const weekdays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

  let html = '';
  results.forEach(r=>{
    const isToday = dateKey(r.d) === todayKey();
    const balance = balanceFromRemaining(r.remaining);
    // Половина дорожки — на каждую сторону оси, поэтому масштаб вдвое мельче.
    const hpx = r.logged ? Math.min(50, Math.abs(balance)/maxAbs*50) : 2;
    // Дефицит идёт вверх, перебор — вниз: по одному взгляду видно, какой был день.
    const side = balance > 0 ? 'down' : 'up';
    const color = !r.logged
      ? 'var(--surface2)'
      : balance <= 0 ? 'linear-gradient(180deg, var(--good), #5FAE33)' : 'linear-gradient(180deg, var(--over), #E23D5C)';
    // Столбик недели — вход в этот день: посмотреть и поправить, даже если он давно прошёл.
    html += `<div class="bar-col ${isToday?'today':''}" onclick="openDayEditor('${dateKey(r.d)}')">
      <div class="bar-track">
        <div class="bar-fill ${side}" style="height:${hpx}%; background:${color};"></div>
      </div>
      <div class="dlabel">${weekdays[r.d.getDay()]}</div>
    </div>`;
  });
  container.innerHTML = html;

  const logged = results.filter(r=>r.logged);
  const avg = logged.length > 0 ? logged.reduce((s,r)=>s+r.remaining,0)/logged.length : 0;
  el('hist-avg').textContent = logged.length > 0 ? signedKcal(balanceFromRemaining(avg)) : '—';
  const okDays = logged.filter(r=>r.remaining>=0).length;
  el('hist-days-ok').textContent = okDays+'/'+logged.length;
}

/* ---- month calendar ---- */
const MONTH_NAMES = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONTH_NAMES_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

function dayColor(remaining, budget){
  if(!budget || budget<=0) return null;
  const ratio = Math.min(1, Math.abs(remaining)/budget);
  const alpha = (0.32 + ratio*0.6).toFixed(2);
  return remaining >= 0 ? `rgba(143,209,79,${alpha})` : `rgba(255,92,122,${alpha})`;
}

async function shiftMonth(delta){
  const shifted = new Date(viewMonth.getFullYear(), viewMonth.getMonth()+delta, 1);
  if(await isBeforeFirstRecord(shifted)){
    showToast('Раньше первой записи истории нет');
    return;
  }
  viewMonth = shifted;
  selectedDayKey = null;
  el('day-detail').classList.remove('show');
  renderMonthView();
}

/** Месяц целиком раньше того, в котором сделана первая запись еды. */
async function isBeforeFirstRecord(month: Date): Promise<boolean> {
  const startKey = await firstFoodDayKey();
  if(!startKey) return false;
  const start = new Date(startKey);
  return month.getFullYear() < start.getFullYear() ||
    (month.getFullYear() === start.getFullYear() && month.getMonth() < start.getMonth());
}

async function renderMonthView(){
  const y = viewMonth.getFullYear(), m = viewMonth.getMonth()+1; // 1-12
  el('cal-month-title').textContent = `${MONTH_NAMES[m-1]} ${y}`;

  const summary = await getMonthSummary(y,m);

  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = (new Date(y, m-1, 1).getDay() + 6) % 7; // Mon=0
  const grid = el('cal-grid');
  let html = '';
  for(let i=0;i<firstDow;i++) html += `<div class="cal-cell empty"></div>`;

  const tKey = todayKey();
  for(let day=1; day<=daysInMonth; day++){
    const dd = pad(day);
    const key = `${y}-${pad(m)}-${dd}`;
    const isToday = key === tKey;
    const isFuture = key > tKey;
    let entry = summary[dd];
    if(isToday){
      const {consumed,burned,budget} = computeTotals();
      if(today.foods.length>0 || today.workouts.length>0) entry = {c:Math.round(consumed), b:Math.round(burned), bud:Math.round(budget)};
    }
    let style = '', cls = 'nodata';
    if(isFuture && !isToday){ cls='future'; }
    else if(entry){
      const remaining = entry.bud - entry.c;
      const color = dayColor(remaining, entry.bud);
      if(color){ style = `background:${color};`; cls=''; }
    }
    html += `<div class="cal-cell ${cls} ${isToday?'is-today':''} ${selectedDayKey===key?'selected':''}" style="${style}" onclick="selectDay('${key}')">${day}</div>`;
  }
  grid.innerHTML = html;

  if(selectedDayKey) showDayDetail(selectedDayKey, summary);
}

async function selectDay(key){
  selectedDayKey = key;
  const [y,m] = key.split('-');
  const summary = await getMonthSummary(y, parseInt(m));
  renderMonthView();
  showDayDetail(key, summary);
}

function showDayDetail(key, summary){
  const [y,m,dd] = key.split('-');
  const panel = el('day-detail');
  let entry = summary[dd];
  if(key === todayKey()){
    const {consumed,burned,budget} = computeTotals();
    if(today.foods.length>0 || today.workouts.length>0) entry = {c:Math.round(consumed), b:Math.round(burned), bud:Math.round(budget)};
  }
  const d = new Date(parseInt(y), parseInt(m)-1, parseInt(dd));
  const title = d.toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'});
  const isFuture = key > todayKey();
  const editBtn = isFuture ? '' : `<button class="dd-edit-btn" onclick="openDayEditor('${key}')">✏️ Редактировать день</button>`;
  if(!entry){
    panel.innerHTML = `<div class="dd-title">${title}</div><div class="dd-row">Нет записей за этот день</div>${editBtn}`;
  } else {
    const remaining = entry.bud - entry.c;
    panel.innerHTML = `
      <div class="dd-title">${title}</div>
      <div class="dd-row"><span>Бюджет</span><b>${fmt(entry.bud)}</b></div>
      <div class="dd-row"><span>Съедено</span><b>${fmt(entry.c)}</b></div>
      <div class="dd-row"><span>Сожжено</span><b>${fmt(entry.b)}</b></div>
      <div class="dd-row"><span>Баланс</span><b style="color:${balanceColor(balanceFromRemaining(remaining))}">${signedKcal(balanceFromRemaining(remaining))}</b></div>
      ${editBtn}
    `;
  }
  panel.classList.add('show');
}

/* ---- day editor: backfill / correct any past (or today's) day ---- */
async function openDayEditor(key){
  if(key === todayKey()){
    // Today already has full editing on its own tab — no need for a separate editor.
    switchView('today');
    return;
  }
  const data = (await storeGet('day:'+key)) || {foods:[], workouts:[], steps:0};
  data.foods = data.foods || [];
  data.workouts = data.workouts || [];
  data.steps = data.steps || 0;
  dayEditor = {key, data};
  addTargetMode = 'dayeditor';

  const [y,m,dd] = key.split('-');
  const d = new Date(parseInt(y), parseInt(m)-1, parseInt(dd));
  const title = d.toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'});
  el('dayedit-title').textContent = title;

  el('overlay-dayedit').classList.add('show');
  renderDayEditor();
}

function closeDayEditor(){
  el('overlay-dayedit').classList.remove('show');
  dayEditor = null;
  addTargetMode = 'today';
}

function renderDayEditor(){
  if(!dayEditor) return;
  const totals = computeTotalsFor(dayEditor.data);
  el('dayedit-summary').innerHTML = `
    <div class="stat-card"><div class="v">${fmt(totals.budget)}</div><div class="k">Бюджет</div></div>
    <div class="stat-card"><div class="v" style="color:var(--intake)">${fmt(totals.consumed)}</div><div class="k">Съедено</div></div>
    <div class="stat-card"><div class="v" style="color:${balanceColor(balanceFromRemaining(totals.remaining))}">${signedKcal(balanceFromRemaining(totals.remaining))}</div><div class="k">Баланс</div></div>
  `;
  const steps = dayEditor.data.steps || 0;
  const manual = manualWalkEntry(dayEditor.data);
  el('dayedit-walk').innerHTML = `
    <div class="cell"><div class="v">${fmt(steps)}</div><div class="k">шагов</div></div>
    <div class="cell"><div class="v">${(stepsDistanceM(steps, profile)/1000).toLocaleString('ru-RU', {minimumFractionDigits:1, maximumFractionDigits:1})}</div><div class="k">км</div></div>
    <div class="cell"><div class="v">${walkMinutes(dayEditor.data) + (manual && manual.minutes ? manual.minutes : 0)}</div><div class="k">минут</div></div>
  `;
  renderFoodList(el('dayedit-food-list'), dayEditor.data.foods, 'dayeditor');
  renderWorkoutList(el('dayedit-workout-list'), dayEditor.data.workouts, 'dayeditor');
}


async function saveDayEditorAndRender(){
  if(!dayEditor) return;
  await storeSet('day:'+dayEditor.key, dayEditor.data);
  await updateMonthSummaryForDate(dayEditor.key, computeTotalsFor(dayEditor.data));
  renderDayEditor();

  // Держим историю под редактором в согласии с правкой: и активную вкладку,
  // и суммарный итог наверху — он тоже меняется от каждой правки дня.
  renderHistorySubtab();
  if(selectedDayKey === dayEditor.key){
    const [y,m] = dayEditor.key.split('-');
    const summary = await getMonthSummary(y, parseInt(m));
    showDayDetail(dayEditor.key, summary);
  }
}


async function shiftYear(delta){
  const startKey = await firstFoodDayKey();
  if(startKey && viewYear + delta < new Date(startKey).getFullYear()){
    showToast('Раньше первой записи истории нет');
    return;
  }
  viewYear += delta;
  renderYearView();
}

async function renderYearView(){
  el('cal-year-title').textContent = String(viewYear);

  const monthSummaries = await Promise.all(
    Array.from({length:12}, (_,i)=>getMonthSummary(viewYear, i+1))
  );
  if(viewYear === new Date().getFullYear() && currentDayKey){
    const curM = new Date().getMonth();
    const {consumed,burned,budget} = computeTotals();
    if(today.foods.length>0 || today.workouts.length>0){
      monthSummaries[curM] = {...monthSummaries[curM], [pad(new Date().getDate())]: {c:Math.round(consumed), b:Math.round(burned), bud:Math.round(budget)}};
    }
  }

  // Год рисуется с первой записи, а не с 1 января: пустые клетки до начала дневника
  // не «нет данных», а «нас тут ещё не было», и занимают полэкрана впустую.
  const firstKey = await firstFoodDayKey();
  const firstInThisYear = firstKey && firstKey.slice(0, 4) === String(viewYear)
    ? new Date(firstKey)
    : null;
  const gridStart = firstInThisYear || new Date(viewYear,0,1);
  const startDow = (gridStart.getDay()+6)%7;
  const start = new Date(gridStart); start.setDate(gridStart.getDate()-startDow);
  const end = new Date(viewYear,11,31);
  const days = [];
  let cur = new Date(start);
  while(cur <= end){ days.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
  while(days.length % 7 !== 0){ days.push(new Date(cur)); cur.setDate(cur.getDate()+1); }

  const tKey = todayKey();
  let cellsHtml = '';
  let sumRemaining = 0, sumCount = 0, okCount = 0;
  const monthLabelCols = [];
  let lastMonthSeen = -1;

  days.forEach((d, idx)=>{
    const col = Math.floor(idx/7);
    const inYear = d.getFullYear() === viewYear;
    const key = dateKey(d);
    if(inYear && d.getMonth() !== lastMonthSeen){ lastMonthSeen = d.getMonth(); monthLabelCols.push({m:d.getMonth(), col}); }
    if(!inYear || (firstInThisYear && d < firstInThisYear)){
      cellsHtml += `<div class="year-cell" style="background:transparent;"></div>`;
      return;
    }
    if(key > tKey){ cellsHtml += `<div class="year-cell future"></div>`; return; }
    const dd = pad(d.getDate());
    const ms = monthSummaries[d.getMonth()] || {};
    const entry = ms[dd];
    if(!entry){ cellsHtml += `<div class="year-cell" title="${key}: нет данных"></div>`; return; }
    const remaining = entry.bud - entry.c;
    sumRemaining += remaining; sumCount++;
    if(remaining>=0) okCount++;
    const color = dayColor(remaining, entry.bud) || 'var(--surface2)';
    cellsHtml += `<div class="year-cell" style="background:${color};" title="${key}: ${signedKcal(balanceFromRemaining(Math.round(remaining)))} ккал"></div>`;
  });

  el('year-grid').innerHTML = cellsHtml;
  el('year-labels').innerHTML = monthLabelCols.map(x=>
    `<span style="grid-column:${x.col+1}">${MONTH_NAMES_SHORT[x.m]}</span>`).join('');

  const avg = sumCount ? sumRemaining/sumCount : 0;
  el('year-avg').textContent = signedKcal(balanceFromRemaining(avg));
  el('year-days-ok').textContent = `${okCount}/${sumCount}`;

  scrollYearToToday();
}

/**
 * Полоса года шире экрана, а интересен её правый край — сегодняшний день.
 * Без этого при открытии видно январь, до которого никому нет дела.
 */
function scrollYearToToday(): void {
  const scroller = document.querySelector('.year-scroll') as HTMLElement | null;
  if(!scroller) return;
  // Ширина содержимого появляется не сразу: вкладку только что показали, шрифты и сетка
  // ещё раскладываются. Пробуем несколько раз и останавливаемся, как только получилось.
  const attempts = [0, 60, 200, 500];
  attempts.forEach(delay => setTimeout(() => {
    if(scroller.scrollWidth <= scroller.clientWidth) return;   // прокручивать нечего
    if(scroller.scrollLeft > 0) return;                        // уже сдвинули (или человек сам)
    scroller.scrollLeft = scroller.scrollWidth;
  }, delay));
}

/* ===================== PROFILE ===================== */
function setGender(g){ genderVal=g; updateSegUI(); updateTdeePreview(); }
function setActivity(a){ activityVal=a; updateSegUI(); updateTdeePreview(); }
function setGoal(g){ goalVal=g; updateSegUI(); updateTdeePreview(); }

function updateSegUI(){
  el('seg-m').classList.toggle('on', genderVal==='m');
  el('seg-f').classList.toggle('on', genderVal==='f');
  [1.2,1.375,1.55,1.725,1.9].forEach((a,i)=>{
    el('seg-a'+(i+1)).classList.toggle('on', activityVal===a);
  });
  ['lose','maintain','gain'].forEach(g=>{
    el('seg-'+g).classList.toggle('on', goalVal===g);
  });
}

function readProfileForm(){
  return {
    gender: genderVal,
    age: parseFloat(el('in-age').value) || 28,
    weight: parseFloat(el('in-weight').value) || 70,
    height: parseFloat(el('in-height').value) || 175,
    activity: activityVal,
    goal: goalVal
  };
}


/** Показывает не только итог, но и из чего он сложился — иначе цифра выглядит взятой с потолка. */
function updateTdeePreview(){
  const p = readProfileForm();
  el('profile-tdee-preview').textContent = fmt(calcGoalCalories(p)) + ' ккал';
}

function fillProfileForm(){
  if(profile){
    genderVal = profile.gender; activityVal = profile.activity; goalVal = profile.goal;
    el('in-age').value = String(profile.age);
    el('in-weight').value = String(profile.weight);
    el('in-height').value = String(profile.height);
  }
  updateSegUI();
  updateTdeePreview();
}

async function saveProfile(){
  profile = readProfileForm();
  await storeSet('profile', profile);
  showToast('Профиль сохранён');
  switchView('today');
}

['in-age','in-weight','in-height'].forEach(id=>{
  document.addEventListener('DOMContentLoaded', ()=>{
    const input = el(id);
    if(input) input.addEventListener('input', updateTdeePreview);
  });
});

/* ===================== ИСТОРИЯ ДЛЯ ПОДСКАЗОК =====================
   Всё, что человек уже вводил, запоминается вместе с калорийностью и последней
   порцией: в следующий раз то же самое добавляется в два касания, без поиска. */

const HISTORY_LIMIT = 40;   // сколько позиций держим — дальше вытесняются самые старые
const SUGGEST_COUNT = 6;    // сколько показываем в блоке «Недавнее»

/** Свежее — вперёд. */
function byRecency(a: { last: number }, b: { last: number }): number {
  return b.last - a.last;
}

async function rememberFood(name: string, kcal100g: number, grams: number): Promise<void> {
  if(!name || kcal100g <= 0) return;
  const key = name.trim().toLowerCase();
  const found = foodHistory.find(f => f.name.trim().toLowerCase() === key);
  if(found){
    found.kcal100g = kcal100g;
    found.grams = grams;
    found.count++;
    found.last = Date.now();
  } else {
    foodHistory.push({ name: name.trim(), kcal100g, grams, count: 1, last: Date.now() });
  }
  foodHistory.sort(byRecency);
  foodHistory = foodHistory.slice(0, HISTORY_LIMIT);
  await storeSet('food_history', foodHistory);
}

async function rememberWorkout(name: string, met: number | null, minutes: number | null, kcal: number): Promise<void> {
  if(!name || kcal <= 0) return;
  const key = name.trim().toLowerCase();
  const found = workoutHistory.find(w => w.name.trim().toLowerCase() === key);
  if(found){
    found.met = met;
    found.minutes = minutes;
    found.kcal = kcal;
    found.count++;
    found.last = Date.now();
  } else {
    workoutHistory.push({ name: name.trim(), met, minutes, kcal, count: 1, last: Date.now() });
  }
  workoutHistory.sort(byRecency);
  workoutHistory = workoutHistory.slice(0, HISTORY_LIMIT);
  await storeSet('workout_history', workoutHistory);
}

/** Блок «Недавнее» в модалке еды — показывается, пока в поиске пусто. */
function renderFoodHistory(): void {
  const list = el('food-suggest');
  if(foodHistory.length === 0){
    list.innerHTML = '';
    return;
  }
  const items = foodHistory.slice(0, SUGGEST_COUNT);
  list.innerHTML = '<div class="suggest-head">Недавнее</div>' + items.map(f => `
    <div class="suggest-item" onclick='selectFood(${JSON.stringify(f.name)}, ${f.kcal100g}, ${f.grams})'>
      <div class="n">${escapeHtml(f.name)}</div>
      <div class="k">${f.kcal100g} ккал/100г · в прошлый раз ${fmt(f.grams)} г</div>
    </div>`).join('');
}

/** То же для тренировок: MET-запись возвращает минуты, ручная — сразу калории. */
function renderWorkoutHistory(): void {
  const list = el('workout-suggest');
  if(workoutHistory.length === 0){
    list.innerHTML = '';
    return;
  }
  const items = workoutHistory.slice(0, SUGGEST_COUNT);
  list.innerHTML = '<div class="suggest-head">Недавнее</div>' + items.map(w => {
    const hint = w.met !== null && w.minutes ? fmt(w.minutes) + ' мин · ' + fmt(w.kcal) + ' ккал' : fmt(w.kcal) + ' ккал';
    const call = w.met !== null
      ? `selectWorkout(${JSON.stringify(w.name)}, ${w.met}, ${w.minutes || 30})`
      : `selectWorkoutManual(${JSON.stringify(w.name)}, ${w.kcal})`;
    return `
    <div class="suggest-item" onclick='${call}'>
      <div class="n">${escapeHtml(w.name)}</div>
      <div class="k">${hint}</div>
    </div>`;
  }).join('');
}

/* ===================== FOOD MODAL ===================== */
function openFoodModal(){
  editingFoodId = null;
  el('food-modal-title').textContent = 'Добавить еду';
  el('overlay-food').classList.add('show');
  el('food-search').value='';
  renderFoodHistory();
  el('food-online-row').style.display='none';
  el('food-selected').style.display='none';
  foodSelectedName = null;
  setTimeout(()=>el('food-search').focus(), 300);
}
function closeFoodModal(){
  el('overlay-food').classList.remove('show');
  editingFoodId = null;
}

function editFoodEntry(id, mode){
  addTargetMode = mode;
  const entry = currentAddTarget().foods.find(f=>f.id===id);
  if(!entry) return;
  el('overlay-food').classList.add('show');
  el('food-modal-title').textContent = 'Редактировать запись';
  el('food-search').value='';
  el('food-suggest').innerHTML='';
  el('food-online-row').style.display='none';
  editingFoodId = id;
  selectFood(entry.name, entry.kcal100g);
  el('food-grams').value = String(entry.grams);
  updateFoodPreview();
}

function allFoods(): FoodRow[] {
  return [...FOOD_DB, ...customFoods.map((f): FoodRow => [f.name, f.kcal100g])];
}

function onFoodSearch(){
  const q = el('food-search').value.trim().toLowerCase();
  const list = el('food-suggest');
  const onlineRow = el('food-online-row');
  if(q.length < 2){ renderFoodHistory(); onlineRow.style.display='none'; return; }
  const matches = allFoods().filter(([n])=>n.toLowerCase().includes(q)).slice(0,7);
  if(matches.length===0){
    list.innerHTML = `<div class="empty-hint">Совпадений в базе не найдено</div>`;
    onlineRow.style.display='flex';
  } else {
    list.innerHTML = matches.map(([n,k])=>`
      <div class="suggest-item" onclick='selectFood(${JSON.stringify(n)}, ${k})'>
        <div class="n">${escapeHtml(n)}</div>
        <div class="k">${k} ккал/100г</div>
      </div>`).join('');
    onlineRow.style.display='flex';
  }
}

function selectFood(name: string, kcal100g: number, grams?: number){
  foodSelectedName = name;
  el('food-selected-name').textContent = name;
  el('food-kcal100').value = String(kcal100g);
  el('food-grams').value = String(grams && grams > 0 ? grams : 100);
  el('food-selected').style.display='block';
  updateFoodPreview();
  const foodSelBox = el('food-selected');
  if(foodSelBox.scrollIntoView) foodSelBox.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function manualFoodEntry(){
  const q = el('food-search').value.trim();
  selectFood(q || 'Продукт', 0);
  el('food-kcal100').value = '';
  el('food-kcal100').focus();
}

function updateFoodPreview(){
  const k100 = parseFloat(el('food-kcal100').value) || 0;
  const g = parseFloat(el('food-grams').value) || 0;
  el('food-preview-kcal').textContent = fmt(k100*g/100);
}

/* ===================== ПОИСК ПРОДУКТА В ИНТЕРНЕТЕ =====================
   Два источника, в порядке полезности для русской еды:

   1. calorizator.ru — их собственная таблица калорийности. Публичного API нет, но
      анализатор рецептов на сайте ходит в /widgets/c_ac.php и получает готовый JSON
      вида [{v: название, d: ккал на 100 г}]. Две особенности, выясненные опытом:
      кириллицу этот скрипт понимает только сырым UTF-8 в теле (процентное
      кодирование даёт пустой ответ), а CORS-заголовков он не отдаёт вовсе — значит
      запрос должен идти нативно, плагином CapacitorHttp, мимо правил браузера.
      Поэтому источник работает только в собранном приложении.

   2. Open Food Facts — открытая база с обычным API и CORS (поисковый сервис
      search.openfoodfacts.org: старый cgi/search.pl под нагрузкой отдаёт 503 HTML-ом).
      Работает и в браузере,
      но там в основном магазинные товары с этикеток, а не «творог 5%». Запасной. */

const CALORIZATOR_URL = 'https://calorizator.ru/widgets/c_ac.php';
const OFF_SEARCH_URL = 'https://search.openfoodfacts.org/search';        // без CORS — только нативно
const OFF_LEGACY_URL = 'https://world.openfoodfacts.org/cgi/search.pl';  // с CORS, но под нагрузкой отдаёт 503
const ONLINE_MAX_RESULTS = 7;
const ONLINE_TIMEOUT_MS = 12000;

/** Найденный продукт, уже приведённый к нужному виду. */
interface OnlineFood {
  name: string;
  kcal100g: number;
  note: string;    // марка или иная подсказка, показывается рядом с калорийностью
}

/** Открытые базы отдают названия уже с HTML-сущностями («Монарх &quot;Латте&quot;»).
 *  Если не раскодировать, при выводе они экранируются второй раз и видны как есть. */
function decodeEntities(text: string): string {
  const box = document.createElement('textarea');
  box.innerHTML = text;
  return box.value;
}

function isNativeApp(): boolean {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

async function searchCalorizator(query: string): Promise<OnlineFood[]> {
  const http = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp;
  if(!http) throw new Error('нативный HTTP недоступен');
  const resp = await http.request({
    url: CALORIZATOR_URL,
    method: 'POST',
    connectTimeout: ONLINE_TIMEOUT_MS,
    readTimeout: ONLINE_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Строкой, а не объектом: объект нативная часть закодирует процентами, и поиск
    // по кириллице вернёт пустоту.
    data: 'value=' + query
  });
  const raw = typeof resp.data === 'string' ? JSON.parse(resp.data || '[]') : (resp.data || []);
  if(!Array.isArray(raw)) return [];
  const out: OnlineFood[] = [];
  for(const item of raw){
    const name = decodeEntities(String(item.v || '')).trim();
    const kcal = Math.round(Number(item.d));
    if(!name || !isFinite(kcal) || kcal <= 0 || kcal > 900) continue;
    out.push({ name, kcal100g: kcal, note: 'calorizator.ru' });
    if(out.length >= ONLINE_MAX_RESULTS) break;
  }
  return out;
}

/**
 * GET, возвращающий JSON. Внутри приложения запрос делает нативная часть — ей не мешают
 * ни CORS, ни то, что у поискового сервиса Open Food Facts нужных заголовков нет вовсе.
 * В браузере остаётся обычный fetch, поэтому там адрес другой — тот, что CORS отдаёт.
 */
async function httpGetJson(url: string): Promise<Record<string, any>> {
  const http = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp;
  let status: number;
  let body: unknown;
  if(http){
    const resp = await http.request({
      url,
      method: 'GET',
      connectTimeout: ONLINE_TIMEOUT_MS,
      readTimeout: ONLINE_TIMEOUT_MS
    });
    status = resp.status;
    body = resp.data;
  } else {
    const resp = await fetch(url, { signal: AbortSignal.timeout(ONLINE_TIMEOUT_MS) });
    status = resp.status;
    body = await resp.text();
  }
  if(status < 200 || status >= 300) throw new Error('база ответила ' + status);
  if(typeof body !== 'string') return (body || {}) as Record<string, any>;
  try{
    return JSON.parse(body);
  }catch{
    // Под нагрузкой обе стороны Open Food Facts отдают HTML-страницу с ошибкой,
    // и стандартное сообщение про «<» вместо JSON ничего человеку не объясняет.
    throw new Error('база вернула не JSON (перегрузка или лимит запросов)');
  }
}

async function searchOpenFoodFacts(query: string): Promise<OnlineFood[]> {
  const url = isNativeApp()
    ? OFF_SEARCH_URL + '?q=' + encodeURIComponent(query) +
      '&page_size=24&fields=product_name,product_name_ru,brands,nutriments'
    : OFF_LEGACY_URL + '?search_terms=' + encodeURIComponent(query) +
      '&search_simple=1&action=process&json=1&page_size=24' +
      '&fields=product_name,product_name_ru,brands,nutriments';
  const data = await httpGetJson(url);
  // Поисковый сервис отдаёт hits, старый CGI — products; поля внутри те же.
  const list = (data.hits || data.products || []) as Array<Record<string, any>>;
  const seen = new Set<string>();
  const out: OnlineFood[] = [];
  for(const item of list){
    const name = decodeEntities(String(item.product_name_ru || item.product_name || '')).trim();
    const kcal = Math.round(Number(item.nutriments && item.nutriments['energy-kcal_100g']));
    // В открытой базе хватает записей без названия и с мусорными числами.
    if(!name || !isFinite(kcal) || kcal <= 0 || kcal > 900) continue;
    const key = name.toLowerCase() + '|' + kcal;
    if(seen.has(key)) continue;
    seen.add(key);
    const brand = decodeEntities(String(item.brands || '')).split(',')[0].trim();
    out.push({ name, kcal100g: kcal, note: brand || 'Open Food Facts' });
    if(out.length >= ONLINE_MAX_RESULTS) break;
  }
  return out;
}

/** Чем закончился поиск: список найденного плюс причины, если найти не удалось. */
interface OnlineSearchResult {
  items: OnlineFood[];
  /** Что ответил каждый источник — попадает в текст сообщения человеку. */
  failures: string[];
  /** Запрос, по которому в итоге что-то нашлось (может быть короче исходного). */
  usedQuery: string;
}

function shortError(e: unknown): string {
  const text = e instanceof Error ? e.message : String(e);
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

/**
 * Длинную фразу вроде «Кофе со сливками и сиропом» база продуктов не найдёт: там лежат
 * отдельные продукты. Поэтому пробуем сначала фразу целиком, потом её сокращения —
 * первые два слова, затем первое.
 */
function queryVariants(query: string): string[] {
  const words = query.split(/\s+/).filter(Boolean);
  const variants = [query];
  if(words.length > 2) variants.push(words.slice(0, 2).join(' '));
  if(words.length > 1) variants.push(words[0]);
  return variants.filter((v, i, all) => v.length >= 2 && all.indexOf(v) === i);
}

/** Пробуем источники по очереди, каждый — на всех вариантах запроса. */
async function searchFoodEverywhere(query: string): Promise<OnlineSearchResult> {
  const sources: Array<{ name: string; run: (q: string) => Promise<OnlineFood[]> }> = isNativeApp()
    ? [{ name: 'calorizator', run: searchCalorizator }, { name: 'Open Food Facts', run: searchOpenFoodFacts }]
    : [{ name: 'Open Food Facts', run: searchOpenFoodFacts }];
  const failures: string[] = [];
  for(const source of sources){
    for(const variant of queryVariants(query)){
      try{
        const found = await source.run(variant);
        if(found.length > 0) return { items: found, failures, usedQuery: variant };
      }catch(e){
        // Ошибка бывает и разовой (перегрузка сервиса), поэтому пробуем оставшиеся
        // варианты запроса, а не сдаёмся на первом сбое.
        const reason = source.name + ': ' + shortError(e);
        if(!failures.includes(reason)) failures.push(reason);
        console.warn('источник поиска не ответил', source.name, e);
      }
    }
  }
  return { items: [], failures, usedQuery: query };
}

async function searchFoodOnlineHandler(){
  const q = el('food-search').value.trim();
  if(!q){ showToast('Сначала введите название продукта'); return; }
  const btn = el('btn-search-online');
  const origHtml = btn.innerHTML;
  btn.innerHTML = '<div class="spinner"></div> Ищу…';
  try{
    const result = await searchFoodEverywhere(q);
    if(result.items.length === 0){
      // Разница принципиальная: «в базе нет такого продукта» и «база недоступна» —
      // это разные проблемы, и решения у них тоже разные.
      showToast(result.failures.length > 0
        ? 'Источники не ответили — ' + result.failures.join('; ')
        : 'В базах нет такого продукта — укажите калорийность вручную');
      manualFoodEntry();
      return;
    }
    // Выбор оставляем за человеком: на один запрос приходит несколько вариантов
    // с разной жирностью и разной калорийностью.
    const head = result.usedQuery === q
      ? 'Найдено в интернете'
      : 'Найдено по запросу «' + escapeHtml(result.usedQuery) + '»';
    el('food-suggest').innerHTML = '<div class="suggest-head">' + head + '</div>' + result.items.map(f => `
      <div class="suggest-item" onclick='selectFood(${JSON.stringify(f.name)}, ${f.kcal100g})'>
        <div class="n">${escapeHtml(f.name)}</div>
        <div class="k">${f.kcal100g} ккал/100г · ${escapeHtml(f.note)}</div>
      </div>`).join('');
  }catch(e){
    console.error(e);
    showToast('Поиск сорвался: ' + shortError(e));
    manualFoodEntry();
  }finally{
    btn.innerHTML = origHtml;
  }
}

async function confirmAddFood(){
  const name = foodSelectedName || el('food-selected-name').textContent;
  const k100 = parseFloat(el('food-kcal100').value) || 0;
  const g = parseFloat(el('food-grams').value) || 0;
  if(g<=0){ showToast('Укажите граммы'); return; }
  const kcal = Math.round(k100*g/100);
  const target = currentAddTarget();

  if(editingFoodId){
    const entry = target.foods.find(f=>f.id===editingFoodId);
    if(entry){ entry.name=name; entry.grams=g; entry.kcal100g=k100; entry.kcal=kcal; }
    editingFoodId = null;
  } else {
    target.foods.push({
      id: Date.now()+'-'+Math.random().toString(36).slice(2,7),
      name, grams: g, kcal100g: k100, kcal,
      time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})
    });
  }
  const exists = customFoods.some(f=>f.name.toLowerCase()===name.toLowerCase());
  if(!exists && k100>0){
    customFoods.push({name, kcal100g: k100});
    await storeSet('custom_foods', customFoods);
  }
  await rememberFood(name, k100, g);
  await persistAddTarget();
  closeFoodModal();
  showToast('Сохранено: '+name);
}

/* ===================== WORKOUT MODAL ===================== */
function openWorkoutModal(){
  editingWorkoutId = null;
  el('workout-modal-title').textContent = 'Добавить тренировку';
  el('overlay-workout').classList.add('show');
  el('workout-search').value='';
  renderWorkoutHistory();
  el('workout-selected').style.display='none';
  workoutSelectedName = null;
  setTimeout(()=>el('workout-search').focus(), 300);
}
function closeWorkoutModal(){
  el('overlay-workout').classList.remove('show');
  editingWorkoutId = null;
}

function editWorkoutEntry(id, mode){
  addTargetMode = mode;
  const entry = currentAddTarget().workouts.find(w=>w.id===id);
  if(!entry) return;
  editingWorkoutId = id;
  el('overlay-workout').classList.add('show');
  el('workout-modal-title').textContent = 'Редактировать тренировку';
  el('workout-search').value='';
  el('workout-suggest').innerHTML='';
  workoutSelectedName = entry.name;
  workoutMode = 'manual';
  el('workout-selected-name').textContent = entry.name;
  el('workout-met-row').style.display='none';
  el('workout-manual-row').style.display='flex';
  el('workout-manual-kcal').value = String(entry.kcal);
  el('workout-selected').style.display='block';
  updateWorkoutPreview();
}

function onWorkoutSearch(){
  const q = el('workout-search').value.trim().toLowerCase();
  const list = el('workout-suggest');
  if(q.length < 1){ renderWorkoutHistory(); return; }
  const matches = WORKOUT_DB.filter(([n])=>n.toLowerCase().includes(q)).slice(0,7);
  list.innerHTML = matches.length ? matches.map(([n,met])=>`
    <div class="suggest-item" onclick='selectWorkout(${JSON.stringify(n)}, ${met})'>
      <div class="n">${escapeHtml(n)}</div>
      <div class="k">MET ${met}</div>
    </div>`).join('') : `<div class="empty-hint">Не найдено. Можно ввести свою активность вручную.</div>`;
}

let currentMet = 0;
function selectWorkout(name: string, met: number, minutes?: number){
  workoutSelectedName = name; currentMet = met; workoutMode = 'met';
  el('workout-selected-name').textContent = name;
  el('workout-met-row').style.display='flex';
  el('workout-manual-row').style.display='none';
  el('workout-minutes').value = String(minutes && minutes > 0 ? minutes : 30);
  el('workout-selected').style.display='block';
  updateWorkoutPreview();
  const woSelBox = el('workout-selected');
  if(woSelBox.scrollIntoView) woSelBox.scrollIntoView({behavior:'smooth', block:'nearest'});
}

/** Тренировка из истории, которую в прошлый раз вводили калориями, а не по MET. */
function selectWorkoutManual(name: string, kcal: number){
  workoutSelectedName = name; workoutMode = 'manual';
  el('workout-selected-name').textContent = name;
  el('workout-met-row').style.display='none';
  el('workout-manual-row').style.display='flex';
  el('workout-manual-kcal').value = String(kcal);
  el('workout-selected').style.display='block';
  updateWorkoutPreview();
}

function manualWorkoutEntry(){
  const q = el('workout-search').value.trim();
  workoutSelectedName = q || 'Своя активность'; workoutMode = 'manual';
  el('workout-selected-name').textContent = workoutSelectedName;
  el('workout-met-row').style.display='none';
  el('workout-manual-row').style.display='flex';
  el('workout-manual-kcal').value='';
  el('workout-selected').style.display='block';
  updateWorkoutPreview();
  el('workout-manual-kcal').focus();
}

function updateWorkoutPreview(){
  let kcal = 0;
  if(workoutMode === 'met'){
    const minutes = parseFloat(el('workout-minutes').value) || 0;
    const weight = profile ? profile.weight : 70;
    kcal = currentMet * 3.5 * weight / 200 * minutes;
  } else {
    kcal = parseFloat(el('workout-manual-kcal').value) || 0;
  }
  el('workout-preview-kcal').textContent = fmt(kcal);
}

async function confirmAddWorkout(){
  const name = workoutSelectedName || 'Тренировка';
  let kcal, minutes = null;
  if(workoutMode === 'met'){
    minutes = parseFloat(el('workout-minutes').value) || 0;
    const weight = profile ? profile.weight : 70;
    kcal = Math.round(currentMet * 3.5 * weight / 200 * minutes);
  } else {
    kcal = Math.round(parseFloat(el('workout-manual-kcal').value) || 0);
  }
  if(kcal<=0){ showToast('Укажите значение больше 0'); return; }
  const target = currentAddTarget();

  if(editingWorkoutId){
    const entry = target.workouts.find(w=>w.id===editingWorkoutId);
    if(entry){ entry.name=name; entry.kcal=kcal; if(minutes!==null) entry.minutes=minutes; }
    editingWorkoutId = null;
  } else {
    target.workouts.push({
      id: Date.now()+'-'+Math.random().toString(36).slice(2,7),
      name, minutes, kcal,
      time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})
    });
  }
  await rememberWorkout(name, workoutMode === 'met' ? currentMet : null, minutes, kcal);
  await persistAddTarget();
  closeWorkoutModal();
  showToast('Сохранено: '+name);
}

/* ===================== ХОДЬБА ===================== */
/**
 * Один лист на оба случая: правка сегодняшнего дня и правка дня из истории.
 * Куда писать, решает currentAddTarget() — тот же механизм, что у еды и тренировок.
 *
 * Шаги и «ходьба без телефона» намеренно разведены: шаги дают калории через
 * пройденное расстояние, а время без телефона — через MET, как обычная тренировка.
 * Складывать их в одну графу нельзя, иначе одна прогулка посчиталась бы дважды.
 */
function walkTargetIsToday(): boolean {
  return !(addTargetMode === 'dayeditor' && dayEditor);
}

/** Запись про ходьбу без телефона, если она уже есть в этом дне. */
function manualWalkEntry(day: DayData): WorkoutEntry | undefined {
  return day.workouts.find(w => w.name === WALK_MANUAL_NAME);
}

function openWalkModal(){
  const target = currentAddTarget();
  el('walk-title').textContent = walkTargetIsToday() ? 'Ходьба сегодня' : 'Ходьба за этот день';

  el('walk-measured').textContent = (target.steps || 0) > 0 || walkMinutes(target) > 0
    ? 'Любое число можно поправить — и в меньшую сторону тоже. Шагомер считает дальше от исправленного, а не возвращает своё.'
    : 'Шагомер за этот день ничего не записал — впиши руками, сколько прошёл.';

  el('walk-steps').value = String(target.steps || 0);
  el('walk-time').value = String(walkMinutes(target));
  const manual = manualWalkEntry(target);
  el('walk-minutes').value = manual && manual.minutes ? String(manual.minutes) : '';
  updateWalkPreview();
  el('overlay-walk').classList.add('show');
}

function closeWalkModal(){
  el('overlay-walk').classList.remove('show');
}

/** Показывает, во что превратятся введённые числа, до нажатия «Сохранить». */
/** Время из поля листа ходьбы, миллисекунды — по нему считается предпросмотр калорий. */
function timeFieldMs(): number {
  return Math.max(0, parseInt(el('walk-time').value) || 0) * 60000;
}

function updateWalkPreview(){
  const steps = Math.max(0, parseInt(el('walk-steps').value) || 0);
  const minutes = Math.max(0, parseInt(el('walk-minutes').value) || 0);
  const dist = stepsDistanceM(steps, profile) / 1000;
  el('walk-steps-hint').textContent = dist.toLocaleString('ru-RU', {minimumFractionDigits: 1, maximumFractionDigits: 1}) +
    ' км · ' + fmt(stepsKcal(steps, profile ? profile.weight : 70, timeFieldMs())) + ' ккал';
  el('walk-minutes-hint').textContent = minutes > 0
    ? 'Прогулка, которую шагомер не увидел: ' + fmt(walkTimeKcal(minutes)) + ' ккал, попадёт в тренировки'
    : 'Прогулка, которую шагомер не увидел';

  const timeMinutes = Math.max(0, parseInt(el('walk-time').value) || 0);
  const pace = timeMinutes > 0 ? Math.round(steps / timeMinutes) : 0;
  el('walk-time-hint').textContent = pace > 0
    ? 'Получается ' + pace + ' шагов в минуту' + (pace > 145 ? ' — это уже бег' : pace < 60 ? ' — очень медленно' : '')
    : 'Столько насчитал шагомер';
}

async function saveWalk(){
  const target = currentAddTarget();
  target.steps = Math.max(0, parseInt(el('walk-steps').value) || 0);
  target.walkMs = Math.max(0, parseInt(el('walk-time').value) || 0) * 60000;

  const minutes = Math.max(0, parseInt(el('walk-minutes').value) || 0);
  const existing = manualWalkEntry(target);
  if(minutes > 0){
    const kcal = walkTimeKcal(minutes);
    if(existing){
      existing.minutes = minutes;
      existing.kcal = kcal;
    } else {
      target.workouts.push({
        id: Date.now()+'-'+Math.random().toString(36).slice(2,7),
        name: WALK_MANUAL_NAME,
        minutes,
        kcal,
        time: new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})
      });
    }
  } else if(existing){
    // Обнулили минуты — убираем и саму запись, чтобы не висела пустой строкой.
    target.workouts = target.workouts.filter(w => w !== existing);
  }

  await persistAddTarget();
  closeWalkModal();
  showToast('Ходьба сохранена');
}
/* ===================== ЭКРАННАЯ КЛАВИАТУРА =====================
   Android не всегда уменьшает WebView, когда открывается клавиатура: разметка остаётся
   прежней высоты, и всё, что приклеено к нижнему краю (наши модалки), уезжает под неё.
   visualViewport знает реальную видимую область — из разницы получаем высоту клавиатуры
   и отдаём её CSS переменной --kb. */
function trackKeyboardInset(): void {
  const vv = window.visualViewport;
  if(!vv) return;
  const apply = () => {
    const hidden = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
    document.documentElement.style.setProperty('--kb', Math.round(hidden) + 'px');
  };
  vv.addEventListener('resize', apply);
  vv.addEventListener('scroll', apply);
  apply();
}

/** Поле, на которое встал фокус, подтягиваем в видимую часть листа. */
function keepFocusedFieldVisible(): void {
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if(!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;
    setTimeout(() => {
      if(target.scrollIntoView) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 350);   // ждём, пока клавиатура доедет и --kb станет актуальной
  });
}

/* ===================== INIT ===================== */
async function init(){
  profile = await storeGet('profile');
  customFoods = (await storeGet('custom_foods')) || [];
  foodHistory = (await storeGet('food_history')) || [];
  workoutHistory = (await storeGet('workout_history')) || [];
  const savedToday = await storeGet('day:'+todayKey());
  today = savedToday || {foods:[], workouts:[], steps:0};
  today.steps = today.steps || 0;

  el('in-age').addEventListener('input', updateTdeePreview);
  el('in-weight').addEventListener('input', updateTdeePreview);
  el('in-height').addEventListener('input', updateTdeePreview);

  currentDayKey = todayKey();

  if(!profile){
    switchView('profile');
    showToast('Заполни профиль, чтобы рассчитать бюджет калорий');
    genderVal='m'; activityVal=1.375; goalVal='maintain';
    updateSegUI(); updateTdeePreview();
  } else {
    switchView('today');
  }
  renderToday();

  // Auto-resume the pedometer if it was running before the app was last closed/reloaded.
  if(localStorage.getItem('cal_pedo_enabled') === 'true'){
    startPedometer();
  } else {
    renderPedometer();
  }

  // Catch date rollover if the app is left open (or backgrounded as a PWA) across midnight,
  // and make sure any not-yet-persisted steps are saved before the app is backgrounded/closed.
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) checkDayRollover();
    else if(pedoUnsavedSteps > 0) pedoFlush();
  });
  trackKeyboardInset();
  keepFocusedFieldVisible();
  window.addEventListener('focus', checkDayRollover);
  window.addEventListener('pagehide', ()=>{ if(pedoUnsavedSteps > 0) pedoFlush(); });
  setInterval(checkDayRollover, 60*1000);
}
init();

/* The service worker exists for the browser/PWA version, where it makes the app work
   offline. Inside the native app it is not just useless but harmful: the assets are already
   local, and its cache-first strategy survives an app update, so a freshly installed APK would
   keep serving the previous build's index.html and app.js. So: register it in the browser,
   and actively tear down any worker left over from a browser session inside the shell. */
if('serviceWorker' in navigator){
  if(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()){
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .then(() => caches.keys())
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .catch(()=>{ /* nothing cached to clean up */ });
  } else {
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('service-worker.js').catch(e=>console.warn('SW registration failed', e));
    });
  }
}


/* ===================== GLOBAL HANDLER EXPORTS =====================
   index.html wires its buttons with inline handlers (onclick="openFoodModal()"),
   and this file is now a module, so its functions are no longer implicitly global.
   Everything the markup calls by name is published on window here, explicitly.
   The upside of doing it this way: a typo in this list is a compile error, while a
   typo in an onclick= attribute used to be a silent runtime failure. */
Object.assign(window as unknown as Record<string, unknown>, {
  closeDayEditor, closeFoodModal, closeWorkoutModal, confirmAddFood,
  confirmAddWorkout, deleteFood, deleteWorkout, editFoodEntry,
  editWorkoutEntry, manualFoodEntry, manualWorkoutEntry, onFoodSearch,
  onWorkoutSearch, openDayEditor, openFoodModal, openWorkoutModal,
  saveProfile, searchFoodOnlineHandler, selectDay, selectFood,
  selectWorkout, selectWorkoutManual, setActivity, setGender,
  setGoal,
  setHistorySubtab, shiftMonth, shiftYear, switchView,
  togglePedometer, updateFoodPreview, updateWorkoutPreview,
  openWalkModal, closeWalkModal, updateWalkPreview, saveWalk,
});

// This file is an ES module (loaded with <script type="module">), which keeps its
// declarations out of the global namespace — see the export block above for what is shared.
export {};
