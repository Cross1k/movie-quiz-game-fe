import React from "react";
import HashLoader from "react-spinners/HashLoader";

const Loader = () => {
  return (
    <HashLoader
      size={100}
      color="#aabbff"
      speedMultiplier={0.85}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "rotate(20deg)",
      }}
    />
  );
};

export default Loader;
