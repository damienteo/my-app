import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    // extend: {
    //   colors: {
    //     primary: '#D21F3C',
    //     'border-dark': '#2F3239',
    //     'border-light': '#D8D8D8',
    //     'section-bg-dark': '#1F2128',
    //     'section-bg': '#EFF0F2',
    //     'subtext-dark': '#848E9C',
    //     subtext: '#545459',
    //     error: '#CA1704',
    //   },
    // },
  },
  plugins: [],
}
export default config
