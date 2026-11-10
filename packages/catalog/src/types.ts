export type Category = "tents" | "packs" | "footwear" | "sleep" | "cooking" | "lights" | "clothing";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  priceCents: number;
  description: string;
  image: {
    file: string;
    width: number;
    height: number;
    credit: { name: string; url: string };
  };
};
