"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpCatchAll() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to our custom signup flow instead
        router.replace("/signup/role");
    }, [router]);
    
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to signup...</p>
        </div>
    );
}