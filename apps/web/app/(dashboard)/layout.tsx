export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Add navigation sidebar/header with Clerk user button */}
      <nav className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/leagues" className="text-xl font-bold text-brand-900">
            League<span className="text-brand-500">Lore</span>
          </a>
          <div className="flex items-center gap-4">
            {/* TODO: Clerk <UserButton /> */}
            <div className="h-8 w-8 rounded-full bg-brand-200" />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
