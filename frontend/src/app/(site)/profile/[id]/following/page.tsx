"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function FollowingPage() {
  const { id } = useParams();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${id}/following`);
      const data = await res.json();
      setFollowing(data.following || []);
      setLoading(false);
    };
    fetchFollowing();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-teal-600" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        ➡️ Following ({following.length})
      </h2>
      {following.map((user) => (
        <Card key={user._id} className="mb-3 border border-gray-100 dark:bg-gray-900">
          <CardContent className="flex items-center gap-3 p-4">
            <img
              src={user.profileImage}
              alt={user.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}