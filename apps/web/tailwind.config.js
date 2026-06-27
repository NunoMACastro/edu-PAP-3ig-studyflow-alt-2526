/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                studyflow: {
                    brand: "#1473E6",
                    brandHover: "#0F63C7",
                    navy: "#0B161A",
                    navyHover: "#193138",
                    page: "#F8F9FA",
                    card: "#FFFFFF",
                    border: "#E0E0E0",
                    muted: "#6B7280",
                },
            },
        },
    },
    plugins: [],
};
