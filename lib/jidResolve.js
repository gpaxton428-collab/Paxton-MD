// Resolves any JID — including @lid (linked-device) identities, which
// don't carry a real phone number in their string form — down to a real,
// displayable phone-number JID wherever possible. Falls back to
// returning the input unchanged only if every resolution strategy fails.
//
// This was previously only used for the dev-react feature; anywhere else
// that displayed a number via `jid.split('@')[0]` directly would show the
// raw internal @lid identifier instead of a real number whenever the
// sender happened to be using a linked-device identity.
export async function resolveJidForLog(sock, inputJid, groupChatJid = null) {
    if (!inputJid) return inputJid;
    if (inputJid.endsWith('@g.us') || inputJid.endsWith('@newsletter')) return inputJid;
    if (inputJid.endsWith('@lid')) {
        if (groupChatJid && groupChatJid.endsWith('@g.us')) {
            try {
                const meta = await sock.groupMetadata(groupChatJid);
                const p = meta?.participants?.find(x => x.id === inputJid);
                if (p?.phoneNumber) {
                    const num = String(p.phoneNumber).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            } catch {}
        }
        try {
            if (sock.signalRepository?.lidMapping?.getPNForLID) {
                const pn = await sock.signalRepository.lidMapping.getPNForLID(inputJid);
                if (pn) {
                    const num = String(pn).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            }
        } catch {}
        const lidNum = inputJid.split('@')[0];
        const cached = globalThis.lidPhoneCache?.get(lidNum);
        if (cached) return `${cached}@s.whatsapp.net`;
        try {
            if (sock.store?.contacts) {
                for (const [contactJid, contact] of Object.entries(sock.store.contacts)) {
                    if (contact.lid === inputJid || contact.lidJid === inputJid) {
                        const num = contactJid.split('@')[0].replace(/\D/g, '');
                        if (num.length >= 7) return `${num}@s.whatsapp.net`;
                    }
                }
            }
        } catch {}
        return inputJid;
    }
    const number = inputJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    return `${number}@s.whatsapp.net`;
}

// Convenience helper for the common case: just want the displayable
// digits (no @s.whatsapp.net suffix) for use in "@1234567" mention text.
export async function resolveDisplayNumber(sock, inputJid, groupChatJid = null) {
    const resolved = await resolveJidForLog(sock, inputJid, groupChatJid);
    return resolved.split('@')[0];
}
