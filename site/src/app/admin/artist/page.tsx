import { Dashboard } from "@/app/admin/components/layout/Dashboard";
import { AdminPages } from "@/lib/definitions";

export default async function ArtistPage() {
  // Access to this page is blocked in proxy.ts to only authenticated users

  return (
    <>
      <main
        className={
          "bg-gray-50 h-screen  overflow-hidden font-sans flex flex-col"
        }
      >
        <Dashboard currentPage={AdminPages.Artist} />
      </main>
    </>
  );
}
