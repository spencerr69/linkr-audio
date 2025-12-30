"use server";

import { getLatestRelease } from "@/app/actions/releases";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const latest_release = await getLatestRelease(id);

  redirect(`/${latest_release.slug}`);
}
