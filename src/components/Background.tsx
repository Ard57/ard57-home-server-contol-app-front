
import React from 'react';
import './Background.css';
import backgroundImage from '../assets/background.svg';

interface BackgroundProps {
  isRisen: boolean;
}

const Background: React.FC<BackgroundProps> = ({ isRisen }) => {
  return (
    <div className={`background-container ${isRisen ? 'risen' : 'fallen'}`}>
      <img src={backgroundImage} alt="background" className="background-image" />
    </div>
  );
};

export default Background;
