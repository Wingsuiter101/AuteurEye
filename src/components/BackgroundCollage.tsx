import React from 'react';

interface BackgroundCollageProps {
  posters: string[];
}

const BackgroundCollage: React.FC<BackgroundCollageProps> = ({ posters }) => {
  return (
    <div className="fixed inset-0 z-1 overflow-hidden">
      <div
        className="w-screen h-screen grid grid-cols-5 grid-rows-4 gap-0 animate-slow-move"
        style={{
          opacity: 0.05,
          filter: 'blur(6px)',
        }}
      >
        {posters.slice(0, 20).map((url) => (
          <div
            key={url}
            className="w-full h-full min-h-[100px] min-w-[100px] bg-cover bg-center"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundCollage; 