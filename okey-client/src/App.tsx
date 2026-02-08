import { useState, useEffect } from 'react';
import './App.css';
import { GameBoard } from './components/game/GameBoard';
import { LandscapeEnforcer } from './components/layout/LandscapeEnforcer';
import { Splash } from './components/layout/Splash';
import { Home } from './components/layout/Home';
import { socketService } from './services/socket';
import { useGameStore } from './store/gameStore';
import { soundManager } from './services/soundManager';


function App() {
  const { setInGame, updateHand, setGameData } = useGameStore();
  const [view, setView] = useState<'splash' | 'home' | 'game'>('splash');

  useEffect(() => {
    // Basic Telegram SDK init check
    try {
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.error("Telegram SDK not found or error", e);
    }

    // Connect to Socket
    socketService.connect();

    // Listeners
    socketService.on('connect', () => {
      console.log('Connected!');
    });

    socketService.on('game_start', (data) => {
      console.log('Game Started:', data);

      // CRITICAL: Set myPlayerId to match socket.id so we know who we are
      const myId = socketService.socket?.id;
      if (myId) {
        useGameStore.getState().setMyPlayerId(myId);
        console.log("Set My Player ID:", myId);
      } else {
        console.error("Socket ID missing on game start!");
      }

      soundManager.play('distribute');
      setGameData(data);
      updateHand(data.myHand); // Initial hand
      setInGame(true); // Set InGame LAST to ensure data is ready
      setView('game'); // Switch to game view
    });

    socketService.on('tile_drawn', (data) => {
      soundManager.play('click');
      if (data.myHand) {
        updateHand(data.myHand);
      }
    });

    socketService.on('my_hand_updated', (data) => {
      if (data.myHand) {
        updateHand(data.myHand);
      }
    });

    // Add turn notification
    socketService.on('game_update', (data) => {
      // Check if it's my turn now? 
      // Need logic to check turn change
    });

    // Cleanup
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleSplashComplete = () => {
    setView('home');
  };

  const handleStartGame = () => {
    // Socket join logic depends on Home trigger or auto
    // Home component triggers socket emit, here we just wait for 'game_start'
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-green-900">
      <LandscapeEnforcer>
        {view === 'splash' && <Splash onComplete={handleSplashComplete} />}
        {view === 'home' && <Home onStartGame={handleStartGame} />}
        {view === 'game' && <GameBoard />}
      </LandscapeEnforcer>
    </div>
  );
}

export default App;
