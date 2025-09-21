import React from 'react';
import LoginForm from './Components/Login';

const App = () => {
  return (
    // Main container: full-screen, uses grid to perfectly center children
    <div 
      className='grid w-full h-screen place-items-center relative'
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      
      {/* The LoginForm is centered by the parent grid container */}
      <LoginForm />
    </div>
  );
};

export default App;