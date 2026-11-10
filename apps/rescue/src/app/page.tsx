import { HomeDoors } from "@/components/HomeDoors";
import { BEFORE_CLIP_URL, BEFORE_URL, beforeShopAwake } from "@/lib/before-health";

// The two-door home: the before shop and the rescued shop, side by side.
export default async function Home() {
  return <HomeDoors beforeUrl={BEFORE_URL} beforeAwake={await beforeShopAwake()} clipUrl={BEFORE_CLIP_URL} />;
}
