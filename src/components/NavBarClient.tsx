"use client";

import Link from "next/link";
import CartCountBadge from "@/components/CartCountBadge";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// type NavBarClientProps = {
//   isAuthenticated?: boolean;
// };

export default function NavBarClient() {
  const router = useRouter();

  //   if (isAuthenticated) {
  //     // Render a different navbar for authenticated users if needed
  //     return (
  //       <nav className="container mx-auto flex justify-between items-center p-4">
  //         <div className="text-2xl font-bold tracking-wide">
  //           <Link
  //             href="/"
  //             className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             MovieShop
  //           </Link>
  //         </div>
  //         <div className="flex gap-6 items-center">
  //           <Link
  //             href="/movies"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             Movies
  //           </Link>
  //           <Link
  //             href="/cart"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
  //           >
  //             Cart <CartCountBadge />
  //           </Link>
  //           <Link
  //             href="/dashboard"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             Dashboard
  //           </Link>
  //           <Link
  //             href="/admin"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             Admin
  //           </Link>
  //           <Link
  //             href="/profile"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             My Account
  //           </Link>
  //           <Link
  //             href="/about"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             About Us
  //           </Link>
  //           <Link
  //             href="/contact"
  //             className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //           >
  //             Contact
  //           </Link>
  //           <button
  //             type="button"
  //             className="ml-auto bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded transition"
  //             onClick={() => {
  //               if (confirm("Are you sure you want to sign out?")) {
  //                 // Implement sign-out logic here, e.g., call an API route to sign out
  //                 authClient.signOut({
  //                   fetchOptions: {
  //                     onRequest: () => {
  //                       // Redirect to home or sign-in page after sign-out
  //                       router.push("/profile");
  //                       router.refresh();
  //                     },
  //                   },
  //                 });
  //               }
  //             }}
  //           >
  //             Sign Out
  //           </button>
  //         </div>
  //       </nav>
  //     );
  //   }

  //   return (
  //     <nav className="container mx-auto flex justify-between items-center p-4">
  //       <div className="text-2xl font-bold tracking-wide">
  //         <Link
  //           href="/"
  //           className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
  //         >
  //           MovieShop
  //         </Link>
  //       </div>
  //       <div className="flex gap-6 items-center">
  //         <Link
  //           href="/movies"
  //           className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //         >
  //           Movies
  //         </Link>
  //         <Link
  //           href="/cart"
  //           className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
  //         >
  //           Cart <CartCountBadge />
  //         </Link>
  //         <Link
  //           href="/about"
  //           className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //         >
  //           About Us
  //         </Link>
  //         <Link
  //           href="/contact"
  //           className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
  //         >
  //           Contact
  //         </Link>
  //         <button
  //           type="button"
  //           className="ml-auto text-white px-4 py-2 rounded-lg transition-shadow inline-flex items-center gap-2"
  //           onClick={() => {
  //             router.push("/profile");
  //             router.refresh();
  //           }}
  //         >
  //             Sign In
  //         </button>
  //       </div>
  //     </nav>
  //   );
  // }

  return (
    <nav className="container mx-auto flex justify-between items-center p-4">
      <div className="text-2xl font-bold tracking-wide">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300 focus:text-teal-300 active:text-teal-500 transition"
        >
          MovieShop
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <Link
          href="/movies"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Movies
        </Link>
        <Link
          href="/cart"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition flex items-center"
        >
          Cart <CartCountBadge />
        </Link>
        <Link
          href="/dashboard"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Dashboard
        </Link>
        <Link
          href="/admin"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Admin
        </Link>
        <Link
          href="/profile"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          My Account
        </Link>
        <Link
          href="/about"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="hover:text-teal-400 focus:text-teal-300 active:text-teal-500 transition"
        >
          Contact
        </Link>
        <button
          type="button"
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
          onClick={() => {
            router.push("/sign-in");
            router.refresh();
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className="ml-auto bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              // Implement sign-out logic here, e.g., call an API route to sign out
              authClient.signOut({
                fetchOptions: {
                  onRequest: () => {
                    // Redirect to home or sign-in page after sign-out
                    router.push("/");
                    router.refresh();
                  },
                },
              });
            }
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
