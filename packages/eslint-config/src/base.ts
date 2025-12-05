import type { ConfigOptions, FlatConfig } from "./types";

import { isPackageExists } from "local-pkg";

import { gitignore } from "./configs/gitignore";
import { ignores } from "./configs/ignores";
import { importSort } from "./configs/import-sort";
import { imports } from "./configs/imports";
import { javascript } from "./configs/javascript";
import { jsx } from "./configs/jsx";
import { nextjs } from "./configs/nextjs";
import { prettier } from "./configs/prettier";
import { react } from "./configs/react";
import { tailwindcss } from "./configs/tailwindcss";
import { typescript } from "./configs/typescript";

const isReactInstalled = isPackageExists("react");
const isNextjsInstalled = isPackageExists("next");

export const defineConfig = (
  options: ConfigOptions,
  ...userConfigs: FlatConfig[]
): FlatConfig[] => {
  const { overrides = {} } = options;

  const configs = [
    ...gitignore(),
    ...ignores(options.ignores ?? []),
    ...javascript(overrides.javascript),
    ...importSort(overrides.importSort),
    ...imports(overrides.imports),
    ...jsx(overrides.jsx),
    ...typescript(options.tsconfigRootDir, overrides.typescript),
  ];

  const isNextjsEnabled = options.nextjs ?? isNextjsInstalled;
  const isReactEnabled = (options.react ?? isReactInstalled) || isNextjsEnabled;

  if (isReactEnabled) {
    configs.push(...react(overrides.react));
  }

  if (isNextjsEnabled) {
    configs.push(...nextjs(overrides.nextjs));
  }

  if (options.tailwindEntryPoint) {
    configs.push(
      ...tailwindcss(options.tailwindEntryPoint, overrides.tailwindcss),
    );
  }

  configs.push(...userConfigs);

  // Must be added as the last item
  // https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
  configs.push(...prettier(overrides.prettier));

  return configs;
};
