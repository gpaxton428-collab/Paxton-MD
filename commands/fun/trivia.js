import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'trivia',
  description: 'Get a random trivia question (with the answer included). Usage: .trivia',
  kind: 'trivia', icon: '❓', title: 'Trivia',
  fallback: [
    { q: 'What is the capital of Australia?', a: 'Canberra' },
    { q: 'How many continents are there?', a: '7' },
    { q: 'What planet is known as the Red Planet?', a: 'Mars' },
    { q: 'What is the largest ocean on Earth?', a: 'Pacific Ocean' },
    { q: 'Who wrote Romeo and Juliet?', a: 'William Shakespeare' }
  ]
});
