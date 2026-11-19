// store.js — progress persistence for Leonida Ledger.
//
// Progress lives in localStorage under one key. The ?demo=1 mode is the one
// exception: when the URL asks for the demo and nothing has ever been saved,
// the tracker runs on an in-memory seed instead, and save() becomes a no-op,
// so a demo can never overwrite a real checklist — present or future.

const STORAGE_KEY = 'leonida-ledger-progress-v1';

// A plausible mid-game checklist for screenshots and first looks: the opening
// missions done, a few free-roam trophies picked up along the way.
const DEMO_EARNED = [2, 3, 4, 8, 9, 16, 20, 21, 35, 44, 46, 51, 55];

function blankState() {
  return { earned: {}, revealed: {}, spoilers: true };
}

function seedDemoState() {
  const state = blankState();
  for (const id of DEMO_EARNED) state.earned[id] = 'demo';
  return state;
}

export function isDemoRequested(location) {
  return new URLSearchParams(location.search).get('demo') === '1';
}

export class Store {
  constructor(location) {
    this.demo = false;
    this.state = blankState();
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.state = {
            earned: parsed.earned || {},
            revealed: parsed.revealed || {},
            spoilers: parsed.spoilers !== false,
          };
        }
      } catch {
        // A corrupt save is treated as no save rather than a broken app.
      }
    } else if (isDemoRequested(location)) {
      this.demo = true;
      this.state = seedDemoState();
    }
  }

  save() {
    if (this.demo) return; // the demo seed is memory-only, by design
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  isEarned(id) {
    return Object.prototype.hasOwnProperty.call(this.state.earned, id);
  }

  setEarned(id, on) {
    if (on) this.state.earned[id] = new Date().toISOString();
    else delete this.state.earned[id];
    this.save();
  }

  earnedCount() {
    return Object.keys(this.state.earned).length;
  }

  isRevealed(id) {
    return Boolean(this.state.revealed[id]);
  }

  reveal(id) {
    this.state.revealed[id] = true;
    this.save();
  }

  get spoilers() {
    return this.state.spoilers;
  }

  setSpoilers(on) {
    this.state.spoilers = Boolean(on);
    this.save();
  }

  exportText() {
    return JSON.stringify(
      { app: 'leonida-ledger', version: 1, exportedAt: new Date().toISOString(), state: this.state },
      null,
      2,
    );
  }

  importText(text) {
    const parsed = JSON.parse(text);
    const state = parsed && parsed.state ? parsed.state : parsed;
    if (!state || typeof state !== 'object' || typeof state.earned !== 'object') {
      throw new Error('That file does not look like a Leonida Ledger export.');
    }
    this.state = {
      earned: state.earned || {},
      revealed: state.revealed || {},
      spoilers: state.spoilers !== false,
    };
    this.demo = false;
    this.save();
  }
}
