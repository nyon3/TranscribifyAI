import { headers } from "next/headers";

import type { FC } from "react";

export const Greet: FC = async () => {
  const response = await fetch("https://bf4a-240b-253-2242-400-418-aab6-70d3-b46c.ngrok-free.app/api/id", {
    cache: "no-cache",
    headers: Object.fromEntries(headers()),
  });
  const hello = await response.json();

  return <pre>{JSON.stringify(hello)}</pre>;
};