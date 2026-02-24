"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/kevjaeg/klasshub")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  if (stars === null) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      {stars}
    </span>
  );
}
