export default function LeagueOverviewPage({
  params,
}: {
  params: { leagueId: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">League Overview</h1>
      <p className="mt-1 text-sm text-gray-500">League ID: {params.leagueId}</p>

      {/* TODO: Fetch league data and render overview */}

      {/* Navigation tabs */}
      <nav className="mt-6 flex gap-1 border-b border-gray-200">
        {[
          { label: 'Overview', href: '' },
          { label: 'History', href: 'history' },
          { label: 'Rivalries', href: 'rivalries' },
          { label: 'Draft', href: 'draft' },
          { label: 'Recaps', href: 'recaps' },
          { label: 'Rules', href: 'rules' },
          { label: 'Dues', href: 'dues' },
        ].map((tab) => (
          <a
            key={tab.label}
            href={`/leagues/${params.leagueId}/${tab.href}`}
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:border-brand-500 hover:text-brand-600 transition-colors"
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <div className="mt-6">
        <p className="text-gray-500">
          Connect and sync your league to see analytics here.
        </p>
      </div>
    </div>
  );
}
