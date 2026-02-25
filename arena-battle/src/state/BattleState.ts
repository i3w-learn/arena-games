import type { GameState, CharacterState, PlayerAnswer, BattlePhase, MCQ } from '../types';

const INITIAL_HP = 100;

function createCharacter(name: string, isPlayer: boolean): CharacterState {
  return { name, hp: INITIAL_HP, maxHp: INITIAL_HP, isPlayer };
}

export function createInitialState(questions: MCQ[]): GameState {
  return {
    phase: 'BATTLE_INTRO',
    player: createCharacter('Player', true),
    opponent: createCharacter('Opponent', false),
    currentQuestionIndex: 0,
    questions,
    answers: [],
    score: 0,
    isGameOver: false,
  };
}

export function getCurrentQuestion(state: GameState): MCQ | null {
  if (state.currentQuestionIndex >= state.questions.length) return null;
  return state.questions[state.currentQuestionIndex];
}

export function recordAnswer(state: GameState, answer: PlayerAnswer): void {
  state.answers.push(answer);
  if (answer.correct) state.score++;
}

export function applyDamage(character: CharacterState, damage: number): void {
  character.hp = Math.max(0, character.hp - damage);
}

export function setPhase(state: GameState, phase: BattlePhase): void {
  state.phase = phase;
}

export const DAMAGE_PER_HIT = 20;
export const QUESTIONS_PER_BATTLE = 5;
