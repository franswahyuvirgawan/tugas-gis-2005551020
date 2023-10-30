export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  daisyui: {
    themes: ["dark"],
  },

  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
