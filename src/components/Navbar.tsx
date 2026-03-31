import TerminalIcon from '@mui/icons-material/Terminal';
import Auth from './Auth';

export default function NavBar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg text-indigo-600">
          <TerminalIcon className="w-6 h-6" />
          <span>Home Server Control Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <Auth />
        </div>
      </div>
    </header>
  );
}
