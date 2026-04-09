import { getSession } from "@/lib/auth/getSession";
import { UserProvider } from "@/components/auth/UserProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // Redirect to login if no session (proxy handles this in production;
  // this is a fallback for direct server-side rendering).
  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <main className="main-scroll-area">
            <div className="content-wrapper">{children}</div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
