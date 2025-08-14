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
  color?: string;
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
  date: string;
  characters: Character[];
}

function Overlay() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR<Campanha>(id ? `/api/campanhas/${id}` : null, fetcher, { refreshInterval: 1000 });

  if (error) return <div>Falha ao carregar a campanha.</div>;
  if (!data) return <div>Campanha não encontrada.</div>;
  console.log("Sistema da campanha:", data.system);
  // Lógica principal: decide qual layout renderizar com base no sistema da campanha
  switch (data.system) {
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
                  {armaduraStat?.value}
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
    default:
      return (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          {data.characters.map((character) => (
            <div key={character.id} className="flex gap-[0.2em] items-center">
              <div className="flex flex-col items-center gap-[0.5em] w-[10.5em] px-[1em] py-[1em] relative rounded-[1.5em]">
                <img
                  src={character.icon}
                  alt={character.name}
                  className="size-[8.5em] aspect-square object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col gap-[0.5em]">
                <div className="flex flex-col gap-[0.2em]">
                  <div className="font-bold text-2xl w-full focus:outline-none" style={{ color: character.color }}>
                    {character.name}
                  </div>
                  {character.stats.map((stat) => {
                    if (stat.max !== undefined) {
                      return (
                        <div key={stat.name} className="flex gap-[0.5em] items-center ">
                          <div className="min-w-[5em] w-fit font-bold">{stat.name}</div>
                          <div className="flex justify-center relative text-white bg-[#555555a2] rounded-[0.6em] py-[0.05em] w-[18em] px-[1.2em] z-0">
                            <div
                              className={`absolute rounded-[0.6em] h-full size-1.5 left-0 top-0 z-10 max-w-[100%]`}
                              style={{
                                width: `${(stat.value / stat.max) * 100}%`,
                                backgroundColor: stat.color,
                              }}
                            />

                            <div className="flex font-semibold z-20">
                              {stat.value} / {stat.max}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="flex gap-2">
                  {character.stats.map((stat) => {
                    if (stat.max === undefined) {
                      return (
                        <div key={stat.name} className="flex gap-[0.5em] items-center">
                          <div className="w-fit font-bold">{stat.name}</div>
                          <div
                            className={`w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                            style={{ borderColor: character.color }}>
                            {stat.value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div>{/* Botão de Salvar removido */}</div>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export default Overlay;
