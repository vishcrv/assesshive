"use client";  // Mark this as a client component

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/signup") || pathname.startsWith("/login");

  return !hideNavbar ? <Navbar /> : null; // Show navbar only if not on auth pages
}
