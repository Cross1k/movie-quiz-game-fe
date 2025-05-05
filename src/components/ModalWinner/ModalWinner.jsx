import React from "react";
import Modal from "react-modal";

import customStyles from "../../utils/customStyles.js";

const ModalWinner = ({ gameEnd, winnerName, winnerPts }) => {
  return (
    <Modal isOpen={gameEnd} style={customStyles}>
      <>
        <h2>{winnerName}</h2>
        <h3>Счет: {winnerPts}</h3>
      </>
    </Modal>
  );
};

export default ModalWinner;
