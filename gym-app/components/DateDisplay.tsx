"use client";

import { useState, useEffect } from "react";

export default function DateDisplay() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  if (!date) return null;

  return <p className="mt-0.5 text-sm text-text-muted">{date}</p>;
}
