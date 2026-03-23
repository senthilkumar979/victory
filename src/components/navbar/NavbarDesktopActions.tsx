'use client'

import { UserMenu } from './UserMenu'

export interface NavbarDesktopActionsProps {
  pathname: string
}

export const NavbarDesktopActions = ({
  pathname,
}: NavbarDesktopActionsProps) => (
  <div className="hidden shrink-0 items-center gap-2 lg:flex">
    <UserMenu key={pathname} />
  </div>
)
