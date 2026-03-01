export default function LeaguesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Leagues</h1>
        <a
          href="/leagues/connect"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          + Connect League
        </a>
      </div>

      {/* TODO: Fetch leagues from API and render cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No leagues connected yet.</p>
          <a
            href="/leagues/connect"
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Connect your first league →
          </a>
        </div>
      </div>
    </div>
  );
}
