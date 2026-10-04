// Downloads a URL straight into a Buffer. Used by the converter commands
// so they can accept a plain media URL the same way they always did, now
// that conversion itself happens locally via ffmpeg instead of a
// third-party API.
export async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download that URL (${res.status})`);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
