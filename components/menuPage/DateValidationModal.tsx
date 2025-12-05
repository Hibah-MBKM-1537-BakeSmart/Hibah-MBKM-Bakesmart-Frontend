"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";

interface DateValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: () => void;
}

export function DateValidationModal({
  isOpen,
  onClose,
  onSelectDate,
}: DateValidationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>
              {t("menu.selectDateTitle") || "Pilih Tanggal Pesanan"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {t("menu.selectDateDescription") ||
              "Silakan pilih tanggal pesanan terlebih dahulu sebelum menambahkan item ke keranjang"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 text-sm">
            {t("menu.selectDateInfo") ||
              "Pilih hari pesanan di kalender di bagian atas menu untuk memulai."}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel") || "Batal"}
          </Button>
          <Button
            type="button"
            onClick={onSelectDate}
            className="bg-[#8B6F47] hover:bg-[#6B5535] text-white"
          >
            {t("common.ok") || "Mengerti"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
