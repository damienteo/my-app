This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!

## More Info

This site was created with a mixture of: React.js, Next.js, and Material UI.
Essentially, it's just Javascript (with Typescript), HTML, and CSS.
Testing is done with Jest.

CPF-forecast TODOs:

- Add more tests specifically for calculation in CPFAccount class
- Fix bug found in cpfForecast.ts
- Add option for bonuses (13th month, optional) - input: number of months, which month
- Add scenario for using CPF to pay for housing - input: amount, date
- Add scenario for choosing to move all sums to Special Account - input: checkbox

Other TODOs:

- Improve on styling
- Add Blog component
- Add route.js file
