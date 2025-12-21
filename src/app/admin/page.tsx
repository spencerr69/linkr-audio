import { LoginForm } from "@/app/ui/login-form";
import { verifySession } from "@/lib/dal";
import { Dashboard } from "@/app/admin/components/dashboard";

const AdminPage = async () => {
  const session = await verifySession();

  return (
    <>
      <div className={"bg-gray-50 h-screen w-screen font-sans"}>
        {!session.isAuth ? <LoginForm key={1} /> : <Dashboard key={2} />}
      </div>
    </>
  );
};

export default AdminPage;
