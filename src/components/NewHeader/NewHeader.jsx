import React from 'react';
import MiddleBar from './MiddleBar';
import NavigationBar from './NavigationBar';

const NewHeader = ({ logoUrl }) => {
  return (
    <header className="w-full flex flex-col font-sans sticky top-0 z-50 bg-white ">
      <MiddleBar logoUrl={logoUrl} />
      <NavigationBar />
    </header>
  );
};

export default NewHeader;
