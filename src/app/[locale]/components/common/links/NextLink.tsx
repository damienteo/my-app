import Link from 'next/link'

type NextLinkProps = {
  className: string
  href: string
  hrefAs: string
  children: React.ReactNode
}

export const NextLink: React.FunctionComponent<NextLinkProps> = ({
  className,
  href,
  hrefAs,
  children,
}) => (
  <Link href={href} as={hrefAs} className={className}>
    {children}
  </Link>
)
