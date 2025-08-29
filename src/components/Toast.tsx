"use client";

import { useEffect, useState } from "react";

export function Toast({ message }: { message: string | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (message) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(t);
    }
  }, [message]);
  if (!show || !message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}


