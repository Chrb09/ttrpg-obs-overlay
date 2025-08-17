// pages/overlay/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import MythicColor from "./mythic";
import "../../src/app/globals.css";
import { Manufacturing_Consent } from "next/font/google";
import { motion } from "motion/react";

const manufacturingConsent = Manufacturing_Consent({
  subsets: ["latin"],
  weight: "400",
});

const fetcher = (url) => fetch(url).then((res) => res.json());

// Interfaces para tipagem dos dados
interface Stat {
  name: string;
  value: number | boolean | string;
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
        <div className="flex flex-rol justify-between flex-wrap gap-8 px-[2em]">
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
                  className="w-[12em] absolute left-[50%] top-[42%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                {fatigadoStat?.value == true && (
                  <img
                    src="/overlays/mythic/fatigado.png"
                    className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                  />
                )}
                <MythicColor
                  color={character.color !== "" ? character.color : undefined}
                  className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <img
                  src="/overlays/mythic/luz.png"
                  className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50.5%] select-none"
                />
                <img
                  src="/overlays/mythic/sombra.png"
                  className="w-[20em] mix-blend-multiply absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <img
                  src="/overlays/mythic/line.png"
                  className="w-[20em] absolute left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] select-none"
                />
                <div
                  className={`absolute left-[50%] top-[56.85%] translate-y-[-50%] translate-x-[-50%] text-[1.8em] ${manufacturingConsent.className}`}>
                  {character.name}
                </div>
                <div className="absolute left-[50%] top-[17%] font-bold text-[1.75em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {vigorStat?.value}
                </div>
                <div className="absolute left-[50%] top-[25.25%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {vigorStat?.max}
                </div>
                <div className="absolute left-[24.5%] top-[25.5%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {clarezaStat?.value}
                </div>
                <div className="absolute left-[18%] top-[29%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {clarezaStat?.max}
                </div>
                <div className="absolute right-[24.5%] top-[25.5%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[50%] text-center">
                  {espiritoStat?.value}
                </div>
                <div className="absolute right-[18%] top-[29%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[50%] text-center">
                  {espiritoStat?.max}
                </div>
                <div className="absolute left-[50%] top-[70%] font-bold text-[1.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {gloriaStat?.value}
                </div>
                <div className="absolute left-[24.5%] top-[65.5%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {guardaStat?.value}
                </div>
                <div className="absolute left-[29.5%] top-[69.5%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[-50%] text-center">
                  {guardaStat?.max}
                </div>
                <div className="absolute right-[25%] top-[65.5%] font-bold text-[1.3em] translate-y-[-50%] translate-x-[50%] text-center">
                  {armaduraStat?.value}
                </div>
                <div className="absolute right-[30%] top-[69.5%] font-bold text-[0.85em] translate-y-[-50%] translate-x-[50%] text-center">
                  {armaduraStat?.value}
                </div>
                <div
                  className={`absolute left-[36%] top-[64.5%] font-bold text-[1.2em] translate-y-[-50%] translate-x-[-50%] text-center ${manufacturingConsent.className}`}>
                  GD
                </div>
                <div
                  className={`absolute right-[36%] top-[64%] font-bold text-[1.4em] translate-y-[-50%] translate-x-[50%] text-center ${manufacturingConsent.className}`}>
                  A
                </div>
              </div>
            );
          })}
        </div>
      );
    case "Ordem Paranormal":
      return (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          {data.characters.map((character) => {
            const vidaStat = character.stats.find((stat) => stat.name === "Vida");
            const sanidadeStat = character.stats.find((stat) => stat.name === "Sanidade");
            const esforcoStat = character.stats.find((stat) => stat.name === "Esforço");
            return (
              <div key={character.id} className="flex gap-[0.2em] relative w-[30em] h-[11em]">
                <img
                  src={character.icon}
                  alt={character.name}
                  className="size-[7.5em] aspect-square object-cover rounded-full outline-[0.25em] outline-gray-700 z-10 absolute left-[2em] top-[1em]"
                />

                <div className="absolute left-[2.25em] bottom-[0.5em] bg-gray-800 text-amber-400 size-[2em] flex justify-center items-center rounded-full  font-bold text-[1.4em] z-20 translate-y-[-50%] translate-x-[-50%] text-center [text-shadow:_0px_0px_8px_#FFB900]">
                  {esforcoStat?.value}
                </div>

                <div className="flex flex-col gap-[0.2em]  absolute left-[8.7em] top-[1em] w-[20em]">
                  <div
                    className="font-bold text-2xl w-full focus:outline-none pl-[1em]"
                    style={{
                      color: character.color,
                    }}>
                    {character.name}
                  </div>
                  <div className="flex flex-col items-center p-[0.25em] rounded-r-[0.75em]  gap-[0.25em] bg-gray-700 w-full">
                    <div className="relative text-white z-0 w-full">
                      <motion.div
                        className={`h-[1.5em] max-w-[100%] rounded-t-[0.5em]`}
                        style={{
                          width: `${
                            typeof vidaStat?.value === "number" && typeof vidaStat?.max === "number"
                              ? (vidaStat?.value / vidaStat?.max) * 100
                              : 0
                          }%`,
                          backgroundColor: vidaStat?.color,
                        }}
                        initial={false}
                        animate={{
                          width: `${
                            typeof vidaStat?.value === "number" && typeof vidaStat?.max === "number"
                              ? (vidaStat?.value / vidaStat?.max) * 100
                              : 0
                          }%`,
                        }}
                      />

                      <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] font-bold z-20 [text-shadow:_0px_0px_8px_rgba(255,255,255,0.9)]">
                        {vidaStat?.value} / {vidaStat?.max}
                      </div>
                    </div>
                    <div className="relative text-white z-0 w-full">
                      <motion.div
                        className={`h-[1.5em] max-w-[100%] rounded-b-[0.5em]`}
                        style={{
                          width: `${
                            typeof sanidadeStat?.value === "number" && typeof sanidadeStat?.max === "number"
                              ? (sanidadeStat?.value / sanidadeStat?.max) * 100
                              : 0
                          }%`,
                          backgroundColor: sanidadeStat?.color,
                        }}
                        initial={false}
                        animate={{
                          width: `${
                            typeof sanidadeStat?.value === "number" && typeof sanidadeStat?.max === "number"
                              ? (sanidadeStat?.value / sanidadeStat?.max) * 100
                              : 0
                          }%`,
                        }}
                      />

                      <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] font-bold z-20 [text-shadow:_0px_0px_8px_rgba(255,255,255,0.9)]">
                        {sanidadeStat?.value} / {sanidadeStat?.max}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-[1em]">
                    {character.stats.map((stat) => {
                      if (stat.max === undefined) {
                        return (
                          <div key={stat.name} className="flex flex-col items-center">
                            <div className="w-fit font-bold">{stat.name}</div>
                            {typeof stat.value !== "boolean" ? (
                              <div
                                className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                                style={{ borderColor: character.color }}>
                                {stat.value}
                              </div>
                            ) : (
                              <div
                                className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                                style={{ borderColor: character.color }}>
                                {stat.value ? "Sim" : "Não"}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div>{/* Botão de Salvar removido */}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    case "Ordem Paranormal - Determinação":
      return (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          {data.characters.map((character) => {
            const vidaStat = character.stats.find((stat) => stat.name === "Vida");
            const determinacaoStat = character.stats.find((stat) => stat.name === "Determinação");
            return (
              <div key={character.id} className="flex gap-[0.2em] relative w-[30em] h-[11em]">
                <img
                  src={character.icon}
                  alt={character.name}
                  className="size-[7.5em] aspect-square object-cover rounded-full outline-[0.25em] outline-gray-700 z-10 absolute left-[2em] top-[1em]"
                />

                <div className="flex flex-col gap-[0.2em]  absolute left-[8.7em] top-[1em] w-[20em]">
                  <div
                    className="font-bold text-2xl w-full focus:outline-none pl-[1em]"
                    style={{
                      color: character.color,
                    }}>
                    {character.name}
                  </div>
                  <div className="flex flex-col items-center p-[0.25em] rounded-r-[0.75em]  gap-[0.25em] bg-gray-700 w-full">
                    <div className="relative text-white z-0 w-full">
                      <motion.div
                        className={`h-[1.5em] max-w-[100%] rounded-t-[0.5em]`}
                        style={{
                          width: `${
                            typeof vidaStat?.value === "number" && typeof vidaStat?.max === "number"
                              ? (vidaStat?.value / vidaStat?.max) * 100
                              : 0
                          }%`,
                          backgroundColor: vidaStat?.color,
                        }}
                        initial={false}
                        animate={{
                          width: `${
                            typeof vidaStat?.value === "number" && typeof vidaStat?.max === "number"
                              ? (vidaStat?.value / vidaStat?.max) * 100
                              : 0
                          }%`,
                        }}
                      />

                      <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] font-bold z-20 [text-shadow:_0px_0px_8px_rgba(255,255,255,0.9)]">
                        {vidaStat?.value} / {vidaStat?.max}
                      </div>
                    </div>
                    <div className="relative text-white z-0 w-full">
                      <motion.div
                        className={`h-[1.5em] max-w-[100%] rounded-b-[0.5em]`}
                        style={{
                          width: `${
                            typeof determinacaoStat?.value === "number" && typeof determinacaoStat?.max === "number"
                              ? (determinacaoStat?.value / determinacaoStat?.max) * 100
                              : 0
                          }%`,
                          backgroundColor: determinacaoStat?.color,
                        }}
                        initial={false}
                        animate={{
                          width: `${
                            typeof determinacaoStat?.value === "number" && typeof determinacaoStat?.max === "number"
                              ? (determinacaoStat?.value / determinacaoStat?.max) * 100
                              : 0
                          }%`,
                        }}
                      />

                      <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] font-bold z-20 [text-shadow:_0px_0px_8px_rgba(255,255,255,0.9)]">
                        {determinacaoStat?.value} / {determinacaoStat?.max}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-[1em]">
                    {character.stats.map((stat) => {
                      if (stat.max === undefined) {
                        return (
                          <div key={stat.name} className="flex flex-col items-center">
                            <div className="w-fit font-bold">{stat.name}</div>
                            {typeof stat.value !== "boolean" ? (
                              <div
                                className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                                style={{ borderColor: character.color }}>
                                {stat.value}
                              </div>
                            ) : (
                              <div
                                className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                                style={{ borderColor: character.color }}>
                                {stat.value ? "Sim" : "Não"}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div>{/* Botão de Salvar removido */}</div>
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
                <div className="font-bold text-2xl w-full focus:outline-none" style={{ color: character.color }}>
                  {character.name}
                </div>
                <div className="flex gap-[1em]">
                  <div className="flex flex-col gap-[0.2em]">
                    {character.stats.map((stat) => {
                      if (stat.max !== undefined) {
                        return <div className="w-fit font-bold">{stat.name}</div>;
                      }
                      return null;
                    })}
                  </div>
                  <div className="flex flex-col gap-[0.2em]">
                    {character.stats.map((stat) => {
                      if (stat.max !== undefined) {
                        return (
                          <div className="flex justify-center relative text-white bg-[#555555a2] rounded-[0.6em] py-[0.05em] w-[18em] px-[1.2em] z-0">
                            <motion.div
                              className={`absolute rounded-[0.6em] h-full size-1.5 left-0 top-0 z-10 max-w-[100%]`}
                              style={{
                                width: `${
                                  typeof stat.value === "number" && typeof stat.max === "number"
                                    ? (stat.value / stat.max) * 100
                                    : 0
                                }%`,
                                backgroundColor: stat.color,
                              }}
                              initial={false}
                              animate={{
                                width: `${
                                  typeof stat.value === "number" && typeof stat.max === "number"
                                    ? (stat.value / stat.max) * 100
                                    : 0
                                }%`,
                              }}
                            />

                            <div className="flex font-semibold z-20">
                              {stat.value} / {stat.max}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  {character.stats.map((stat) => {
                    if (stat.max === undefined) {
                      return (
                        <div key={stat.name} className="flex gap-[0.5em] items-center">
                          <div className="w-fit font-bold">{stat.name}</div>
                          {typeof stat.value !== "boolean" ? (
                            <div
                              className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                              style={{ borderColor: character.color }}>
                              {stat.value}
                            </div>
                          ) : (
                            <div
                              className={`min-w-[3ch] text-center font-bold text-gray-600 border-b-2 `}
                              style={{ borderColor: character.color }}>
                              {stat.value ? "Sim" : "Não"}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export default Overlay;
