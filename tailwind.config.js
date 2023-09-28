export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        martian: ["Martian Mono", "monospace"],
      },
    },
  },
  plugins: [require("daisyui")],
};
