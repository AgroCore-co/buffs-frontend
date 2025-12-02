import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading({ text = "Carregando painel..." }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#ce7d0a]" />
      <p className="text-xs font-medium text-[#404040]/60">{text}</p>
    </div>
  );
}
