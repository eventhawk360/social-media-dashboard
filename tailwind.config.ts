import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        good: "#16a34a",
        regular: "#eab308",
        bad: "#dc2626",
        excellent: "#0ea5e9",
      },
    },
  },
  plugins: [],
};
export default config;
