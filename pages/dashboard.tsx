import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Dashboard() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    fetch("/api/socket");
    const s = io({ path: "/api/socket_io" });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  async function handleUpdate() {
    const update = { id: "char1", name: "Herói", vida: Math.floor(Math.random() * 100) };
    // atualiza API
    await fetch(`/api/characters?campaignId=test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    // emite evento socket com objeto completo
    socket.emit("updateCharacter", update);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
        Atualizar Personagem
      </button>
    </div>
  );
}
