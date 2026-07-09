/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                studyflow: {
                    brand: "#1473E6",
                    brandHover: "#1473E6",
                    navy: "#0B161A",
                    navyHover: "#193138",
                    page: "#0B161A",
                    card: "#193138",
                    border: "#E0E0E0",
                    muted: "#E0E0E0",
                    text: "#E0E0E0",
                    alert: "#9E5252",
                },
            },
        },
    },
    plugins: [],
};
