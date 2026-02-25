import { Link } from 'react-router-dom';

interface ActiveGameBlockerProps {
    gameType: string;
    betAmount: number;
}

const GAME_ROUTES: Record<string, string> = {
    MINES: '/game/mines',
    HILO: '/game/hilo',
    BLACKJACK: '/game/blackjack',
    STAIRS: '/game/stairs',
    TOWER: '/game/tower',
};

const GAME_LABELS: Record<string, string> = {
    MINES: 'Mines',
    HILO: 'Hi-Lo',
    BLACKJACK: 'Blackjack',
    STAIRS: 'Stairs',
    TOWER: 'Tower',
};

/**
 * Banner that blocks gameplay when the user has an active session in another game.
 * Shows which game is active and a link to go finish it.
 */
export default function ActiveGameBlocker({ gameType, betAmount }: ActiveGameBlockerProps) {
    const route = GAME_ROUTES[gameType] || '/';
    const label = GAME_LABELS[gameType] || gameType;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid #e74c3c',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '16px',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '20px',
                marginBottom: '8px',
            }}>
                ⚠️
            </div>
            <div style={{
                color: '#e74c3c',
                fontWeight: 700,
                fontSize: '15px',
                marginBottom: '6px',
            }}>
                Active Game in Progress
            </div>
            <div style={{
                color: '#a0aec0',
                fontSize: '13px',
                marginBottom: '14px',
                lineHeight: 1.5,
            }}>
                You have an active <strong style={{ color: '#fff' }}>{label}</strong> game
                {betAmount > 0 && <> with a <strong style={{ color: '#f39c12' }}>${betAmount.toFixed(2)}</strong> bet</>}.
                <br />
                Finish it before playing here.
            </div>
            <Link
                to={route}
                style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: '#fff',
                    padding: '10px 28px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
                Go to {label} →
            </Link>
        </div>
    );
}
