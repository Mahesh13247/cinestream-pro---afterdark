/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                'surface-highlight': 'var(--color-surface-highlight)',
                text: 'var(--color-text)',
                'text-muted': 'var(--color-text-muted)',
                'text-inverse': 'var(--color-text-inverse)',
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                border: 'var(--color-border)',
                'border-hover': 'var(--color-border-hover)',
                overlay: 'var(--color-overlay)',
                'overlay-light': 'var(--color-overlay-light)',
                'card-bg': 'var(--color-card-bg)',
                'card-hover': 'var(--color-card-hover)',
                shadow: 'var(--color-shadow)',
                'shadow-hover': 'var(--color-shadow-hover)',
                'input-bg': 'var(--color-input-bg)',
                'input-border': 'var(--color-input-border)',
                'hero-text': 'var(--color-hero-text)',
                'hero-text-muted': 'var(--color-hero-text-muted)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'custom-pulse': 'customPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
