import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PwaFloatingBanner from '../pwa/PwaFloatingBanner';
import PwaInstallModal from '../pwa/PwaInstallModal';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PwaFloatingBanner />
      <PwaInstallModal />
    </div>
  );
}
