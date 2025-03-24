import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { imageService } from './lib/image-service';

// Préchargement des images au démarrage de l'application
imageService.preloadImages();

createRoot(document.getElementById("root")!).render(<App />);
