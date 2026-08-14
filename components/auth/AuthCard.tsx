type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
