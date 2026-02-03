/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    darkMode: 'media', // Enable dark mode based on system preference
    theme: {
        extend: {
            fontFamily: {
                yuji: ["YujiSyuku_400Regular", "Quicksand_400Regular", "serif"],
                hina: ["HinaMincho_400Regular", "serif"],
                iansui: ["Iansui_400Regular", "Quicksand_400Regular", "serif"],
                google_sans: ["GoogleSans_400Regular", "sans-serif"],
            }
        },
    },
    plugins: [],
}
