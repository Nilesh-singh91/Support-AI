import EmbedClient from "@/components/EmbedClient";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function EmbedPage() {
  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  return <EmbedClient ownerId={user.id} />;
}