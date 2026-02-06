tailwind.config = {
    theme: {
        extend: {
            colors: {
                'ferrari-red': '#D40000',
                'ferrari-yellow': '#FFF200',
                'ferrari-black': '#111111',
                'ferrari-dark': '#0a0a0a',
                'ferrari-gray': '#333333',
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                display: ['Oswald', 'sans-serif'],
            },
            spacing: {
                '128': '32rem',
            },
            animation: {
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'slide-in': 'slideIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                }
            }
        }
    }
}
