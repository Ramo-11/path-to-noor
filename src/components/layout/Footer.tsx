import { Link } from "@/i18n/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-heading text-xl font-bold text-primary-700 dark:text-primary-300">
              Path to Noor
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
              A guided learning platform for new Muslims — explore Islam at your own pace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/topics" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Topics
                </Link>
              </li>
              <li>
                <Link href="/paths" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Learning Paths
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {currentYear} Path to Noor. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Made by{" "}
            <a
              href="https://sahab-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Sahab Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
