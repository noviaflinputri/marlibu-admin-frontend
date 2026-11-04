'use server';

import { auth } from "@/auth";

export async function deleteBookingAction(bookingId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("UNAUTHORIZED: Silakan login terlebih dahulu.");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "admin") {
    throw new Error("FORBIDDEN: Hanya admin yang diizinkan melakukan tindakan ini.");
  }

  return { success: true, message: `Booking ${bookingId} berhasil dihapus.` };
}