import React from 'react';
import TopBar from './TopBar';
import MiddleBar from './MiddleBar';
import NavigationBar from './NavigationBar';

const NewHeader = () => {
  return (
    <header className="w-full flex flex-col font-sans relative z-50">
      <TopBar />
      <MiddleBar />
      <NavigationBar />
    </header>
  );
};

export default NewHeader;
