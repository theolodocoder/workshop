import { CategoryTabs } from "@/components/CategoryTabs";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreWaking } from "@/components/StoreStates";
import { getProducts } from "@/lib/products";

// FIX 7: a server component. Products are fetched on the server and arrive with the HTML.
export default async function Home() {
  const products = await getProducts();
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <PageIntro title="Gear for long days outside" lead="Tents, packs, boots and camp kit. 40 products, all made up." />
      <CategoryTabs current="all" />
      {products.ok ? <ProductGrid products={products.data} /> : <StoreWaking />}
    </div>
  );
}
