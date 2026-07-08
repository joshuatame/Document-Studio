import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        electric: "#0078FF",
        graphite: "#2B2F36",
        steel: "#DDE6F1",
        indigo: "#7B61FF",
        success: "#1DBF73",
        alert: "#FF8A34",
        error: "#E74C3C",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(11 31 58 / 0.06), 0 4px 12px 0 rgb(11 31 58 / 0.04)",
        elevated:
          "0 4px 6px -1px rgb(11 31 58 / 0.08), 0 10px 24px -4px rgb(11 31 58 / 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
