export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  daisyui: {
    themes: ["dark"],
  },

  theme: {
    extend: {
      fontFamily: {
        martian: ["Martian Mono", "monospace"],
      },
    },
  },
  plugins: [require("daisyui")],
};
