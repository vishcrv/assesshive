"use client";
// import Link from "next/link";
// import { Button } from "@/src/app/components/ui/button";
// import { ModeToggle } from "@/src/app/components/themetoggle";
import { UserButton } from "@clerk/nextjs";
const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4  border-b">

    <div className="text-xl font-bold ml-15">Iris</div>

      

      {/* <div className="hidden md:flex space-x-7 text-xs ml-27 font-normal opacity-70 tracking-wide">
        <Link href="#">Product</Link>
        <Link href="#">Resources</Link>
        <Link href="#">Pricing</Link>
        <Link href="#">Customers</Link>
        <Link href="#">Blog</Link>
        <Link href="#">Contact</Link>
      </div> */}

      {/* Authentication Buttons */}
      <div className="flex space-x-4 text-sm mr-30">
      {/* <Button asChild variant="secondary">
      <Link href=".">
        Log out
      </Link>
      </Button> */}
        
        <div className="scale-150"> {/* Adjust the scale factor as needed */}
            <UserButton />
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
