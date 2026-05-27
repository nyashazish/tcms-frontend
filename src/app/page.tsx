import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession =
    cookieStore.has("tcms-access-token") || cookieStore.has("tcms-dev-auth");
  redirect(hasSession ? "/overview" : "/login");
}
