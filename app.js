
    const ONBOARDED_KEY = "ironPulseOnboarded";
    const LAST_SCREEN_KEY = "ironPulseLastScreen";
    const WEEKLY_GOAL_KEY = "ironPulseWeeklyGoalDays";
    const DEFAULT_WEEKLY_GOAL = 4;
    const WEEKLY_GOAL_LOCKED_KEY = "ironPulseWeeklyGoalLocked";
    const WORKOUTS_THIS_WEEK_KEY = "ironPulseWorkoutsCompleted";
    const ROTATION_INDEX_KEY = "ironPulseRotationIndex";
    const WEEK_ID_KEY = "ironPulseWeekId";
    const WEEKLY_STREAK_KEY = "ironPulseWeeklyStreak";
    const ROTATION_ORDER = [0, 1, 2, 3];
    const LAST_FINISHER_DATE_KEY = "ironPulseLastFinisherDate";
    const EXERCISE_WEIGHT_KEY = "ironPulseExerciseWeights";
    const LAST_EMBLEM_KEY = "ironPulseLastEmblem";
    const EMBLEM_TIER_KEY = "ironPulseEmblemTier";
    const VOLUME_TIER_KEY = "ironPulseVolumeTier";
    const WEEKLY_GOAL_CELEBRATED_KEY = "ironPulse_weeklyGoalCelebrated";
    const WEEKLY_DAY_LOG_KEY = "ironPulse_weeklyDayLog"
    const WEEKDAY_LABELS_MON_FIRST = ["M", "T", "W", "T", "F", "S", "S"];
    const VOLUME_BAND_STATE_KEY = "ironPulseVolumeBandState"; 
    const FOCUS_VOLUME_SANITY_THRESHOLD = 60000; 
    const VOLUME_ICON_CLASS_BY_LABEL = {
    "Small backpack": "volume-icon-backpack",
    "Small car": "volume-icon-car",
    "SUV": "volume-icon-suv",
    "Pickup truck": "volume-icon-truck",
    "Tank": "volume-icon-tank",
    "Fighter jet": "volume-icon-jet",
    "Cargo plane": "volume-icon-cargo",
    "Orbital station": "volume-icon-orbital"
    };

const ENCOUNTER_THEMES = {
  gateDefault: {
    id: "gateDefault",
    type: "gate",
    spriteClass: "encounter-gate-default",
    introAnimationClass: "encounter-target-intro",
    hitAnimationClass: "encounter-gate-hit",
  },
  gateDamaged: {
    id: "gateDamaged",
    type: "gate",
    spriteClass: "encounter-gate-damaged",
    introAnimationClass: "encounter-target-intro",
    hitAnimationClass: "encounter-gate-hit",
  },
  gateCritical: {
    id: "gateCritical",
    type: "gate",
    spriteClass: "encounter-gate-critical",
    introAnimationClass: "encounter-target-intro",
    hitAnimationClass: "encounter-gate-hit",
  },
  gateElite: {
    id: "gateElite",
    type: "gate",
    spriteClass: "encounter-gate-elite",
    introAnimationClass: "encounter-target-intro",
    hitAnimationClass: "encounter-gate-hit",
  },
  gateBoss: {
    id: "gateBoss",
    type: "gate",
    spriteClass: "encounter-gate-boss",
    introAnimationClass: "encounter-target-intro",
    hitAnimationClass: "encounter-target-hit",
  },
};


// weapon tiers: which "skin" to use based on % of weekly target
const WEAPON_TIERS = [
  { id: "raw",         minPercent: 0,   maxPercent: 20,  cssClass: "weapon-tier-raw" },
  { id: "tempered1",   minPercent: 20,  maxPercent: 50,  cssClass: "weapon-tier-1"   },
  { id: "tempered2",   minPercent: 50,  maxPercent: 80,  cssClass: "weapon-tier-2"   },
  { id: "forged",      minPercent: 80,  maxPercent: 100, cssClass: "weapon-tier-3"   },
  { id: "overcharged", minPercent: 100, maxPercent: 999, cssClass: "weapon-tier-4"   },
];





function pickWeaponTier(percent) {
  for (const tier of WEAPON_TIERS) {
    if (percent >= tier.minPercent && percent < tier.maxPercent) return tier;
  }
  return WEAPON_TIERS[0]; // fallback
}
// Simple turn-based encounter engine
function runTurnBasedEncounter({ 
  totalTurns, 
  bossMaxHp, 
  attackPowerPerTurn, 
  onUpdate, 
  onEnd 
}) {
  let turnsLeft = totalTurns;
  let bossHp = bossMaxHp;

  function doAttack() {
    if (turnsLeft <= 0 || bossHp <= 0) return;

    bossHp = Math.max(0, bossHp - attackPowerPerTurn);
    turnsLeft--;

    if (typeof onUpdate === "function") {
      onUpdate({ bossHp, bossMaxHp, turnsLeft });
    }

    if (bossHp <= 0 || turnsLeft === 0) {
      if (typeof onEnd === "function") {
        onEnd({ bossHp, bossMaxHp, turnsUsed: totalTurns - turnsLeft });
      }
    }
  }

  return { doAttack };
}
function openWeeklyEncounter({
  theme = ENCOUNTER_THEMES.bossPulseGuardian,
  weaponPercent = 100,
  totalTurns = 4,
  bossMaxHp = 100,
  attackPowerPerTurn = 30,
}) {

      console.log("[Encounter] openWeeklyEncounter()", {
    themeId: theme.id,
    weaponPercent,
    totalTurns,
    bossMaxHp,
    attackPowerPerTurn
  });
  // Remove any existing overlay
  const existing = document.getElementById("encounter-overlay");
  if (existing) existing.remove();

  const tier = pickWeaponTier(weaponPercent);

  const overlay = document.createElement("div");
  overlay.id = "encounter-overlay";
  overlay.className = "encounter-overlay";

  overlay.innerHTML = `
    <div class="encounter-stage ${theme.spriteClass}" 
         data-encounter-type="${theme.type}"
         data-weapon-tier="${tier.id}">
      
      <div class="encounter-weapon" id="encounter-weapon"></div>
      <div class="encounter-target" id="encounter-target"></div>

      <div class="encounter-ui">
        <div class="encounter-bars">
          <div class="encounter-bar-label">Boss HP</div>
          <div class="encounter-bar-outer">
            <div class="encounter-bar-inner" id="encounter-boss-bar"></div>
          </div>

          <div class="encounter-bar-label">Turns Left</div>
          <div class="encounter-turns" id="encounter-turns"></div>
        </div>

        <div class="encounter-actions">
          <button type="button" class="btn btn-primary" id="encounter-strike-btn">
            Strike
          </button>
          <button type="button" class="btn btn-ghost" id="encounter-skip-btn">
            Skip
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const bossBarEl = overlay.querySelector("#encounter-boss-bar");
  const turnsEl = overlay.querySelector("#encounter-turns");
  const strikeBtn = overlay.querySelector("#encounter-strike-btn");
  const skipBtn = overlay.querySelector("#encounter-skip-btn");
  const stageEl = overlay.querySelector(".encounter-stage");
  const targetEl = overlay.querySelector("#encounter-target");
  const weaponEl = overlay.querySelector("#encounter-weapon");
    if (targetEl && theme.spriteClass) {
    targetEl.classList.add(theme.spriteClass);
    }

  // Init engine
  const encounter = runTurnBasedEncounter({
    totalTurns,
    bossMaxHp,
    attackPowerPerTurn,
    onUpdate: ({ bossHp, bossMaxHp, turnsLeft }) => {
  const percent = (bossHp / bossMaxHp) * 100;
  bossBarEl.style.width = `${percent}%`;
  turnsEl.textContent = `${turnsLeft} turn${turnsLeft === 1 ? "" : "s"} left`;

  // 🔁 Hit animation
  if (targetEl && theme.hitAnimationClass) {
    targetEl.classList.remove(theme.hitAnimationClass);
    void targetEl.offsetWidth;
    targetEl.classList.add(theme.hitAnimationClass);
  }

  // 🔥 Gate crack states (only for gate encounters)
if (stageEl.dataset.encounterType === "gate") {
  stageEl.classList.remove("encounter-gate-damaged", "encounter-gate-critical");

  if (percent <= 35) {
    stageEl.classList.add("encounter-gate-critical");
  } else if (percent <= 70) {
    stageEl.classList.add("encounter-gate-damaged");
  }
} else if (stageEl.dataset.encounterType === "boss") {
  stageEl.classList.remove("encounter-boss-damaged", "encounter-boss-critical");

  if (percent <= 35) {
    stageEl.classList.add("encounter-boss-critical");
  } else if (percent <= 70) {
    stageEl.classList.add("encounter-boss-damaged");
  }
}

},




    onEnd: ({ bossHp }) => {
      strikeBtn.disabled = true;

      if (bossHp <= 0) {
        stageEl.classList.add(theme.defeatAnimationClass);
      }

      // auto-close after a short delay (for now)
      setTimeout(() => {
        overlay.remove();
      }, 1400);
    }
  });

  bossBarEl.style.width = "100%";
  turnsEl.textContent = `${totalTurns} turns left`;
  stageEl.classList.add(theme.introAnimationClass);

  // NEW: enemy / gate intro
  setTimeout(() => {
    if (targetEl) {
      targetEl.classList.add("encounter-target-intro");
    }
  }, 50);

  // 🔥 NEW: weapon forge + idle pulse
  if (weaponEl) {
    // Delay so the enemy starts sliding in first
    setTimeout(() => {
      weaponEl.classList.add("encounter-weapon-materialize");

      setTimeout(() => {
        weaponEl.classList.remove("encounter-weapon-materialize");
        weaponEl.classList.add("encounter-weapon-idle");
      }, 1150);
    }, 220); // tweak this value to taste (150–300ms feels good)
  }




  strikeBtn.addEventListener("click", () => {
    // 🔨 Trigger hammer swing animation
    if (weaponEl) {
      weaponEl.classList.remove("encounter-hammer-swing");
      // force reflow so animation can restart
      void weaponEl.offsetWidth;
      weaponEl.classList.add("encounter-hammer-swing");
    }

    // Run the turn-based attack
    encounter.doAttack();
  });


  skipBtn.addEventListener("click", () => {
    overlay.remove();
  });

  // click backdrop to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function offerWeeklyEncounterCutIn({ isBossWeek = false } = {}) {
  // One key per type so gate and boss can be tracked separately
  const storageKey = isBossWeek
    ? "weeklyBossEncounterState"
    : "weeklyGateEncounterState";

  const existingState = localStorage.getItem(storageKey);
  console.log("[Cut-in] existing state =", existingState);

  // 🔎 IMPORTANT: for now, DO NOT early-return.
  // Once we confirm visuals work, we can re-enable this:
  // if (existingState === "skipped" || existingState === "seen") {
  //   console.log("[Cut-in] Skipping, state is", existingState);
  //   return;
  // }

  // Remove any previous instance
  const existing = document.getElementById("encounter-cutin");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "encounter-cutin";
  overlay.className = "encounter-cutin-overlay";

  const title = isBossWeek ? "Boss Week Trial" : "Weekly Trial Unlocked";
  const subtitle = isBossWeek
    ? "You’ve forged your strength all month. The Pulse Guardian stands in your way."
    : "Your training opened a new trial this week. Break the gate and mark this week in your favor.";

  const primaryLabel = isBossWeek ? "Face the Guardian" : "Enter Trial";
  const pillText = isBossWeek ? "BOSS WEEK" : "TRIAL READY";

  overlay.innerHTML = `
    <div class="encounter-cutin-card ${isBossWeek ? "cutin-boss" : "cutin-gate"}">
      <div class="cutin-header">
        <span class="cutin-pill">${pillText}</span>
        <h2 class="cutin-title">${title}</h2>
      </div>

      <p class="cutin-subtitle">
        ${subtitle}
      </p>

      <div class="cutin-actions">
        <button type="button" class="btn btn-primary" id="cutin-start-btn">
          ${primaryLabel}
        </button>
        <button type="button" class="btn btn-outline" id="cutin-later-btn">
          Later
        </button>
        <button type="button" class="cutin-skip" id="cutin-skip-btn">
          Skip this week
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const startBtn = overlay.querySelector("#cutin-start-btn");
  const laterBtn = overlay.querySelector("#cutin-later-btn");
  const skipBtn  = overlay.querySelector("#cutin-skip-btn");

  const setState = (state) => {
    localStorage.setItem(storageKey, state);
  };

  // Enter trial immediately
  if (startBtn) {
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("[Cut-in] Enter Trial clicked. isBossWeek =", isBossWeek);
    setState("seen");
    overlay.remove();
    launchWeeklyEncounterFromStats({ isBossWeek });
  });
}


  // “Later” – mark pending so we can show a small CTA elsewhere later
  if (laterBtn) {
    laterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setState("pending");
      overlay.remove();
    });
  }

  // “Skip this week”
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setState("skipped");
      overlay.remove();
    });
  }

  // Tap outside card = treat as "Later"
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      setState("pending");
      overlay.remove();
    }
  });
}



function launchWeeklyEncounterFromStats({ isBossWeek = false } = {}) {
  // Log so we know this is being hit
  console.log("[Encounter] launchWeeklyEncounterFromStats called. isBossWeek =", isBossWeek);

  const goalRaw = typeof getWeeklyGoal === "function" ? getWeeklyGoal() : null;
  const doneRaw = typeof getWorkoutsCompletedThisWeek === "function"
    ? getWorkoutsCompletedThisWeek()
    : 0;

  // Fallbacks so dev testing always shows *something*
  const goal = goalRaw || 4;
  const done = doneRaw || goal;  // if 0, pretend they hit the goal

  console.log("[Encounter] goal =", goal, "done =", done);

  // Rough volume % for now – you can plug real volume later
  const percentOfGoal = Math.min(
    160,
    Math.round((done / goal) * 100)
  );

  const daysTrained = Math.max(1, done);
  const totalTurns = Math.max(1, Math.min(daysTrained, 7));

  // Boss HP scaled to goal; attack scaled to progress
  const bossMaxHp = 100;
  const attackPowerPerTurn = Math.max(
    10,
    Math.round((percentOfGoal / 100) * (bossMaxHp / totalTurns))
  );

  console.log(
    "[Encounter] percentOfGoal =", percentOfGoal,
    "totalTurns =", totalTurns,
    "attackPowerPerTurn =", attackPowerPerTurn
  );

  const theme = isBossWeek
    ? ENCOUNTER_THEMES.bossPulseGuardian
    : ENCOUNTER_THEMES.gateDefault;

  openWeeklyEncounter({
    theme: ENCOUNTER_THEMES.gateDefault,
    weaponPercent: percentOfGoal,
    totalTurns,
    bossMaxHp,
    attackPowerPerTurn,
  });
}





function markTodayAsSkippedInWeeklyState() {
  const key = "ironpulse.weeklyState.v1";
  let state;
  try {
    state = JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    state = {};
  }

  const today = getTodayKey(); // you already use this for logging sets

  state[today] = {
    ...(state[today] || {}),
    status: "skipped"
  };

  localStorage.setItem(key, JSON.stringify(state));
}
const volumeTiers = {
  backpack: {
    iconClass: "volume-icon-backpack",
    label: "Backpack"
  },
  car: {
    iconClass: "volume-icon-car",
    label: "Small car"
  },
  suv: {
    iconClass: "volume-icon-suv",
    label: "SUV"
  },
  truck: {
    iconClass: "volume-icon-truck",
    label: "Pickup truck"
  },
  tank: {
    iconClass: "volume-icon-tank",
    label: "Tank"
  },
  jet: {
    iconClass: "volume-icon-jet",
    label: "Fighter jet"
  },
  cargo: {
    iconClass: "volume-icon-cargo",
    label: "Cargo plane"
  },
  orbital: {
    iconClass: "volume-icon-orbital",
    label: "Orbital station"
  }
};
function setWeeklyVolumeTier(tierKey) {
  const tier = volumeTiers[tierKey];
  if (!tier) return;

  const iconEl = document.getElementById("volume-object-icon");
  const labelEl = document.getElementById("volume-object-label");

  // Reset classes so we don't accumulate old ones
  iconEl.className = "volume-object-icon " + tier.iconClass + " volume-icon-enter";

  // Optional: remove any leftover emoji attribute
  iconEl.removeAttribute("data-emoji");

  // Update label text
  labelEl.textContent = tier.label;
}

const POST_WORKOUT_QUOTES = [
    "Small steps stack faster than you think.",
    "Every rep leaves a mark. Today’s is a good one.",
    "Progress doesn’t shout. It whispers — until it doesn’t.",
    "You’re closer than yesterday. That’s the whole point.",
    "Momentum earned, not given.",
    "Consistency beats intensity over time.",
    "You showed up today. That’s the hardest rep.",
    "You didn’t wait to feel ready. You started.",
    "Strong days are built on days like this.",
    "Today’s work will quietly show up later.",
    "You’re building someone you can rely on.",
    "Discipline is a skill. You’re sharpening it.",
    "You kept a promise to yourself today.",
    "This session is one more vote for the person you want to be.",
    "Tired but done is still done.",
    "You didn’t need perfect. You just needed effort.",
    "Progress is built on days just like this one.",
    "You finished. Most people never started.",
    "You turned intention into action.",
    "Your future self notices days like today.",
    "You moved your body. Your mind will thank you.",
    "Strong body, clearer head, better day.",
    "You traded comfort for progress. That adds up.",
    "Slow progress is still real progress.",
    "You proved you can show up when it’s easier not to.",
    "Not every workout is loud. This one still counts.",
    "You didn’t quit when it got boring. That matters.",
    "You handled the hard part. The rest of the day is lighter.",
    "You trained the muscle and the habit.",
    "You just raised your baseline a tiny bit.",
    "You stacked another brick on the wall.",
    "You’re quietly getting harder to stop.",
    "You pushed when no one was watching.",
    "Today’s effort is tomorrow’s normal.",
    "Your body will remember this work.",
    "You moved more than your mood.",
    "You finished what you started. That’s rare.",
    "You turned a plan into a result.",
    "You’ve got one more data point that says: I can do hard things.",
    "You just made the next workout easier to start.",
    "You didn’t need perfect energy — just enough.",
    "You kept the streak of effort alive.",
    "You showed yourself you can follow through.",
    "You’re teaching your brain that you’re serious.",
    "Your comfort zone shifted a little today.",
    "You chose long-term over short-term. Again.",
    "You did something for yourself that no one can take away.",
    "You turned pressure into progress.",
    "You used your time instead of losing it.",
    "You converted fatigue into confidence.",
    "You did the work. The results will catch up.",
    "You chose effort instead of excuses.",
    "You invested in strength you haven’t even needed yet.",
    "You showed up for your goals, not your feelings.",
    "You pushed through the part where most people stop.",
    "You did something future you can be proud of.",
    "You traded 1 hour for a better week.",
    "You turned a regular day into a win.",
    "You didn’t wait for motivation. You built it.",
    "You treated your health like a priority, not a slogan.",
    "You proved that low energy doesn’t mean zero effort.",
    "You made progress that only you needed to understand.",
    "You added one more rep to your story.",
    "You fought the urge to skip. That’s real strength.",
    "You showed up for yourself. Again.",
    "You picked effort over comfort. That’s how things change.",
    "You finished the session. The hardest part is over.",
    "You chose growth when nobody asked you to.",
    "You practiced doing what you said you would do.",
    "You gave your future self a better starting point.",
    "You built proof that you’re capable, not just hopeful.",
    "You didn’t let the day decide for you.",
    "You chose discipline, not default.",
    "You created momentum that only you can feel.",
    "You made it through the reps your mind wanted to skip.",
    "You pushed a little past your comfort zone.",
    "You trained even if today wasn’t perfect. That’s power.",
    "You gave yourself one less reason to doubt tomorrow.",
    "You turned resistance into resilience.",
    "You added another quiet win to your week.",
    "You didn’t coast. You contributed.",
    "You moved the needle, even if just a notch.",
    "You showed your limits they don’t get the final say.",
    "You made the hard thing look normal.",
    "You turned “I should” into “I did.”",
    "You invested in strength you’ll use outside the gym.",
    "You ended the session stronger than you started.",
    "You made today count in a way most people won’t.",
    "You took control of at least one part of your day.",
    "You proved that effort is always available.",
    "You made your next choice easier by finishing this one.",
    "You added weight to your confidence, not just the bar.",
    "You didn’t wait for the right mood. You created it.",
    "You practiced being the type of person you respect.",
    "You kept your word when no one was checking.",
    "You made progress in private that will show in public.",
    "You turned doubt into data: you can do more than you think.",
    "You finished tired, not empty. That’s a good line to live on.",
    "You repped out discipline one set at a time.",
    "You went from “maybe” to “done.”",
    "You added a chapter to your streak, not a footnote.",
    "You treated your goals like a job, not a wish.",
    "You gave yourself a win that can’t be scrolled away.",
    "You walked out stronger than you walked in.",
    "You pushed through the voice that said “skip it.”",
    "You made effort a habit, not an event.",
    "You did enough today to be proud. That’s enough."
];


function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


    function saveExerciseWeights(map) {
        try {
            localStorage.setItem(EXERCISE_WEIGHT_KEY, JSON.stringify(map));
        } catch {
            // fail silently if storage is full, etc.
        }
    }

    function loadWeeklyGoalFromStorageOrDefault() {
    const raw = localStorage.getItem(WEEKLY_GOAL_KEY);
    const n = parseInt(raw ?? "", 10);
    if (!Number.isFinite(n) || n <= 0) return DEFAULT_WEEKLY_GOAL;
    return n;
}



        // === Rest tokens ===
    const REST_TOKENS_KEY = "ironPulseRestTokens";
    const REST_TOKEN_PROGRESS_KEY = "ironPulseRestTokenProgress";

    const WEEKLY_WEIGHT_BY_DAY_KEY = "ironPulseWeeklyWeightByDay";
// =============================
// 4) VOLUME & WEEKLY CHALLENGE
// =============================

// ---- Volume tiers (objects you are "moving") ----
const VOLUME_OBJECTS = [
  { id: "backpack", label: "Small Backpack",  emoji: "🎒", threshold: 0 },
  { id: "car",      label: "Small Car",       emoji: "🚗", threshold: 4000 },
  { id: "pickup",   label: "Pickup Truck",    emoji: "🛻", threshold: 10000 },
  { id: "suv",      label: "SUV",             emoji: "🚙", threshold: 20000 },
  { id: "truck",    label: "Delivery Truck",  emoji: "🚚", threshold: 35000 },
  { id: "tank",     label: "Battle Tank",     emoji: "🛡️", threshold: 50000 },
  { id: "jet",      label: "Fighter Jet",     emoji: "✈️", threshold: 75000 },
  { id: "cargo",    label: "Cargo Plane",     emoji: "🛩️", threshold: 100000 },
  { id: "orbital",  label: "Orbital Station", emoji: "🛰️", threshold: 150000 }
];

// Optional CSS-based icon skins (for PNGs later)
const VOLUME_ICON_CLASS_PREFIX = "volume-icon-";
function applyVolumeIconTier(tierId) {
  const iconEl = document.getElementById("volume-object-icon");
  if (!iconEl) return;

  // Remove any old tier classes, but keep base + animation classes
  iconEl.classList.remove(
    "volume-icon-backpack",
    "volume-icon-car",
    "volume-icon-pickup",
    "volume-icon-suv",
    "volume-icon-truck",
    "volume-icon-tank",
    "volume-icon-jet",
    "volume-icon-cargo",
    "volume-icon-orbital"
  );

  switch (tierId) {
    case "backpack":
      iconEl.classList.add("volume-icon-backpack");
      break;
    case "car":
      iconEl.classList.add("volume-icon-car");
      break;
    case "pickup":
      iconEl.classList.add("volume-icon-pickup");
      break;
    case "suv":
      iconEl.classList.add("volume-icon-suv");
      break;
    case "truck":
      iconEl.classList.add("volume-icon-truck");
      break;
    case "tank":
      iconEl.classList.add("volume-icon-tank");
      break;
    case "jet":
      iconEl.classList.add("volume-icon-jet");
      break;
    case "cargo":
      iconEl.classList.add("volume-icon-cargo");
      break;
    case "orbital":
      iconEl.classList.add("volume-icon-orbital");
      break;
  }
}


// ---- Simple difficulty “bands” just for copy tone ----
const VOLUME_DIFFICULTY_BANDS = {
  novice:       { id: "novice",       label: "Finding your base" },
  intermediate: { id: "intermediate", label: "Dialed in" },
  advanced:     { id: "advanced",     label: "Heavy hitter" }
};

function getVolumeDifficultyBand(totalLbs) {
  const total = Math.max(0, totalLbs || 0);

  if (total < 2500) return VOLUME_DIFFICULTY_BANDS.novice;
  if (total < 6000) return VOLUME_DIFFICULTY_BANDS.intermediate;
  return VOLUME_DIFFICULTY_BANDS.advanced;
}

// ---- Exercise volume log (per day, per exercise) ----
const EXERCISE_LOG_KEY = "ironpulse.exerciseLog.v1";

// Optional: which muscle group each exercise hits
const EXERCISE_MUSCLE_MAP = {
  "Squat":        "Legs",
  "Bench Press":  "Chest",
  "Row":          "Back",
  "Plank":        "Core"
  // add more as needed
};

const MUSCLE_EMOJI_MAP = {
  "Legs":      "🦵",
  "Chest":     "💪",
  "Back":      "🏹",
  "Core":      "🛡️",
  "Full Body": "🔥"
};

function getTodayKey() {
  return dateToKey(new Date());
}


function getExerciseLog() {
  try {
    const raw = localStorage.getItem(EXERCISE_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Bad exercise log, resetting", e);
    return {};
  }
}

function saveExerciseLog(log) {
  localStorage.setItem(EXERCISE_LOG_KEY, JSON.stringify(log));
}

/**
 * Save the sets for a single exercise for *today*.
 * cleanedSets = [{ weight: number, reps: number }, ...]
 * Also recomputes and redraws the weekly challenge card.
 */
function recordExerciseSetsForToday(exerciseName, cleanedSets) {
  const log = getExerciseLog();
  const todayKey = getTodayKey();

  if (!log[todayKey]) {
    log[todayKey] = {};
  }

  // Overwrite today's sets for this exercise with the latest completed ones
  log[todayKey][exerciseName] = cleanedSets;
  saveExerciseLog(log);
  setDailySummary(getTodayKey(), {
  totalVolume: Math.round(getTotalVolumeForDay(getTodayKey()) || 0)
});

  // Recompute weekly volume + refresh Weekly Challenge UI
  updateWeeklyVolumeSummaryFromLog();
  render90DayHeatmap();
}
// ======================================
// WEEKLY VOLUME – READ FROM EXERCISE LOG
// ======================================

function computeWeeklyVolumeSummary() {
  const log = getExerciseLog();
  const startOfWeek = getStartOfWeek();
  const now = new Date();

  let totalVolume = 0;

  const cursor = new Date(startOfWeek);
  while (cursor <= now) {
    const key = dateToKey(cursor);
    const dayLog = log[key];

    if (dayLog) {
      Object.values(dayLog).forEach((sets) => {
        (sets || []).forEach((set) => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          totalVolume += w * r;
        });
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return { totalVolume };
}

function updateWeeklyVolumeSummaryFromLog() {
  const { totalVolume } = computeWeeklyVolumeSummary();
  console.log("[WeeklyVolume] total lbs this week =", totalVolume);
  renderWeeklyVolumeChallenge(totalVolume);
}

function getDayTotalVolume(dateKey) {
  const log = getExerciseLog();
  const dayLog = log[dateKey];
  if (!dayLog) return 0;

  let total = 0;
  Object.values(dayLog).forEach((sets) => {
    (sets || []).forEach((set) => {
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      total += w * r;
    });
  });

  return total;
}



function hideTip() {
  const tip =
    document.getElementById("heatmap-mini-tip") ||
    document.querySelector(".heatmap-mini-tip") ||
    document.querySelector(".mini-tip") ||
    document.querySelector(".tip");

  if (tip) tip.classList.add("hidden");
}

function renderWeeklyVolumeChallenge(totalVolume) {
  const iconEl    = document.getElementById("volume-object-icon");
  const labelEl   = document.getElementById("volume-object-label");
  const barFillEl = document.getElementById("volume-bar-fill");
  const captionEl = document.getElementById("volume-bar-caption");
  const cardEl    = document.querySelector(".weekly-volume-card");

  const nextWrapper = document.getElementById("volume-next");
  const nextIconEl  = document.getElementById("volume-object-next");
  const nextLabelEl = document.getElementById("volume-object-next-label");

  if (!iconEl || !labelEl || !barFillEl || !captionEl) {
    console.warn("[WeeklyVolume] Card elements not found");
    return;
  }

  const safeTotal = Math.max(0, totalVolume || 0);

  // Which object are we at?
  const { current, next, progress } = getVolumeTierInfo(safeTotal);

  // 🔹 Apply PNG tier class based on current.id
  applyVolumeIconTier(current.id);

  // 🔹 Friendly label
  labelEl.textContent = current.label;

  // --- Next tier silhouette (still just label for now) ---
  if (next && nextWrapper && nextLabelEl) {
    nextWrapper.style.display = "flex";
    nextLabelEl.textContent = next.label;

    // optional: if you later want a PNG here, we can mirror the same idea
    // using classes on nextIconEl + extra CSS
  } else if (nextWrapper) {
    // final tier – hide the “next” column
    nextWrapper.style.display = "none";
  }

  // --- Progress within current tier ---
  const pct = Math.round(progress * 100);
  barFillEl.style.width = `${pct}%`;
  // --- Animate bar on tier shift ---
    if (cardEl) {
    cardEl.classList.add("tier-shift");
    setTimeout(() => cardEl.classList.remove("tier-shift"), 900);
    }


  const totalRounded = Math.round(safeTotal).toLocaleString();


  // --- Tooltip hint for next tier ---
    if (next) {
    const remaining = Math.max(0, next.threshold - safeTotal);
    const remainingRounded = Math.round(remaining).toLocaleString();
    iconEl.setAttribute(
        "data-next-tier",
        `Next: ${next.label} (${remainingRounded} lbs to go)`
    );
    } else {
    iconEl.removeAttribute("data-next-tier");
    }

  if (next) {
    const remaining = Math.max(0, next.threshold - safeTotal);
    const remainingRounded = Math.round(remaining).toLocaleString();

    captionEl.textContent =
      `You’ve moved ${totalRounded} lbs so far — ` +
      `${remainingRounded} lbs to see if you can reach a ${next.label.toLowerCase()} this week.`;
  } else {
    captionEl.textContent =
      `You’ve moved ${totalRounded} lbs this week — you’ve outlifted the final tier. Everything now is bonus payload.`;
  }

  // --- Little bar + icon pulse on update ---
  if (cardEl) {
    cardEl.classList.remove("volume-levelup");
    void cardEl.offsetWidth;
    cardEl.classList.add("volume-levelup");
  }

  iconEl.classList.remove("levelup-pop", "volume-icon-enter");
  void iconEl.offsetWidth;
  iconEl.classList.add("volume-icon-enter"); // tier-specific entrance animation
}


function getTodaysVolumeForExercise(exerciseName) {
  const log = getExerciseLog();
  const todayKey = getTodayKey();
  const dayLog = log[todayKey];

  if (!dayLog || !dayLog[exerciseName]) return 0;

  return dayLog[exerciseName].reduce((sum, set) => {
    const w = Number(set.weight) || 0;
    const r = Number(set.reps) || 0;
    return sum + w * r;
  }, 0);
}

// ---- Weekly aggregation helpers ----

/**
 * Monday as start of week (Mon–Sun).
 */
function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

let lastVolumeTierId = null;


const CHECKIN_KEY = "ip_checkins_v1"; // separate from EXERCISE_LOG_KEY

function getCheckins() {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCheckins(map) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(map));
}

function markWorkoutCompletedToday() {
  const map = getCheckins();
  const key = getTodayKey(); // you already have YYYY-MM-DD
  map[key] = true;
  saveCheckins(map);
}

function isWorkoutCompletedOn(date) {
  const map = getCheckins();
  const key = dateToKey(date); // you already have dateToKey()
  return !!map[key];
}




// ---- Tier lookup for current + next object ----

/**
 * Given total lbs, returns:
 *  - current: tier the user is currently in
 *  - next:    next tier object (or null if at top)
 *  - progress: 0–1 progress *within* the current tier
 */
function getVolumeTierInfo(totalLbs) {
  const total = Math.max(0, totalLbs || 0);

  let current = VOLUME_OBJECTS[0];
  let next = null;

  for (let i = 0; i < VOLUME_OBJECTS.length; i++) {
    const tier = VOLUME_OBJECTS[i];
    if (total >= tier.threshold) {
      current = tier;
      next = VOLUME_OBJECTS[i + 1] || null;
    } else {
      // first tier whose threshold we haven’t reached yet
      next = tier;
      break;
    }
  }

  let progress = 1;
  if (next) {
    const span = Math.max(next.threshold - current.threshold, 1);
    const base = total - current.threshold;
    progress = Math.min(Math.max(base / span, 0), 1);
  } else {
    progress = 1; // at or beyond the last object
  }

  return { current, next, progress };
}




    // Splits by day (you already had this)
  const trainingPrograms = {
  /* =============================
   *  3-DAY FULL BODY (A / B / C)
   * ============================= */
  fullBody3: {
    label: "Full Body 3x / week",
    rotation: [
      {
        id: "fb-a",
        type: "full-body",
        name: "Full Body A",
        description: "Squat, press, and row to hit everything with solid strength work.",
        exercises: [
          {
            name: "Squat",
            modalities: ["Barbell", "Machine"],
            description: "Aim for 3–4 working sets of 5–8 reps. Full range, controlled tempo.",
            suggestedReps: 6
          },
          {
            name: "Bench Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Push the bar in a straight line over mid-chest. 6–8 reps.",
            suggestedReps: 8
          },
          {
            name: "Row",
            modalities: ["Barbell", "Cable", "Machine"],
            description: "Pull elbows back and squeeze shoulder blades. 8–10 reps.",
            suggestedReps: 8
          },
          {
            name: "Plank",
            modalities: ["Bodyweight"],
            description: "Hold 30–45 seconds, 2–3 sets.",
            suggestedReps: 1
          }
        ]
      },
      {
        id: "fb-b",
        type: "full-body",
        name: "Full Body B",
        description: "Hip hinge, vertical press, and pull to balance A-day volume.",
        exercises: [
          {
            name: "Romanian Deadlift",
            modalities: ["Barbell", "Dumbbell"],
            description: "Hinge at the hips, feel the hamstring stretch. 6–8 reps.",
            suggestedReps: 6
          },
          {
            name: "Overhead Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Press from collarbone to overhead. 6–8 controlled reps.",
            suggestedReps: 8
          },
          {
            name: "Lat Pulldown",
            modalities: ["Cable"],
            description: "Pull to upper chest, no swinging. 8–10 reps.",
            suggestedReps: 8
          },
          {
            name: "Walking Lunges",
            modalities: ["Dumbbell", "Bodyweight"],
            description: "8–12 steps per leg. Short, controlled stride.",
            suggestedReps: 10
          }
        ]
      },
      {
        id: "fb-c",
        type: "full-body",
        name: "Full Body C",
        description: "Front-loaded legs, upper chest, and lots of back and core.",
        exercises: [
          {
            name: "Front Squat / Leg Press",
            modalities: ["Barbell", "Machine"],
            description: "Quads focused. 8–10 reps, 3 work sets.",
            suggestedReps: 8
          },
          {
            name: "Incline Press",
            modalities: ["Dumbbell", "Barbell"],
            description: "30° incline. Aim for 8–12 reps.",
            suggestedReps: 10
          },
          {
            name: "Seated Row",
            modalities: ["Cable", "Machine"],
            description: "Neutral spine, squeeze at the chest. 10–12 reps.",
            suggestedReps: 10
          },
          {
            name: "Core (Choice)",
            modalities: ["Bodyweight", "Cable"],
            description: "Pick crunches, hanging leg raises, or cable crunches.",
            suggestedReps: 12
          }
        ]
      }
    ]
  },

  /* =============================
   *  4-DAY UPPER / LOWER
   * ============================= */
  upperLower4: {
    label: "Upper / Lower 4x / week",
    rotation: [
      {
        id: "upper-1",
        type: "upper",
        name: "Upper A",
        description: "Heavier presses and rows for overall upper strength.",
        exercises: [
          {
            name: "Bench Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Main chest move. 3–4 sets of 6–8 reps.",
            suggestedReps: 6
          },
          {
            name: "Row",
            modalities: ["Barbell", "Cable", "Machine"],
            description: "Horizontal pull to balance the bench. 8–10 reps.",
            suggestedReps: 8
          },
          {
            name: "Overhead Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Press overhead for shoulder strength. 6–8 reps.",
            suggestedReps: 8
          },
          {
            name: "Lat Pulldown",
            modalities: ["Cable"],
            description: "Vertical pull. 8–10 controlled reps.",
            suggestedReps: 8
          },
          {
            name: "Triceps Pushdown",
            modalities: ["Cable"],
            description: "Keep elbows tucked. 12–15 reps.",
            suggestedReps: 12
          }
        ]
      },
      {
        id: "lower-1",
        type: "lower",
        name: "Lower A",
        description: "Squat-focused leg day with hamstrings and calves.",
        exercises: [
          {
            name: "Squat",
            modalities: ["Barbell", "Machine"],
            description: "3–4 sets of 5–8 reps. This is your main lower-body lift.",
            suggestedReps: 6
          },
          {
            name: "Romanian Deadlift",
            modalities: ["Barbell", "Dumbbell"],
            description: "Stretch hamstrings, keep bar close. 8 reps.",
            suggestedReps: 8
          },
          {
            name: "Leg Press",
            modalities: ["Machine"],
            description: "10–12 reps, no knee lockout at the top.",
            suggestedReps: 10
          },
          {
            name: "Calf Raises",
            modalities: ["Machine", "Dumbbell"],
            description: "Pause at the top. 15–20 reps.",
            suggestedReps: 15
          },
          {
            name: "Core (Plank / Crunches)",
            modalities: ["Bodyweight"],
            description: "Choose 2–3 sets of core work.",
            suggestedReps: 1
          }
        ]
      },
      {
        id: "upper-2",
        type: "upper",
        name: "Upper B",
        description: "Higher-rep pressing and direct arm + shoulder work.",
        exercises: [
          {
            name: "Incline Press",
            modalities: ["Dumbbell", "Barbell"],
            description: "Upper chest focus. 8–12 reps.",
            suggestedReps: 10
          },
          {
            name: "Pull-Ups / Lat Pulldown",
            modalities: ["Bodyweight", "Cable"],
            description: "Vertical pull. 8–10 controlled reps.",
            suggestedReps: 8
          },
          {
            name: "Lateral Raises",
            modalities: ["Dumbbell", "Cable"],
            description: "Light weight, controlled swings. 12–15 reps.",
            suggestedReps: 12
          },
          {
            name: "Face Pulls",
            modalities: ["Cable"],
            description: "Rear delts and posture. 12–15 reps.",
            suggestedReps: 12
          },
          {
            name: "Bicep Curls",
            modalities: ["Dumbbell", "Barbell"],
            description: "Strict form. 10–12 reps.",
            suggestedReps: 10
          }
        ]
      },
      {
        id: "lower-2",
        type: "lower",
        name: "Lower B",
        description: "Hinge-focused lower day with single-leg work.",
        exercises: [
          {
            name: "Deadlift or Trap Bar Deadlift",
            modalities: ["Barbell", "Trap Bar"],
            description: "Heavier 3–5 rep sets. Full rest between sets.",
            suggestedReps: 5
          },
          {
            name: "Bulgarian Split Squats",
            modalities: ["Dumbbell"],
            description: "8–10 reps per leg. Great for balance & hypertrophy.",
            suggestedReps: 8
          },
          {
            name: "Hamstring Curls",
            modalities: ["Machine"],
            description: "12–15 reps with a squeeze at the top.",
            suggestedReps: 12
          },
          {
            name: "Calf Raises",
            modalities: ["Machine", "Dumbbell"],
            description: "Burn out calves with 15–20 reps.",
            suggestedReps: 15
          },
          {
            name: "Core (Choice)",
            modalities: ["Bodyweight", "Cable"],
            description: "Another 2–3 sets of core of your choice.",
            suggestedReps: 1
          }
        ]
      }
    ]
  },

  /* =============================
   *  5–7 DAY PUSH / PULL / LEGS
   * ============================= */
  ppl: {
    label: "Push / Pull / Legs rotation",
    rotation: [
      {
        id: "push",
        type: "push",
        name: "Push – Chest, Shoulders, Triceps",
        description: "Pressing and shoulder work. Great for strength and aesthetics.",
        exercises: [
          {
            name: "Bench Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Main chest lift. 3–4 sets of 6–8 reps.",
            suggestedReps: 6
          },
          {
            name: "Incline Press",
            modalities: ["Dumbbell", "Barbell"],
            description: "Upper chest focus. 8–12 reps.",
            suggestedReps: 10
          },
          {
            name: "Overhead Press",
            modalities: ["Barbell", "Dumbbell"],
            description: "Vertical press. 6–8 steady reps.",
            suggestedReps: 8
          },
          {
            name: "Lateral Raises",
            modalities: ["Dumbbell", "Cable"],
            description: "High-rep shoulder width work. 12–15 reps.",
            suggestedReps: 12
          },
          {
            name: "Triceps Pushdown",
            modalities: ["Cable"],
            description: "Lock out hard without swinging. 12–15 reps.",
            suggestedReps: 12
          }
        ]
      },
      {
        id: "pull",
        type: "pull",
        name: "Pull – Back, Biceps",
        description: "Rowing and pulling for a thicker back and arms.",
        exercises: [
          {
            name: "Deadlift / RDL",
            modalities: ["Barbell", "Dumbbell"],
            description: "Heavy hip hinge. 3–5 reps if deadlifting, 6–8 for RDL.",
            suggestedReps: 5
          },
          {
            name: "Pull-Ups / Lat Pulldown",
            modalities: ["Bodyweight", "Cable"],
            description: "Vertical pull. 8–10 reps.",
            suggestedReps: 8
          },
          {
            name: "Seated Row",
            modalities: ["Cable", "Machine"],
            description: "Horizontal pull. 8–12 reps.",
            suggestedReps: 10
          },
          {
            name: "Face Pulls",
            modalities: ["Cable"],
            description: "Rear delts and upper back. 12–15 reps.",
            suggestedReps: 12
          },
          {
            name: "Bicep Curls",
            modalities: ["Dumbbell", "Barbell"],
            description: "Control the descent. 10–12 reps.",
            suggestedReps: 10
          }
        ]
      },
      {
        id: "legs",
        type: "legs",
        name: "Legs – Quads, Hamstrings, Glutes",
        description: "Big leg session that hits everything once per rotation.",
        exercises: [
          {
            name: "Squat",
            modalities: ["Barbell", "Machine"],
            description: "Main leg lift. 3–4 sets of 5–8 reps.",
            suggestedReps: 6
          },
          {
            name: "Romanian Deadlift",
            modalities: ["Barbell", "Dumbbell"],
            description: "Hamstring and glute focus. 8 reps.",
            suggestedReps: 8
          },
          {
            name: "Leg Press / Lunges",
            modalities: ["Machine", "Dumbbell"],
            description: "10–12 reps or steps per leg.",
            suggestedReps: 10
          },
          {
            name: "Hamstring Curls",
            modalities: ["Machine"],
            description: "12–15 reps. Squeeze at the top.",
            suggestedReps: 12
          },
          {
            name: "Calf Raises",
            modalities: ["Machine", "Dumbbell"],
            description: "High-rep finisher, 15-20 reps.",
            suggestedReps: 15
          }
        ]
      }
    ]
  }
};





    function getTodayDateKey() {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`; // e.g. "2025-11-24"
        }

// Exercise Behaviors
const STORAGE_KEYS = {
  programId: "ironpulse_program_id",
  nextIndex: "ironpulse_next_session_index"
};

let currentSessionMeta = {
  programId: null,
  recommendedIndex: null,
  isRecommended: true,
  session: null
};

function getProgramIdForWeeklyGoal(goalDays) {
  if (goalDays <= 3) return "fullBody3";
  if (goalDays === 4) return "upperLower4";
  return "ppl"; // 5–7
}

function getProgramForCurrentGoal(weeklyGoal) {
  const programId = getProgramIdForWeeklyGoal(weeklyGoal);
  const program = trainingPrograms[programId];
  localStorage.setItem(STORAGE_KEYS.programId, programId);
  return { programId, program };
}

function getRecommendedSession(weeklyGoal) {
  const { programId, program } = getProgramForCurrentGoal(weeklyGoal);
  const rotation = program.rotation;

  const storedIndex = parseInt(localStorage.getItem(STORAGE_KEYS.nextIndex), 10);
  const index = Number.isFinite(storedIndex) ? storedIndex : 0;

  const safeIndex = index % rotation.length;
  return {
    programId,
    index: safeIndex,
    session: rotation[safeIndex]
  };
}

function advanceRecommendedSession(programId) {
  const program = trainingPrograms[programId];
  if (!program) return;

  const rotationLen = program.rotation.length;
  const storedIndex = parseInt(localStorage.getItem(STORAGE_KEYS.nextIndex), 10);
  const index = Number.isFinite(storedIndex) ? storedIndex : 0;

  const nextIndex = (index + 1) % rotationLen;
  localStorage.setItem(STORAGE_KEYS.nextIndex, String(nextIndex));
}

    function getRestTokenProgress() {
        const raw = localStorage.getItem(REST_TOKEN_PROGRESS_KEY);
        const num = parseFloat(raw ?? "0");
        if (Number.isNaN(num)) return 0;
        return Math.min(Math.max(num, 0), 1);
    }

    function setRestTokenProgress(value) {
        const clamped = Math.min(Math.max(value, 0), 1);
        localStorage.setItem(REST_TOKEN_PROGRESS_KEY, String(clamped));
    }


    // ----- Weekly weight helpers -----
    function getWeeklyWeightByDay() {
        try {
            const raw = localStorage.getItem(WEEKLY_WEIGHT_BY_DAY_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    function setWeeklyWeightByDay(map) {
        try {
            localStorage.setItem(WEEKLY_WEIGHT_BY_DAY_KEY, JSON.stringify(map));
        } catch {
            // ignore
        }
    }

    function resetWeeklyWeightByDay() {
        localStorage.removeItem(WEEKLY_WEIGHT_BY_DAY_KEY);
    }

    function addTodayWeight(volumeLbs) {
        const dayIndex = new Date().getDay(); // 0-6
        const map = getWeeklyWeightByDay();
        const prev = parseFloat(map[dayIndex] ?? "0") || 0;
        map[dayIndex] = prev + Math.max(0, volumeLbs);
        setWeeklyWeightByDay(map);
    }

    function getWeeklyTotalWeight() {
        const map = getWeeklyWeightByDay();
        return Object.values(map).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    }

    function getWeeklyStreak() {
            const raw = localStorage.getItem(WEEKLY_STREAK_KEY);
            const num = parseInt(raw ?? "0", 10);
            return Number.isNaN(num) ? 0 : num;
        }

    function setWeeklyStreak(value) {
        const safe = Math.max(0, value);
        localStorage.setItem(WEEKLY_STREAK_KEY, String(safe));
        }

    function getLastEmblemClass() {
            return localStorage.getItem(LAST_EMBLEM_KEY) || "";
        }

    function setLastEmblemClass(cls) {
        localStorage.setItem(LAST_EMBLEM_KEY, cls);
    }



    function getCurrentWeekId() {
            const today = new Date();

            // Treat week as starting Monday
            const dayIndex = (today.getDay() + 6) % 7; // Sun=0 → 6, Mon=1 → 0, etc.
            const monday = new Date(today);
            monday.setDate(today.getDate() - dayIndex);

            const y = monday.getFullYear();
            const m = String(monday.getMonth() + 1).padStart(2, "0");
            const d = String(monday.getDate()).padStart(2, "0");

            return `${y}-${m}-${d}`; // e.g. "2025-11-17"
        }


function getWorkoutsForWeekId(weekId) {
  const counts = safeParseJSON(localStorage.getItem("ip_weekCountsById"), {});
  return Number(counts[weekId] || 0);
}


function setWorkoutsCompletedThisWeek(value) {
  // 🚫 Legacy setter disabled. Weekly counts are owned by the new module.
  // Keep a mirror key for backwards compatibility/debug displays only.
  localStorage.setItem(WORKOUTS_THIS_WEEK_KEY, String(Math.max(0, value)));
}

        function getRotationIndex() {
            const raw = localStorage.getItem(ROTATION_INDEX_KEY);
            const num = parseInt(raw ?? "0", 10);
            if (Number.isNaN(num)) return 0;
            // Make sure it always stays within the rotation length
            return num % ROTATION_ORDER.length;
        }

        function setRotationIndex(value) {
            const normalized = value % ROTATION_ORDER.length;
            localStorage.setItem(ROTATION_INDEX_KEY, String(normalized));
        }


function getVolumeBandState() {
  try {
    const raw = localStorage.getItem(VOLUME_BAND_STATE_KEY);
    if (!raw) {
      // Default starting point
      return {
        band: "novice",
        weeksInBand: 0,
        lastAvgPerSession: 0,
        lastWeekTotalVolume: 0,
        lastWeekSessions: 0,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      band: parsed.band || "novice",
      weeksInBand: parsed.weeksInBand ?? 0,
      lastAvgPerSession: parsed.lastAvgPerSession ?? 0,
      lastWeekTotalVolume: parsed.lastWeekTotalVolume ?? 0,
      lastWeekSessions: parsed.lastWeekSessions ?? 0,
    };
  } catch {
    return {
      band: "novice",
      weeksInBand: 0,
      lastAvgPerSession: 0,
      lastWeekTotalVolume: 0,
      lastWeekSessions: 0,
    };
  }
}

function setVolumeBandState(state) {
  try {
    localStorage.setItem(VOLUME_BAND_STATE_KEY, JSON.stringify(state));
  } catch {
    // swallow
  }
}

function classifyVolumeBand(avgPerSession) {
  const v = Math.max(0, avgPerSession || 0);

  // Rough ranges – tweak later if you want
  if (v < 3000) {
    return "novice";
  } else if (v < 8000) {
    return "intermediate";
  } else {
    return "advanced";
  }
}

function computeVolumeSummaryForWeek(weekStartDate) {
  const log = getExerciseLog();
  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 7 days total (Mon-Sun)
  end.setHours(23, 59, 59, 999);

  let totalVolume = 0;
  let daysWithAnyVolume = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const key = dateToKey(cursor);
    const dayLog = log[key];
    let dayVolume = 0;

    if (dayLog) {
      Object.entries(dayLog).forEach(([exerciseName, sets]) => {
        const exerciseVolume = (sets || []).reduce((sum, set) => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          return sum + w * r;
        }, 0);
        dayVolume += exerciseVolume;
      });
    }

    if (dayVolume > 0) {
      daysWithAnyVolume += 1;
      totalVolume += dayVolume;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    totalVolume,
    daysWithAnyVolume
  };
}


function evaluateLastWeekForVolumeBand() {
  const storedWeekId = localStorage.getItem(WEEK_ID_KEY);
  if (!storedWeekId) return;


  const weekStart = new Date(storedWeekId + "T00:00:00");
  if (Number.isNaN(weekStart.getTime())) return;

  const { totalVolume } = computeVolumeSummaryForWeek(weekStart);

  const lastWeekSessions = getWorkoutsForWeekId(storedWeekId);


  if (lastWeekSessions <= 0 || totalVolume <= 0) {

    const current = getVolumeBandState();
    setVolumeBandState({
      ...current,
      lastAvgPerSession: 0,
      lastWeekTotalVolume: totalVolume,
      lastWeekSessions: lastWeekSessions,
    });
    return;
  }

  const avgPerSession = totalVolume / lastWeekSessions;
  const newBand = classifyVolumeBand(avgPerSession);
  const current = getVolumeBandState();

  let band = current.band || newBand;
  let weeksInBand = current.weeksInBand ?? 0;

  if (!current.band) {
    // First time classification
    band = newBand;
    weeksInBand = 1;
  } else if (newBand === current.band) {
    // Same band → strengthen confidence
    weeksInBand += 1;
  } else {
    // Different band than before – only move if we've been in the old band
    // at least 1 full week. This adds a little inertia so it doesn't flip-flop.
    if (weeksInBand >= 1) {
      band = newBand;
      weeksInBand = 1;
    } else {
      // Not enough history in old band → hold it steady for now
      // (you can tweak this behavior later)
      band = current.band;
    }
  }

  setVolumeBandState({
    band,
    weeksInBand,
    lastAvgPerSession: avgPerSession,
    lastWeekTotalVolume: totalVolume,
    lastWeekSessions: lastWeekSessions,
  });
}

/** Convenience: just return "novice" | "intermediate" | "advanced" */
function getCurrentVolumeBand() {
  const state = getVolumeBandState();
  return state.band || "novice";
}

    function getWeeklyGoal() {
            const stored = localStorage.getItem(WEEKLY_GOAL_KEY);
            if (!stored) {
                return null; // 🔹 explicit “no goal set”
            }
            const num = parseInt(stored, 10);
            return isNaN(num) ? null : num;
        }


function renderWeeklyDayMarkers() {
  const row = document.getElementById("weekly-day-row");
  if (!row) return;

  const dates = getCurrentWeekDates();   // already defined earlier
  const log = getWeeklyDayLog();         // { "YYYY-MM-DD": true }
  const todayIso = getTodayIsoDate();    // "YYYY-MM-DD"

  row.innerHTML = "";

  dates.forEach((dateStr, index) => {
    const label = WEEKDAY_LABELS_MON_FIRST[index];
    const pill = document.createElement("button");
    pill.type = "button";
    pill.classList.add("weekly-day-pill");
    pill.textContent = label;

    if (log[dateStr]) {
      pill.classList.add("weekly-day-pill--worked");
    }
    if (dateStr === todayIso) {
      pill.classList.add("weekly-day-pill--today");
    }

    // 👇 Tap / click to show bottom sheet
    pill.addEventListener("click", () => {
      openWeeklyDaySheet({ dateStr, label, isWorked: !!log[dateStr] });
    });

    row.appendChild(pill);
  });
}
function getCurrentWeekDates() {
  const today = new Date();
  const jsDay = today.getDay();            // 0=Sun..6=Sat
  const diffToMonday = (jsDay + 6) % 7;    // 0 if Monday

  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(dateToKey(d)); // ✅ local YYYY-MM-DD
  }
  return dates;
}

function formatDateKeyFromDate(d) {
  return dateToKey(d); // local YYYY-MM-DD
}

function getTodayIsoDate() {
  return dateToKey(new Date());
}


function getWeeklyDayLog() {
  const raw = localStorage.getItem(WEEKLY_DAY_LOG_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function setWeeklyDayLog(log) {
  localStorage.setItem(WEEKLY_DAY_LOG_KEY, JSON.stringify(log));
}

function getTotalVolumeForDay(dateKey) {
  const log = getExerciseLog();
  const dayLog = log[dateKey];
  if (!dayLog) return 0;

  let total = 0;
  Object.values(dayLog).forEach((sets) => {
    (sets || []).forEach((set) => {
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      total += w * r;
    });
  });
  return total;
}

// Tune these 3 thresholds to your taste
function intensityFromVolume(totalVolume) {
  if (totalVolume <= 0) return 0;
  if (totalVolume < 3000) return 1;
  if (totalVolume < 9000) return 2;
  return 3;
}




function resetWeeklyGoalCelebrationFlag() {
  localStorage.removeItem(WEEKLY_GOAL_CELEBRATED_KEY);
}

function celebrateWeekComplete() {
  const card = document.getElementById("weekly-focus-card");
  // Only celebrate active (lit) dots
  const dots = document.querySelectorAll(
    "#weekly-goal-dots .weekly-goal-dot.weekly-goal-dot--active"
  );

  if (!card || !dots.length) return;

  // Card aura pulse
  card.classList.add("weekly-focus-card--week-complete");

  // Wave the dots with staggered delay
  dots.forEach((dot, index) => {
    dot.classList.add("weekly-goal-dot--celebrate");
    dot.style.animationDelay = `${index * 80}ms`;
  });

  // Cleanup after animation finishes
  setTimeout(() => {
    card.classList.remove("weekly-focus-card--week-complete");
    dots.forEach(dot => {
      dot.classList.remove("weekly-goal-dot--celebrate");
      dot.style.animationDelay = "";
    });
  }, 1200); // slightly longer than animation duration
}

function checkWeeklyCompletion() {
  const goal = getWeeklyGoal();
  if (!goal) {
    // No goal -> no celebration state
    resetWeeklyGoalCelebrationFlag();
    return;
  }

  if (typeof getWorkoutsCompletedThisWeek !== "function") return;
  const completed = getWorkoutsCompletedThisWeek() || 0;

  // Not done yet: make sure next time we can celebrate
  if (completed < goal) {
    resetWeeklyGoalCelebrationFlag();
    return;
  }

  // Goal reached or surpassed
  const alreadyCelebrated =
    localStorage.getItem(WEEKLY_GOAL_CELEBRATED_KEY) === "true";

  if (alreadyCelebrated) return; // don't spam animation every render

  // Mark as celebrated for this week + fire animation
  localStorage.setItem(WEEKLY_GOAL_CELEBRATED_KEY, "true");
  celebrateWeekComplete();
}

function formatDateNice(isoStr) {
  const d = new Date(isoStr + "T00:00:00"); // force local date
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function openWeeklyDaySheet({ dateStr, label, isWorked }) {
  // Remove any existing sheet
  const existing = document.querySelector(".weekly-day-sheet-backdrop");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "weekly-day-sheet-backdrop";

  const sheet = document.createElement("div");
  sheet.className = "weekly-day-sheet";

  const niceDate = formatDateNice(dateStr);
  const goal = getWeeklyGoal();
  const todayIso = getTodayIsoDate();
  const isToday = dateStr === todayIso;

  // Simple status logic for now – can expand later
  let statusLine = "";
  let subLine = "";

  if (isWorked) {
    statusLine = "Workout completed ✅";
    if (goal) {
      subLine = `This session counted toward your goal of ${goal} days this week.`;
    } else {
      subLine = "Logged as a completed training day.";
    }
  } else if (isToday) {
    statusLine = "No session logged yet.";
    subLine = "You can still train today and move the dots forward.";
  } else {
    statusLine = "Rest day 💤";
    subLine = "No workout recorded for this day in the current week.";
  }

  sheet.innerHTML = `
    <div class="weekly-day-sheet-handle"></div>
    <div class="weekly-day-sheet-header">
      <div class="weekly-day-sheet-title">
        ${label}
      </div>
      <div class="weekly-day-sheet-date">
        ${niceDate}
      </div>
    </div>
    <div class="weekly-day-sheet-status">
      ${statusLine}
    </div>
    <div class="weekly-day-sheet-sub">
      ${subLine}
    </div>
    <div class="weekly-day-sheet-footer">
      <button class="weekly-day-sheet-close" type="button">
        Close
      </button>
    </div>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // Close when tapping outside the sheet
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Close button
  const closeBtn = sheet.querySelector(".weekly-day-sheet-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => overlay.remove());
  }
}


function setWeeklyGoal(days) {
    localStorage.setItem(WEEKLY_GOAL_KEY, String(days));
}
function hasWeeklyGoal() {
        return localStorage.getItem(WEEKLY_GOAL_KEY) !== null;
    }

function repositionWeeklyGoalSection() {
  const days = getWeeklyGoal();
  const dailyScreen = document.getElementById("screen-daily");
  const weeklyFocus = document.getElementById("weekly-focus-live");
  const goalSection = document.getElementById("weekly-goal-control");
  const dailyMain = document.getElementById("daily-main-content");

  if (!dailyScreen || !weeklyFocus || !goalSection || !dailyMain) return;

  if (!days) {
    dailyMain.classList.add("hidden");
    dailyScreen.insertBefore(goalSection, dailyMain);

    setWeeklyGoalLockedUI(0);                // ✅ unlock
  } else {
    dailyMain.classList.remove("hidden");
    dailyScreen.appendChild(goalSection);

    setWeeklyGoalLockedUI(Number(days));     // ✅ lock to chosen
  }
}





    // =============================
    // 5) WEEKLY FOCUS LIVE CARD
    // =============================
function renderWeeklyProgressText() {
  const progressEl = document.getElementById("weekly-progress-text");
  if (!progressEl) return;

  const goal = getWeeklyGoal();
  if (!goal) {
    progressEl.textContent =
      "No sessions tracked yet. Pick a weekly goal to get started.";
    return;
  }

  // ✅ Single source of truth
  const s = getWeeklyBannerState();
  const done = s.workoutsThisWeek;
  const minComplete = s.minToComplete;

  if (s.weekCompleted) {
    progressEl.textContent =
      done >= s.tokenThreshold
        ? `Week complete — ${done} sessions logged`
        : `Week complete — minimum met (${done}/${minComplete})`;
  } else {
    progressEl.textContent =
      `${done} of ${minComplete} sessions completed this week`;
  }
}


function renderWeeklyGoalDots() {
  const dotsContainer = document.getElementById("weekly-goal-dots");
  if (!dotsContainer) return;

  const goal = getWeeklyGoal();

  if (!goal || goal < 1) {
    dotsContainer.innerHTML = "";
    dotsContainer.style.display = "none";
    return;
  }

  dotsContainer.style.display = "flex";
  dotsContainer.innerHTML = "";

  // ✅ single source of truth
  const s = getWeeklyBannerState();
  const completed = s.workoutsThisWeek || 0;

  const clampedCompleted = Math.max(0, Math.min(goal, completed));

  for (let i = 0; i < goal; i++) {
    const dotEl = document.createElement("span");
    dotEl.classList.add("weekly-goal-dot");
    if (i < clampedCompleted) dotEl.classList.add("weekly-goal-dot--active");
    dotsContainer.appendChild(dotEl);
  }
}


function renderWeeklyFocusLive() {
  const daysLabelEl = document.getElementById("weekly-focus-days-label");
  const summaryEl = document.getElementById("weekly-focus-summary");
  if (!daysLabelEl || !summaryEl) return;

  const days = getWeeklyGoal();

  if (!days) {
    daysLabelEl.textContent = "No weekly goal set";
    summaryEl.textContent =
      "Pick a weekly training goal below to lock in how many days you’re committing to this week.";

    const progressEl = document.getElementById("weekly-progress-text");
    if (progressEl) {
      progressEl.textContent = "";
    }

    renderWeeklyGoalDots(); // will hide the row
    return;
  }

  daysLabelEl.textContent = `${days} days / week`;

  const descriptions = {
    3: "You’re committing to 3 focused sessions this week. Expect heavier full-body or big compound days that earn your rest.",
    4: "You’re training 4 days this week. A solid balance of work and recovery that fits most busy schedules.",
    5: "You’re aiming for 5 days. Higher frequency, slightly smaller sessions so you can show up often without burning out.",
    6: "6 days on. You’re chasing serious momentum. We’ll mix push/pull/legs with built-in lighter work to keep you moving.",
    7: "Daily movement mode. Training every day with a blend of lifting, lighter days, and recovery work to keep the habit alive."
  };

  summaryEl.textContent =
    descriptions[days] ||
    "You set your training goal for this week. Show up for it, one session at a time.";

  // 🔹 Update text + dots
  renderWeeklyProgressText();
  renderWeeklyGoalDots();
  renderWeeklyDayMarkers();
}



function initWeeklyGoalControls() {
  const dailyScreen = document.getElementById("screen-daily");
  if (!dailyScreen) return;

  const pills = dailyScreen.querySelectorAll(".day-pill");
  if (!pills.length) return;

  const resetBtn = document.getElementById("reset-weekly-goal-btn");
  const commitBtn = document.getElementById("commit-weekly-goal-btn");

  if (commitBtn) commitBtn.style.display = "none";

  const currentPref = getWeeklyGoal(); // days/week or null

  // Reset button only if preference exists
  if (resetBtn) resetBtn.style.display = currentPref ? "inline-flex" : "none";

  // ✅ Lock/unlock pills immediately on init
  setWeeklyGoalLockedUI(currentPref ? Number(currentPref) : 0);

  pills.forEach(pill => {
    const pillDays = parseInt(pill.getAttribute("data-days"), 10);

    pill.addEventListener("click", () => {
      // ✅ Already set? Ignore clicks (Reset is the unlock)
      if (hasWeeklyGoal()) return;

      setWeeklyGoal(pillDays);

      if (resetBtn) resetBtn.style.display = "inline-flex";

      // Refresh UI (and apply lock + layout)
      repositionWeeklyGoalSection?.();
      renderWeeklyFocusLive?.();
      renderTrainingGoalWeekRow?.();
      updateStreak();

      // ✅ Smooth scroll to Training Goal card (slightly higher tweak below)
      const goalCard =
        document.getElementById("weekly-focus-card") ||
        document.getElementById("weekly-focus-live");

      if (goalCard) {
        goalCard.scrollIntoView({ behavior: "smooth", block: "start" });
        pulseEl?.(goalCard);
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const ok = window.confirm("Clear your weekly preference?");
      if (!ok) return;

      localStorage.removeItem(WEEKLY_GOAL_KEY);

      if (resetBtn) resetBtn.style.display = "none";

      repositionWeeklyGoalSection?.();   // ✅ unlock pills + move section
      renderWeeklyFocusLive?.();
      renderTrainingGoalWeekRow?.();
      updateStreak();
    });
  }

  renderWeeklyFocusLive?.();
  repositionWeeklyGoalSection?.();
}
function hasLoggedAnythingToday() {
  const todayKey = getTodayKey?.();
  if (!todayKey) return false;

  // If any volume exists, something was logged
  const volume = getTotalVolumeForDay?.(todayKey) || 0;
  if (volume > 0) return true;

  // Fallback: check exercise logs directly if you have them
  if (typeof getTodaysExerciseLog === "function") {
    const log = getTodaysExerciseLog();
    return log && Object.keys(log).length > 0;
  }

  return false;
}





    // ===== SPLIT TEMPLATES =====

        const FINISHERS = {
                conditioning: {
                    easy: {
                        title: "5-Min Incline Walk",
                        description: "Walk on the treadmill or around the gym for 5 minutes at a steady pace.",
                        tokenReward: 0
                    },
                    standard: {
                        title: "10-Min Cardio Block",
                        description: "Bike, rower, or stair master for 10 minutes at a moderate pace.",
                        tokenReward: 0.25
                    },
                    hard: {
                        title: "1-Mile Push",
                        description: "Walk or jog 1 mile. Keep it honest but sustainable.",
                        tokenReward: 1
                    }
                },
                bodyweight: {
                    easy: {
                        title: "Core Check-In",
                        description: "1 minute plank (can be broken into two 30s holds).",
                        tokenReward: 0
                    },
                    standard: {
                        title: "Simple Bodyweight Circuit",
                        description: "3 rounds: 10 push-ups, 15 bodyweight squats, 20 jumping jacks.",
                        tokenReward: 0.25
                    },
                    hard: {
                        title: "Burpee Challenge",
                        description: "50 burpees for time, or as many as you can in 4 minutes.",
                        tokenReward: 1
                    }
                },
                pump: {
                    easy: {
                        title: "30-Rep Pump",
                        description: "Pick any machine or dumbbell movement and do 30 controlled reps.",
                        tokenReward: 0
                    },
                    standard: {
                        title: "50-Rep Combo",
                        description: "Superset biceps and triceps for a total of 50 reps.",
                        tokenReward: 0.25
                    },
                    hard: {
                        title: "100-Rep Afterburn",
                        description: "Choose one movement (curls, pushdowns, lateral raises, etc.) and complete 100 total reps.",
                        tokenReward: 1
                    }
                },
                recovery: {
                    easy: {
                        title: "3-Min Stretch Reset",
                        description: "Spend at least 3 minutes stretching hips, hamstrings, and chest.",
                        tokenReward: 0
                    },
                    standard: {
                        title: "Mobility Flow",
                        description: "5–8 minutes of light mobility work: cat-cow, world’s greatest stretch, shoulder circles.",
                        tokenReward: 0
                    },
                    hard: null // no hard tier for recovery; hard work earns tokens elsewhere
                }
            };
function getWorkoutsCompletedThisWeek() {
  return getWeeklyBannerState().workoutsThisWeek;
}


function evaluateLastWeekForStreak() {
  const goal = getWeeklyGoal();
  const done = getWorkoutsCompletedThisWeek();

  if (!goal) {
    setWeeklyStreak(0);
    return;
  }

  const currentStreak = getWeeklyStreak();
  const shortfall = Math.max(goal - done, 0);

  // Met goal → streak grows
  if (shortfall === 0) {
    setWeeklyStreak(currentStreak + 1);
    return;
  }

  // Only allow a save if shortfall is exactly 1
  if (shortfall === 1 && getRestTokens() > 0) {
    setRestTokens(getRestTokens() - 1);
    setWeeklyStreak(currentStreak + 1);
    showToast?.("Rest Token saved your streak this week. 🛌");
    return;
  }

  // Otherwise streak breaks (don't burn tokens)
  setWeeklyStreak(0);
}

function ensureWeeklyState() {
  const currentWeekId = getCurrentWeekId();
  const storedWeekId = localStorage.getItem(WEEK_ID_KEY);

  // First time: set and bail
  if (!storedWeekId) {
    localStorage.setItem(WEEK_ID_KEY, currentWeekId);
    return;
  }

  // Same week: nothing
  if (storedWeekId === currentWeekId) return;

  // ✅ NEW WEEK detected:
  // 1) Finalize missed weeks / apply token-save / break streak if needed
  reconcileUpToCurrentWeek();

  // 2) Keep your volume-band / weekly weight resets (these are separate from streak)
  evaluateLastWeekForVolumeBand?.();
  resetWeeklyWeightByDay?.();

  // 3) Reset rotation if you want a fresh split start each week
  setRotationIndex?.(0);

  // 4) Store the new week id
  localStorage.setItem(WEEK_ID_KEY, currentWeekId);

  // 5) Re-render
  updateStreak();
  updateWeeklyVolumeSummaryFromLog?.();
}


let hasRecordedCompletionForCurrentSplit = false;

// =====================================
// INIT TODAY'S SPLIT (NEW LOGIC)
// =====================================
function initTodaysSplit() {
  const weeklyGoal = getWeeklyGoal();

  const saved = loadTodaySession();
  if (saved && saved.session) {
    currentSessionMeta = {
      programId: saved.programId ?? null,
      recommendedIndex: saved.recommendedIndex ?? null,
      isRecommended: saved.isRecommended ?? true,
      session: saved.session
    };
    renderSessionIntoSplitCard(currentSessionMeta.session, weeklyGoal);
    return;
  }

  const { programId, index, session } = getRecommendedSession(weeklyGoal);

  currentSessionMeta = {
    programId,
    recommendedIndex: index,
    isRecommended: true,
    session
  };

  saveTodaySession(currentSessionMeta);
  renderSessionIntoSplitCard(session, weeklyGoal);
}

function handleSkipToday() {
  if (!currentSessionMeta) return;

  // 1) Mark this day as skipped in your weekly state (no streak credit)
  markTodayAsSkippedInWeeklyState?.();

  // 2) Visually mark the card as skipped (greyed out, etc.)
  const splitCard = document.querySelector("#todays-split .workout-card");
  if (splitCard) {
    splitCard.classList.add("day-skipped");
  }

  const weeklyGoal = getWeeklyGoal();
  const programId =
    currentSessionMeta.programId || getProgramIdForWeeklyGoal(weeklyGoal);

  // 3) Advance the *real* recommended rotation cursor
  advanceRecommendedSession(programId);

  // 4) Pull the next recommended session and render it
  const next = getRecommendedSession(weeklyGoal);

  currentSessionMeta = {
    programId: next.programId,
    recommendedIndex: next.index,
    isRecommended: true,
    session: next.session
  };

  renderSessionIntoSplitCard(next.session, weeklyGoal);

  // 5) Toast so user knows what happened
  showToast?.("Today’s workout skipped. You’re on the next session in your rotation.");
}

function updateSkipTodayState(skipBtn) {
  if (!skipBtn) return;

  const blocked = hasLoggedAnythingToday();

  skipBtn.disabled = blocked;
  skipBtn.classList.toggle("disabled", blocked);

  skipBtn.title = blocked
    ? "You’ve already logged work today"
    : "Skip today’s workout";
}


function renderSessionIntoSplitCard(session, weeklyGoal) {
  const listEl  = document.getElementById("exercise-list");
  const nameEl  = document.getElementById("split-name");
  const skipBtn = document.getElementById("split-days");
  const descEl  = document.getElementById("split-description");

  if (!listEl || !session) return;

  // Header text
  if (nameEl) nameEl.textContent = session.name || "Training Day";
  if (descEl) descEl.textContent = session.description || "";

  // Turn the old "3 days / week" chip into a Skip button
if (skipBtn) {
  skipBtn.textContent = "Skip today";

  skipBtn.onclick = () => {
    if (hasLoggedAnythingToday()) {
      showToast?.("You’ve already logged work today — skipping is disabled.");
      return;
    }

    const ok = window.confirm(
      "Skip today's workout?\n(It won’t count toward your streak.)"
    );
    if (!ok) return;

    handleSkipToday();
  };
  updateSkipTodayState();
}


  // Clear previous rows
  listEl.innerHTML = "";

  // Build exercise rows
  session.exercises.forEach((ex, index) => {
    const exerciseName = ex.name;
    const checkboxId = `split-ex-${index}`;

    const li = document.createElement("li");
    li.className = "exercise-row";

    li.innerHTML = `
      <!-- hidden checkbox so completion logic & finisher unlock work -->
      <input
        type="checkbox"
        id="${checkboxId}"
        class="exercise-complete-checkbox"
        style="display:none;"
      />

      <div class="exercise-main">
        <button
          type="button"
          class="exercise-name-btn"
          data-exercise="${exerciseName}"
        >
          <div class="exercise-name-text-block">
            <span class="exercise-name-title">${exerciseName}</span>
            <span class="exercise-name-subtitle">Log sets</span>
          </div>
          <span class="exercise-name-chevron">›</span>
        </button>

        <div class="exercise-meta-row">
          <span class="exercise-meta-label">Min 3 sets</span>
          <span class="exercise-meta-value">0 lbs logged</span>
        </div>
      </div>
    `;
    // ✅ Rehydrate "completed" state from today's saved exercise log
    const loggedSets = getTodaysLoggedSets(exerciseName);

    if (loggedSets.length > 0) {
      li.classList.add("completed");

      // tick checkbox so finisher unlock survives refresh
      const checkboxEl = li.querySelector(`#${checkboxId}`);
      if (checkboxEl) checkboxEl.checked = true;

      // update "X lbs logged"
      const metaValueEl = li.querySelector(".exercise-meta-value");
      if (metaValueEl && typeof getTodaysVolumeForExercise === "function") {
        const v = getTodaysVolumeForExercise(exerciseName) || 0;
        metaValueEl.textContent = v > 0 ? `${v.toLocaleString()} lbs logged` : "0 lbs logged";
      }
    }


    // Open focus card on click
    const btn = li.querySelector(".exercise-name-btn");
    btn.addEventListener("click", () => {
      window.openFocusCardForExercise(exerciseName, {
        modalities: ex.modalities || [],
        description: ex.description || "",
        suggestedReps: ex.suggestedReps || 10
      });
    });

    // Hook checkbox into split completion (finisher unlock)
    const checkboxEl = li.querySelector(`#${checkboxId}`);
    if (checkboxEl && typeof checkSplitCompletion === "function") {
      checkboxEl.addEventListener("change", () => {
        checkSplitCompletion();
      });
    }

    // Fill the "X lbs logged" text from today's log
    const metaValueEl = li.querySelector(".exercise-meta-value");
    if (metaValueEl) {
      const todaysVolume = getTodaysVolumeForExercise(exerciseName);
      metaValueEl.textContent =
        todaysVolume > 0
          ? `${todaysVolume.toLocaleString()} lbs logged`
          : "0 lbs logged";
    }

    listEl.appendChild(li);
  });

  // Make sure finisher lock state reflects any already-logged exercises
  if (typeof checkSplitCompletion === "function") {
    checkSplitCompletion();
  }
  if (typeof updatePrimaryCTAs === "function") {
    updatePrimaryCTAs();
  }
}

function isInstalledPWA() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true; // iOS Safari
}

function applyInstalledUI() {
  if (!isInstalledPWA()) return;

  // Hide install instructions once installed
  const installSection = document.getElementById("install");
  if (installSection) installSection.style.display = "none";

  // Optional: change the “Add to Home Screen” button into a Help/Info scroll
  const addBtn = document.getElementById("add-to-home-btn");
  if (addBtn) {
    addBtn.textContent = "App Info";
    addBtn.onclick = () => {
      document.getElementById("weekly-goal")?.scrollIntoView({ behavior: "smooth" });
    };
  }
}




function getEmblemVisualForTier(tier) {
// Default if somehow no tier
if (!tier) {
  return {
      icon: "🔥",
      label: "Keep showing up"
  };
}

// Group tiers into “Iron Pulse” progressions
if (tier.startsWith("emblem-weekly")) {
  // Very first weeks – simple iron plate
  return {
      icon: "⬢",
      label: "Bronze – Iron Spark"
  };
}

if (tier.startsWith("emblem-monthly")) {
  // 1–3 months – reinforced shield
  return {
      icon: "🛡️",
      label: "Silver – Iron Guard"
  };
}

if (tier.startsWith("emblem-quarterly")) {
  // 4–9 months – crossed weapons / reaper feel
  return {
      icon: "⚔️",
      label: "Gold – Iron Vanguard"
  };
}

if (tier.startsWith("emblem-annual")) {
  // 1+ year – skull-shield
  return {
      icon: "💀",
      label: "Mythic – Iron Warden"
  };
}

if (tier.startsWith("emblem-legendary")) {
  // 2+ years – fully cracked, COD-zombie vibes
  return {
      icon: "☠️",
      label: "Legendary – Eternal Grind"
  };
}

return {
  icon: "🔥",
  label: "Streak Active"
};
}



function getEmblemTierForStreak(streak) {
  if (!streak || streak <= 0) return null;

  // Very early weeks
  if (streak === 1) return "emblem-weekly-1";
  if (streak === 2) return "emblem-weekly-2";
  if (streak === 3) return "emblem-weekly-3";

  // ~1–3 months
  if (streak >= 4 && streak <= 7) return "emblem-monthly-1";
  if (streak >= 8 && streak <= 11) return "emblem-monthly-2";
  if (streak >= 12 && streak <= 15) return "emblem-monthly-3";

  // ~4–9 months
  if (streak >= 16 && streak <= 23) return "emblem-quarterly-1";
  if (streak >= 24 && streak <= 35) return "emblem-quarterly-2";
  if (streak >= 36 && streak <= 51) return "emblem-quarterly-3";

  // 1–2 years
  if (streak >= 52 && streak <= 77) return "emblem-annual-1";
  if (streak >= 78 && streak <= 103) return "emblem-annual-2";

  // 2+ years — split into three legendary sub-tiers
  if (streak >= 104 && streak <= 151) return "emblem-legendary-1";
  if (streak >= 152 && streak <= 199) return "emblem-legendary-2";
  if (streak >= 200) return "emblem-legendary-3";

  return null;
}

function getStoredEmblemTier() {
return localStorage.getItem(EMBLEM_TIER_KEY) || "";
}

function setStoredEmblemTier(tier) {
if (!tier) {
  localStorage.removeItem(EMBLEM_TIER_KEY);
} else {
  localStorage.setItem(EMBLEM_TIER_KEY, tier);
}
}

function applyEmblemTierClass(banner, tier) {
  const emblem = document.getElementById("streak-emblem");
  const targets = [banner, emblem].filter(Boolean);

  targets.forEach(el => {
      const toRemove = [];
      el.classList.forEach(cls => {
          if (cls.startsWith("emblem-")) {
              toRemove.push(cls);
          }
      });
      toRemove.forEach(cls => el.classList.remove(cls));

      if (tier) {
          el.classList.add(tier);
      }
  });
}


// Friendly name for overlay text
function getEmblemLabelForTier(tier) {
const map = {
  "emblem-weekly-1": "Week 1 – Ember Spark",
  "emblem-weekly-2": "Week 2 – Warming Forge",
  "emblem-weekly-3": "Week 3 – Steady Flame",

  "emblem-monthly-1": "Monthly Rank I – Kindled Core",
  "emblem-monthly-2": "Monthly Rank II – Flow State",
  "emblem-monthly-3": "Monthly Rank III – Iron Rhythm",

  "emblem-quarterly-1": "Quarter Rank I – Forged Focus",
  "emblem-quarterly-2": "Quarter Rank II – Relentless Drive",
  "emblem-quarterly-3": "Quarter Rank III – Unbroken Arc",

  "emblem-annual-1": "Annual Rank I – Iron Pulse Year One",
  "emblem-annual-2": "Annual Rank II – Iron Pulse Veteran",

  "emblem-legendary-1": "Legendary – Eternal Grind"
};
return map[tier] || "New Emblem Unlocked";
}



function triggerEmblemRankUp(tier, visuals) {
  const overlay = document.createElement("div");
  overlay.className = "rankup-overlay";

  overlay.innerHTML = `
<div class="rankup-inner">
<div class="rankup-emblem-preview ${tier}">
  <span class="rankup-icon">${visuals.icon}</span>
</div>
<h2>New Emblem Unlocked</h2>
<p>${visuals.label}</p>
<button type="button" class="btn btn-primary">Nice</button>
</div>
`;

  document.body.appendChild(overlay);
  const btn = overlay.querySelector("button");
  btn?.addEventListener("click", () => overlay.remove());
}


// Called from updateStreak()
function handleEmblemTier(streak) {
  const banner = document.getElementById("streak-banner");
  if (!banner) return;

  const emblemEl = document.getElementById("streak-emblem");
  const emblemIconSpan = emblemEl?.querySelector(".streak-emblem-icon");
  const emblemLabelEl = document.getElementById("streak-emblem-label");

  const newTier = getEmblemTierForStreak(streak);
  const prevTier = getStoredEmblemTier();

  // No streak → clear emblem + label
  if (!newTier) {
      applyEmblemTierClass(banner, null);
      setStoredEmblemTier("");
      if (emblemIconSpan) emblemIconSpan.textContent = "🔥";
      if (emblemLabelEl) emblemLabelEl.textContent = "Keep showing up";
      return;
  }

  // Always apply tier classes
  applyEmblemTierClass(banner, newTier);

  // Set icon + label based on the tier
  const visuals = getEmblemVisualForTier(newTier);
  if (emblemIconSpan) emblemIconSpan.textContent = visuals.icon;
  if (emblemLabelEl) emblemLabelEl.textContent = visuals.label;

  // First emblem ever → just store it, no pop
  if (!prevTier) {
      setStoredEmblemTier(newTier);
      return;
  }

  if (prevTier !== newTier) {
    setStoredEmblemTier(newTier);
  }

}




function updateStreak() {
  const banner = document.getElementById("streak-banner");
  const weekLabelEl = document.getElementById("streak-week-label");
  const tokenLabelEl = document.getElementById("streak-token-label");
  const progressTextEl = document.getElementById("streak-text");
  const progressFillEl = document.getElementById("streak-progress-fill");
  const emblemLabelEl = document.getElementById("streak-emblem-label");

  if (!banner || !weekLabelEl || !tokenLabelEl || !progressTextEl || !progressFillEl) return;

  const s = getWeeklyBannerState();

  const done = s.workoutsThisWeek;
  const minComplete = s.minToComplete;
  const tokenThresh = s.tokenThreshold;
  const streak = s.streak;
  const tokens = s.restTokens;
  const tokenProgress = s.restTokenProgress;

  banner.classList.remove("hidden");

  // state classes
  banner.classList.toggle("streak-week-complete", s.weekCompleted);
  banner.classList.toggle("streak-token-earned", done >= tokenThresh);

  // 1) Week label chip
  weekLabelEl.textContent = streak > 0 ? `Week ${streak} streak` : "No streak started";

  // 2) Progress text
  const clamped = Math.min(done, minComplete);
  const progressPct = Math.round((clamped / minComplete) * 100);

  progressTextEl.textContent = s.weekCompleted
    ? (done >= tokenThresh
        ? `Week complete • Recovery earned (${done}/${tokenThresh})`
        : `Week complete (${done}/${minComplete})`)
    : `This week: ${done}/${minComplete} sessions`;

  // 3) Token label
  if (tokens > 0 || tokenProgress > 0) {
    const tokenPct = Math.round(tokenProgress * 100);
    const extra = tokenProgress > 0 && tokenProgress < 1 ? ` • Charge: ${tokenPct}%` : "";
    tokenLabelEl.textContent = `Rest tokens: ${tokens}${extra}`;
  } else {
    tokenLabelEl.textContent = "Rest Tokens = 0";
  }

  // 4) Progress bar fill
  progressFillEl.style.width = `${Math.min(progressPct, 100)}%`;

  // 5) Emblem label
  if (emblemLabelEl) {
    const tier = getEmblemTierForStreak(streak);
    if (tier) {
      emblemLabelEl.textContent = getEmblemLabelForTier(tier);
      emblemLabelEl.classList.remove("hidden");
    } else {
      emblemLabelEl.textContent = "";
      emblemLabelEl.classList.add("hidden");
    }
  }

  // 6) Aura ramp
  if (streak > 0) {
    banner.classList.add("streak-active");

    let strength = 0.25;
    if (streak >= 2 && streak <= 3) strength = 0.55;
    else if (streak >= 4 && streak <= 7) strength = 0.85;
    else if (streak > 7) strength = 1.15;

    banner.style.setProperty("--emblem-strength", String(strength));
  } else {
    banner.classList.remove("streak-active");
    banner.style.setProperty("--emblem-strength", "0");
  }

  // 7) Tier visuals
  if (typeof handleEmblemTier === "function") {
    handleEmblemTier(streak);
  }
}

const RankFX = (() => {
  let playing = false;
  const q = [];

  function afterburnOverlayOpen() {
    return !!document.querySelector(".postworkout-overlay.afterburn-prompt");
  }

  function pump() {
    if (playing || !q.length) return;

    // don't overlay on top of the Afterburn prompt
    if (afterburnOverlayOpen()) {
      setTimeout(pump, 250);
      return;
    }

    playing = true;
    const job = q.shift();

    try {
      job(() => {
        playing = false;
        setTimeout(pump, 80);
      });
    } catch (e) {
      playing = false;
      setTimeout(pump, 80);
    }
  }

  function enqueue(job) {
    q.push(job);
    pump();
  }

  return { enqueue };
})();



function triggerStreakPowerup(duration = 900) {
  const b = document.getElementById("streak-banner");
  if (!b) return;

  b.classList.remove("streak-powerup");
  void b.offsetWidth;
  b.classList.add("streak-powerup");

  setTimeout(() => b.classList.remove("streak-powerup"), duration);
}
function queueRankUpOverlay(tier, label) {
  RankFX.enqueue((done) => {
    // let the banner powerup land first
    setTimeout(() => {
      showRankUpOverlay(tier, label);
      // allow time to read; closes on button anyway
      setTimeout(done, 900);
    }, 650);
  });
}
const FOCUS_DRAFT_PREFIX = "ip_focus_draft_v1";

function getFocusDraftKey(exerciseName) {
  const d = dateToKey(new Date());
  const prog = currentSessionMeta?.programId ?? "na";
  const idx  = currentSessionMeta?.recommendedIndex ?? "na";
  return `${FOCUS_DRAFT_PREFIX}:${d}:${prog}:${idx}:${exerciseName}`;
}

function saveFocusDraft(exerciseName, draft) {
  try { localStorage.setItem(getFocusDraftKey(exerciseName), JSON.stringify(draft)); } catch {}
}

function loadFocusDraft(exerciseName) {
  try {
    const raw = localStorage.getItem(getFocusDraftKey(exerciseName));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearFocusDraft(exerciseName) {
  try { localStorage.removeItem(getFocusDraftKey(exerciseName)); } catch {}
}


function onWorkoutCompleted() {
    if (isWorkoutDoneToday()) return;
    setWorkoutDoneToday();

    if (hasRecordedCompletionForCurrentSplit) return;
    hasRecordedCompletionForCurrentSplit = true;


    markWorkoutCompletedToday();
    renderTrainingGoalWeekRow();
    renderWeeklyFocusLive();
   

    // 2) Advance rotation if recommended session
    if (currentSessionMeta.isRecommended && currentSessionMeta.programId) {
        advanceRecommendedSession(currentSessionMeta.programId);
    }

    // 3) Estimate today's training volume
    const exerciseListEl = document.getElementById("exercise-list");
    if (exerciseListEl) {
        const weightInputs = exerciseListEl.querySelectorAll(
            'input[type="number"][data-exercise]'
        );
        let todayVolume = 0;
        const EST_REPS_PER_EXERCISE = 30;

        weightInputs.forEach(input => {
            const w = parseFloat(input.value || "0");
            if (!Number.isNaN(w) && w > 0) {
                todayVolume += w * EST_REPS_PER_EXERCISE;
            }
        });

        if (todayVolume > 0) {
            addTodayWeight(todayVolume);
        }
    }

    // 4) UI updates
    logWorkoutAndUpdateWeeklySystems();   // ✅ update weekly counts/streak/token FIRST
    updateStreak();                       // ✅ render banner from new state
    updateWeeklyVolumeSummaryFromLog();   // keep

    render90DayHeatmap();
    flashDayComplete(); // per-workout animation
    persistTodaySummary();

    // 5) Weekly goal celebration + overlay + quote
    setTimeout(() => {
        checkWeeklyCompletion();       // ✨ card aura + dot wave (once per week)
        celebrateWeeklyGoalHit();      // 🎉 weekly overlay (when goal is hit)
        showAfterburnPromptOverlay();  // 🔥 bring back the "Do Afterburn?" card
    }, 900);

}

function checkSplitCompletion() {
  const exerciseListEl = document.getElementById("exercise-list");
  const finisherCard   = document.getElementById("finisher-card");
  if (!exerciseListEl || !finisherCard) return;

  const checkboxes = exerciseListEl.querySelectorAll('input[type="checkbox"]');
  const allChecked =
    checkboxes.length > 0 &&
    Array.from(checkboxes).every(cb => cb.checked);

  const wasLocked = finisherCard.classList.contains("locked");

  if (allChecked) {
    finisherCard.classList.remove("locked");

    if (wasLocked) {
      showToast?.("Afterburn unlocked – pick your finisher for extra rewards. 🔥");
      onWorkoutCompleted?.();
    }
  } else {
    finisherCard.classList.add("locked");
  }

  // ✅ let ONE place control labels/disabled states
  window.updateFinisherButtons?.();

}


function restoreFocusDraftIfAny() {
  const ex = getCurrentFocusExerciseName();
  if (!ex) return;

  const draft = loadFocusDraft(ex);
  if (!draft) return;

  writeFocusStateToUI(draft);
}

function restoreTodayCompletionUI() {
  if (!isWorkoutDoneToday()) return;

  hasRecordedCompletionForCurrentSplit = true;

  const todayKey = getTodayKey();
  const log = getExerciseLog?.() || {};
  const todayLog = log[todayKey] || {};

  const rows = document.querySelectorAll("#exercise-list .exercise-row");

  rows.forEach((row) => {
    const btn = row.querySelector(".exercise-name-btn");
    if (!btn) return;

    const exerciseName =
      btn.getAttribute("data-exercise") || btn.textContent.trim();

    const didLogThisExercise = Array.isArray(todayLog[exerciseName]) && todayLog[exerciseName].length > 0;

    const cb = row.querySelector('input[type="checkbox"]');

    if (didLogThisExercise) {
      row.classList.add("completed");
      if (cb) cb.checked = true;

      // restore "X lbs logged"
      const metaValueEl = row.querySelector(".exercise-meta-value");
      if (metaValueEl) {
        const v = getTodaysVolumeForExercise?.(exerciseName) || 0;
        metaValueEl.textContent = v > 0 ? `${v.toLocaleString()} lbs logged` : "0 lbs logged";
      }
    } else {
      row.classList.remove("completed");
      if (cb) cb.checked = false;
    }
  });

  // now this will only unlock if all truly completed
  checkSplitCompletion?.();
}



    // If you have extra finisher-specific controls, they can live here:
function initFinisherControls() {
  const finisherCard = document.getElementById("finisher-card");
  if (!finisherCard) return;

  const titleEl       = document.getElementById("finisher-title");
  const tagEl         = document.getElementById("finisher-tag");
  const descEl        = document.getElementById("finisher-description");
  const statusEl      = document.getElementById("finisher-status");
  const catButtons    = document.querySelectorAll(".finisher-cat-btn");
  const diffButtons   = document.querySelectorAll(".finisher-diff-btn");
  const diffContainer = document.getElementById("finisher-difficulties");
  const doBtn         = document.getElementById("finisher-do-btn");
  const skipBtn       = document.getElementById("finisher-skip-btn");

  if (!titleEl || !tagEl || !descEl || !statusEl || !diffContainer || !doBtn || !skipBtn) return;

  // --- Local state for this card ---
  let selectedCategory   = null;
  let selectedDifficulty = null;
  let currentFinisher    = null;
  let hasStartedFinisher = false; // 🔹 NEW: tracks "in progress" state

  function clearDiffSelection() {
    diffButtons.forEach(btn => btn.classList.remove("btn-primary"));
  }

  function clearCatSelection() {
    catButtons.forEach(btn => btn.classList.remove("btn-primary"));
  }
// Converts JS getDay() (Sun=0..Sat=6) → Monday-first index (Mon=0..Sun=6)
function getMondayIndex(date) {
  return (date.getDay() + 6) % 7;
}



 function updateFinisherButtons() {
  const todayKey = getTodayDateKey();
  const lastFinisherDay = localStorage.getItem(LAST_FINISHER_DATE_KEY);
  const decisionLocked = lastFinisherDay === todayKey;

  // ✅ If today's decision is locked, explain why and bail
  if (decisionLocked) {
    doBtn.disabled = true;
    skipBtn.disabled = true;

    statusEl.textContent = "Afterburn decision locked for today. Come back tomorrow 🔒";
    tagEl.textContent = "LOCKED";
    return;
  }

  // locked until split is complete
  const isLocked = finisherCard.classList.contains("locked");

  // Skip is only allowed when unlocked
  skipBtn.disabled = isLocked;

  // Nothing selected yet
  if (!selectedCategory || !selectedDifficulty || !currentFinisher) {
    doBtn.textContent = "Lock In";
    doBtn.disabled = true;      // must pick category + difficulty first
    skipBtn.textContent = "Skip Afterburn today";
    return;
  }

  // Selected, but not started
  if (!hasStartedFinisher) {
    doBtn.textContent = "Start Afterburn";
    doBtn.disabled = isLocked;  // only blocked by locked state
    skipBtn.textContent = "Skip Afterburn today";
    return;
  }

  // Started
  doBtn.textContent = "Mark Afterburn done";
  doBtn.disabled = isLocked;
  skipBtn.textContent = "Too burned out to finish";
}

// ✅ expose for other modules (like checkSplitCompletion)
window.updateFinisherButtons = updateFinisherButtons;


  function selectFinisher(catKey, diffKey) {
    const cat = FINISHERS[catKey];
    if (!cat) return;

    const data = cat[diffKey];
    if (!data) return;

    currentFinisher    = data;
    selectedCategory   = catKey;
    selectedDifficulty = diffKey;
    hasStartedFinisher = false; // reset if they change their mind

    titleEl.textContent = data.title;
    descEl.textContent  = data.description;
    tagEl.textContent   = "Unlocked"

    statusEl.textContent =
  "Complete this Afterburn session to earn 33% of a Rest Token. (3 Afterburns = 1 token)";


    updateFinisherButtons();
    

  }

  // --- Category buttons ---
  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (finisherCard.classList.contains("locked")) return;

      const cat = btn.getAttribute("data-category");
      if (!cat) return;

      clearCatSelection();
      btn.classList.add("btn-primary");

      // Reset difficulty + finisher when switching categories
      diffContainer.classList.add("is-visible");
      clearDiffSelection();
      selectedCategory   = cat;
      selectedDifficulty = null;
      currentFinisher    = null;
      hasStartedFinisher = false;

      titleEl.textContent = "Pick your Afterburn difficulty";
      descEl.textContent  = "Choose how hard you want to push today. Harder options can earn Rest Tokens.";
      tagEl.textContent   = "Unlocked";
      statusEl.textContent = "Rest is important. But you have to earn it!";

      updateFinisherButtons();
    });
  });

  // --- Difficulty buttons ---
  diffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (finisherCard.classList.contains("locked")) return;

      const diff = btn.getAttribute("data-difficulty");
      if (!diff) return;

      const activeCatBtn = Array.from(catButtons).find(b => b.classList.contains("btn-primary"));
      if (!activeCatBtn) return;

      const cat = activeCatBtn.getAttribute("data-category");
      if (!cat) return;

      clearDiffSelection();
      btn.classList.add("btn-primary");

      selectFinisher(cat, diff);
    });
  });

  // === PRIMARY BUTTON: two-stage behavior ===
  doBtn.addEventListener("click", () => {
    if (finisherCard.classList.contains("locked")) return;

    const todayKey = getTodayDateKey();
    const lastFinisherDay = localStorage.getItem(LAST_FINISHER_DATE_KEY);

    // Already made a decision (completed or skipped) today
    if (lastFinisherDay === todayKey) {
      showToast("You already locked in today's Afterburn session. Extra work now is pure bonus. 💪");
      return;
    }

    // No finisher chosen yet – shouldn’t happen if updateFinisherButtons is working,
    // but let's guard anyway
    if (!currentFinisher || !selectedCategory || !selectedDifficulty) {
      showToast("Pick an Afterburn catetory and difficulty first.");
      return;
    }

    // Stage 1: Start finisher
    if (!hasStartedFinisher) {
      const ok = window.confirm(
        "Start this Afterburn session now?\n\n" +
        "Do the work, then come back and mark it done."
      );
      if (!ok) return;

      hasStartedFinisher = true;

      tagEl.textContent = "IN PROGRESS";
      statusEl.textContent =
        "Do this Afterburn session, then come back and mark it done when you're finished.";

      updateFinisherButtons();
      return;
    }

    // Stage 2: Mark done (final commit)
    const confirmDone = window.confirm(
      "Mark this Afterburn session as completed for today?\n\n" +
      "This will award Rest Token progress."
    );
    if (!confirmDone) return;

    onAfterburnCompleted();  // ✅ uses AFTERBURN_TOKEN_PROGRESS = 1/3 inside the new module
    updateStreak();          // ✅ re-renders banner


    // Lock today's finisher decision
    localStorage.setItem(LAST_FINISHER_DATE_KEY, todayKey);

    statusEl.textContent = "Finisher completed. Nice work.";
    tagEl.textContent    = "DONE";

    finisherCard.classList.add("completed-pulse");
    finisherCard.classList.add("locked");
    doBtn.disabled   = true;
    skipBtn.disabled = true;

    setTimeout(() => {
      finisherCard.classList.remove("completed-pulse");
    }, 800);

    celebrateFinisher?.();
  });

  // === SECONDARY BUTTON: skip / "I didn't do it" ===
  skipBtn.addEventListener("click", () => {
    if (finisherCard.classList.contains("locked")) return;

    const todayKey = getTodayDateKey();
    const lastFinisherDay = localStorage.getItem(LAST_FINISHER_DATE_KEY);

    if (lastFinisherDay === todayKey) {
      showToast("You already locked in today's Afterburn session.");
      return;
    }

    const confirmSkip = window.confirm(
      "Skip today's Afterburn session for the day?\n\n" +
      "You won't be able to come back and complete it later."
    );

    if (!confirmSkip) {
      statusEl.textContent = "Finisher is still optional for today.";
      return;
    }

    // Mark that today’s finisher decision is made (even though it was a skip)
    localStorage.setItem(LAST_FINISHER_DATE_KEY, todayKey);

    statusEl.textContent =
      "You skipped the Afterburn sesssion today. Main work still counts — come back stronger tomorrow.";
    tagEl.textContent = "SKIPPED";

    finisherCard.classList.add("locked");
    doBtn.disabled   = true;
    skipBtn.disabled = true;
  });

  // Initial button state on load
  updateFinisherButtons();
}

function scrollToSplitSection() {
  const split = document.getElementById("split");
  if (!split) return;

  split.scrollIntoView({ behavior: "smooth", block: "start" });

  split.classList.remove("pulse");
  void split.offsetWidth;
  split.classList.add("pulse");
  setTimeout(() => split.classList.remove("pulse"), 650);
}

function getTodayWorkoutState() {
  const listEl = document.getElementById("exercise-list");
  const checkboxes = listEl?.querySelectorAll('input.exercise-complete-checkbox') || [];
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;

  const hasAny = checked > 0;
  const allDone = total > 0 && checked === total;

  const todayKey = (typeof getTodayDateKey === "function") ? getTodayDateKey() : null;
  const lastFinisherDay = localStorage.getItem(LAST_FINISHER_DATE_KEY);
  const afterburnLocked = !!todayKey && lastFinisherDay === todayKey;

  return { total, checked, hasAny, allDone, afterburnLocked };
}

function updatePrimaryCTAs() {
  const topBtn = document.getElementById("hero-cta");
  const bottomBtn = document.getElementById("bottom-split-btn");
  const sub = document.getElementById("app-status-sub"); // optional

  const s = getTodayWorkoutState();

  if (sub) {
    if (s.allDone) sub.textContent = s.afterburnLocked ? "Done for today" : "Workout done • Afterburn optional";
    else if (s.hasAny) sub.textContent = `In progress • ${s.checked}/${s.total} done`;
    else sub.textContent = "Ready";
  }

  let label = "Start Today";
  if (s.allDone) label = s.afterburnLocked ? "View Today" : "Afterburn";
  else if (s.hasAny) label = "Continue";

    [topBtn, bottomBtn].forEach(btn => {
    if (!btn) return;
    btn.textContent = label;
    // ✅ do NOT set btn.onclick here
  });

}



function scrollToFinisherSection() {
  const finisherSection =
    document.getElementById("finisher-card") ||
    document.getElementById("finisher-section");

  if (!finisherSection) {
    console.warn("[Afterburn] finisher section not found");
    return;
  }

  try {
    finisherSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } catch (e) {
    // scrollIntoView might not exist on very old browsers
    console.warn("[Afterburn] scrollIntoView failed:", e);
  }

  // quick highlight so it feels “summoned”
  finisherSection.classList.add("finisher-focus");
  setTimeout(() => {
    finisherSection.classList.remove("finisher-focus");
  }, 900);
}

function showRankUpOverlay(tier, label) {
  const visuals = getEmblemVisualForTier(tier);
  visuals.label = label || visuals.label;
  triggerEmblemRankUp(tier, visuals);
}
function queueRankUpOverlay(tier, label) {
  RankFX.enqueue((done) => {
    setTimeout(() => {
      const overlay = showRankUpOverlay(tier, label);

      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        done();
      };

      // release if user closes it
      overlay?.querySelector("button")?.addEventListener("click", release);

      // safety timeout
      setTimeout(release, 1200);
    }, 650);
  });
}




function showAfterburnPromptOverlay() {
  // avoid stacking multiple overlays
  const existing = document.querySelector(".postworkout-overlay.afterburn-prompt");
  if (existing) {
    console.log("[Afterburn] overlay already open");
    return;
  }

  console.log("[Afterburn] opening overlay");

  const overlay = document.createElement("div");
  overlay.className = "postworkout-overlay afterburn-prompt";

  overlay.innerHTML = `
    <div class="postworkout-card">
      <h2>Afterburn unlocked 🔥</h2>
      <p class="postworkout-quote">
        You finished today's main work. Want to push a little extra and earn rest token progress?
      </p>
      <p class="postworkout-hint">
        Afterburn is optional — treat it like bonus XP, not punishment.
      </p>
      <div class="postworkout-actions">
        <button class="btn btn-primary" id="afterburn-do-btn">
          Fire it up
        </button>
        <button class="btn btn-outline" id="afterburn-skip-btn">
          Not today
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeOverlay = () => overlay.remove();

  const doBtn  = overlay.querySelector("#afterburn-do-btn");
  const skipBtn = overlay.querySelector("#afterburn-skip-btn");

  if (doBtn) {
    doBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeOverlay();
      scrollToFinisherSection();   // 👈 this is the only scroll now
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeOverlay();
    });
  }

  // tap outside the card to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });
}


        // =============================
        // 2) SHOW SCREEN
        // =============================
        function showScreen(name) {
            const setup = document.getElementById("screen-setup");
            const daily = document.getElementById("screen-daily");
            if (!setup || !daily) {
                console.warn("screen elements not found");
                return;
            }

            if (name === "setup") {
                setup.style.display = "block";
                daily.style.display = "none";
            } else {
                setup.style.display = "none";
                daily.style.display = "block";
            }

            localStorage.setItem(LAST_SCREEN_KEY, name);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // =============================
        // 3) INIT SCREENS + BUTTONS
        // =============================
        function initScreens() {
            console.log("initScreens running");

            const onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
            const last = localStorage.getItem(LAST_SCREEN_KEY);

            if (!onboarded) {
                console.log("Not onboarded → show setup");
                showScreen("setup");
            } else if (last === "daily" || last === "setup") {
                console.log("Onboarded, last:", last);
                showScreen(last);
            } else {
                console.log("Onboarded, no last → daily");
                showScreen("daily");
            }


            // --- Setup button in nav ---
            const settingsBtn = document.getElementById("open-settings-btn");
            if (settingsBtn) {
              settingsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("open-settings-btn clicked");
                showScreen("setup");

                // after screen switch, scroll to the right place
                requestAnimationFrame(() => {
                  if (isInstalledPWA()) {
                    document.getElementById("weekly-goal")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
                  }
                });
              });
            }


            // --- Add to Home Screen button ---
            const addToHomeBtn = document.getElementById("add-to-home-btn");
            if (addToHomeBtn) {
                addToHomeBtn.addEventListener("click", () => {
                    console.log("add-to-home-btn clicked");
                    const installSection = document.getElementById("install");
                    if (installSection) {
                        installSection.scrollIntoView({ behavior: "smooth" });
                    } else {
                        console.warn("#install section not found");
                    }
                });
            } else {
                console.warn("add-to-home-btn not found");
            }
        }


    
        // --- Small toast at bottom of screen ---
            function showToast(message, timeout = 2200) {
                let container = document.getElementById("toast-container");
                if (!container) {
                    container = document.createElement("div");
                    container.id = "toast-container";
                    container.className = "toast-container";
                    document.body.appendChild(container);
                }

                const toast = document.createElement("div");
                toast.className = "toast";
                toast.textContent = message;
                container.appendChild(toast);

                setTimeout(() => {
                    toast.classList.add("out");
                    setTimeout(() => {
                        toast.remove();
                        if (!container.hasChildNodes()) {
                            container.remove();
                        }
                    }, 220);
                }, timeout);
            }

            // --- Daily completion pulse on Today's Split card ---
            function flashDayComplete() {
                const splitCard = document.querySelector("#split .workout-card");
                if (!splitCard) return;

                // reset animation if it was already applied
                splitCard.classList.remove("day-complete-boost");
                void splitCard.offsetWidth; // force reflow
                splitCard.classList.add("day-complete-boost");
            }

            // --- Finisher micro celebration ---
            function celebrateFinisher() {
                const finisherCard = document.getElementById("finisher-card");
                if (!finisherCard) return;

                finisherCard.classList.remove("finisher-celebrate");
                void finisherCard.offsetWidth;
                finisherCard.classList.add("finisher-celebrate");

                showToast("Finisher complete. That’s extra work in the bank. 💪");
            }


function celebrateWeeklyGoalHit() {
    const goal = getWeeklyGoal();
    const done = getWorkoutsCompletedThisWeek();

    // Only fire the moment you *hit* the goal, not on extra sessions
    if (!goal || done !== goal) return;

    // If one is already open, don’t stack them
    if (document.querySelector(".weekly-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "weekly-overlay";
    overlay.innerHTML = `
      <div class="weekly-overlay-card">
          <h2>Weekly goal hit 🎉</h2>
          <p>You showed up for all ${goal} planned sessions. That's how streaks are built.</p>
          <button class="btn btn-primary" id="weekly-overlay-continue">Continue</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // 🔹 Button closes the overlay
    const continueBtn = overlay.querySelector("#weekly-overlay-continue");
    if (continueBtn) {
        continueBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            overlay.remove();

            // 🔥 After closing celebration, offer the RPG cut-in
            const isBossWeek = false; // TODO: hook real logic later
            offerWeeklyEncounterCutIn({ isBossWeek });
        });
    }

    // 🔹 Click outside the card also closes it
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

const TODAY_SESSION_KEY = "ip_today_session_v1";

function saveTodaySession(meta) {
  try {
    localStorage.setItem(TODAY_SESSION_KEY, JSON.stringify({
      dateKey: dateToKey(new Date()),
      ...meta
    }));
  } catch {}
}

function loadTodaySession() {
  try {
    const raw = localStorage.getItem(TODAY_SESSION_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || obj.dateKey !== dateToKey(new Date())) return null;
    return obj;
  } catch { return null; }
}





function devForceWeeklyGoalCompletion() {
  const goal = getWeeklyGoal?.();
  if (!goal) {
    alert("No weekly goal set!");
    return;
  }

  // Force workouts = goal
  if (typeof setWorkoutsCompletedThisWeek === "function") {
    setWorkoutsCompletedThisWeek(goal);
  } else {
    console.warn("setWorkoutsCompletedThisWeek is not defined");
  }

  // Optional: play your day-complete card animation if you have it
  try {
    flashDayComplete?.();
  } catch (err) {
    console.warn("flashDayComplete error or not defined:", err);
  }

  // Refresh UI bits that depend on weekly stats
  try {
    updateWeeklyVolumeSummaryFromLog();

  } catch (err) {
    console.warn("updateWeeklyVolumeSummary not defined or failed:", err);
  }

  try {
    updateStreak?.();
  } catch (err) {
    console.warn("updateStreak not defined or failed:", err);
  }

  // Then trigger the celebration overlay
  try {
    celebrateWeeklyGoalHit();
  } catch (err) {
    console.error("celebrateWeeklyGoalHit is not defined or failed:", err);
    alert("celebrateWeeklyGoalHit failed — check console for details.");
  }
}


let historyHeatmapInitialized = false;

function initTrainingHistoryToggle() {
  const card = document.getElementById("history-card");
  const btn  = document.getElementById("history-toggle-btn");

  if (!card || !btn) {
    console.warn("[History] missing #history-card or #history-toggle-btn");
    return;
  }

  const setExpanded = (expanded) => {
    card.classList.toggle("history-expanded", expanded);
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  // start collapsed
  setExpanded(false);

  btn.addEventListener("click", () => {
    const expanded = !card.classList.contains("history-expanded");
    setExpanded(expanded);

    // render on first open (or render every open if you prefer)
    if (expanded && !historyHeatmapInitialized) {
      render90DayHeatmap();
      historyHeatmapInitialized = true;
    }
  });
}


    // =============================
    // 8) PWA / SERVICE WORKER
    // =============================
    function initServiceWorker() {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("./sw.js")
                    .then((registration) => {
                        console.log("Service worker registered:", registration.scope);
                    })
                    .catch((err) => {
                        console.log("Service worker registration failed:", err);
                    });
            });
        }
    }

function initWeeklyVolumeScrollTrigger() {
  const sectionEl = document.getElementById("weekly-volume");
  const iconEl    = document.getElementById("volume-object-icon");

  if (!sectionEl || !iconEl) return;

  // Fallback: old browsers → just animate immediately
  if (!("IntersectionObserver" in window)) {
    iconEl.classList.add("volume-icon-enter");
    return;
  }

  let hasPlayed = false; // only play once per page load

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || hasPlayed) return;
        hasPlayed = true;

        // 🔥 Trigger the entrance animation
        iconEl.classList.remove("volume-icon-enter"); // reset if somehow present
        void iconEl.offsetWidth;                      // force reflow
        iconEl.classList.add("volume-icon-enter");

        observer.disconnect(); // we’re done
      });
    },
    {
      root: null,
      threshold: 0.35, // ~35% of the section visible
    }
  );

  observer.observe(sectionEl);
}


    function initDebugStreakButton() {
        const btn = document.getElementById("debug-streak-plus");
        if (!btn) return;

        btn.addEventListener("click", () => {
            const current = getWeeklyStreak();
            const next = current + 1;
            setWeeklyStreak(next);

            // Update banner + aura
            updateStreak();

            // If emblem system is wired in, this will trigger rank up overlays / power-up
            if (typeof handleEmblemTier === "function") {
                handleEmblemTier(next);
            }

            showToast?.(`Debug: weekly streak is now ${next} week(s).`);
        });
    }


// === Focus Card Logic ==========================================
const focusOverlayEl = document.getElementById('focus-overlay');
const focusNameEl = document.getElementById('focus-exercise-name');
const focusModalitiesEl = document.getElementById('focus-exercise-modalities');
const focusDescEl = document.getElementById('focus-exercise-description');
const focusSetsListEl = document.getElementById('focus-sets-list');
const focusAddSetBtn = document.getElementById('focus-add-set-btn');
const focusCancelBtn = document.getElementById('focus-cancel-btn');
const focusCompleteBtn = document.getElementById('focus-complete-btn');
const focusCloseBtn = document.getElementById('focus-close-btn');

const MAX_FOCUS_SETS = 5;

// 🕒 Rest timer
const focusRestTimerBtn  = document.getElementById("focus-rest-timer-btn");
const focusRestTimerText = document.getElementById("focus-rest-timer-text");

let focusRestTimerId = null;
let focusRestSecondsLeft = 0;

const REST_TIMER_DEFAULT_SECONDS = 120; // 2 minutes
const REST_TIMER_MAX_SECONDS = 600; // max 10 minutes


let currentFocusExercise = null;

function getCurrentFocusTotalVolume() {
  if (!currentFocusExercise) return 0;

  return currentFocusExercise.sets.reduce((sum, s) => {
    const w = Number(s.weight) || 0;
    const r = Number(s.reps) || 0;
    return sum + w * r;
  }, 0);
}
function maybeConfirmInsaneFocusVolume(totalVolume, onConfirm) {
  // If it's not crazy, just proceed
  if (totalVolume < FOCUS_VOLUME_SANITY_THRESHOLD) {
    onConfirm();
    return;
  }

  // If one is already open, don't stack
  if (document.querySelector(".weekly-overlay.focus-volume-sanity")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "weekly-overlay focus-volume-sanity";

  overlay.innerHTML = `
    <div class="weekly-overlay-card">
      <h2>That is… a LOT of weight 😅</h2>
      <p>
        You’re about to log
        <strong>${Math.round(totalVolume).toLocaleString()} lbs</strong>
        on this one exercise.
      </p>
      <p style="margin-top:0.5rem; font-size:0.9rem; opacity:0.9;">
        If that’s real, you’re a monster. If a zero slipped in, you might want
        to fix it before we lock it in.
      </p>
      <div style="display:flex; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">
        <button class="btn btn-primary" id="focus-volume-keep">
          Looks right 💪
        </button>
        <button class="btn btn-outline" id="focus-volume-fix">
          Oops, let me edit
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  const keepBtn = overlay.querySelector("#focus-volume-keep");
  const fixBtn  = overlay.querySelector("#focus-volume-fix");

  if (keepBtn) {
    keepBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
      onConfirm(); // actually log the sets
    });
  }

  if (fixBtn) {
    fixBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
      showToast?.("No worries — adjust the sets, then hit Complete again.");
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });
}


// Render all set rows
function renderFocusSets() {
  if (!currentFocusExercise) return;

  focusSetsListEl.innerHTML = '';

  currentFocusExercise.sets.forEach((set, index) => {
    const row = document.createElement('div');
    row.className = 'focus-set-row';
    row.dataset.index = index;

    row.innerHTML = `
      <div class="focus-set-label">Set ${index + 1}</div>
      <div class="focus-set-main">
        <div class="focus-weight-inline">
          <input
            type="number"
            inputmode="decimal"
            class="focus-weight-input"
            placeholder="Weight"
            value="${set.weight ?? ''}"
          />
          <span class="focus-weight-unit">lbs</span>
        </div>
        <div class="focus-reps-control">
          <button type="button" class="focus-reps-btn reps-minus">−</button>
          <span class="focus-reps-count">${set.reps}</span>
          <button type="button" class="focus-reps-btn reps-plus">+</button>
        </div>
      </div>
    `;

    focusSetsListEl.appendChild(row);
  });

  // Disable Add Set when we hit the cap
  focusAddSetBtn.disabled = currentFocusExercise.sets.length >= MAX_FOCUS_SETS;
}

function persistTodaySummary() {
  const key = getTodayKey(); // your local YYYY-MM-DD
  const volume = getTotalVolumeForDay(key) || 0;

  setDailySummary(key, {
    didWorkout: true,
    totalVolume: Math.round(volume)
  });
}

// Open the overlay for a given exercise
    window.openFocusCardForExercise = function (name, options = {}) {
    const {
        modalities = ['Barbell', 'Dumbbell'],
        description = 'Log your working sets and we’ll add them to your weekly volume.',
        suggestedReps = 10,
        existingSets
    } = options;

    currentFocusExercise = {
        name,
        modalities,
        description,
        suggestedReps,
        sets:
        existingSets && existingSets.length
            ? existingSets.map(s => ({ weight: s.weight || '', reps: s.reps || suggestedReps }))
            : [
                { weight: '', reps: suggestedReps },
                { weight: '', reps: suggestedReps },
                { weight: '', reps: suggestedReps }
            ]
    };

    // Fill header
    focusNameEl.textContent = name;
    focusModalitiesEl.textContent = modalities.join(' · ');
    focusDescEl.textContent = description;

    renderFocusSets();
    restoreFocusDraftIfAny();
    clearRestTimer();      
    updateRestTimerUI();


    // Show overlay
    focusOverlayEl.classList.remove('hidden');
    focusOverlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    };

function closeFocusCard() {
focusOverlayEl.classList.add('hidden');
focusOverlayEl.classList.remove('active');
document.body.style.overflow = '';
currentFocusExercise = null;
clearRestTimer();
}

// === Rest Timer (Focus Card) ==========================
const REST_TIMER_DEFAULT_SECS = 120; // 2 minutes

let restTimerRemaining = 0;
let restTimerRunning   = false;
let restTimerInterval  = null;

const focusRestBtn    = document.getElementById("focus-rest-btn");
const focusRestLabel  = document.getElementById("focus-rest-label");

function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const WORKOUT_DONE_TODAY_KEY = "ip_workout_done_today";

function isWorkoutDoneToday() {
  return localStorage.getItem(WORKOUT_DONE_TODAY_KEY) === getTodayKey();
}

function setWorkoutDoneToday() {
  localStorage.setItem(WORKOUT_DONE_TODAY_KEY, getTodayKey());
}

function updateRestTimerUI() {
  const btn = document.getElementById("focus-rest-btn");

  if (!btn) return;

  if (restTimerRunning) {
    btn.textContent = `Rest • ${formatMmSs(restTimerRemaining)}`;
    btn.classList.add("running");
    btn.classList.remove("finished");
  } 
  else if (!restTimerRunning && restTimerRemaining === 0) {
    btn.textContent = "Rest Timer";
    btn.classList.remove("running", "finished");
  }
  else {
    // finished naturally
    btn.textContent = "Rest done";
    btn.classList.remove("running");
    btn.classList.add("finished");
  }
}

function getTodaysSetsForExercise(exerciseName) {
  const key = getTodayKey(); // MUST match whatever you use to store logs
  const log = getExerciseLog?.() || {};
  const today = log[key] || {};
  const sets = today[exerciseName];
  return Array.isArray(sets) ? sets : [];
}

function calcVolumeFromSets(sets = []) {
  return sets.reduce((sum, s) => {
    const w = Number(s.weight) || 0;
    const r = Number(s.reps) || 0;
    return sum + (w * r);
  }, 0);
}

function clearRestTimer() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  restTimerRemaining = 0;
  restTimerRunning   = false;
  updateRestTimerUI();
}
function toggleRestTimer() {
  // If idle or finished → start a fresh 2:00
  if (!restTimerRunning && restTimerRemaining === 0) {
    restTimerRemaining = REST_TIMER_DEFAULT_SECS;
    restTimerRunning   = true;

    if (restTimerInterval) clearInterval(restTimerInterval);

    restTimerInterval = setInterval(() => {
      restTimerRemaining -= 1;
      if (restTimerRemaining <= 0) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
        restTimerRemaining = 0;
        restTimerRunning = false;
        updateRestTimerUI();
        showToast?.("Rest is up — next set when you're ready. 💪");
        return;
      }
      updateRestTimerUI();
    }, 1000);

    updateRestTimerUI();
    return;
  }

  // If running → cancel + reset
  if (restTimerRunning) {
    clearRestTimer();
    showToast?.("Rest timer cancelled.");
  }
}


function initFocusRestTimerControls() {
  if (!focusRestBtn || !focusRestLabel) return;

  clearRestTimer();

    focusRestBtn.addEventListener("click", () => {
    toggleRestTimer();
    });

}


// Weight input → update state
focusSetsListEl.addEventListener('input', (event) => {
  const input = event.target;
  if (!input.classList.contains('focus-weight-input')) return;

  const row = input.closest('.focus-set-row');
  if (!row || !currentFocusExercise) return;

  const index = Number(row.dataset.index);
  currentFocusExercise.sets[index].weight = input.value;
  autosaveFocusDraft();
});

// Reps +/- buttons
focusSetsListEl.addEventListener('click', (event) => {
  if (!currentFocusExercise) return;

  const btn = event.target.closest('.focus-reps-btn');
  if (!btn) return;

  const row = btn.closest('.focus-set-row');
  const index = Number(row.dataset.index);
  const set = currentFocusExercise.sets[index];
  if (!set) return;

  if (btn.classList.contains('reps-minus')) {
    set.reps = Math.max(1, (set.reps || 0) - 1);
  } else if (btn.classList.contains('reps-plus')) {
    set.reps = (set.reps || 0) + 1;
  }
  autosaveFocusDraft();
  renderFocusSets();
});

// Add Set (up to 5)
focusAddSetBtn.addEventListener('click', () => {
  if (!currentFocusExercise) return;
  if (currentFocusExercise.sets.length >= MAX_FOCUS_SETS) return;

  currentFocusExercise.sets.push({
    weight: '',
    reps: currentFocusExercise.suggestedReps || 10
  });
  autosaveFocusDraft();
  renderFocusSets();
});

// Cancel / close
focusCancelBtn.addEventListener('click', closeFocusCard);
focusCloseBtn.addEventListener('click', closeFocusCard);

// Complete – for now just log + close; you can hook this into your volume logic
// Complete
// Complete – log with sanity check first
focusCompleteBtn.addEventListener('click', () => {
  if (!currentFocusExercise) return;

  const totalVolume = getCurrentFocusTotalVolume();

  // Show the “are you sure?” overlay only if it’s insane,
  // otherwise just commit immediately.
  maybeConfirmInsaneFocusVolume(totalVolume, finalizeFocusExerciseCompletion);
});

function finalizeFocusExerciseCompletion() {
  if (!currentFocusExercise) return;

  // 1) Clean the sets (only keep ones with weight + reps)
  const cleanedSets = currentFocusExercise.sets.filter(
    (s) => s.weight !== '' && s.reps > 0
  );

  // 2) Save to today's exercise log (this also updates weekly volume card)
  recordExerciseSetsForToday(currentFocusExercise.name, cleanedSets);

  // 3) Find the matching exercise row in the Today's Split list
  const rows = document.querySelectorAll('#exercise-list .exercise-row');
  let targetRow = null;

  rows.forEach((row) => {
    const btn = row.querySelector('.exercise-name-btn');
    if (!btn) return;

    const nameAttr = btn.getAttribute('data-exercise');
    const label = nameAttr || btn.textContent.trim();

    if (label === currentFocusExercise.name) {
      targetRow = row;
    }
  });

  if (targetRow) {
    // a) Visually mark it as completed
    targetRow.classList.add('completed');

    // b) Tick the hidden checkbox so your existing logic still fires
    const checkbox = targetRow.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // c) Update that row's "X lbs logged" text from today's log
    const metaValueEl = targetRow.querySelector('.exercise-meta-value');
    if (metaValueEl) {
      const todaysVolume = getTodaysVolumeForExercise(currentFocusExercise.name);
      metaValueEl.textContent =
        todaysVolume > 0
          ? `${todaysVolume.toLocaleString()} lbs logged`
          : '0 lbs logged';
    }
  }

  // 4) Re-run your split completion logic (unlock finisher, etc.)
  if (typeof checkSplitCompletion === 'function') {
    checkSplitCompletion();
  }
  clearFocusDraft(currentFocusExercise.name);
  // 5) Close the focus card
  closeFocusCard();
  updatePrimaryCTAs();
}

function finalizeFocusExerciseCompletion() {
  if (!currentFocusExercise) return;

  // 1) Clean the sets (only keep ones with weight + reps)
  const cleanedSets = currentFocusExercise.sets.filter(
    (s) => s.weight !== '' && s.reps > 0
  );

  // 2) Save to today's exercise log (this also updates weekly volume card)
  recordExerciseSetsForToday(currentFocusExercise.name, cleanedSets);

  // 3) Find the matching exercise row in the Today's Split list
  const rows = document.querySelectorAll('#exercise-list .exercise-row');
  let targetRow = null;

  rows.forEach((row) => {
    const btn = row.querySelector('.exercise-name-btn');
    if (!btn) return;

    const nameAttr = btn.getAttribute('data-exercise');
    const label = nameAttr || btn.textContent.trim();

    if (label === currentFocusExercise.name) {
      targetRow = row;
    }
  });

  if (targetRow) {
    // a) Visually mark it as completed
    targetRow.classList.add('completed');

    // b) Tick the hidden checkbox so your existing logic still fires
    const checkbox = targetRow.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // c) Update that row's "X lbs logged" text from today's log
    const metaValueEl = targetRow.querySelector('.exercise-meta-value');
    if (metaValueEl) {
      const todaysVolume = getTodaysVolumeForExercise(currentFocusExercise.name);
      metaValueEl.textContent =
        todaysVolume > 0
          ? `${todaysVolume.toLocaleString()} lbs logged`
          : '0 lbs logged';
    }
  }

  // 4) Re-run your split completion logic (unlock finisher, etc.)
  if (typeof checkSplitCompletion === 'function') {
    checkSplitCompletion();
  }
  clearFocusDraft(currentFocusExercise.name);
  // 5) Close the focus card
  closeFocusCard();
}

function getTodayKey(){
  return getTodayDateKey();
}
/* Dev tools!!!!!!!!!!!! */
function devClearVolume() {
  localStorage.removeItem(EXERCISE_LOG_KEY);        // "ironpulse.exerciseLog.v1"
  resetWeeklyWeightByDay?.();

  updateWeeklyVolumeSummaryFromLog?.();
  showToast?.("Dev: Weekly volume reset to 0 lbs.");
}

function devResetStreak() {
  setWeeklyStreak(0);
  updateStreak();
  showToast?.("Dev: Weekly streak reset to 0.");
}

// --- Helper: bucket daily volume into 0–3 intensity ---
function getHistoryIntensityBucket(totalVolume) {
  if (!totalVolume || totalVolume <= 0) return 0;

  // tweak thresholds as you see real data
  if (totalVolume < 5000)  return 1; // light
  if (totalVolume < 15000) return 2; // medium
  return 3;                           // heavy
}

// --- Helper: build { "YYYY-MM-DD": totalVolume } from your exercise log ---
function getTotalVolumeByDateMap() {
  if (typeof getExerciseLog !== "function") {
    console.warn("[History] getExerciseLog is not defined");
    return {};
  }

  const log = getExerciseLog(); // same store used by focus card
  const volumeByDate = {};

  Object.keys(log || {}).forEach((dayKey) => {
    const exercises = log[dayKey];
    if (!exercises) return;

    let sum = 0;

    Object.keys(exercises).forEach((exerciseName) => {
      const sets = exercises[exerciseName] || [];
      sets.forEach((set) => {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        sum += w * r;
      });
    });

    volumeByDate[dayKey] = sum;
  });

  return volumeByDate;
}

// --- Helper: last N calendar days as Date objects ---
function getLastNDates(n) {
  const dates = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function getTodaysLoggedSets(exerciseName) {
  const todayKey = getTodayKey();              // make sure this matches your log keys
  const log = getExerciseLog?.() || {};
  const today = log[todayKey] || {};
  const sets = today[exerciseName];
  return Array.isArray(sets) ? sets : [];
}


function formatFriendlyDate(d) {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
function renderTrainingGoalWeekRow() {
  const row = document.getElementById("weekly-day-row");
  if (!row) return;

  const start = getStartOfWeek(new Date()); // Monday start
  const labels = ["M","T","W","T","F","S","S"];
  const todayKey = getTodayKey();

  row.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const key = dateToKey(d);

    const pill = document.createElement("div");
    pill.className = "weekly-day-pill";
    pill.textContent = labels[i];

    if (key === todayKey) pill.classList.add("weekly-day-pill--today");
    if (isWorkoutCompletedOn(d)) pill.classList.add("weekly-day-pill--worked");

    row.appendChild(pill);
  }
}



function startOfWeekMonday(d) {
  // returns a new Date at local midnight, Monday-based week
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  x.setDate(x.getDate() + diff);
  return x;
}

// intensity function (edit this later to match your real “volume/intensity” logic)
function getIntensityForDateKey(dateKey) {


  const log = getExerciseLog?.() || {};
  const dayLog = log[dateKey];

  if (!dayLog) return 0;


  let total = 0;
  for (const exName in dayLog) {
    const sets = dayLog[exName] || [];
    for (const s of sets) {
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      total += w * r;
    }
  }

  if (total <= 0) return 1;     // logged but tiny
  if (total < 6000) return 1;   // light
  if (total < 16000) return 2;  // medium
  return 3;                     // heavy
}

function getLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


function render90DayHeatmap() {
  const gridEl   = document.getElementById("history-heatmap-grid");
  const monthsEl = document.getElementById("history-month-row");
  const daysEl   = document.getElementById("history-days-logged");
  if (!gridEl || !monthsEl || !daysEl) return;

  gridEl.innerHTML = "";
  monthsEl.innerHTML = "";

  const checkins = getCheckins?.() || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysBack = 90;
  const start = new Date(today);
  start.setDate(start.getDate() - (daysBack - 1));

  const mon0 = (d) => (d.getDay() + 6) % 7;

  const dates = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  const startOffset = mon0(dates[0]);
  const totalCells = startOffset + dates.length;
  const weeks = Math.ceil(totalCells / 7);

  const monthLabelByWeek = new Array(weeks).fill("");
  let lastMonth = null;
  const weekIndexForDateIdx = (i) => Math.floor((startOffset + i) / 7);

  dates.forEach((d, i) => {
    const w = weekIndexForDateIdx(i);
    const month = d.getMonth();
    if (month !== lastMonth) {
      if (!monthLabelByWeek[w]) {
        monthLabelByWeek[w] = d.toLocaleString(undefined, { month: "short" });
      }
      lastMonth = month;
    }
  });

  monthLabelByWeek.forEach((label) => {
    const span = document.createElement("div");
    span.className = "history-month-label";
    span.textContent = label;
    monthsEl.appendChild(span);
  });

  let loggedDays = 0;

  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < 7; r++) {
      const cellIndex = w * 7 + r;
      const dateIndex = cellIndex - startOffset;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "history-hm-day";

      const dot = document.createElement("span");
      dot.className = "history-hm-dot history-hm-i0";
      btn.appendChild(dot);

      if (dateIndex >= 0 && dateIndex < dates.length) {
        const d = dates[dateIndex];
        const key = getLocalDateKey(d); // <-- use one consistent key helper

        const didWorkout = !!checkins[key];
        if (didWorkout) loggedDays++;

        const summary = getDailySummary?.(key);
        const volume =
        summary?.totalVolume ??
        (didWorkout ? (getTotalVolumeForDay?.(key) || 0) : 0);

        let intensity = intensityFromVolume?.(volume) ?? (didWorkout ? 2 : 0);
        if (didWorkout && intensity === 0) intensity = 1;

        dot.classList.remove("history-hm-i0");
        dot.classList.add(`history-hm-i${intensity}`);

          // ✅ Tooltip + accessibility
        const friendly = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const volText = Math.round(volume).toLocaleString();
        btn.title = didWorkout
          ? `${friendly} • ${volText} lbs`
          : `${friendly} • No workout`;

  btn.setAttribute("aria-label", btn.title);

        if (getLocalDateKey(today) === key) btn.classList.add("history-hm-today");
      } else {
        btn.classList.add("history-hm-pad");
      }

      gridEl.appendChild(btn);
    }
  }

  daysEl.textContent = `${loggedDays} day${loggedDays === 1 ? "" : "s"} logged`;
}


const DAILY_SUMMARY_KEY = "ip_daily_summary_v1";

function getDailySummaryMap() {
  try { return JSON.parse(localStorage.getItem(DAILY_SUMMARY_KEY) || "{}"); }
  catch { return {}; }
}

function saveDailySummaryMap(map) {
  localStorage.setItem(DAILY_SUMMARY_KEY, JSON.stringify(map));
}

function setDailySummary(dateKey, summary) {
  const map = getDailySummaryMap();
  map[dateKey] = { ...(map[dateKey] || {}), ...summary, updatedAt: Date.now() };
  saveDailySummaryMap(map);
}

function getDailySummary(dateKey) {
  const map = getDailySummaryMap();
  return map[dateKey] || null;

}
function initHeatmapMiniTip() {
    const tip = document.getElementById("history-hm-tip");
    const main = document.querySelector(".history-heatmap-main");
    const grid = document.getElementById("history-heatmap-grid");
    if (!tip || !main || !grid) return;

    const showTip = (btn) => {
    if (!btn || btn.classList.contains("history-hm-pad")) return;

    const title = btn.getAttribute("aria-label") || btn.title;
    if (!title) return;

    const parts = title.split("•").map(s => s.trim());
    const dateTxt = parts[0] || "";
    const volTxt  = parts[1] || "";

    tip.innerHTML = `
      <div class="hm-tip-date">${dateTxt}</div>
      <div class="hm-tip-vol">${volTxt}</div>
    `;

    const rect = btn.getBoundingClientRect();

    // Centered above the square, relative to viewport
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    tip.style.left = `${x}px`;
    tip.style.top  = `${y}px`;
    tip.style.transform = `translate(-50%, -12px)`;

    tip.classList.add("is-visible");
  };

  // Hover + focus support
  grid.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".history-hm-day");
    if (!btn) return;
    showTip(btn);
  });

  grid.addEventListener("mouseout", (e) => {
    const leavingGrid = !e.relatedTarget || !grid.contains(e.relatedTarget);
    if (leavingGrid) hideTip();
  });

  grid.addEventListener("focusin", (e) => {
    const btn = e.target.closest(".history-hm-day");
    if (!btn) return;
    showTip(btn);
  });

  grid.addEventListener("focusout", () => hideTip());

  // Tap support: tap a square to show; tap elsewhere to hide
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".history-hm-day");
    if (!btn) { hideTip(); return; }
    showTip(btn);
  });

  document.addEventListener("click", (e) => {
    if (main.contains(e.target)) return;
    hideTip();
  });
}
function initHistoryHeatmapTooltipDismiss() {
  const tip = document.getElementById("history-hm-tip");
  const grid = document.getElementById("history-heatmap-grid");
  if (!tip || !grid) return;

  const hideTip = () => {
    tip.classList.remove("is-visible");
  };

  // Hide when clicking/tapping anywhere outside a heatmap day
  document.addEventListener("pointerdown", (e) => {
    const dayBtn = e.target.closest?.(".history-hm-day");
    if (!dayBtn) {
      hideTip();
      return;
    }

    // If they tapped a padding cell, also hide
    if (dayBtn.classList.contains("history-hm-pad")) hideTip();
  }, { passive: true });

  // Hide on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideTip();
  });

  // Hide when the user scrolls (prevents “floating orphan tooltip”)
  const onScroll = () => hideTip();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
/* ===============================
   WEEKLY STREAK + REST TOKENS v1
   Calendar week (Mon–Sun)
   =============================== */

const IP_KEYS = {
  weekCounts: "ip_weekCountsById",         // { [weekId]: number }
  lastSeenWeekId: "ip_lastSeenWeekId",     // "YYYY-W##"
  streakCount: "ip_weeklyStreakCount",     // number
  streakLastWeekId: "ip_streakLastWeekId", // "YYYY-W##" (latest week included)
  restTokens: "ip_restTokens",             // integer
  tokenProgress: "ip_restTokenProgress",   // 0..( < 1)
  starterWeekId: "ip_starterWeekId",       // "YYYY-W##" (set on first workout ever)
  rewardedWeekId: "ip_rewardedWeekId",     // last weekId that gave +1 token for 3+
};

const MAX_REST_TOKENS = 3;
const MIN_FOR_WEEK_COMPLETE = 2;
const MIN_FOR_TOKEN_EARN = 3;
const AFTERBURN_TOKEN_PROGRESS = 1 / 3;

function safeParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function getWeekCounts() {
  return safeParseJSON(localStorage.getItem(IP_KEYS.weekCounts), {});
}

function setWeekCounts(obj) {
  localStorage.setItem(IP_KEYS.weekCounts, JSON.stringify(obj));
}


function getRestTokens() {
  const n = Number(localStorage.getItem(IP_KEYS.restTokens) || 0);
  const clamped = Math.min(MAX_REST_TOKENS, Math.max(0, Math.floor(n)));
  if (clamped !== n) localStorage.setItem(IP_KEYS.restTokens, String(clamped)); // self-heal
  return clamped;
}

function setRestTokens(n) {
  const clamped = Math.max(0, Math.min(MAX_REST_TOKENS, Math.floor(n)));
  localStorage.setItem(IP_KEYS.restTokens, String(clamped));
}

function getTokenProgress() {
  const p = Number(localStorage.getItem(IP_KEYS.tokenProgress) || 0);
  const clamped = Math.max(0, Math.min(0.999999, p));
  if (clamped !== p) localStorage.setItem(IP_KEYS.tokenProgress, String(clamped)); // self-heal
  return clamped;
}

function setTokenProgress(p) {
  const clamped = Math.max(0, Math.min(0.999999, p));
  localStorage.setItem(IP_KEYS.tokenProgress, String(clamped));
}

function addRestTokenProgress(delta) {
  // If already capped, do not accumulate progress
  if (getRestTokens() >= MAX_REST_TOKENS) {
    setTokenProgress(0);
    return;
  }

  let progress = getTokenProgress() + delta;

  while (progress >= 1 && getRestTokens() < MAX_REST_TOKENS) {
    setRestTokens(getRestTokens() + 1);
    progress -= 1;
  }

  // If we hit cap, clear progress
  if (getRestTokens() >= MAX_REST_TOKENS) {
    setTokenProgress(0);
    return;
  }

  setTokenProgress(progress);
}


function getStreakCount() {
  return Number(localStorage.getItem(IP_KEYS.streakCount) || 0);
}

function setStreakCount(n) {
  localStorage.setItem(IP_KEYS.streakCount, String(Math.max(0, Math.floor(n))));
}

function getStreakLastWeekId() {
  return localStorage.getItem(IP_KEYS.streakLastWeekId) || "";
}

function setStreakLastWeekId(weekId) {
  localStorage.setItem(IP_KEYS.streakLastWeekId, weekId);
}

/** WeekId format: "YYYY-W##" based on Monday-start week */
function getWeekId(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Monday-start week key (matches getCurrentWeekId)
  const dayIndex = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - dayIndex);

  return dateToKey(d); // "YYYY-MM-DD" (Monday)
}


function isAdjacentWeek(prevWeekId, nextWeekId) {
  // prevWeekId / nextWeekId are Monday keys: "YYYY-MM-DD"
  const prev = new Date(prevWeekId + "T00:00:00");
  const next = new Date(nextWeekId + "T00:00:00");
  if (Number.isNaN(prev.getTime()) || Number.isNaN(next.getTime())) return false;

  const diffDays = Math.round((next - prev) / (24 * 60 * 60 * 1000));
  return diffDays === 7;
}


function weekIdToDate(weekId) {
  // Approx: parse YYYY-W## and return Monday of that week
  const m = /^(\d{4})-W(\d{2})$/.exec(weekId);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);

  // Monday of week 1
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const week1Mon = new Date(jan4);
  week1Mon.setDate(jan4.getDate() - jan4Day);
  week1Mon.setHours(0, 0, 0, 0);

  const target = new Date(week1Mon);
  target.setDate(week1Mon.getDate() + (week - 1) * 7);
  return target;
}

// One place to store weekly counts (map of weekId -> number)
function getWeekCountsMap() {
  try {
    const raw = localStorage.getItem(IP_KEYS.weekCounts);
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch {
    return {};
  }
}

function setWeekCountsMap(map) {
  try {
    localStorage.setItem(IP_KEYS.weekCounts, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

function getCountForWeek(weekId) {
  const map = getWeekCountsMap();
  const n = Number(map?.[weekId] ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function setCountForWeek(weekId, value) {
  const map = getWeekCountsMap();
  map[weekId] = Math.max(0, Math.floor(Number(value) || 0));
  setWeekCountsMap(map);
}


function ensureStarterWeekId(currentWeekId) {
  const existing = localStorage.getItem(IP_KEYS.starterWeekId);
  if (existing) return existing;
  localStorage.setItem(IP_KEYS.starterWeekId, currentWeekId);
  return currentWeekId;
}

function isStarterWeek(weekId) {
  const starter = localStorage.getItem(IP_KEYS.starterWeekId);
  return starter && starter === weekId;
}

function isWeekCompleted(weekId) {
  const count = getCountForWeek(weekId);
  if (isStarterWeek(weekId)) return count >= 1;
  return count >= MIN_FOR_WEEK_COMPLETE;
}

function didWeekEarnToken(weekId) {
  return getCountForWeek(weekId) >= MIN_FOR_TOKEN_EARN;
}

/**
 * Reconcile missed weeks when app opens after being away.
 * Applies token-save rule for "1 workout week".
 */
function reconcileUpToCurrentWeek() {
  const currentWeekId = getWeekId(new Date());
  const lastSeen = localStorage.getItem(IP_KEYS.lastSeenWeekId);

  if (!lastSeen) {
    localStorage.setItem(IP_KEYS.lastSeenWeekId, currentWeekId);
    return;
  }
  if (lastSeen === currentWeekId) return;

  let cursor = lastSeen;
  let guard = 0;

  while (cursor !== currentWeekId && guard < 60) { // ~60 weeks safety
    finalizeWeek(cursor);

    const cursorDate = new Date(cursor + "T00:00:00");
    if (Number.isNaN(cursorDate.getTime())) break;

    cursorDate.setDate(cursorDate.getDate() + 7);
    cursor = getWeekId(cursorDate);

    if (!cursor || cursor === lastSeen) break;
    guard++;
  }

  localStorage.setItem(IP_KEYS.lastSeenWeekId, currentWeekId);
}


const COMPLETED_EXERCISES_KEY = "ip_completed_exercises_by_day";

function getCompletedExercisesForDay(dayKey) {
  try {
    const all = JSON.parse(localStorage.getItem(COMPLETED_EXERCISES_KEY) || "{}");
    return Array.isArray(all[dayKey]) ? all[dayKey] : [];
  } catch {
    return [];
  }
}

function setExerciseCompletedForDay(dayKey, exerciseName) {
  let all = {};
  try { all = JSON.parse(localStorage.getItem(COMPLETED_EXERCISES_KEY) || "{}"); } catch {}

  const set = new Set(all[dayKey] || []);
  set.add(exerciseName);

  all[dayKey] = Array.from(set);
  localStorage.setItem(COMPLETED_EXERCISES_KEY, JSON.stringify(all));
}

function isExerciseCompletedForDay(dayKey, exerciseName) {
  return getCompletedExercisesForDay(dayKey).includes(exerciseName);
}

function clearExerciseCompletedForDay(dayKey, exerciseName) {
  let all = {};
  try { all = JSON.parse(localStorage.getItem(COMPLETED_EXERCISES_KEY) || "{}"); } catch {}

  const set = new Set(all[dayKey] || []);
  set.delete(exerciseName);

  all[dayKey] = Array.from(set);
  localStorage.setItem(COMPLETED_EXERCISES_KEY, JSON.stringify(all));
}

function finalizeWeek(weekId) {
  const count = getCountForWeek(weekId);

  // Starter week rule handled by isWeekCompleted (>=1)
  if (isWeekCompleted(weekId)) {
    // Completed weeks are already counted when they complete (instant),
    // but reconciliation ensures streak breaks on gaps.
    return;
  }

  // Not completed. Token-save only if exactly 1 workout (and not starter week)
  if (!isStarterWeek(weekId) && count === 1 && getRestTokens() > 0) {
    setRestTokens(getRestTokens() - 1);
    // Treat as completed for streak continuity:
    setCountForWeek(weekId, MIN_FOR_WEEK_COMPLETE);
    return;
  }

  // 0 workouts OR starter week with 0 OR any other incomplete -> streak breaks
  setStreakCount(0);
  setStreakLastWeekId("");
}

function logWorkoutAndUpdateWeeklySystems() {
  reconcileUpToCurrentWeek();

  const weekId = getWeekId(new Date());

  ensureStarterWeekId(weekId);

  const prev = getCountForWeek(weekId);
  const next = prev + 1;
  setCountForWeek(weekId, next);

  // --- micro feedback every workout ---
  const banner = document.getElementById("streak-banner");
  if (banner) {
    banner.classList.remove("streak-tick");
    void banner.offsetWidth;
    banner.classList.add("streak-tick");
  }

  const wasCompleted = (isStarterWeek(weekId) ? prev >= 1 : prev >= MIN_FOR_WEEK_COMPLETE);
  const nowCompleted = isWeekCompleted(weekId);

  if (!wasCompleted && nowCompleted) {
    const prevStreak = getStreakCount();
    const prevTier = getEmblemTierForStreak?.(prevStreak);

    const lastStreakWeek = getStreakLastWeekId();
    if (lastStreakWeek && isAdjacentWeek(lastStreakWeek, weekId)) {
      setStreakCount(prevStreak + 1);
    } else {
      setStreakCount(1);
    }
    setStreakLastWeekId(weekId);

    // 🔥 Week clinched hit
    triggerStreakPowerup();

    const newStreak = getStreakCount();
    const newTier = getEmblemTierForStreak?.(newStreak);

    if (newTier && newTier !== prevTier) {
      const label = getEmblemLabelForTier?.(newTier) || "Rank Up";

      const shouldOverlay =
        String(newTier).includes("monthly") ||
        String(newTier).includes("quarterly") ||
        String(newTier).includes("annual") ||
        String(newTier).includes("legendary");

      if (shouldOverlay) queueRankUpOverlay(newTier, label);
    }

  }

  // IMMEDIATE TOKEN AWARD when they hit 3+ for the week (once per week)
  if (prev < MIN_FOR_TOKEN_EARN && next >= MIN_FOR_TOKEN_EARN) {
    const rewardedWeek = localStorage.getItem(IP_KEYS.rewardedWeekId);
    if (rewardedWeek !== weekId) {
      setRestTokens(getRestTokens() + 1);
      localStorage.setItem(IP_KEYS.rewardedWeekId, weekId);

      // 🔥 Recovery earned hit
      triggerStreakPowerup();
      // showToast?.("Recovery earned — Rest Token +1 🛌🔥");
    }
  }
}


function triggerStreakPowerup() {
  const b = document.getElementById("streak-banner");
  if (!b) return;
  b.classList.remove("streak-powerup");
  void b.offsetWidth;
  b.classList.add("streak-powerup");
  setTimeout(() => b.classList.remove("streak-powerup"), 900);
}

/** Called when Afterburn is completed */
function onAfterburnCompleted() {
  addRestTokenProgress(AFTERBURN_TOKEN_PROGRESS);
  // updateStreakBannerUI?.();
}

function getWeeklyBannerState() {
  const weekId = getWeekId(new Date());
  const count = getCountForWeek(weekId);

  return {
    weekId,
    workoutsThisWeek: count,
    minToComplete: isStarterWeek(weekId) ? 1 : MIN_FOR_WEEK_COMPLETE,
    tokenThreshold: MIN_FOR_TOKEN_EARN,
    weekCompleted: isWeekCompleted(weekId),
    tokenEarnedThisWeek: count >= MIN_FOR_TOKEN_EARN,
    streak: getStreakCount(),
    restTokens: getRestTokens(),
    restTokenProgress: getTokenProgress(),
    isStarterWeek: isStarterWeek(weekId),
  };
}

function getCurrentFocusExerciseName() {
  return document.getElementById("focus-exercise-name")?.textContent?.trim() || "";
}

function readFocusStateFromUI() {
  const list = document.getElementById("focus-sets-list");
  if (!list) return { sets: [] };

  const rows = list.querySelectorAll(".focus-set-row");
  const sets = Array.from(rows).map((row) => {
    const weight = row.querySelector(".focus-weight-input")?.value ?? "";
    const repsText = row.querySelector(".focus-reps-count")?.textContent ?? "0";
    const reps = parseInt(repsText, 10);
    const completed = row.classList.contains("completed");

    return {
      weight,
      reps: Number.isNaN(reps) ? 0 : reps,
      completed
    };
  });

  return { sets };
}

function writeFocusStateToUI(state) {
  const list = document.getElementById("focus-sets-list");
  if (!list || !state?.sets) return;

  const rows = list.querySelectorAll(".focus-set-row");

  state.sets.forEach((s, i) => {
    const row = rows[i];
    if (!row) return;

    const w = row.querySelector(".focus-weight-input");
    if (w && typeof s.weight !== "undefined") w.value = String(s.weight);

    const repsEl = row.querySelector(".focus-reps-count");
    if (repsEl && typeof s.reps !== "undefined") repsEl.textContent = String(s.reps);

    row.classList.toggle("completed", !!s.completed);
  });
}
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const autosaveFocusDraft = debounce(() => {
  const ex = getCurrentFocusExerciseName();
  if (!ex) return;

  saveFocusDraft(ex, {
    ...readFocusStateFromUI(),
    updatedAt: Date.now()
  });
}, 200);

function initFocusDraftAutosave() {
  const overlay = document.getElementById("focus-overlay");
  if (!overlay) return;

  // weights inputs
  overlay.addEventListener("input", (e) => {
    if (e.target && e.target.classList?.contains("focus-weight-input")) autosaveFocusDraft();
  });

  // reps +/- buttons (click changes text content)
  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;

    // if your +/- buttons have classes, swap these selectors accordingly
    if (t.classList.contains("focus-reps-btn") || t.closest(".focus-reps-btn")) {
      autosaveFocusDraft();
    }

    // if your set toggle marks row completed
    if (t.classList.contains("focus-set-toggle") || t.closest(".focus-set-toggle")) {
      autosaveFocusDraft();
    }
  });
}

function initHeaderUI() {
  window.addEventListener("scroll", () => {
    document.body.classList.toggle("scrolled", window.scrollY > 6);
  });
}
function pulseEl(el) {
  if (!el) return;
  el.classList.remove("pulse-hint");
  void el.offsetWidth;
  el.classList.add("pulse-hint");
  setTimeout(() => el.classList.remove("pulse-hint"), 900);
}

function scrollToEl(el, offset = 14) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

function isSetupVisible() {
  const setup = document.getElementById("screen-setup");
  if (!setup) return false;
  return getComputedStyle(setup).display !== "none";
}

function initStartTodayCTA() {
  const btnTop = document.getElementById("hero-cta");
  const btnBottom = document.getElementById("bottom-split-btn");

  const onClick = (e) => {
    e.preventDefault();

    // ✅ If user is on page 1 → ONLY switch screens, no scrolling
    if (isSetupVisible()) {
      localStorage.setItem(ONBOARDED_KEY, "true");
      showScreen("daily");
      return;
    }

    // ✅ Already on page 2 → now we can scroll based on goal
    const goal = getWeeklyGoal?.() || 0;

    if (!goal) {
      const goalSection = document.getElementById("weekly-goal-control");
      if (goalSection) {
        goalSection.scrollIntoView({ behavior: "smooth", block: "start" });
        pulseEl?.(goalSection);
      }
      

      showToast?.("Set your weekly goal to start your streak 🔥");
      return;
    }

    const splitSection = document.getElementById("split");
    splitSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // IMPORTANT: use ONE handler, don’t stack multiples
  btnTop?.addEventListener("click", onClick);
  btnBottom?.addEventListener("click", onClick);
}

function setWeeklyGoalLockedUI(lockedDays) {
  const dailyScreen = document.getElementById("screen-daily");
  if (!dailyScreen) return;

  const pills = dailyScreen.querySelectorAll(".day-pill");
  pills.forEach(p => {
    const d = parseInt(p.getAttribute("data-days"), 10);
    const isChosen = lockedDays && d === lockedDays;

    p.classList.toggle("active", isChosen);

    // lock everything except the chosen one
    p.disabled = !!lockedDays && !isChosen;
    p.classList.toggle("locked", !!lockedDays && !isChosen); // optional CSS hook
  });
}

function appConfirm({
  title = "Confirm",
  message = "",
  okText = "OK",
  cancelText = "Cancel",
  danger = false, // optional: you can style ok button differently later
} = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("app-confirm");
    const titleEl = document.getElementById("app-confirm-title");
    const textEl = document.getElementById("app-confirm-text");
    const okBtn = document.getElementById("app-confirm-ok");
    const cancelBtn = document.getElementById("app-confirm-cancel");
    const backdrop = modal?.querySelector(".app-confirm-backdrop");

    if (!modal || !titleEl || !textEl || !okBtn || !cancelBtn) {
      // fallback if DOM missing
      resolve(window.confirm(message));
      return;
    }

    titleEl.textContent = title;
    textEl.textContent = message;
    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;

    const cleanup = () => {
      okBtn.onclick = null;
      cancelBtn.onclick = null;
      backdrop?.removeEventListener("click", onCancel);
      window.removeEventListener("keydown", onKey);
      modal.classList.add("hidden");
    };

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onOk();
    };

    okBtn.onclick = onOk;
    cancelBtn.onclick = onCancel;
    backdrop?.addEventListener("click", onCancel);
    window.addEventListener("keydown", onKey);

    modal.classList.remove("hidden");
    okBtn.focus();
  });
}




// =============================
// 9) INIT
// =============================
window.addEventListener("DOMContentLoaded", () => {
  initHeaderUI();
  reconcileUpToCurrentWeek();
  ensureWeeklyState();
  initScreens();
  applyInstalledUI();
  initStartTodayCTA();
  initTodaysSplit();
  updatePrimaryCTAs();
  restoreTodayCompletionUI();
  initWeeklyGoalControls?.();
  initFinisherControls();
  initServiceWorker();
  initFocusRestTimerControls();
  initTrainingHistoryToggle();
  updateStreak();
  updateWeeklyVolumeSummaryFromLog();
  render90DayHeatmap();
  initHeatmapMiniTip();
  initHistoryHeatmapTooltipDismiss();
  renderTrainingGoalWeekRow();


  // 🔧 Dev buttons


  /*initDebugStreakButton(); // 🔧 DEV ONLY – remove later
  // 
  initWeeklyVolumeScrollTrigger();
const devClearVolumeBtn = document.getElementById("dev-clear-volume-btn");
if (devClearVolumeBtn) {
  devClearVolumeBtn.addEventListener("click", devClearVolume);
}

const devResetStreakBtn = document.getElementById("dev-reset-streak-btn");
if (devResetStreakBtn) {
  devResetStreakBtn.addEventListener("click", devResetStreak);
}


  const gateBtn = document.getElementById("dev-gate-btn");
  const bossBtn = document.getElementById("dev-boss-btn");
  const completeBtn = document.getElementById("dev-complete-weekly-btn");

  if (gateBtn) {
    gateBtn.addEventListener("click", () => {
      console.log("[DEV] Gate encounter test");
      launchWeeklyEncounterFromStats({ isBossWeek: false });
    });
  }

  if (bossBtn) {
    bossBtn.addEventListener("click", () => {
      console.log("[DEV] Boss encounter test");
      launchWeeklyEncounterFromStats({ isBossWeek: true });
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      console.log("[DEV] Force weekly goal completion");
      devForceWeeklyGoalCompletion();
    });
  }
  */
});
