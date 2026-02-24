import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import JackpotNotifications from '@/components/JackpotNotifications';
import MainHeader from '@/app/mainHeader/mainheader';
import BetPad from '@/app/bettingpad/BetPad';
import { useLocation } from 'react-router-dom';

// Pages
import HomePage from '@/app/page';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import AdminPage from '@/app/admin/page';
import WalletPage from '@/app/wallet/page';
import HistoryPage from '@/app/history/page';
import JackpotsPage from '@/app/jackpots/page';
import VerifierPage from '@/app/verifier/page';

// Game Pages
import DicePage from '@/app/game/dice/page';
import MinesPage from '@/app/game/mines/page';
import PlinkoPage from '@/app/game/plinko/page';
import CoinFlipPage from '@/app/game/coinflip/page';
import LimboPage from '@/app/game/limbo/page';
import BalloonPage from '@/app/game/balloon/page';
import CrashPage from '@/app/game/crash/page';
import SoloCrashPage from '@/app/game/solocrash/page';
import RushPage from '@/app/game/rush/page';
import WheelPage from '@/app/game/wheel/page';
import RoulettePage from '@/app/game/roulette/page';
import FastParityPage from '@/app/game/fastparity/page';
import KenoPage from '@/app/game/keno/page';
import HiLoPage from '@/app/game/hilo/page';
import BlackjackPage from '@/app/game/blackjack/page';
import TowerPage from '@/app/game/tower/page';
import StairsPage from '@/app/game/stairs/page';
import LudoLobbyPage from '@/app/game/ludo/page';
import LudoGamePage from '@/app/game/ludo/LudoGamePage';
import JoinLudoPage from '@/app/game/ludo/JoinLudoPage';

// Root Layout wraps everything
function RootLayout() {
    return (
        <div className="min-w-[1440px] max-w-full mx-auto">
            <MainHeader />
            <Outlet />
            <JackpotNotifications />
            <Toaster position="top-right" />
        </div>
    );
}

// Game Layout wraps all /game/* routes
function GameLayout() {
    const location = useLocation();
    const slug = location.pathname.split('/')[2];

    console.log(slug, 'slug');

    return (
        <div className="bg-gray-900" style={{ display: 'flex' }}>
            {/* LEFT SIDE */}
            <div className="pl-3 " style={{ width: '520px', marginTop: '35px' }}>
                <BetPad />
            </div>

            {/* RIGHT SIDE */}
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                {/* Main pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/jackpots" element={<JackpotsPage />} />
                <Route path="/verifier" element={<VerifierPage />} />

                {/* Game pages - wrapped in GameLayout */}
                <Route path="/game" element={<GameLayout />}>
                    <Route path="dice" element={<DicePage />} />
                    <Route path="mines" element={<MinesPage />} />
                    <Route path="plinko" element={<PlinkoPage />} />
                    <Route path="coinflip" element={<CoinFlipPage />} />
                    <Route path="limbo" element={<LimboPage />} />
                    <Route path="balloon" element={<BalloonPage />} />
                    <Route path="crash" element={<CrashPage />} />
                    <Route path="solocrash" element={<SoloCrashPage />} />
                    <Route path="rush" element={<RushPage />} />
                    <Route path="wheel" element={<WheelPage />} />
                    <Route path="roulette" element={<RoulettePage />} />
                    <Route path="fastparity" element={<FastParityPage />} />
                    <Route path="keno" element={<KenoPage />} />
                    <Route path="hilo" element={<HiLoPage />} />
                    <Route path="blackjack" element={<BlackjackPage />} />
                    <Route path="tower" element={<TowerPage />} />
                    <Route path="stairs" element={<StairsPage />} />
                    <Route path="ludo" element={<LudoLobbyPage />} />
                    <Route path="ludo/:gameId" element={<LudoGamePage />} />
                    <Route path="ludo/join/:gameId" element={<JoinLudoPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
