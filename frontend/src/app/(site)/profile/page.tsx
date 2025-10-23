"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit3,
  Briefcase,
  Phone,
  Globe,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfilePostCard from "@/components/ProfilePostCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import SavedPosts from "@/components/SavedPosts";

type Post = {
  _id: string;
  title: string;
  likes?: string[];
  comments?: string[];
  views?: number;
  createdAt?: string;
  image?: string;
  category?: { name: string; color?: string };
};

export default function ProfileTabsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧲 Миний нийтлэлүүд
  useEffect(() => {
    const load = async () => {
      if (!user?._id || !token) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/users/${user._id}/posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) setPosts(data.posts || []);
      } catch (e) {
        console.error("❌ Failed to load my posts:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, token]);

  // 📊 Chart-д зориулсан өгөгдөл (Hook-уудын дээд талд байх ёстой)
  const stats = useMemo(() => {
    const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);
    const totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);

    const topByEngagement = [...posts]
      .map((p) => ({
        id: p._id,
        title: p.title,
        likes: p.likes?.length || 0,
        comments: p.comments?.length || 0,
        views: p.views ?? 0,
        score: (p.likes?.length || 0) + (p.comments?.length || 0) + (p.views ?? 0) / 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const timeline = [...posts]
      .sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      )
      .map((p) => ({
        name: new Date(p.createdAt || Date.now()).toLocaleDateString("mn-MN", {
          month: "2-digit",
          day: "2-digit",
        }),
        views: p.views ?? 0,
      }));

    return { totalLikes, totalComments, totalViews, topByEngagement, timeline };
  }, [posts]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Та нэвтрээгүй байна
        </h2>
        <a
          href="/login"
          className="text-teal-600 dark:text-teal-400 underline mt-3 text-sm"
        >
          Нэвтрэх
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header card */}
        <Card className="mb-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={
                  user?.profileImage ||
                  "https://res.cloudinary.com/demo/image/upload/v1690000000/avatar_default.png"
                }
                alt="profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-teal-500 shadow-md"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user?.fullName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{user?.username}
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/profile/edit")}
                  className="bg-teal-600 hover:bg-teal-700 text-white hover:cursor-pointer"
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Профайл засах
                </Button>
              </div>

              {/* quick facts */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Нийтлэл</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {posts.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Like</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalLikes}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Comment</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalComments}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Уншсан</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalViews}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-4 max-w-md mx-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-xl ">
            <TabsTrigger className="hover:cursor-pointer" value="about">About</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="stats">Stats</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="saved">Saved</TabsTrigger>
          </TabsList>

          {/* About */}
          <TabsContent value="about" className="mt-6">
            <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                {/* Bio */}
                {user?.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Танилцуулга
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Profession / Experience */}
                {(user?.profession || user?.experience) && (
                  <div className="grid sm:grid-cols-1 gap-4">
                    {user?.profession && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Briefcase size={16} />
                        <span>{user.profession}</span>
                      </div>
                    )}
                    {user?.experience && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Briefcase size={16} />
                        <span>{user.experience}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contacts */}
                {(user?.contact?.phone || user?.contact?.website || user?.contact?.address) && (
                  <div className="grid sm:grid-cols-1 gap-4">
                    {user?.contact?.phone && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone size={16} />
                        <span>{user.contact.phone}</span>
                      </div>
                    )}
                    {/* {user?.contact?.website && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Globe size={16} />
                        <a
                          href={user.contact.website}
                          target="_blank"
                          className="text-teal-600 hover:underline"
                        >
                          {user.contact.website}
                        </a>
                      </div>
                    )} */}
                    {user?.contact?.address && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <MapPin size={16} />
                        <span>{user.contact.address}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Socials */}
                {(user?.contact?.facebook ||
                  user?.contact?.twitter ||
                  user?.contact?.linkedin) && (
                    <div className="flex items-center gap-3">
                      {user?.contact?.facebook && (
                        <a
                          href={user.contact.facebook}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Facebook size={16} />
                          Facebook
                        </a>
                      )}
                      {user?.contact?.twitter && (
                        <a
                          href={user.contact.twitter}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Twitter size={16} />
                          Twitter
                        </a>
                      )}
                      {user?.contact?.linkedin && (
                        <a
                          href={user.contact.linkedin}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Linkedin size={16} />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}

                {/* Empty state */}
                {!user?.bio &&
                  !user?.profession &&
                  !user?.experience &&
                  !user?.contact?.phone &&
                  !user?.contact?.website &&
                  !user?.contact?.address && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Профайлын мэдээлэл хоосон байна.{" "}
                      <button
                        className="text-teal-600 hover:underline"
                        onClick={() => router.push("/profile/edit")}
                      >
                        Оруулж шинэчлээрэй.
                      </button>
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts */}
          <TabsContent value="posts" className="mt-6">
            {loading ? (
              <p className="text-center text-gray-500">Уншиж байна...</p>
            ) : posts.length === 0 ? (
              <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
                <CardContent className="p-8 text-center text-gray-500">
                  Одоогоор нийтлэл алга.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((p) => (
                  <ProfilePostCard key={p._id} post={p} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Top engagement bar */}
              <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Interaction (Top 6)
                  </h3>
                  {posts.length === 0 ? (
                    <p className="text-gray-500">Мэдээлэл алга.</p>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topByEngagement}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="title" hide />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="likes" />
                          <Bar dataKey="comments" />
                          <Bar dataKey="views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Views timeline area */}
              <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Views timeline
                  </h3>
                  {posts.length === 0 ? (
                    <p className="text-gray-500">Мэдээлэл алга.</p>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.timeline}>
                          <defs>
                            <linearGradient id="vfill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopOpacity={0.3} />
                              <stop offset="95%" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="views"
                            fill="url(#vfill)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="saved">
            <SavedPosts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}