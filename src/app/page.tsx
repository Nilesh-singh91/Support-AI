import HomeClient from "@/components/HomeClient";
import { getSession } from "@/lib/getSession";

export default async function Home() {
  const user = await getSession();

  return (
    <HomeClient email={user?.email || ""} />
  );
}