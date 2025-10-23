"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaFacebook, FaTwitter, FaLinkedin, FaLink } from "react-icons/fa";
import { toast } from "sonner";

export default function ShareModal({
    open,
    setOpen,
    post,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    post: any;
}) {
    if (!post) return null;

    const shareUrl = `${window.location.origin}/posts/${post._id}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("🔗 Холбоос хууллаа!");
    };

    const shareLinks = [
        {
            name: "Facebook",
            icon: <FaFacebook className="text-blue-600" size={22} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(post.title)}`,
        },
        {
            name: "Twitter",
            icon: <FaTwitter className="text-sky-500" size={22} />,
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                post.title
            )}`,
        },
        {
            name: "LinkedIn",
            icon: <FaLinkedin className="text-blue-700" size={22} />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Нийтлэл хуваалцах</DialogTitle>
                </DialogHeader>

                <div className="flex justify-around items-center mt-3 mb-4">
                    {shareLinks.map((s) => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                        >
                            {s.icon}
                            <span className="text-xs text-gray-600 dark:text-gray-300">{s.name}</span>
                        </a>
                    ))}

                    {/* COPY LINK */}
                    <button
                        onClick={handleCopy}
                        className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                    >
                        <FaLink className="text-gray-500 dark:text-gray-300" size={22} />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Copy</span>
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 break-all bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                    {shareUrl}
                </p>
            </DialogContent>
        </Dialog>
    );
}