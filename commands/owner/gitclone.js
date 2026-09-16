// Downloads a public GitHub repo as a .zip and sends it as a document.
// Doesn't shell out to `git` (avoids needing the binary on the host and
// avoids running an arbitrary command from chat input) — just fetches
// GitHub's own zip archive endpoint.
function parseRepo(input) {
  let s = (input || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  const parts = s.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return { owner: parts[0], repo: parts[1] };
}

export default {
  name: 'gitclone',
  alias: ['clone'],
  ownerOnly: true,
  description: 'Download a public GitHub repo as a zip and send it here (owner only). Usage: .gitclone <owner/repo or full URL> [branch]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const parsed = parseRepo(args[0]);
    if (!parsed) return sock.sendMessage(chatId, { text: '❌ Usage: .gitclone <owner/repo or GitHub URL> [branch]' }, { quoted: msg });
    const branchArg = args[1];
    const candidates = branchArg ? [branchArg] : ['main', 'master'];

    await sock.sendMessage(chatId, { text: `📦 Fetching *${parsed.owner}/${parsed.repo}*...` }, { quoted: msg });
    for (const branch of candidates) {
      try {
        const url = `https://github.com/${parsed.owner}/${parsed.repo}/archive/refs/heads/${branch}.zip`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length < 500) continue; // GitHub returns a tiny error page, not a real zip
        await sock.sendMessage(chatId, {
          document: buffer,
          fileName: `${parsed.repo}-${branch}.zip`,
          mimetype: 'application/zip',
          caption: `✅ ${parsed.owner}/${parsed.repo} @ ${branch}`
        }, { quoted: msg });
        return;
      } catch {}
    }
    await sock.sendMessage(chatId, { text: `❌ Couldn't fetch that repo/branch. Check the name is correct and the repo is public.` }, { quoted: msg });
  }
};
