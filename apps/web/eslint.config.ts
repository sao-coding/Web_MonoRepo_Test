import { defineConfig } from "@msi/eslint-config";

export default defineConfig({
  tailwindEntryPoint: "./src/styles/globals.css",
  overrides: {
    javascript: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/navigation",
              importNames: [
                "usePathname",
                "useRouter",
                "redirect",
                "permanentRedirect",
              ],
              message: "Please use `@repo/i18n/routing` instead.",
            },
            {
              name: "next/link",
              importNames: ["default"],
              message: "Please use `@repo/ui/components/link` instead.",
            },
          ],
        },
      ],
    },
  },
});
