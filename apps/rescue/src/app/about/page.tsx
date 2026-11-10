import type { Metadata } from "next";
import { products } from "@workshop/catalog";
import { AboutContent } from "@/components/AboutContent";

export const metadata: Metadata = { title: "About this demo · Northfold Outfitters" };

export default function About() {
  const credits = products.map((p) => ({ product: p.name, photographer: p.image.credit.name, url: p.image.credit.url }));
  return <AboutContent credits={credits} />;
}
