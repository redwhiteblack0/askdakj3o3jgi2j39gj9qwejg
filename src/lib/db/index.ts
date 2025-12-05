export const game_state = {
    time_start: 0,
    player_1: {
        session_id: "",
        id: -1,
        char_selected: -1,
        last_pos: {pX: 0, pY: 0}
    },
    player_2: {
        session_id: "",
        id: -1,
        char_selected: -1,
        last_pos: {pX: 0, pY: 0}
    }
}

// Connected SSE clients
export const clients: Response[] = [];

export function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res: any) => {
    try {
      res.write(message);
    } catch (e) {
      console.error("Write failed:", e);
    }
  });
}