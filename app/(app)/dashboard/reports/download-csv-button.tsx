"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadCSVButton({ data, filename }: { data: (string | number)[][]; filename: string }) {
  function download() {
    const csv = data.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button size="sm" variant="secondary" onClick={download}>
      <Download size={14} /> CSV
    </Button>
  );
}
