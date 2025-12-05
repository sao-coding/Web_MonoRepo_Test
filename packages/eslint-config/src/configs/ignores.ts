import type { FlatConfig } from "../types";

export const ignores = (userIgnores: string[] = []): FlatConfig[] => [
  {
    name: "eslint-config/ignores",
    ignores: [...userIgnores],
  },
];
