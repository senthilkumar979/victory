import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { NAV_LINKS } from './navbarLinks'

interface NavLinksProps {
  linkBaseClass: string
  activeClass: (href: string) => string
}

export const NavLinks = ({ linkBaseClass, activeClass }: NavLinksProps) => {
  const { user } = useUser()

  const renderLink = (
    href: string,
    label: string,
    Icon: React.ElementType,
    checkAccess: boolean = false,
    isAdminCheck: boolean = false,
  ) => {
    if (checkAccess && !user) return null
    if (isAdminCheck && !user?.publicMetadata?.isAdmin) return null
    return (
      <Link
        key={href}
        href={href}
        className={`${linkBaseClass} ${activeClass(
          href,
        )} shrink-0 whitespace-nowrap`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </Link>
    )
  }

  return (
    <>
      {NAV_LINKS.map(({ href, label, icon: Icon, checkAccess, isAdminCheck }) =>
        renderLink(href, label, Icon, checkAccess, isAdminCheck),
      )}
    </>
  )
}
