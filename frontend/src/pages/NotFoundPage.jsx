import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="auth-wrap">
      <article className="card auth-card">
        <h1>Page not found</h1>
        <p>The page you are trying to open does not exist.</p>
        <Link className="btn" to="/">
          Go to home
        </Link>
      </article>
    </section>
  )
}
