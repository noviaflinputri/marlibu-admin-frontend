import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const verifySession = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return { 
    isAuth: true, 
    user: session.user, 
    role: (session.user as any).role 
  };
});

export const getAdminData = cache(async () => {
  const session = await verifySession();

  if (session.role !== "admin") {
    throw new Error("FORBIDDEN: Anda tidak memiliki akses ke data ini.");
  }

  return {
    totalRevenue: "Rp 45.000.000",
    activeBookings: 120,
  };
});