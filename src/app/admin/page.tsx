import { LoginForm } from "@/app/ui/login-form";
import { verifySession } from "@/lib/dal";
import { Dashboard } from "@/app/admin/components/dashboard";

const AdminPage = async () => {
  const session = await verifySession();

  return (
    <>
      <div className={"text-white bg-gray-950 h-screen w-screen"}>
        {!session.isAuth ? <LoginForm /> : <Dashboard />}
      </div>
    </>
  );
};

export default AdminPage;
