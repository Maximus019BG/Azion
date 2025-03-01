/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--background))',
                foreground: 'rgb(var(--foreground))',
                muted: 'rgb(var(--muted))',
                accent: 'rgb(var(--accent))',
                lightAccent: 'rgb(var(--lightAccent))',
                neonAccent: 'rgb(var(--neonAccent))',

            },
        },
    },
    plugins: [require('daisyui'),],
    daisyui: {
        themes: [
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    accent: "#0ea5e9",
                }
            }
        ]
    },
};