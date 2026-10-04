// /fun/*  — riddles, pickup lines, quotes, flirt, jokes, would-you-rather,
// roasts, fun facts, dares, truth, trivia.
import { getJson } from './wolvarex.js';
import { firstString, firstValue, pickResult, summarizeShape } from './normalize.js';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const FUN_ENDPOINTS = {
  riddle: '/fun/riddles', pickupline: '/fun/pickuplines', quote: '/fun/quotes', flirt: '/fun/flirt',
  joke: '/fun/jokes', wouldyourather: '/fun/wouldyourather', roast: '/fun/roasts', fact: '/fun/funfacts',
  dare: '/fun/dares', truth: '/fun/truth', trivia: '/fun/trivia'
};

const MAIN_KEYS = ['question', 'riddle', 'joke', 'setup', 'quote', 'text', 'content', 'line', 'pickup', 'pickupline', 'pickup_line', 'flirt', 'fact', 'truth', 'dare', 'roast', 'wouldyourather', 'would_you_rather', 'prompt', 'message', 'result'];
const ANSWER_KEYS = ['answer', 'correct_answer', 'correctAnswer', 'solution', 'punchline', 'delivery'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function normalizeFun(data) {
  let node = pickResult(data);
  if (Array.isArray(node)) node = node.length ? pick(node) : null;
  if (typeof node === 'string') return node.trim() ? { text: node.trim() } : null;
  if (!node || typeof node !== 'object') return null;

  let text = firstString(node, MAIN_KEYS);
  const answer = firstString(node, ANSWER_KEYS);
  // "A or B" style objects
  const a = firstString(node, ['optionA', 'option_a', 'option1', 'a']);
  const b = firstString(node, ['optionB', 'option_b', 'option2', 'b']);
  if (!text && a && b) text = 'Would you rather…';
  if (!text) return null;

  let options;
  const rawOptions = firstValue(node, ['options', 'choices']);
  if (Array.isArray(rawOptions)) options = rawOptions.map((o) => String(o)).slice(0, 6);
  else if (a && b) options = [a, b];

  return { text, answer: answer && answer !== text ? answer : undefined, options, author: firstString(node, ['author', 'by', 'source']), category: firstString(node, ['category', 'type']) };
}

export async function fetchFun(kind) {
  const path = FUN_ENDPOINTS[kind];
  if (!path) throw new ApiError(`Unknown fun kind ${kind}`, { kind: 'internal' });
  const data = await getJson(path, {}, { timeoutMs: 15000 });
  const item = normalizeFun(data);
  if (!item) { logger.warn('fun', `${kind}: unrecognised response`, summarizeShape(data)); throw new ApiError('Unrecognised response', { kind: 'bad_response' }); }
  return item;
}
