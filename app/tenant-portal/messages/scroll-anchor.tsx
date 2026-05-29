"use client";
import { useEffect, useRef } from "react";

export function ScrollAnchor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant" });
  }, []);
  return <div ref={ref} />;
}
