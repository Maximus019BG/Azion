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
                background1: 'rgb(var(--background1))',
                background2: 'rgb(var(--background2))',
                background3: 'rgb(var(--background3))',
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