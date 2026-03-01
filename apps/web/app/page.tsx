export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-brand-900">
          League<span className="text-brand-500">Lore</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Your fantasy football history, unlocked.
        </p>
        <p className="mt-2 text-gray-500">
          Connect your league from ESPN, Yahoo, or Sleeper and instantly unlock
          decades of rivalries, analytics, draft grades, and AI-powered recaps.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/sign-up"
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            Get Started Free
          </a>
          <a
            href="#features"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            See Features
          </a>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-left">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-brand-800">📊 All-Time History</h3>
            <p className="mt-1 text-sm text-gray-500">
              Head-to-head rivalries, career stats, and league records going back years.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-brand-800">🏆 Commissioner Tools</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dues tracking, rule management with voting, and league administration.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-brand-800">🤖 AI Recaps</h3>
            <p className="mt-1 text-sm text-gray-500">
              Weekly recaps that roast your leaguemates and celebrate the winners.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
