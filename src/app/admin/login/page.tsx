import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminSetup, MIN_PASSWORD_LENGTH } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="mx-auto flex max-w-[440px] flex-col gap-5 px-4 py-16">
      <h1 className="font-display text-[44px] font-bold uppercase leading-none">Admin sign in</h1>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <LoginBody searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginBody({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  await connection();
  const setup = adminSetup();
  const next = (await searchParams).next;
  return (
    <>
      {setup !== "ok" && (
        <div role="alert" className="flex flex-col gap-2 border-l-4 border-brand bg-brand-soft p-4 text-[15px]">
          <strong>{setup === "missing" ? "Admin password not set up yet" : "Admin password is too short"}</strong>
          <span>
            In Vercel, open your project → <b>Settings → Environment Variables</b>, add <code>ADMIN_PASSWORD</code> with a password of at least{" "}
            {MIN_PASSWORD_LENGTH} characters, then redeploy.
          </span>
        </div>
      )}
      <LoginForm next={typeof next === "string" ? next : ""} />
    </>
  );
}
