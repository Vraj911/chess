import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import "../css/ChessBoard.css";
const socket = io('http://localhost:5000'); 
const ChessBoard = () => {
  const [chess, setChess] = useState(new Chess());
  const [playerRole, setPlayerRole] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [sourceSquare, setSourceSquare] = useState(null);
  const [board, setBoard] = useState(chess.board());
  useEffect(() => {
  socket.on("playerRole", (role) => {
    setPlayerRole(role);
  });

  socket.on("spectatorRole", () => {
    setPlayerRole(null);
  });

  socket.on("boardState", (fen) => {
    const updated = new Chess();
    updated.load(fen);
    setChess(updated);
    setBoard(updated.board());
  });
  socket.on("move", (move) => {
    const updated = new Chess(chess.fen());
    updated.move(move);
    setChess(updated);
    setBoard(updated.board());
  });
  socket.on("gameOver", (message) => {
    alert(message);
  });
  return () => {
    socket.off();
  };
}, [chess]);
  useEffect(() => {
    socket.emit("joinGame");
  }, []);
  const getPieceUnicode = (piece) => {
    const unicode = {
      p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
      P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    };
    return unicode[piece.type] || "";
  };
  const handleMove = (from, to) => {
    const move = {
      from: `${String.fromCharCode(97 + from.col)}${8 - from.row}`,
      to: `${String.fromCharCode(97 + to.col)}${8 - to.row}`,
      promotion: "q",
    };
    const updated = new Chess(chess.fen());
    const result = updated.move(move);
    if (result) {
      socket.emit("move", move);
      setChess(updated);
      setBoard(updated.board());
    } else {
      alert("Invalid move");
    }
  };
  return (
    <div className={`chessboard ${playerRole === "b" ? "flipped" : ""}`}>
      {board.map((row, rowIdx) =>
        row.map((square, colIdx) => {
          const squareColor = (rowIdx + colIdx) % 2 === 0 ? "light" : "dark";
          return (
            <div  key={`${rowIdx}-${colIdx}`} className={`square ${squareColor}`}  data-row={rowIdx} data-col={colIdx}
           onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                e.preventDefault();
                if (dragged) {
                  handleMove(sourceSquare, { row: rowIdx, col: colIdx });
                }
              }}>
              {square && (
                <div
                  className={`piece ${square.color === "w" ? "white" : "black"}`}
                  draggable={playerRole === square.color}
                  onDragStart={(e) => {
                    if (playerRole === square.color) {
                      setDragged(true);
                      setSourceSquare({ row: rowIdx, col: colIdx });
                      e.dataTransfer.setData("text/plain", "");
                    }
                  }}
                  onDragEnd={() => {
                    setDragged(false);
                    setSourceSquare(null);
                  }} >
                  {getPieceUnicode(square)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
export default ChessBoard;
