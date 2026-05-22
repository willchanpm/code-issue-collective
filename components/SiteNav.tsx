import Link from 'next/link'

// Shared top navigation so you can jump between creating and browsing friends.
export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Main">
      <Link className="site-nav-link" href="/">
        Create friend
      </Link>
      <Link className="site-nav-link" href="/friends">
        All my friends
      </Link>
    </nav>
  )
}
