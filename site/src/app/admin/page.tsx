"use server";

import { Dashboard } from "@/app/admin/components/Dashboard";
import { AdminPages } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const session = await getSession();

  if (session.isErr) {
    redirect("/");
  }

  return (
    <>
      <main className={" h-screen  overflow-hidden font-sans flex flex-col"}>
        {session.isOk && <Dashboard currentPage={AdminPages.Releases} />}
      </main>
    </>
  );
};

export default AdminPage;
