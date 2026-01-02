"use server";

import { Dashboard } from "@/app/admin/components/Dashboard";
import { verifySession } from "@/lib/dal";
import { AdminPages } from "@/lib/definitions";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/");
  }

  return (
    <>
      <main className={" h-screen  overflow-hidden font-sans flex flex-col"}>
        {session.isAuth && <Dashboard currentPage={AdminPages.Releases} />}
      </main>
    </>
  );
};

export default AdminPage;
