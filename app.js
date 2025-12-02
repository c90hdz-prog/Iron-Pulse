
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
    const VOLUME_OBJECTS = [
  {
    id: "backpack",
    label: "Small backpack",
    emoji: "🎒",
    threshold: 0
  },
  {
    id: "car",
    label: "Small car",
    emoji: "🚗",
    threshold: 800      // hit this pretty early
  },
  {
    id: "suv",
    label: "Pickup truck",
    emoji: "🚙",
    threshold: 2500
  },
  {
    id: "truck",
    label: "Delivery truck",
    emoji: "🚚",
    threshold: 6000
  },
  {
    id: "tank",
    label: "Battle tank",
    emoji: "🛡️",
    threshold: 12000
  },
  {
    id: "jet",
    label: "Fighter jet",
    emoji: "✈️",
    threshold: 22000
  }
];

// --- Skipped workout tracking ---





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

// Moves the program cursor forward by 1 day
function advanceSessionRotation(meta) {
  if (!meta || !meta.programId) return;

  // however you're storing program cursor – adjust key if needed
  const KEY = "ironpulse.programCursor.v1";

  let state;
  try {
    state = JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    state = {};
  }

  const programId = meta.programId;
  const currentIndex = meta.recommendedIndex ?? 0;

  // bump index (wrap around within the program length)
  // if you know your program length, you can store it here or
  // pull it from your PROGRAMS array
  const program = PROGRAMS.find(p => p.id === programId);
  const sessionCount = program ? program.sessions.length : 1;

  const nextIndex = (currentIndex + 1) % sessionCount;

  state[programId] = {
    index: nextIndex,
    lastUpdated: new Date().toISOString()
  };

  localStorage.setItem(KEY, JSON.stringify(state));
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

    // Key: "ironpulse.exerciseLog.v1"
// Shape:
// {
//   "2025-12-01": {
//     "Squat": [ { weight: 135, reps: 8 }, ... ],
//     "Bench Press": [ ... ]
//   },
//   ... more days ...
// }

// ---- Exercise volume log helpers ----

const EXERCISE_LOG_KEY = "ironpulse.exerciseLog.v1";

// Optional: map each exercise to a muscle group
const EXERCISE_MUSCLE_MAP = {
  "Squat": "Legs",
  "Bench Press": "Chest",
  "Row": "Back",
  "Plank": "Core"
  // add more as you add exercises
};

const MUSCLE_EMOJI_MAP = {
  "Legs": "🦵",
  "Chest": "💪",
  "Back": "🏹",
  "Core": "🛡️",
  "Full Body": "🔥"
};

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  // Recompute weekly volume + refresh UI
  updateWeeklyVolumeSummaryFromLog();
}
    
// ---- Weekly volume aggregation ----

/**
 * Get the Date object for the start of this week.
 * Here I'm treating Monday as the start. Change if you prefer Sunday.
 */
function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
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

/**
 * Compute weekly totals:
 * - totalVolume: sum of (weight * reps)
 * - perMuscle: { "Legs": xxx, "Chest": yyy, ... }
 * - perExercise: { "Squat": xxx, ... }
 */
function computeWeeklyVolumeSummary() {
  const log = getExerciseLog();
  const startOfWeek = getStartOfWeek();
  const now = new Date();

  let totalVolume = 0;
  const perMuscle = {};
  const perExercise = {};

  // Walk each day of the week up to today
  const cursor = new Date(startOfWeek);
  while (cursor <= now) {
    const key = dateToKey(cursor);
    const dayLog = log[key];
    if (dayLog) {
      Object.entries(dayLog).forEach(([exerciseName, sets]) => {
        const muscle =
          EXERCISE_MUSCLE_MAP[exerciseName] || "Full Body";

        const exerciseVolume = (sets || []).reduce((sum, set) => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          return sum + w * r;
        }, 0);

        totalVolume += exerciseVolume;
        perExercise[exerciseName] =
          (perExercise[exerciseName] || 0) + exerciseVolume;
        perMuscle[muscle] =
          (perMuscle[muscle] || 0) + exerciseVolume;
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return { totalVolume, perMuscle, perExercise };
}

/**
 * Update the weekly volume card UI.
 * Adjust element IDs if your HTML uses different ones.
 */
function updateWeeklyVolumeSummaryFromLog() {
  const { totalVolume } = computeWeeklyVolumeSummary();

  // DOM hooks – these IDs match your HTML snippet
  const emojiEl   = document.getElementById("volume-object-emoji");
  const labelEl   = document.getElementById("volume-object-label");
  const barFillEl = document.getElementById("volume-bar-fill");
  const captionEl = document.getElementById("volume-bar-caption");

  // If card isn't on this screen, bail quietly
  if (!emojiEl || !labelEl || !barFillEl || !captionEl) return;

  // Use your tier system instead of muscles
  const { current, next, progress } = getVolumeTierInfo(totalVolume);

  // Emoji + label from the current vehicle tier
  emojiEl.textContent = current.emoji;
  labelEl.textContent = current.label;

  // Fill the bar based on progress within this tier
  barFillEl.style.width = `${Math.round(progress * 100)}%`;

  const roundedTotal = Math.round(totalVolume).toLocaleString();

  if (!next) {
    // Last tier reached (e.g. tank / jet)
    captionEl.textContent =
      `You’ve moved ${roundedTotal} lbs so far — you’ve maxed out this week’s ${current.label.toLowerCase()} tier.`;
  } else {
    const remaining = Math.max(0, next.threshold - totalVolume);
    captionEl.textContent =
      `You’ve moved ${roundedTotal} lbs so far — ` +
      `${Math.round(remaining).toLocaleString()} lbs to upgrade into a ${next.label.toLowerCase()}.`;
  }
}



    function getRandomPostWorkoutQuote() {
            if (!POST_WORKOUT_QUOTES || POST_WORKOUT_QUOTES.length === 0) return "";
            const idx = Math.floor(Math.random() * POST_WORKOUT_QUOTES.length);
            return POST_WORKOUT_QUOTES[idx];
        }

    function getExerciseWeights() {
        try {
            const raw = localStorage.getItem(EXERCISE_WEIGHT_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
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
    const MAX_REST_TOKENS = 5; // you can change to 3–5 later if you want


    // === Weekly weight (by day, 0 = Sunday ... 6 = Saturday) ===
    const WEEKLY_WEIGHT_BY_DAY_KEY = "ironPulseWeeklyWeightByDay";


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
            description: "High-rep finisher, 15–20 reps.",
            suggestedReps: 15
          }
        ]
      }
    ]
  }
};


    function scrollToFinisherSection() {
        const section = document.getElementById("finisher");
        if (!section) return;
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }



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











// ----- Rest token helpers -----
    function getRestTokens() {
        const raw = localStorage.getItem(REST_TOKENS_KEY);
        const num = parseInt(raw ?? "0", 10);
        return Number.isNaN(num) ? 0 : Math.max(0, num);
    }

    function setRestTokens(value) {
            const capped = Math.max(0, Math.min(MAX_REST_TOKENS, value));
            localStorage.setItem(REST_TOKENS_KEY, String(capped));
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

    function addRestTokenProgress(amount) {
            let progress = getRestTokenProgress();
            let tokens = getRestTokens();

            // Already maxed out → keep bar full, do nothing else
            if (tokens >= MAX_REST_TOKENS) {
                setRestTokenProgress(1);
                showToast?.("Rest token stash is full. Time to spend a few. 😴");
                return;
            }

            progress += amount;

            // Convert progress → tokens, but never exceed the cap
            while (progress >= 1 && tokens < MAX_REST_TOKENS) {
                tokens += 1;
                progress -= 1;
            }

            // If we somehow overshoot at the exact moment we hit cap
            if (tokens >= MAX_REST_TOKENS) {
                tokens = MAX_REST_TOKENS;
                progress = 0; // clean bar once fully capped
            }

            setRestTokens(tokens);
            setRestTokenProgress(progress);
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



    function getWorkoutsCompletedThisWeek() {
            const raw = localStorage.getItem(WORKOUTS_THIS_WEEK_KEY);
            const num = parseInt(raw ?? "0", 10);
            return Number.isNaN(num) ? 0 : num;
        }

        function setWorkoutsCompletedThisWeek(value) {
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




    function getVolumeTierInfo(totalLbs) {
            // Make sure total is non-negative
            const total = Math.max(0, totalLbs || 0);

            let current = VOLUME_OBJECTS[0];
            let next = null;

            for (let i = 0; i < VOLUME_OBJECTS.length; i++) {
                const tier = VOLUME_OBJECTS[i];
                if (total >= tier.threshold) {
                    current = tier;
                    next = VOLUME_OBJECTS[i + 1] || null;
                } else {
                    // first tier whose threshold we haven't reached yet
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


function updateWeeklyVolumeSummary() {
  // 1) Get weekly total (weight × reps)
  const { totalVolume } = computeWeeklyVolumeSummary();

  // 2) Figure out which vehicle we’re on + progress within that tier
  const { current, next, progress } = getVolumeTierInfo(totalVolume);

  // 3) Grab DOM elements
  const emojiEl   = document.getElementById("volume-object-emoji");
  const labelEl   = document.getElementById("volume-object-label");
  const barFillEl = document.getElementById("volume-bar-fill");
  const captionEl = document.getElementById("volume-bar-caption");

  if (!emojiEl || !labelEl || !barFillEl || !captionEl) return;

  // 4) Set emoji + label for current object
  emojiEl.textContent = current.emoji;
  labelEl.textContent = current.label;

  // 5) Set bar width based on progress in current tier (0–1)
  const pct = Math.round(progress * 100);
  barFillEl.style.width = pct + "%";

  // Optional little “pop” animation
  barFillEl.classList.add("volume-levelup");
  setTimeout(() => barFillEl.classList.remove("volume-levelup"), 700);

  // 6) Caption text (current total + tease next object)
  const totalRounded = Math.round(totalVolume).toLocaleString();

  if (next) {
    captionEl.textContent =
      `You’ve moved ${totalRounded} lbs so far — next up: ${next.label.toLowerCase()}.`;
  } else {
    captionEl.textContent =
      `You’ve moved ${totalRounded} lbs — you’ve outlifted the final tier. Monster work.`;
  }
}




    // =============================
    // 2) STORAGE HELPERS
    // =============================
    function getWeeklyGoal() {
            const stored = localStorage.getItem(WEEKLY_GOAL_KEY);
            if (!stored) {
                return null; // 🔹 explicit “no goal set”
            }
            const num = parseInt(stored, 10);
            return isNaN(num) ? null : num;
        }


    function setWeeklyGoal(days) {
        localStorage.setItem(WEEKLY_GOAL_KEY, String(days));
    }
    function hasWeeklyGoal() {
            return localStorage.getItem(WEEKLY_GOAL_KEY) !== null;
        }
    function repositionWeeklyGoalSection() {
            const days = getWeeklyGoal();  // null when no goal set
            const dailyScreen = document.getElementById("screen-daily");
            const weeklyFocus = document.getElementById("weekly-focus-live");
            const goalSection = document.getElementById("weekly-goal-control");
            const dailyMain = document.getElementById("daily-main-content");

            if (!dailyScreen || !weeklyFocus || !goalSection || !dailyMain) return;

            if (!days) {
                // 🔸 No weekly goal set:
                // - hide split/motivation/finisher
                // - move goal section right under the focus card
                dailyMain.classList.add("hidden");

                // weeklyFocus is before dailyMain, so insert goalSection before dailyMain
                dailyScreen.insertBefore(goalSection, dailyMain);
            } else {
                // 🔹 Goal is set:
                // - show workouts
                // - keep goal selector down at the bottom
                dailyMain.classList.remove("hidden");

                dailyScreen.appendChild(goalSection);
            }
        }


    // =============================
    // 5) WEEKLY FOCUS LIVE CARD
    // =============================


    function renderWeeklyFocusLive() {
            const daysLabelEl = document.getElementById("weekly-focus-days-label");
            const summaryEl = document.getElementById("weekly-focus-summary");
            if (!daysLabelEl || !summaryEl) return;

            const days = getWeeklyGoal();
            if (!days) {
                daysLabelEl.textContent = "No weekly goal set";
                summaryEl.textContent = "Pick a weekly training goal below to lock in how many days you’re committing to this week.";
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
        }



    function initWeeklyGoalControls() {
            const dailyScreen = document.getElementById("screen-daily");
            if (!dailyScreen) return;

            const pills = dailyScreen.querySelectorAll(".day-pill");
            if (!pills.length) return;

            const resetBtn = document.getElementById("reset-weekly-goal-btn");
            const commitBtn = document.getElementById("commit-weekly-goal-btn");

            const currentGoal = getWeeklyGoal();
            const isLocked = localStorage.getItem(WEEKLY_GOAL_LOCKED_KEY) === "true";

            let pendingDays = null; // what the user has selected but not committed yet

            // Reset button visibility: only show if a goal actually exists
            if (resetBtn) {
                resetBtn.style.display = currentGoal ? "inline-flex" : "none";
            }

            // Commit button starts hidden
            if (commitBtn) {
                commitBtn.style.display = "none";
            }

            // Initialize pill states
            pills.forEach(pill => {
                const pillDays = parseInt(pill.getAttribute("data-days"), 10);

                if (currentGoal && pillDays === currentGoal) {
                    pill.classList.add("active");
                }

                if (isLocked) {
                    pill.disabled = true;
                }

                pill.addEventListener("click", () => {
                    if (localStorage.getItem(WEEKLY_GOAL_LOCKED_KEY) === "true") {
                        return;
                    }

                    pendingDays = pillDays;

                    pills.forEach(p => p.classList.remove("active"));
                    pill.classList.add("active");

                    if (commitBtn) {
                        commitBtn.style.display = "inline-flex";
                    }
                });
            });

            // ✅ Commit the weekly goal (lock it + reset progress + rotation)
            if (commitBtn) {
                commitBtn.addEventListener("click", () => {
                    if (localStorage.getItem(WEEKLY_GOAL_LOCKED_KEY) === "true") return;
                    if (!pendingDays) return;

                    const confirmCommit = window.confirm(
                        `Commit to training ${pendingDays} days this week?`
                    );
                    if (!confirmCommit) return;

                    setWeeklyGoal(pendingDays);
                    localStorage.setItem(WEEKLY_GOAL_LOCKED_KEY, "true");

                    // 🔹 Reset progress + rotation for a fresh week
                    setWorkoutsCompletedThisWeek(0);
                    setRotationIndex(0);

                    pills.forEach(p => {
                        p.disabled = true;
                    });

                    if (commitBtn) {
                        commitBtn.style.display = "none";
                    }
                    if (resetBtn) {
                        resetBtn.style.display = "inline-flex";
                    }

                    renderWeeklyFocusLive();
                    repositionWeeklyGoalSection();
                    initTodaysSplit();
                    updateStreak();
                });
            }

            // ✅ Reset weekly goal (also reset progress + rotation)
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    const firstConfirm = window.confirm(
                        "Are you sure you want to reset this week’s training goal?"
                    );
                    if (!firstConfirm) return;

                    const secondConfirm = window.confirm(
                        "Resetting will clear your current weekly goal and unlock the day selector.\n\n" +
                        "Use this if your schedule changed, not because today feels hard.\n\nContinue?"
                    );
                    if (!secondConfirm) return;

                    localStorage.removeItem(WEEKLY_GOAL_KEY);
                    localStorage.removeItem(WEEKLY_GOAL_LOCKED_KEY);

                    // 🔹 Reset progress + rotation when goal is reset
                    setWorkoutsCompletedThisWeek(0);
                    setRotationIndex(0);

                    pills.forEach(p => {
                        p.classList.remove("active");
                        p.disabled = false;
                    });

                    if (resetBtn) {
                        resetBtn.style.display = "none";
                    }
                    if (commitBtn) {
                        commitBtn.style.display = "none";
                    }

                    pendingDays = null;

                    renderWeeklyFocusLive();
                    repositionWeeklyGoalSection();
                    initTodaysSplit();
                    updateStreak();
                });
            }
            renderWeeklyFocusLive();
            repositionWeeklyGoalSection();
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
                        title: "100-Rep Finisher",
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


     function evaluateLastWeekForStreak() {
            const goal = getWeeklyGoal();
            const done = getWorkoutsCompletedThisWeek();

            // No goal set → we don't maintain a streak for that week
            if (!goal) {
                setWeeklyStreak(0);
                return;
            }

            const currentStreak = getWeeklyStreak();
            let tokens = getRestTokens();

            const shortfall = Math.max(goal - done, 0);

            // Already met or exceeded the goal → easy win, no tokens needed
            if (shortfall === 0) {
                setWeeklyStreak(currentStreak + 1);
                return;
            }

            // No tokens to help and didn’t meet goal → streak breaks
            if (tokens <= 0) {
                setWeeklyStreak(0);
                return;
            }

            // How many tokens would we need to cover the gap?
            const tokensNeeded = shortfall;
            const tokensWeCanUse = Math.min(tokensNeeded, tokens);
            const effectiveDone = done + tokensWeCanUse;

            if (effectiveDone >= goal) {
                // ✅ Tokens SAVE the streak → spend them
                tokens -= tokensWeCanUse;
                setRestTokens(tokens);
                setRestTokenProgress(0); // fresh bar for next token

                setWeeklyStreak(currentStreak + 1);

                showToast?.(
                    `Rest tokens saved your streak this week (${tokensWeCanUse} used).`
                );
            } else {
                // ❌ Even using all tokens wouldn't reach the goal → don't burn them
                setWeeklyStreak(0);
                // tokens stay as-is for another week
            }
        }


        function ensureWeeklyState() {
            const currentWeekId = getCurrentWeekId();
            const storedWeekId = localStorage.getItem(WEEK_ID_KEY);

            // First time using the app: initialize week ID and bail
            if (!storedWeekId) {
                localStorage.setItem(WEEK_ID_KEY, currentWeekId);
                return;
            }

            // Same week → nothing to do
            if (storedWeekId === currentWeekId) {
                return;
            }

            // 🚀 New week detected:
            // 1) Evaluate last week for streak
            evaluateLastWeekForStreak();

            // 2) Reset weekly counters for the new week
            setWorkoutsCompletedThisWeek(0);
            setRotationIndex(0);
            resetWeeklyWeightByDay();
            // After resetting + evaluating streak
            updateStreak();


            // 3) Store the new week ID
            localStorage.setItem(WEEK_ID_KEY, currentWeekId);
        }
   
function getTodaysVolumeForExercise(exerciseName) {
  const log = getExerciseLog();   // uses EXERCISE_LOG_KEY
  const todayKey = getTodayKey(); // you already have this helper
  const dayLog = log[todayKey];

  if (!dayLog || !dayLog[exerciseName]) return 0;

  return dayLog[exerciseName].reduce((sum, set) => {
    const w = Number(set.weight) || 0;
    const r = Number(set.reps) || 0;
    return sum + w * r;
  }, 0);
}



let hasRecordedCompletionForCurrentSplit = false;

// =====================================
// INIT TODAY'S SPLIT (NEW LOGIC)
// =====================================
function initTodaysSplit() {
  const weeklyGoal = getWeeklyGoal();
  const { programId, index, session } = getRecommendedSession(weeklyGoal);

  // Store metadata so we can advance rotation after workout
  currentSessionMeta = {
    programId,
    recommendedIndex: index,
    isRecommended: true,
    session
  };

  // Render the NEW session into the old UI
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
      const ok = window.confirm(
        "Skip today's workout?\n(It won't log any volume for today.)"
      );
      if (!ok) return;

      // Use your proper skip logic (marks skipped + advances rotation)
      handleSkipToday();
    };
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
}



function renderTodaySplitFromSession(session, weeklyGoal) {
  const splitNameEl = document.getElementById("split-name");
  const splitDaysEl = document.getElementById("split-days");
  const splitDescEl = document.getElementById("split-description");
  const exerciseListEl = document.getElementById("exercise-list");

  if (!splitNameEl || !exerciseListEl) {
    console.warn("Split DOM nodes missing");
    return;
  }

  hasRecordedCompletionForCurrentSplit = false;

  const daysLabel = weeklyGoal
    ? `${weeklyGoal} days / week`
    : "No weekly goal set";

  // No session (defensive fallback)
  if (!session) {
    splitNameEl.textContent = "Training Day";
    splitDaysEl.textContent = daysLabel;
    splitDescEl.textContent =
      "Simple training session. Get in, move some weight, and get out.";
    exerciseListEl.innerHTML = "";
    return;
  }

  // Header text
  splitNameEl.textContent = session.name || "Training Day";
  splitDaysEl.textContent = daysLabel;
  splitDescEl.textContent = session.description || "";

  // Clear placeholder + old items
  exerciseListEl.innerHTML = "";

  // Saved weights (localStorage)
  const weightsMap = getExerciseWeights();

  // Rest-day style sessions (no exercises)
  if (!session.exercises || !session.exercises.length) {
    const li = document.createElement("li");
    li.style.marginBottom = "0.5rem";
    li.textContent =
      "Rest or keep it light today. Walk, stretch, or move just enough to feel good.";
    exerciseListEl.appendChild(li);

    if (typeof checkSplitCompletion === "function") {
      checkSplitCompletion();
    }
    return;
  }

  session.exercises.forEach((exercise, index) => {
    const exerciseName = exercise.name;
    const checkboxId = `split-ex-${index}`;
    const hiddenWeightId = `split-ex-weight-${index}`;
    const metaLabelId = `split-ex-meta-label-${index}`;
    const metaValueId = `split-ex-meta-value-${index}`;
    const savedWeight = weightsMap[exerciseName] ?? "";

    const li = document.createElement("li");
    li.className = "exercise-row";

    li.innerHTML = `
      <!-- hidden checkbox we can tick from JS for completion logic -->
      <input
        type="checkbox"
        id="${checkboxId}"
        class="exercise-complete-checkbox"
      />

      <div class="exercise-main">
        <!-- clickable name → opens focus card -->
        <button
          type="button"
          class="exercise-label exercise-name-btn"
          data-exercise="${exerciseName}"
        >
          ${exerciseName}
          <span class="exercise-focus-tag">• FOCUS</span>
        </button>

        <!-- NEW meta row instead of Avg weight input -->
        <div class="exercise-meta-row">
          <span class="exercise-meta-label" id="${metaLabelId}">
            3 sets planned
          </span>
          <span class="exercise-meta-value" id="${metaValueId}">
            ${savedWeight ? `${Math.round(savedWeight)} lbs logged` : "0 lbs logged"}
          </span>
        </div>

        <!-- hidden helper input so your volume logic still works -->
        <input
          type="number"
          id="${hiddenWeightId}"
          class="exercise-weight-hidden"
          inputmode="decimal"
          min="0"
          step="5"
          value="${savedWeight}"
          data-exercise="${exerciseName}"
        />
      </div>
    `;

    // 🔗 Open focus card when the name is tapped
    const nameBtn = li.querySelector(".exercise-name-btn");
    if (nameBtn) {
      nameBtn.addEventListener("click", () => {
        window.openFocusCardForExercise(exerciseName, {
          modalities: exercise.modalities || [],
          description: exercise.description || "",
          suggestedReps: exercise.suggestedReps || 10
        });
      });
    }

    // ☑️ Checkbox → completion logic (we’ll tick this from JS later)
    const checkboxEl = li.querySelector(`#${checkboxId}`);
    if (checkboxEl && typeof checkSplitCompletion === "function") {
      checkboxEl.addEventListener("change", () => {
        checkSplitCompletion();
      });
    }

    // 💾 Save / clear avg weight when this hidden input changes
    const weightInputEl = li.querySelector(`#${hiddenWeightId}`);
    if (weightInputEl) {
      weightInputEl.addEventListener("change", () => {
        const val = parseFloat(weightInputEl.value || "0");
        const map = getExerciseWeights();

        if (!Number.isNaN(val) && val > 0) {
          map[exerciseName] = val;
        } else {
          delete map[exerciseName];
        }

        saveExerciseWeights(map);

        // keep the “lbs logged” text in sync
        const metaValueEl = document.getElementById(metaValueId);
        if (metaValueEl) {
          metaValueEl.textContent =
            !Number.isNaN(val) && val > 0
              ? `${Math.round(val)} lbs logged`
              : "0 lbs logged";
        }
      });
    }

    exerciseListEl.appendChild(li);
  });

  // Make sure the finisher lock state is up to date
  if (typeof checkSplitCompletion === "function") {
    checkSplitCompletion();
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

        // Full-screen rank-up overlay
        function showRankUpOverlay(tier) {
            const label = getEmblemLabelForTier(tier);

            const overlay = document.createElement("div");
            overlay.className = "rankup-overlay";

            overlay.innerHTML = `
        <div class="rankup-inner">
            <div class="rankup-emblem-preview ${tier}">
                <span class="rankup-icon">🔥</span>
            </div>
            <h2>New Emblem Unlocked</h2>
            <p>${label}</p>
            <button type="button" class="btn btn-primary rankup-close">Continue</button>
        </div>
    `;

            document.body.appendChild(overlay);

            const close = () => overlay.remove();

            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) close();
            });

            const btn = overlay.querySelector(".rankup-close");
            if (btn) {
                btn.addEventListener("click", close);
            }
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

                // If tier changed → rank up!
                if (prevTier !== newTier) {
                    setStoredEmblemTier(newTier);
                    triggerEmblemRankUp(newTier, visuals);
                }
            }




    function updateStreak() {
            const banner = document.getElementById("streak-banner");
            const weekLabelEl = document.getElementById("streak-week-label");
            const tokenLabelEl = document.getElementById("streak-token-label");
            const progressTextEl = document.getElementById("streak-text");
            const progressFillEl = document.getElementById("streak-progress-fill");
            const emblemLabelEl = document.getElementById("streak-emblem-label"); // 🔥 NEW


            if (!banner || !weekLabelEl || !tokenLabelEl || !progressTextEl || !progressFillEl) return;

            const goal = getWeeklyGoal();
            const done = getWorkoutsCompletedThisWeek();
            const streak = getWeeklyStreak?.() ?? 0;
            const tokens = getRestTokens();
            const tokenProgress = getRestTokenProgress();

            // ❌ No goal set → banner off, aura off
            if (!goal) {
                banner.classList.add("hidden");
                banner.classList.remove("streak-active");
                banner.style.setProperty("--emblem-strength", "0");
                return;
            }

            banner.classList.remove("hidden");

            // 1) Week label chip
            if (streak > 0) {
                weekLabelEl.textContent = `Week ${streak} streak`;
            } else {
                weekLabelEl.textContent = "No active streak yet";
            }

            // 2) Progress text
            const clampedDone = Math.min(done, goal);
            const progressPct = Math.round((clampedDone / goal) * 100);
            progressTextEl.textContent = `${done} / ${goal} sessions • ${progressPct}% of weekly goal`;

            // 3) Token label
            if (tokens > 0 || tokenProgress > 0) {
                const tokenPct = Math.round(tokenProgress * 100);
                const extra =
                    tokenProgress > 0 && tokenProgress < 1
                        ? ` • Next: ${tokenPct}%`
                        : "";
                tokenLabelEl.textContent = `Rest tokens: ${tokens}${extra}`;
            } else {
                tokenLabelEl.textContent = "Earn rest tokens with finishers";
            }
            // Not sure if this goes here lol
            if (emblemLabelEl) {
                const tier = getEmblemTierForStreak(streak);
                if (tier) {
                    const label = getEmblemLabelForTier(tier); 
                    emblemLabelEl.textContent = label;
                    emblemLabelEl.classList.remove("hidden");
                } else {
                    emblemLabelEl.textContent = "";
                    emblemLabelEl.classList.add("hidden");
                }
            }


            // 4) Progress bar fill
            progressFillEl.style.width = `${Math.min(progressPct, 100)}%`;

            handleEmblemTier(streak);


            // 5) Continuous aura intensity (COD skin ramp)
            if (streak > 0) {
                banner.classList.add("streak-active");

                let strength = 0.25; // base for 1 week
                if (streak >= 2 && streak <= 3) {
                    strength = 0.55;
                } else if (streak >= 4 && streak <= 7) {
                    strength = 0.85;
                } else if (streak > 7) {
                    strength = 1.15; // turned up
                }

                banner.style.setProperty("--emblem-strength", String(strength));
            } else {
                banner.classList.remove("streak-active");
                banner.style.setProperty("--emblem-strength", "0");
            }

            // 6) Emblem tier + rank-up overlay / lightning
            if (typeof handleEmblemTier === "function") {
                handleEmblemTier(streak);
            }
        }










        

    function onWorkoutCompleted() {
            if (hasRecordedCompletionForCurrentSplit) return;
            hasRecordedCompletionForCurrentSplit = true;

            // 1) Increment workouts done
            const current = getWorkoutsCompletedThisWeek();
            setWorkoutsCompletedThisWeek(current + 1);

            // 2) Advance rotation
            // 2) Advance recommended rotation (only if this was a recommended session)
            if (currentSessionMeta.isRecommended && currentSessionMeta.programId) {
                advanceRecommendedSession(currentSessionMeta.programId);
            }


            // 3) Rough volume estimate from avg weights
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
            updateStreak();
            updateWeeklyVolumeSummary?.();
            flashDayComplete();   // 🔥 let the card animation play first

            // 5) After a short delay, show weekly goal overlay + quote
            setTimeout(() => {
                celebrateWeeklyGoalHit();      // only shows if you *just* hit the goal
                showPostWorkoutQuoteOverlay(); // or showDailyQuoteModal() if you kept that one
            }, 900); // ≈ front half of your 1.6s animeBlast
        }







    function checkSplitCompletion() {
            const exerciseListEl = document.getElementById("exercise-list");
            const finisherCard = document.querySelector(".finisher-card");
            const doBtn = document.getElementById("finisher-do-btn");
            const skipBtn = document.getElementById("finisher-skip-btn");

            if (!exerciseListEl || !finisherCard || !doBtn || !skipBtn) return;

            const checkboxes = exerciseListEl.querySelectorAll('input[type="checkbox"]');
            const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);

            if (allChecked) {
                finisherCard.classList.remove("locked");
                doBtn.disabled = false;
                skipBtn.disabled = false;
                // --- Update finisher card text on unlock ---
                const titleEl = document.getElementById("finisher-title");
                const tagEl = document.getElementById("finisher-tag");
                const descEl = document.getElementById("finisher-description");
                const statusEl = document.getElementById("finisher-status");

                titleEl.textContent = "Choose Your Finisher";
                tagEl.textContent = "Unlocked";
                descEl.textContent = "Pick a category below to customize your finisher.";
                statusEl.textContent = "Select conditioning, bodyweight, pump, or recovery.";

                onWorkoutCompleted();
                
            } else {
                finisherCard.classList.add("locked");
                doBtn.disabled = true;
                skipBtn.disabled = true;
                // if they uncheck something, we don't undo the logged workout,
                // but we do keep the finisher locked until it's all done
            }
        }


    // If you have extra finisher-specific controls, they can live here:
    function initFinisherControls() {
            const finisherCard = document.getElementById("finisher-card");
            if (!finisherCard) return;

            const titleEl = document.getElementById("finisher-title");
            const tagEl = document.getElementById("finisher-tag");
            const descEl = document.getElementById("finisher-description");
            const statusEl = document.getElementById("finisher-status");
            const catButtons = document.querySelectorAll(".finisher-cat-btn");
            const diffButtons = document.querySelectorAll(".finisher-diff-btn");
            const diffContainer = document.getElementById("finisher-difficulties");
            const doBtn = document.getElementById("finisher-do-btn");
            const skipBtn = document.getElementById("finisher-skip-btn");

            if (!titleEl || !tagEl || !descEl || !statusEl || !diffContainer || !doBtn || !skipBtn) return;

            let selectedCategory = null;
            let selectedDifficulty = null;
            let currentFinisher = null;

            function clearDiffSelection() {
                diffButtons.forEach(btn => btn.classList.remove("btn-primary"));
            }

            function clearCatSelection() {
                catButtons.forEach(btn => btn.classList.remove("btn-primary"));
            }

            function selectFinisher(catKey, diffKey) {
                const cat = FINISHERS[catKey];
                if (!cat) return;

                const data = cat[diffKey];
                if (!data) return;

                currentFinisher = data;
                selectedCategory = catKey;
                selectedDifficulty = diffKey;

                titleEl.textContent = data.title;
                descEl.textContent = data.description;
                tagEl.textContent = `${catKey} • ${diffKey}`.toUpperCase();

                statusEl.textContent =
                    data.tokenReward > 0
                        ? `Complete this finisher to earn ${data.tokenReward >= 1 ? "a Rest Token" : `${data.tokenReward * 100}% of a Rest Token`}.`
                        : "Extra work for extra pride — no token reward on this one.";

                doBtn.disabled = false;
                skipBtn.disabled = false;
            }

            // Category buttons
            catButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (finisherCard.classList.contains("locked")) return;

                    const cat = btn.getAttribute("data-category");
                    if (!cat) return;

                    clearCatSelection();
                    btn.classList.add("btn-primary");

                    diffContainer.classList.remove("hidden");
                    clearDiffSelection();
                    selectedDifficulty = null;
                    currentFinisher = null;

                    titleEl.textContent = "Pick your finisher difficulty";
                    descEl.textContent = "Choose how hard you want to push today. Harder options can earn Rest Tokens.";
                    tagEl.textContent = cat.toUpperCase();
                    statusEl.textContent = "Select Easy, Standard, or Hard to lock in your finisher.";
                });
            });

            // Difficulty buttons
            diffButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (finisherCard.classList.contains("locked")) return;

                    const diff = btn.getAttribute("data-difficulty");
                    if (!diff) return;

                    const activeCatBtn = Array.from(catButtons).find(b => b.classList.contains("btn-primary"));
                    if (!activeCatBtn) return;

                    const cat = activeCatBtn.getAttribute("data-category");
                    clearDiffSelection();
                    btn.classList.add("btn-primary");

                    selectFinisher(cat, diff);
                });
            });

            // ✅ Mark Completed (with 1-per-day decision gate)
        doBtn.addEventListener("click", () => {
            if (!currentFinisher) return;
            if (finisherCard.classList.contains("locked")) return;

            const todayKey = getTodayDateKey();
            const lastFinisherDay = localStorage.getItem(LAST_FINISHER_DATE_KEY);

            // Already made a decision (completed or skipped) today
            if (lastFinisherDay === todayKey) {
                showToast("You already locked in today’s finisher decision. Extra work now is pure bonus. 💪");
                return;
            }

            const ok = window.confirm("Mark this finisher as completed for today?");
            if (!ok) return;

            const reward = currentFinisher.tokenReward || 0;
            if (reward > 0) {
                addRestTokenProgress(reward);
                updateStreak();
            }

            // 🔒 Lock today’s finisher decision
            localStorage.setItem(LAST_FINISHER_DATE_KEY, todayKey);

            statusEl.textContent = "Finisher completed. Nice work.";
            finisherCard.classList.add("completed-pulse");

            // Lock the card for the rest of the day
            finisherCard.classList.add("locked");
            doBtn.disabled = true;
            skipBtn.disabled = true;
            tagEl.textContent = "DONE";

            setTimeout(() => {
                finisherCard.classList.remove("completed-pulse");
            }, 800);

            celebrateFinisher?.();
        });


            // ❌ Skip for Today (with confirmation + lock)
        skipBtn.addEventListener("click", () => {
            if (finisherCard.classList.contains("locked")) return;

            const confirmSkip = window.confirm(
                "Skip today’s finisher and lock it in for the day?\n\n" +
                "You won’t be able to come back and complete it later."
            );

            // ❗ If they fat-fingered, this lets them back out
            if (!confirmSkip) {
                statusEl.textContent = "Finisher is still optional for today.";
                return;
            }

            const todayKey = getTodayDateKey();
            // Mark that today’s finisher decision is made (even though it was a skip)
            localStorage.setItem(LAST_FINISHER_DATE_KEY, todayKey);

            statusEl.textContent =
                "You skipped the finisher today. Main work still counts — come back stronger tomorrow.";
            tagEl.textContent = "SKIPPED";

            finisherCard.classList.add("locked");
            doBtn.disabled = true;
            skipBtn.disabled = true;
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

            // --- Start Today (top nav) ---
            const heroCta = document.getElementById("hero-cta");
            if (heroCta) {
                heroCta.addEventListener("click", () => {
                    console.log("hero-cta clicked");
                    localStorage.setItem(ONBOARDED_KEY, "true");
                    showScreen("daily");
                });
            } else {
                console.warn("hero-cta not found");
            }

            // --- Get Started (bottom bar) ---
            const bottomSplitBtn = document.getElementById("bottom-split-btn");
            if (bottomSplitBtn) {
                bottomSplitBtn.addEventListener("click", () => {
                    console.log("bottom-split-btn clicked");
                    localStorage.setItem(ONBOARDED_KEY, "true");
                    showScreen("daily");
                });
            } else {
                console.warn("bottom-split-btn not found");
            }

            // --- Setup button in nav ---
            const settingsBtn = document.getElementById("open-settings-btn");
            if (settingsBtn) {
                settingsBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    console.log("open-settings-btn clicked");
                    showScreen("setup");
                });
            } else {
                console.warn("open-settings-btn not found");
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
            function showPostWorkoutQuoteOverlay() {
                    const overlay = document.createElement("div");
                    overlay.className = "postworkout-overlay";

                    const quote = getRandomPostWorkoutQuote();

                    overlay.innerHTML = `
        <div class="postworkout-card">
            <h2>Workout complete 🔥</h2>
            <p class="postworkout-quote">${quote}</p>
            <p class="postworkout-hint">
                Feeling good? You can cash in a finisher for extra progress.
            </p>
            <div class="postworkout-actions">
                <button class="btn btn-primary" id="postworkout-do-finisher">
                    Do finisher
                </button>
                <button class="btn btn-outline" id="postworkout-close">
                    Close
                </button>
            </div>
        </div>
    `;

                    document.body.appendChild(overlay);

                    const closeBtn = document.getElementById("postworkout-close");
                    const finisherBtn = document.getElementById("postworkout-do-finisher");

                    if (closeBtn) {
                        closeBtn.addEventListener("click", () => {
                            overlay.remove(); // no scroll, no locking — they can change their mind later
                        });
                    }

                    if (finisherBtn) {
                        finisherBtn.addEventListener("click", () => {
                            overlay.remove();

                            scrollToFinisherSection();

                            const finisherSection =
                                document.getElementById("finisher-card") ||
                                document.getElementById("finisher-section");

                            if (finisherSection) {
                                finisherSection.classList.add("finisher-focus");
                                setTimeout(() => {
                                    finisherSection.classList.remove("finisher-focus");
                                }, 1000);
                            }
                        });
                    }


                    // Close by tapping outside the card
                    overlay.addEventListener("click", (e) => {
                        if (e.target === overlay) {
                            overlay.remove();
                        }
                    });
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
            <p>You showed up for all ${goal} planned sessions. That’s how streaks are built.</p>
            <button class="btn btn-primary" id="weekly-overlay-continue">Continue</button>
        </div>
    `;

        document.body.appendChild(overlay);

        // 🔹 Button closes the overlay
        const continueBtn = overlay.querySelector("#weekly-overlay-continue");
        if (continueBtn) {
            continueBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // don’t trigger the background click
                overlay.remove();
            });
        }

        // 🔹 Click outside the card also closes it
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
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

let currentFocusExercise = null;

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
}

// Weight input → update state
focusSetsListEl.addEventListener('input', (event) => {
  const input = event.target;
  if (!input.classList.contains('focus-weight-input')) return;

  const row = input.closest('.focus-set-row');
  if (!row || !currentFocusExercise) return;

  const index = Number(row.dataset.index);
  currentFocusExercise.sets[index].weight = input.value;
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

  renderFocusSets();
});

// Cancel / close
focusCancelBtn.addEventListener('click', closeFocusCard);
focusCloseBtn.addEventListener('click', closeFocusCard);

// Complete – for now just log + close; you can hook this into your volume logic
focusCompleteBtn.addEventListener('click', () => {
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
            : "0 lbs logged";
        }

  }

  // 4) Re-run your split completion logic (unlock finisher, streak, etc.)
  if (typeof checkSplitCompletion === 'function') {
    checkSplitCompletion();
  }

  // 5) Close the focus card
  closeFocusCard();
});





    // =============================
    // 9) INIT
    // =============================
    window.addEventListener("DOMContentLoaded", () => {
        ensureWeeklyState();
        //resetWeeklyWeightByDay();
        updateStreak();
        initScreens();
        initTodaysSplit();
        initWeeklyGoalControls();
        initFinisherControls();
        initServiceWorker();
        updateStreak();
        updateWeeklyVolumeSummary();
        updateWeeklyVolumeSummaryFromLog();

        initDebugStreakButton(); // 🔧 DEV ONLY – remove later

    });