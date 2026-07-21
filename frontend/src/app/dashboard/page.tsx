"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null; // avoid a flash of content before redirect

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{user.companyName}</h1>
          <p className="text-gray-600 text-sm">
            Signed in as {user.email} ({user.role})
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
        >
          Log out
        </button>
      </div>

      <p className="text-gray-500">
        This is your dashboard. Employee, department, attendance, and leave pages go here next.
      </p>
    </div>
  );
}