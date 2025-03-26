import React from "react";

const Layout = ({ children }) => {
  return (
    <>
      <header>
        <button>New Game</button>
        <button>End Game</button>
      </header>
      <main>{children}</main>
    </>
  );
};

export default Layout;
