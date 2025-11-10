interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-primary-foreground font-bold text-2xl">TF</span>
          </div>
          <h1 className="text-3xl font-bold">TradeFlow</h1>
          <p className="text-muted-foreground mt-2">
            Your complete business management platform
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
