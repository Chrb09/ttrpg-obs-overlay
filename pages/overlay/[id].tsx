import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";

export default function Overlay() {
  const [character, setCharacter] = useState<any>({});
  const router = useRouter();
  const { id } = router.query; // campanha ID

  useEffect(() => {
    if (!id) return;

    async function fetchInitial() {
      try {
        const res = await fetch(`/api/characters?campaignId=${id}`);
        if (!res.ok) throw new Error("Erro ao buscar dados");
        const chars = await res.json();
        const char = chars.find((c: any) => c.id === "char1");
        if (char) setCharacter(char);
      } catch (err) {
        console.error(err);
      }
    }

    fetchInitial();

    fetch("/api/socket");
    const socket = io({ path: "/api/socket_io" });

    socket.on("characterUpdated", (data: { id: string }) => {
      if (data.id === "char1") {
        setCharacter((prev: any) => ({ ...prev, ...data }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="bg-black text-white p-4">
      <h2 className="text-lg font-bold">Personagem - Campanha: {id}</h2>
      <p>Vida: {character.vida ?? "N/A"}</p>
      <p>Nome: {character.name ?? "N/A"}</p>
      {/* Renderize outros atributos dinamicamente */}
    </div>
  );
}
