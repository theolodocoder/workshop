import manifest from "../../../assets/northfold/manifest.json" with { type: "json" };
import rows from "./products.data.json" with { type: "json" };
import type { Category, Product } from "./types.ts";

type ManifestEntry = (typeof manifest)[number];
const byFile = new Map<string, ManifestEntry>(manifest.map((m) => [m.file, m]));

export const products: readonly Product[] = rows.map((row) => {
  const photo = byFile.get(row.file);
  if (!photo) throw new Error(`No photo in manifest for ${row.file}`);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Category,
    priceCents: row.priceCents,
    description: row.description,
    image: {
      file: row.file,
      width: photo.width ?? 0,
      height: photo.height ?? 0,
      credit: photo.credit,
    },
  };
});

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
