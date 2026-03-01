
import React, { useLayoutEffect, useRef, useState } from 'react';
import './Sun.css';
import Land from './Land';

interface SunProps {
  isRisen: boolean;
}

const Sun: React.FC<SunProps> = ({ isRisen: isRisen }) => {
  const [position, setPosition] = useState({ x: -100, y: window.innerHeight - 200 });
  const [sunColor, setSunColor] = useState('rgba(255, 140, 0, 1)');
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const animationRef = useRef<number>(0);

  useLayoutEffect(() => {
    const h = window.innerWidth / 8;
    const y_peak = (window.innerHeight * 0.85) - 100;

    const a = -y_peak / (h * h);
    const parabola_b = 2 * y_peak / h;

    const orange = { r: 255, g: 140, b: 0 };
    const yellow = { r: 255, g: 215, b: 0 };

    const animate = (startTime: number, isSunrise: boolean) => {
      const animateParabola = (timestamp: number) => {
        const elapsedTime = timestamp - startTime;
        const animationDuration = 2500;
        let progress;

        if (isSunrise) {
          progress = (elapsedTime / animationDuration) * h;
        } else {
          progress = h - (elapsedTime / animationDuration) * h;
        }

        if ((isSunrise && progress <= h) || (!isSunrise && progress >= 0)) {
          const x_calc = progress;
          const y_calc = a * x_calc * x_calc + parabola_b * x_calc;

          setPosition({ x: x_calc - 100, y: window.innerHeight - y_calc - 250 });

          const colorProgress = progress / h;

          const r = Math.round(orange.r + (yellow.r - orange.r) * colorProgress);
          const g = Math.round(orange.g + (yellow.g - orange.g) * colorProgress);
          const b_color = Math.round(orange.b + (yellow.b - orange.b) * colorProgress);
          setSunColor(`rgba(${r}, ${g}, ${b_color}, 1)`);

          const maxOpacity = 0.7;
          // Corrected opacity logic
          const newOpacity = maxOpacity * (1 - colorProgress);
          setOverlayOpacity(newOpacity);

          animationRef.current = requestAnimationFrame(animateParabola);
        } else {
          if (isSunrise) {
            setPosition({ x: h - 100, y: window.innerHeight - y_peak - 250 });
            setSunColor(`rgba(${yellow.r}, ${yellow.g}, ${yellow.b}, 1)`);
            setOverlayOpacity(0);
          } else {
            setPosition({ x: -100, y: window.innerHeight - 250 });
            setSunColor(`rgba(${orange.r}, ${orange.g}, ${orange.b}, 1)`);
            setOverlayOpacity(0.7);
          }
        }
      };

      animationRef.current = requestAnimationFrame(animateParabola);
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const startTime = performance.now();
    animate(startTime, isRisen);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRisen]);

  return (
    <>
        <div
          className="sun"
          style={{ left: `${position.x}px`, top: `${position.y}px`, position: 'absolute' }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="sunGradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor={sunColor.replace(/, 1\)$/, ', 0.8)')} />
                <stop offset="60%" stopColor={sunColor.replace(/, 1\)$/, ', 0.3)')} />
                <stop offset="100%" stopColor={sunColor.replace(/, 1\)$/, ', 0)')} />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="100" fill="url(#sunGradient)" />
            <circle cx="100" cy="100" r="35" fill={sunColor} />
          </svg>
        </div>
        <Land overlayOpacity={overlayOpacity} />
    </>
  );
};

export default Sun;
