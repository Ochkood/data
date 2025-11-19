"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setStats(data);
          setChartData([
            { name: "1-р сар", posts: 20 },
            { name: "2-р сар", posts: 45 },
            { name: "3-р сар", posts: 60 },
            { name: "4-р сар", posts: 80 },
            { name: "5-р сар", posts: 55 },
            { name: "6-р сар", posts: 90 },
          ]);
        } else toast.error(data.message || "Алдаа гарлаа");
      } catch (err) {
        toast.error("Сервертэй холбогдох үед алдаа гарлаа");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#14b8a6", "#0d9488", "#99f6e4"];

  if (loading)
    return (
      <div className="flex justify-center items-center w-full m-auto h-full">
        <Loader />
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          📊 Админ хяналтын самбар
        </h1>
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
          <TrendingUp size={18} />
          <span className="text-sm font-medium">Realtime data synced</span>
        </div>
      </div>

      {/* 🧮 Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Нийт хэрэглэгч"
          value={stats.users}
          icon={<Users className="text-teal-600" size={22} />}
          delay={0}
        />
        <StatCard
          title="Нийт мэдээ"
          value={stats.posts}
          icon={<FileText className="text-teal-600" size={22} />}
          delay={0.2}
        />
        <StatCard
          title="Сэтгэгдэл"
          value={stats.comments}
          icon={<MessageSquare className="text-teal-600" size={22} />}
          delay={0.4}
        />
      </div>

      {/* 📈 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Мэдээний өсөлт (сар бүр)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Контентын харьцаа</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Мэдээ", value: stats.posts },
                    { name: "Хэрэглэгч", value: stats.users },
                    { name: "Сэтгэгдэл", value: stats.comments },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {COLORS.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** ── 💎 Animated Stat Card ───────────────────────────── */
function StatCard({
  title,
  value,
  icon,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}