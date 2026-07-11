import DashboardClient from "@/components/DashboardClient";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user?.id) {
    redirect("/");
  }

  return <DashboardClient ownerId={user.id} />;
}