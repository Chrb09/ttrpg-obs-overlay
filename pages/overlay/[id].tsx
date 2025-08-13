// pages/overlay/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import MythicColor from "./mythic";
import "../../src/app/globals.css";
import { Manufacturing_Consent } from "next/font/google";

const manufacturingConsent = Manufacturing_Consent({
  weight: "400",
});

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
  color: string;
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
        <div className="flex flex-rol justify-between flex-wrap gap-8 p-4">
          {data.characters.map((character) => {
            const clarezaStat = character.stats.find((stat) => stat.name === "Clareza");
            const vigorStat = character.stats.find((stat) => stat.name === "Vigor");
            const espiritoStat = character.stats.find((stat) => stat.name === "Espirito");
            const guardaStat = character.stats.find((stat) => stat.name === "Guarda");
            const armaduraStat = character.stats.find((stat) => stat.name === "Armadura");
            const gloriaStat = character.stats.find((stat) => stat.name === "Gloria");
            const fatigadoStat = character.stats.find((stat) => stat.name === "Fatigado");
            return (
              <div key={character.id} className="relative w-[20em] h-[30em]">
                <img
                  src={character.icon}
                  alt={character.name}
                  className="w-[12em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <MythicColor
                  color={character.color !== "" ? character.color : undefined}
                  className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <img
                  src="/overlays/mythic/sombra.png"
                  className="w-[20em] mix-blend-multiply absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <img
                  src="/overlays/mythic/line2.png"
                  className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <div
                  className={`absolute left-[50%] top-[62.5%] translate-y-[-50%] translate-x-[-50%] text-[1.5em] ${manufacturingConsent.className}`}>
                  {character.name}
                </div>
                <div className="absolute left-[50%] top-[22%] font-bold text-[1.75em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {vigorStat?.value}
                </div>
                <div className="absolute left-[50%] top-[30.75%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {vigorStat?.max}
                </div>
                <div className="absolute left-[24.5%] top-[30.95%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {clarezaStat?.value}
                </div>
                <div className="absolute left-[18%] top-[34.5%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {clarezaStat?.max}
                </div>
                <div className="absolute right-[24.5%] top-[30.95%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[50%] text-center">
                  {espiritoStat?.value}
                </div>
                <div className="absolute right-[18%] top-[34.5%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[50%] text-center">
                  {espiritoStat?.max}
                </div>
                <div className="absolute left-[50%] top-[72.4%] font-bold text-[1.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {gloriaStat?.value}
                </div>
                <div className="absolute left-[22.5%] top-[71.2%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {guardaStat?.value}
                </div>
                <div className="absolute left-[27.5%] top-[75%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {guardaStat?.max}
                </div>
                <div className="absolute right-[22.5%] top-[71.2%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[50%] text-center">
                  {armaduraStat?.value}
                </div>
                <div className="absolute right-[27.5%] top-[75%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[50%] text-center">
                  {armaduraStat?.max}
                </div>
                <div
                  className={`absolute left-[20%] top-[77%] font-bold text-[1.2em] translate-y-[-50%] translate-x-[-50%] text-center ${manufacturingConsent.className}`}>
                  GD
                </div>
                <div
                  className={`absolute right-[20%] top-[77%] font-bold text-[1.6em] translate-y-[-50%] translate-x-[50%] text-center ${manufacturingConsent.className}`}>
                  A
                </div>
              </div>
            );
          })}
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
