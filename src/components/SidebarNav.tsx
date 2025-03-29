import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: React.ReactNode;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  // Function to check if a path is active
  const isActiveLink = (href: string) => {
    // Handle the special case for the dashboard index
    if (href === "/dashboard/admin" || href === "/dashboard/faculty" || href === "/dashboard/student") {
      return pathname === href;
    }
    
    // For security activities, just check exact match
    if (href === "/dashboard/admin/activities") {
      return pathname === href;
    }

    // For other paths, check if the pathname includes the href
    return pathname.includes(href);
  };

  return (
    <nav
      className={cn(
        "flex flex-col space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            isActiveLink(item.href)
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start gap-2",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 