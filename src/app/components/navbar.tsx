"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4  border-b">
      <div className="text-xl font-bold ml-15">AssessHive</div>
      <div className="hidden md:flex space-x-7 text-xs ml-27 font-normal opacity-70 tracking-wide">
        <Link href="#">About</Link>
        <Link href="#">Institution</Link>
        <Link href="#">Contact Us</Link>
      </div>

      {/* Authentication Buttons */}
      <div className="flex space-x-4 text-sm mr-30">
      <Button asChild variant="default">
      <Link href="/login">
        Log in
      </Link>
      </Button>

      <Button asChild variant="secondary">
      <Link href="/register">
        Sign up
      </Link>
      </Button>
      </div>
    </nav>
  );
};

export default Navbar;
