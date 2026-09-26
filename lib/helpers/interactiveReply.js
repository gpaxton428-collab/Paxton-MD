/**
 * Extract a command/action from WhatsApp interactive replies.
 * Handles legacy buttons, native-flow replies, and the wrappers WhatsApp
 * uses around replies on different clients.
 */
export function unwrapMessageContent(message) {
  let current = message || null;
  const wrappers = [
    'ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2',
    'viewOnceMessageV2Extension', 'documentWithCaptionMessage', 'editedMessage'
  ];
  for (let i = 0; i < 10 && current; i++) {
    const nextKey = wrappers.find((key) => current?.[key]?.message);
    if (!nextKey) break;
    current = current[nextKey].message;
  }
  return current || message || {};
}

function parseParams(value) {
  if (!value) return null;
  let current = value;
  for (let i = 0; i < 3; i++) {
    if (typeof current !== 'string') return current;
    try { current = JSON.parse(current); } catch { return null; }
  }
  return current && typeof current === 'object' ? current : null;
}

function commandFromId(id, prefix) {
  if (!id) return '';
  const value = String(id).trim();
  if (!value) return '';
  if (/^[.$!/]/.test(value)) return value;
  // Button ids in third-party helpers sometimes lose the prefix during
  // protobuf conversion. Restore it for command dispatch.
  if (/^[a-z0-9_-]+(?:\s+.*)?$/i.test(value)) return `${prefix}${value}`;
  return value;
}

function labelToCommand(label, prefix) {
  const lower = String(label || '').trim().toLowerCase();
  if (!lower) return '';
  const known = [
    ['ping', `${prefix}ping`], ['alive', `${prefix}alive`], ['repo', `${prefix}repo`],
    ['main menu', `${prefix}menu`], ['menu', `${prefix}menu`],
    ['enable', `${prefix}on`], ['disable', `${prefix}off`],
    ['pending', `${prefix}pending`], ['refresh', `${prefix}pending`],
    ['accept all', `${prefix}acceptall`], ['reject all', `${prefix}rejectall`]
  ];
  const found = known.find(([needle]) => lower.includes(needle));
  return found ? found[1] : '';
}

function inspect(node, prefix, seen = new Set(), depth = 0) {
  if (!node || typeof node !== 'object' || depth > 12 || seen.has(node)) return '';
  seen.add(node);

  const direct = node?.buttonsResponseMessage?.selectedButtonId
    || node?.templateButtonReplyMessage?.selectedId
    || node?.buttonReplyMessage?.selectedButtonId
    || node?.listResponseMessage?.singleSelectReply?.selectedRowId;
  if (direct) return commandFromId(direct, prefix);

  const native = node?.interactiveResponseMessage?.nativeFlowResponseMessage
    || node?.nativeFlowResponseMessage;
  if (native) {
    const parsed = parseParams(native.paramsJson ?? native.paramsJsonString ?? native.messageParamsJson);
    if (parsed) {
      const id = parsed.id ?? parsed.selected_id ?? parsed.button_id ?? parsed.row_id ?? parsed.selectedRowId;
      const command = commandFromId(id, prefix);
      if (command) return command;
      const byLabel = labelToCommand(parsed.text ?? parsed.display_text ?? parsed.selected_text, prefix);
      if (byLabel) return byLabel;
    }
  }

  const label = node?.interactiveResponseMessage?.body?.text
    || node?.buttonsResponseMessage?.selectedDisplayText
    || node?.templateButtonReplyMessage?.selectedDisplayText
    || node?.listResponseMessage?.title;
  const byLabel = labelToCommand(label, prefix);
  if (byLabel) return byLabel;

  for (const [key, value] of Object.entries(node)) {
    if (key === 'messageContextInfo' || key === 'contextInfo' || key === 'senderKeyDistributionMessage') continue;
    const result = inspect(value, prefix, seen, depth + 1);
    if (result) return result;
  }
  return '';
}

export function extractInteractiveReply(message, prefix = '.') {
  return inspect(message, prefix);
}
