import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], darkMode: "class", theme: { extend: { colors: { brand: { 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490" } } } }, plugins: [] };
export default config;
