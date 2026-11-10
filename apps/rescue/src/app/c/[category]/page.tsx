import { CategoryTabs } from "@/components/CategoryTabs";
import { EmptyCategory } from "@/components/EmptyCategory";
import { PageIntro } from "@/components/PageIntro";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreWaking } from "@/components/StoreStates";
import { CATEGORIES } from "@/lib/constants";
import { getProducts } from "@/lib/products";

export default async function Category({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = CATEGORIES.find(([key]) => key === category)?.[1] ?? category;
  const products = await getProducts(category);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <PageIntro title={label} />
      <CategoryTabs current={category} />
      {!products.ok && <StoreWaking />}
      {products.ok && products.data.length === 0 && <EmptyCategory />}
      {products.ok && products.data.length > 0 && <ProductGrid products={products.data} />}
    </div>
  );
}
