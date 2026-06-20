import { rootDomain } from "@/lib/utils";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(rootDomain);
}
