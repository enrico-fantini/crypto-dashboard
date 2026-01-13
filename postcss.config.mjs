const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1e293b",
          green: "#22c55e",
        },
      },
      animation: {
        "gradient-slow": "gradient 15s ease infinite",
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
    },
  },
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
