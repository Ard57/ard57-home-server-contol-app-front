
import React from 'react';
import './Land.css';

interface LandProps {
  overlayOpacity: number;
}

const Land: React.FC<LandProps> = ({ overlayOpacity }) => {
  const landOverlayPath = "M -50,600 V 380 Q 100,310 250,390 T 500,380 T 850,420 V 600 Z";

  return (
    <div className="land-container">
      <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="land-image">
        <path d="M -50,600 V 380 Q 100,310 250,390 T 500,380 T 850,420 V 600 Z" fill="rgba(100, 15, 20, 1)"/>
        <path d="M -50,600 V 380 Q 100,310 250,390 T 500,380 T 850,420 V 600 Z" fill="rgba(67, 160, 71, 0.7)"/>
        <path d="M -50,600 V 450 Q 150,380 400,470 T 850,460 V 600 Z" fill="rgba(56, 142, 60, 0.6)" />
        <path d="M -50,600 V 520 Q 200,450 450,540 T 850,530 V 600 Z" fill="rgba(46, 125, 50, 0.5)" />

        {/* This is the new darkening overlay path */}
        <path
          d={landOverlayPath}
          fill="#000000"
          fillOpacity={overlayOpacity}
        />
      </svg>
    </div>
  );
};

export default Land;
