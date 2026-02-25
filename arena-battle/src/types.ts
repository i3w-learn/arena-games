// ─── MCQ ─────────────────────────────────────────────────────────
export interface MCQ {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

// ─── Character State (pure data) ─────────────────────────────────
export interface CharacterState {
  name: string;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
}

// ─── Battle Phase ────────────────────────────────────────────────
export type BattlePhase =
  | 'BATTLE_INTRO'
  | 'QUESTION_DISPLAY'
  | 'ANSWER_RESOLVE'
  | 'VICTORY'
  | 'DEFEAT';

// ─── Player Answer Record ────────────────────────────────────────
export interface PlayerAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

// ─── Game State (single source of truth) ─────────────────────────
export interface GameState {
  phase: BattlePhase;
  player: CharacterState;
  opponent: CharacterState;
  currentQuestionIndex: number;
  questions: MCQ[];
  answers: PlayerAnswer[];
  score: number;
  isGameOver: boolean;
}

// ─── Sound Parameters (jsfxr arrays) ─────────────────────────────
export interface SoundParams {
  correct: number[];
  wrong: number[];
  attackHit: number[];
  victory: number[];
  defeat: number[];
  buttonTap: number[];
  battleStart: number[];
  timerTick: number[];
  heartBreak: number[];
}

// ─── Visual Identity ─────────────────────────────────────────────
export interface VisualIdentity {
  palette: {
    primary: string;
    secondary: string;
    light: string;
    accent1: string;
    accent2: string;
  };
  characters: {
    height: number;
    lineWeight: number;
    style: string;
  };
  ui: {
    minTouchTarget: number;
    fontFamily: string;
    healthBarWidth: number;
    healthBarHeight: number;
  };
  timing: {
    introDelay: number;
    explanationDisplay: number;
    interQuestionDelay: number;
  };
}
