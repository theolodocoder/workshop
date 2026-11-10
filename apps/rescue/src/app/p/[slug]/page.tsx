import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { StoreWaking } from "@/components/StoreStates";
import { getProduct } from "@/lib/products";

// FIX 7: rendered on the server. FIX 4: store down shows Retry, unknown slug shows not-found.
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product.ok) return <StoreWaking />;
  if (!product.data) notFound();
  return <ProductDetail p={product.data} />;
}
