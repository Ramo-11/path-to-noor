import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/Container";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <Container size="sm">
        <div className="text-center">
          <p className="text-7xl font-bold text-primary-600 dark:text-primary-400">404</p>
          <h1 className="mt-4 font-heading text-3xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
