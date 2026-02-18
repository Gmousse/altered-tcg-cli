import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  globalIgnores(["dist/**/*", "poc/**/*"]),
  eslint.configs.recommended,
  tseslint.configs.recommended
);
