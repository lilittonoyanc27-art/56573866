export type GameMode = 'rosco' | 'adivinanzas' | 'matematicas';

export interface RoscoItem {
  id: string;
  letter: string;
  type: 'empieza' | 'contiene';
  questionEs: string;
  questionArm: string;
  answerEs: string;
  answerArm: string;
  acceptableAnswers: string[];
  hintEs?: string;
  hintArm?: string;
  explanationEs: string;
  explanationArm: string;
}

export type RoscoStatus = 'unanswered' | 'passed' | 'correct' | 'incorrect';

export interface AdivinanzaOption {
  key: string;
  textEs: string;
  textArm: string;
}

export interface AdivinanzaItem {
  id: number;
  part: number;
  partTitleEs: string;
  partTitleArm: string;
  type: 'riddle' | 'multiple_choice' | 'trick' | 'term' | 'quick';
  questionEs: string;
  questionArm: string;
  options?: AdivinanzaOption[];
  correctOptionKey?: string;
  answerEs: string;
  answerArm: string;
  acceptableKeywords: string[];
  explanationEs?: string;
  explanationArm?: string;
}

export interface MathProblemItem {
  id: number;
  part: number;
  partTitleEs: string;
  partTitleArm: string;
  titleEs: string;
  titleArm: string;
  problemEs: string;
  problemArm: string;
  correctValue: number | string;
  tolerance?: number;
  unitEs: string;
  unitArm: string;
  solutionStepsEs: string[];
  solutionStepsArm: string[];
  finalAnswerEs: string;
  finalAnswerArm: string;
}

export interface SpeakingQuestion {
  id: number;
  questionEs: string;
  questionArm: string;
  suggestedAnswerEs?: string;
  suggestedAnswerArm?: string;
}
