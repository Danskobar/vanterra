import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import MobileBottomNav from '../mobile/MobileBottomNav.jsx';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
