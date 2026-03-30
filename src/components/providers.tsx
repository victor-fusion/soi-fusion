"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
  defaultRadius: "md",

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.5",
    md: "1.6",
    lg: "1.7",
    xl: "1.8",
  },

  headings: {
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "1.2" },
      h2: { fontSize: "1.75rem", lineHeight: "1.3" },
      h3: { fontSize: "1.25rem", lineHeight: "1.4" },
      h4: { fontSize: "1.05rem", lineHeight: "1.4" },
    },
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  colors: {
    green: [
      "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac",
      "#4ade80", "#22c55e", "#16a34a", "#15803d",
      "#166534", "#14532d",
    ],
  },

  components: {
    Button: {
      defaultProps: { radius: "md" },
      styles: {
        root: { fontWeight: 500, letterSpacing: "-0.01em" },
      },
    },
    TextInput: {
      styles: {
        label: { fontWeight: 500, marginBottom: "6px" },
        input: { borderColor: "#e5e7eb", "&:focus": { borderColor: "#16a34a" } },
      },
    },
    PasswordInput: {
      styles: {
        label: { fontWeight: 500, marginBottom: "6px" },
        input: { borderColor: "#e5e7eb" },
      },
    },
    Paper: {
      defaultProps: { radius: "lg" },
    },
    NavLink: {
      styles: {
        root: { borderRadius: "8px", fontWeight: 500 },
        label: { fontSize: "0.875rem" },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
