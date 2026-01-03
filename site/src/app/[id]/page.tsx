"use server";

import { getLatestRelease } from "@/app/actions/releases";
import { rootDomain } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id.includes(".")) {
    notFound();
  }

  const latest_release = await getLatestRelease(id);

  redirect(`${id}.${rootDomain}/${latest_release.slug}`);
}
