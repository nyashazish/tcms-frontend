import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";

export default async function Home() {
  const user = await getSession();
  redirect(user ? "/overview" : "/login");
}
