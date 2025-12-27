"use server";

import { LoginForm } from "@/app/ui/login-form";
import { verifySession } from "@/lib/dal";
import { Dashboard } from "@/app/admin/components/dashboard";

const AdminPage = async () => {
  const session = await verifySession();

  return (
    <>
      <main
        className={
          "bg-gray-50 h-screen  overflow-hidden font-sans flex flex-col"
        }
      >
        {!session.isAuth ? <LoginForm /> : <Dashboard />}
      </main>
    </>
  );
};

export default AdminPage;
