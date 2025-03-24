import React, { useState } from 'react';
import { X, RefreshCw, ArrowDownUp } from 'lucide-react';
import { Button } from './ui/button';

interface DeviceEmulatorProps {
  children: React.ReactNode;
}

const DeviceEmulator: React.FC<DeviceEmulatorProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 shadow-lg"
        size="sm"
        variant="default"
      >
        Prévisualiser Mobile
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-xl overflow-hidden shadow-2xl max-w-full max-h-full flex flex-col">
        <div className="bg-slate-800 text-white p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="font-medium">Émulateur Mobile</div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={toggleOrientation}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className={`${
            orientation === 'portrait' 
              ? 'w-[375px] h-[667px]' 
              : 'w-[667px] h-[375px]'
          } overflow-hidden flex-shrink-0 relative bg-white`}
        >
          <div className="absolute inset-0 overflow-auto">
            {children}
          </div>
        </div>
        
        <div className="p-2 bg-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">iPhone 8 ({orientation})</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Recharger
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceEmulator; 