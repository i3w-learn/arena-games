import type { MCQ } from '../types';

const questions: MCQ[] = [
  {
    id: 'thermo-01',
    subject: 'Physics - Thermodynamics',
    question: 'In an isothermal expansion of an ideal gas, which of the following is true?',
    options: [
      'Internal energy increases',
      'Heat is removed from the system',
      'Work done by the gas is equal to heat absorbed',
      'Pressure remains constant',
    ],
    correctIndex: 2,
    explanation:
      'Temperature is constant, so change in internal energy is zero. By First Law (dQ = dU + dW), dQ = dW.',
  },
  {
    id: 'thermo-02',
    subject: 'Physics - Thermodynamics',
    question: 'A Carnot engine operates between 500 K and 300 K. What is its maximum theoretical efficiency?',
    options: ['20%', '40%', '60%', '80%'],
    correctIndex: 1,
    explanation: 'Efficiency = 1 - (T_cold / T_hot) = 1 - (300/500) = 0.4 = 40%.',
  },
  {
    id: 'thermo-03',
    subject: 'Physics - Thermodynamics',
    question:
      'During an adiabatic process, the pressure of a gas is found to be proportional to the cube of its temperature. The ratio Cp/Cv for the gas is:',
    options: ['1.5', '1.67', '1.33', '1.4'],
    correctIndex: 0,
    explanation: 'P \u221d T\u00b3. For adiabatic, \u03b3/(\u03b3\u22121) = 3, solving gives \u03b3 = 1.5.',
  },
  {
    id: 'thermo-04',
    subject: 'Physics - Thermodynamics',
    question: 'Which law of thermodynamics establishes the concept of temperature?',
    options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'],
    correctIndex: 0,
    explanation:
      'The Zeroth Law states that if two systems are in thermal equilibrium with a third, they are in equilibrium with each other, defining temperature.',
  },
  {
    id: 'thermo-05',
    subject: 'Physics - Thermodynamics',
    question: 'For a cyclic process, the change in internal energy of the system is:',
    options: [
      'Equal to the heat absorbed',
      'Zero',
      'Equal to the work done',
      'Always positive',
    ],
    correctIndex: 1,
    explanation:
      'Internal energy is a state function. Since the system returns to its initial state, \u0394U = 0.',
  },
];

/** Returns a random subset of `count` questions from the bank. */
export function getQuestions(count: number): MCQ[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
