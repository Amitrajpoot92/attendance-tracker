export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} DailyTracker. All rights reserved.
        </p>
        <p className="text-xs text-slate-500">
          Built for Paperboys, Milkmen, and Corporate Teams to manage daily tasks efficiently.
        </p>
      </div>
    </footer>
  );
}