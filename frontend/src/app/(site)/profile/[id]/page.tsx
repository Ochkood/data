"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Briefcase, Phone, Globe, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";
import ProfilePostCard from "@/components/ProfilePostCard";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";
import NewsCardCompact from "@/components/NewsCardCompact";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${id}`);
        const data = await res.json();

        if (res.ok && data.user) {
          setProfileUser(data.user);
          setPosts(data.posts || []);
        } else {
          toast.error("Хэрэглэгчийн мэдээлэл олдсонгүй");
        }
      } catch (err) {
        console.error("❌ Profile fetch error:", err);
        toast.error("Серверийн холболт амжилтгүй");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={36} />
      </div>
    );

  if (!profileUser)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Хэрэглэгч олдсонгүй.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 🌟 Profile Header */}
        <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={profileUser.profileImage}
                alt={profileUser.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 border-teal-500 shadow-md"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profileUser.fullName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
                </div>
                <FollowButton targetUserId={profileUser._id} />
              </div>

              {/* quick stats */}
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Нийтлэл</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{posts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Followers</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profileUser.followersCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Following</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profileUser.followingCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🗂️ Tabs */}
        <Tabs defaultValue="about" className="w-full mt-6">
          <TabsList className="grid grid-cols-2 max-w-sm mx-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger className="hover:cursor-pointer" value="about">About</TabsTrigger>
            <TabsTrigger className="hover:cursor-pointer" value="posts">Posts</TabsTrigger>
          </TabsList>

          {/* 🧠 About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                {profileUser.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ТАНИЛЦУУЛГА
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profileUser.bio}
                    </p>
                  </div>
                )}

                {(profileUser.profession || profileUser.experience) && (
                  <div className="grid sm:grid-cols-1 gap-4">
                    {profileUser.profession && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Briefcase size={16} />
                        <span>{profileUser.profession}</span>
                      </div>
                    )}
                    {profileUser.experience && (
                      <div className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Briefcase size={16} />
                          <span>{profileUser.experience}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(profileUser.contact?.phone ||
                  profileUser.contact?.website ||
                  profileUser.contact?.address) && (
                    <div className="grid sm:grid-cols-1 gap-4">
                      {profileUser.contact?.phone && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Phone size={16} />
                          <span>{profileUser.contact.phone}</span>
                        </div>
                      )}
                      {profileUser.contact?.website && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Globe size={16} />
                          <a
                            href={profileUser.contact.website}
                            target="_blank"
                            className="text-teal-600 hover:underline"
                          >
                            {profileUser.contact.website}
                          </a>
                        </div>
                      )}
                      {profileUser.contact?.address && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin size={16} />
                          <span>{profileUser.contact.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                {(profileUser.contact?.facebook ||
                  profileUser.contact?.twitter ||
                  profileUser.contact?.linkedin) && (
                    <div className="flex items-center gap-3">
                      {profileUser.contact?.facebook && (
                        <a
                          href={profileUser.contact.facebook}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Facebook size={16} /> Facebook
                        </a>
                      )}
                      {profileUser.contact?.twitter && (
                        <a
                          href={profileUser.contact.twitter}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Twitter size={16} /> Twitter
                        </a>
                      )}
                      {profileUser.contact?.linkedin && (
                        <a
                          href={profileUser.contact.linkedin}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-teal-600"
                        >
                          <Linkedin size={16} /> LinkedIn
                        </a>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📰 Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((p) => (
                  <NewsCardCompact key={p._id} post={p} />
                ))}
              </div>
            ) : (
              <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
                <CardContent className="p-8 text-center text-gray-500">
                  Оруулсан мэдээ байхгүй байна.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}