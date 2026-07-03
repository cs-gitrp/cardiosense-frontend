import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--theme-bg)",
        surface: "var(--theme-surface)",
        "surface-2": "var(--theme-surface-2)",
        "surface-3": "var(--theme-surface-3)",
        text: {
          DEFAULT: "var(--theme-text)",
          muted: "var(--theme-text-muted)",
          subtle: "var(--theme-text-subtle)",
        },
        "accent-soft": "var(--theme-accent-soft)",
        "accent-glow": "var(--theme-accent-glow)",
        border: "var(--theme-border)",
        "border-dark": "var(--theme-border-dark)",

        // Shadcn UI base colors (mapped to HSL CSS variables)
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--theme-bg)",
        foreground: "var(--theme-text)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "var(--theme-accent)",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        cs: {
          bg:        "#0D1B2A",
          surface:   "#1B2D42",
          surface2:  "#243650",
          border:    "#2E4A6A",
          text:      "#E8EDF2",
          muted:     "#7A94B0",
          subtle:    "#4A6480",
          high:      "#E63946",
          mod:       "#F4A261",
          low:       "#2EC4B6",
          accent:    "#3D8BFF",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "12px",
        lg: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
