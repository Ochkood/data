"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="text-center py-8 max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <DialogHeader>
                <div className="flex flex-col items-center justify-center">
                  <CheckCircle2 className="text-green-500 w-14 h-14 mb-2 drop-shadow-sm" />
                  <DialogTitle className="text-2xl font-semibold text-green-600">
                    Амжилттай хадгалагдлаа!
                  </DialogTitle>
                </div>
              </DialogHeader>

              <p className="text-gray-600 mt-3 mb-6">
                Таны мэдээ амжилттай нэмэгдлээ.
              </p>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.refresh(); // ✅ бүрэн шинэчилнэ
                  }}
                  className="rounded-lg border-gray-300 hover:bg-gray-100"
                >
                  Шинэ мэдээ нэмэх
                </Button>
                <Button
                  className="text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                  onClick={() => {
                    onClose();
                    router.push("/admin/posts");
                  }}
                >
                  Dashboard руу буцах
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}