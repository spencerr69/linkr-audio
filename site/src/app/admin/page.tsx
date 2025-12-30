"use server";

import { Dashboard } from "@/app/admin/components/layout/Dashboard";
import { LoginForm } from "@/app/ui/LoginForm";
import { verifySession } from "@/lib/dal";
import { AdminPages } from "@/lib/definitions";

const AdminPage = async () => {
  const session = await verifySession();

  return (
    <>
      <main
        className={
          "bg-gray-50 h-screen  overflow-hidden font-sans flex flex-col"
        }
      >
        {!session.isAuth ? (
          <LoginForm />
        ) : (
          <Dashboard currentPage={AdminPages.Releases} />
        )}
      </main>
    </>
  );
};

export default AdminPage;
