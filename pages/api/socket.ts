import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    const io = new Server((res.socket as any).server, {
      path: "/api/socket_io",
    });

    io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      socket.on("updateCharacter", (data) => {
        io.emit("characterUpdated", data);
      });
    });

    (res.socket as any).server.io = io;
  }

  res.end();
}
