"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { assignVendor } from "../vendors/actions";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string;
  name: string;
  trade: string;
  phone: string | null;
}

interface Props {
  requestId: string;
  currentVendorId: string | null;
  currentVendorName: string | null;
  vendors: Vendor[];
}

export function VendorAssign({ requestId, currentVendorId, currentVendorName, vendors }: Props) {
  const [selecting, setSelecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSelect(vendorId: string | null) {
    setLoading(true);
    await assignVendor(requestId, vendorId);
    setSelecting(false);
    setLoading(false);
    router.refresh();
  }

  if (vendors.length === 0) return null;

  if (!selecting) {
    return (
      <div className="flex items-center gap-3">
        {currentVendorId ? (
          <>
            <span className="text-sm text-gray-700 font-medium">{currentVendorName}</span>
            <button onClick={() => setSelecting(true)} className="text-xs text-primary hover:underline">Change</button>
            <button onClick={() => handleSelect(null)} disabled={loading} className="text-xs text-gray-400 hover:text-red-400">Remove</button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setSelecting(true)}>Assign from vendor book</Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {vendors.map((v) => (
        <button
          key={v.id}
          onClick={() => handleSelect(v.id)}
          disabled={loading}
          className={`text-sm px-3 py-1.5 rounded-lg border transition ${
            v.id === currentVendorId
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
          }`}
        >
          <span className="font-medium">{v.name}</span>
          <span className="text-xs opacity-60 ml-1 capitalize">· {v.trade}</span>
        </button>
      ))}
      <Button size="sm" variant="secondary" onClick={() => setSelecting(false)}>Cancel</Button>
    </div>
  );
}
