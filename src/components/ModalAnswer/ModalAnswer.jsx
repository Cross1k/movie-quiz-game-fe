import React from "react";
import Modal from "react-modal";

import customStyles from "../../utils/customStyles.js";

const ModalAnswer = ({ isModalOpen, isAnswering, playerName }) => {
  return (
    <Modal isOpen={isModalOpen} style={customStyles}>
      {isAnswering ? (
        <div className={css.modalPlayer}>
          <h2 className={css.menuTitle}>Имя игрока:</h2>
          <p className={css.playerName}>{playerName}</p>
          <div>
            <button onClick={handleGoodAnswer} className={css.btn}>
              Верно! 🟢
            </button>
            <button onClick={handleBadAnswer} className={css.btn}>
              Не верно! 🔴
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleChangeFrame}
          className={css.btn}
          disabled={IsNextFrameButtonDisabled}
        >
          Следующий кадр ▶
        </button>
      )}
    </Modal>
  );
};

export default ModalAnswer;
