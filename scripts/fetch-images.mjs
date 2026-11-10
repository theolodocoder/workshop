// Downloads the Northfold product photos listed in assets/northfold/manifest.json from Unsplash
// (1600px wide) and records each photo's real width and height.
// Run only after Promise approved the photo list: `node scripts/fetch-images.mjs`
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../assets/northfold/", import.meta.url));
const manifestPath = dir + "manifest.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

function jpegSize(buf) {
  // Walk JPEG markers until a start-of-frame segment, which holds height then width.
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error("not a JPEG");
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error("no JPEG size found");
}

for (const entry of manifest) {
  const url = `https://unsplash.com/photos/${entry.photoId}/download?force=true&w=1600&fm=jpg`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${entry.photoId}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { width, height } = jpegSize(buf);
  await writeFile(dir + entry.file, buf);
  Object.assign(entry, { width, height });
  console.log(`${entry.file} ${width}x${height} ${(buf.length / 1024).toFixed(0)} KB`);
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
