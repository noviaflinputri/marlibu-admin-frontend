import { NextResponse } from "next/server";

export function proxy() {
  // Bolehkan semua halaman diakses tanpa me-redirect ke login
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};