import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    if (session.user.role === "salesManager") {
      redirect("/admin/sales");
    } else if (session.user.role === "supportManager") {
      redirect("/admin/support");
    } else if (session.user.role === "productManager") {
      redirect("/admin/product");
    }
  }
}
