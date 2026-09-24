import { Illustration } from "@/components/primer/Illustration";

interface AuthShellProps {
  children: React.ReactNode;
  mobileArt?: boolean;
}

export function AuthShell({ children, mobileArt = true }: AuthShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-stretch lg:gap-14 lg:px-8 lg:py-20">
      <div
        className={`order-1 overflow-hidden rounded-[var(--radius-panel)] bg-stage1-tint p-2 sm:p-3 lg:order-2 ${
          mobileArt ? "" : "hidden lg:block"
        }`}
      >
        <div className="aspect-[21/9] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] lg:aspect-auto lg:h-full lg:min-h-[28rem]">
          <Illustration name="welcome" sizes="(min-width: 1024px) 460px, 100vw" priority />
        </div>
      </div>
      <div className="order-2 flex flex-col justify-center lg:order-1">
        <div className="card w-full p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
