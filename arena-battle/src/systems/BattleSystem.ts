import type { GameState } from '../types';
import {
  createInitialState,
  getCurrentQuestion,
  recordAnswer,
  applyDamage,
  setPhase,
  DAMAGE_PER_HIT,
  QUESTIONS_PER_BATTLE,
} from '../state/BattleState';
import { getQuestions } from '../state/QuestionBank';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';

export class BattleSystem {
  private state: GameState;

  constructor() {
    this.state = createInitialState(getQuestions(QUESTIONS_PER_BATTLE));
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  startBattle(): void {
    this.state = createInitialState(getQuestions(QUESTIONS_PER_BATTLE));
    setPhase(this.state, 'BATTLE_INTRO');
    eventBus.emit(GameEventType.BATTLE_START);
  }

  showNextQuestion(): void {
    const question = getCurrentQuestion(this.state);
    if (!question) return;
    setPhase(this.state, 'QUESTION_DISPLAY');
    eventBus.emit(GameEventType.QUESTION_SHOW, {
      question,
      questionIndex: this.state.currentQuestionIndex,
    });
  }

  submitAnswer(selectedIndex: number): void {
    const question = getCurrentQuestion(this.state);
    if (!question) return;

    setPhase(this.state, 'ANSWER_RESOLVE');
    const correct = selectedIndex === question.correctIndex;

    recordAnswer(this.state, {
      questionId: question.id,
      selectedIndex,
      correct,
    });

    if (correct) {
      // Player attacks opponent
      applyDamage(this.state.opponent, DAMAGE_PER_HIT);
      eventBus.emit(GameEventType.ANSWER_CORRECT, { questionId: question.id, selectedIndex });
      eventBus.emit(GameEventType.ATTACK_PLAYER, {
        character: 'opponent',
        newHp: this.state.opponent.hp,
        maxHp: this.state.opponent.maxHp,
      });
    } else {
      // Opponent attacks player
      applyDamage(this.state.player, DAMAGE_PER_HIT);
      eventBus.emit(GameEventType.ANSWER_WRONG, {
        questionId: question.id,
        selectedIndex,
        correctIndex: question.correctIndex,
      });
      eventBus.emit(GameEventType.ATTACK_OPPONENT, {
        character: 'player',
        newHp: this.state.player.hp,
        maxHp: this.state.player.maxHp,
      });
      eventBus.emit(GameEventType.SHOW_EXPLANATION, {
        explanation: question.explanation,
        correctIndex: question.correctIndex,
      });
    }

    this.state.currentQuestionIndex++;
    // Game-over is checked AFTER animations via checkGameOver()
  }

  /** Called by BattleScene after attack/explanation animations finish. */
  checkGameOver(): boolean {
    if (this.state.isGameOver) return true;

    if (this.state.opponent.hp <= 0) {
      this.endBattle('VICTORY');
      return true;
    } else if (this.state.player.hp <= 0) {
      this.endBattle('DEFEAT');
      return true;
    } else if (this.state.currentQuestionIndex >= this.state.questions.length) {
      // All questions exhausted — compare HP
      this.endBattle(this.state.player.hp > this.state.opponent.hp ? 'VICTORY' : 'DEFEAT');
      return true;
    }
    return false;
  }

  private endBattle(outcome: 'VICTORY' | 'DEFEAT'): void {
    this.state.isGameOver = true;
    setPhase(this.state, outcome);

    const payload = {
      score: this.state.score,
      totalQuestions: this.state.questions.length,
      missed: this.state.answers.filter((a) => !a.correct),
    };

    if (outcome === 'VICTORY') {
      eventBus.emit(GameEventType.VICTORY, payload);
    } else {
      eventBus.emit(GameEventType.DEFEAT, payload);
    }
  }

  restart(): void {
    this.startBattle();
  }
}
