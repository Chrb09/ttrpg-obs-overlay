// pages/overlay/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import "../../src/app/globals.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Interfaces para tipagem dos dados
interface Stat {
  name: string;
  value: number;
  max?: number;
}

interface Character {
  id: number;
  name: string;
  icon: string;
  stats: Stat[];
}

interface Campanha {
  id: number;
  name: string;
  system: string;
  characters: Character[];
}

function Overlay() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR<Campanha>(id ? `/api/campanhas/${id}` : null, fetcher, { refreshInterval: 1000 });

  if (error) return <div>Falha ao carregar a campanha.</div>;
  if (!data) return <div>Campanha não encontrada.</div>;

  // Lógica principal: decide qual layout renderizar com base no sistema da campanha
  switch (data.system) {
    case "Ordem Paranormal":
      return (
        <div className="flex flex-rol justify-between flex-wrap gap-4">
          {data.characters.map((character) => (
            <div key={character.id} className="flex flex-row items-center gap-4 w-[22em]">
              <img
                src={character.icon}
                alt={character.name}
                className="size-32 aspect-square object-cover rounded-full"
              />
              <div className="flex flex-col w-full">
                <div className="text-xl font-bold">{character.name}</div>
                {character.stats.map((stat) => (
                  <div key={stat.name}>
                    <strong>{stat.name}:</strong>
                    {stat.name === "Nex" ? ` ${stat.value}%` : ` ${stat.value} / ${stat.max}`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "Mythic Bastionland":
      return (
        <div className="flex flex-rol justify-between flex-wrap gap-8 p-4 bg-gray-800 text-white">
          {data.characters.map((character) => (
            <div key={character.id} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
              <img
                src={character.icon}
                alt={character.name}
                className="size-24 aspect-square object-cover rounded-full border-2"
              />
              <div className="font-serif text-2xl font-bold">{character.name}</div>
              <ul className="list-disc list-inside">
                {character.stats.map((stat) => (
                  <li key={stat.name}>
                    <strong>{stat.name}:</strong> {stat.value}
                    {stat.max ? ` / ${stat.max}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "Tormenta":
      return (
        <div className="flex flex-rol justify-between flex-wrap gap-4 bg-yellow-100 p-4">
          {data.characters.map((character) => (
            <div
              key={character.id}
              className="flex flex-row items-center gap-4 w-[22em] bg-white p-4 rounded-xl shadow">
              <img
                src={character.icon}
                alt={character.name}
                className="size-32 aspect-square object-cover rounded-full border-4 border-yellow-500"
              />
              <div className="flex flex-col w-full">
                <div className="text-xl font-bold text-yellow-800">{character.name}</div>
                {character.stats.map((stat) => (
                  <div key={stat.name}>
                    <strong className="text-yellow-600">{stat.name}:</strong> {stat.value} / {stat.max}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    default:
      // Layout padrão para sistemas não especificados
      return (
        <div className="flex flex-rol justify-between flex-wrap gap-4">
          {data.characters.map((character) => (
            <div key={character.id} className="flex flex-row items-center gap-4 w-[22em]">
              <img
                src={character.icon}
                alt={character.name}
                className="size-32 aspect-square object-cover rounded-full"
              />
              <div className="flex flex-col w-full">
                <div className="text-xl font-bold">{character.name}</div>
                {character.stats.map((stat) => (
                  <div key={stat.name}>
                    <strong>{stat.name}:</strong> {stat.value}
                    {stat.max ? ` / ${stat.max}` : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export default Overlay;
