import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import "../css/ChessBoard.css";

const ChessBoard = () => {
  const [chess, setChess] = useState(new Chess());
  const [playerRole, setPlayerRole] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [sourceSquare, setSourceSquare] = useState(null);
  const [board, setBoard] = useState(chess.board());
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);
  useEffect(() => {
    if (!socket) return;
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
    socket.on("check", (data) => {
      console.log("Check:", data.message);
    });
    socket.on("checkmate", (data) => {
      console.log("Checkmate:", data.message);
    });
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
    return () => {
      socket.off();
    };
  }, [socket, chess]);
  useEffect(() => {
    if (socket) {
      socket.emit("joinGame");
    }
  }, [socket]);
  const getPieceUnicode = (piece) => {
    const unicode = {
      p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
      P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    };
    return unicode[piece.type] || "";
  };
  const handleMove = (from, to) => {
    if (!socket || !playerRole) return;
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
  const handleNewGame = () => {
    if (socket) {
      socket.emit("newGame");
    }
  };
  const handleResign = () => {
    if (socket && playerRole) {
      socket.emit("resign");
    }
  };
  return (
    <div className="chess-game-container">
      <div className="game-controls">
        <button onClick={handleNewGame} className="game-button">
          New Game
        </button>
        {playerRole && (
          <button onClick={handleResign} className="game-button resign">
            Resign
          </button>
        )}
      </div>
      <div className={`chessboard ${playerRole === "b" ? "flipped" : ""}`}>
        {board.map((row, rowIdx) =>
          row.map((square, colIdx) => {
            const squareColor = (rowIdx + colIdx) % 2 === 0 ? "light" : "dark";
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`square ${squareColor}`}
                data-row={rowIdx}
                data-col={colIdx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragged) {
                    handleMove(sourceSquare, { row: rowIdx, col: colIdx });
                  }
                }}
              >
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
                    }}
                  >
                    {getPieceUnicode(square)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="game-info">
        <p>Status: {playerRole ? `Playing as ${playerRole === 'w' ? 'White' : 'Black'}` : 'Spectating'}</p>
        <p>Turn: {chess.turn() === 'w' ? 'White' : 'Black'}</p>
      </div>
    </div>
  );
};
export default ChessBoard;
