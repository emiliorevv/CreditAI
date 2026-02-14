/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#ccff00', // Lime Green
                    hover: '#b3e600',
                },
                background: '#0f0f0f',
                card: '#1c1c1c',
                muted: '#a1a1aa',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
