import test from 'node:test';
import assert from 'node:assert/strict';
import { extractInteractiveReply } from '../lib/helpers/interactiveReply.js';

test('extracts legacy button replies', () => {
  assert.equal(extractInteractiveReply({ buttonsResponseMessage: { selectedButtonId: '.ping' } }), '.ping');
});

test('extracts native-flow quick replies', () => {
  const message = {
    interactiveResponseMessage: {
      nativeFlowResponseMessage: {
        name: 'quick_reply',
        paramsJson: JSON.stringify({ id: '.alive', text: '🟢 Alive' })
      }
    }
  };
  assert.equal(extractInteractiveReply(message), '.alive');
});

test('extracts replies wrapped by WhatsApp envelopes', () => {
  const message = {
    ephemeralMessage: {
      message: {
        viewOnceMessageV2: {
          message: {
            interactiveResponseMessage: {
              nativeFlowResponseMessage: {
                paramsJson: JSON.stringify({ id: '.repo' })
              }
            }
          }
        }
      }
    }
  };
  assert.equal(extractInteractiveReply(message), '.repo');
});

test('maps a visible button label when an id is missing', () => {
  const message = {
    buttonsResponseMessage: { selectedDisplayText: '🏓 Ping' }
  };
  assert.equal(extractInteractiveReply(message, '!'), '!ping');
});
