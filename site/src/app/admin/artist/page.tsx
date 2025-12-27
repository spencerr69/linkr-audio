import { Dashboard } from "@/app/admin/components/dashboard";
import { AdminPages } from "@/lib/definitions";

export default async function ArtistPage() {
  // Access to this page is blocked in proxy.ts to only authenticated users

  return (
    <>
      <Dashboard currentPage={AdminPages.Artist} />
    </>
  );
}
