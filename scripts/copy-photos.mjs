// Copies the Northfold photos into an app's public folder as real files at build time.
// (A symlinked public folder may not survive a Vercel deploy; real files always do.)
// Usage, from an app folder: node ../../scripts/copy-photos.mjs public/products
import { cp, lstat, mkdir, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("../assets/northfold/", import.meta.url));

/** @returns the number of photos copied */
export async function copyPhotos(src = SOURCE, dest) {
  const existing = await lstat(dest).catch(() => null);
  if (existing?.isSymbolicLink()) await rm(dest); // removes the link only, never what it points at
  await mkdir(dest, { recursive: true });
  const photos = (await readdir(src)).filter((f) => f.endsWith(".jpg"));
  await Promise.all(photos.map((f) => cp(join(src, f), join(dest, f))));
  return photos.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dest = resolve(process.argv[2] ?? "public/products");
  console.log(`copied ${await copyPhotos(SOURCE, dest)} photos to ${dest}`);
}
