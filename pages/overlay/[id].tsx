// pages/overlay/[id].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import MythicColor from "./mythic";
import "../../src/app/globals.css";
import { Manufacturing_Consent } from "next/font/google";
import { motion } from "motion/react";

const manufacturingConsent = Manufacturing_Consent({
  subsets: ["latin"],
  weight: "400",
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Tipagem
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
  visible?: boolean;
  stats: Stat[];
}

interface Campanha {
  id: number;
  name: string;
  system: string;
  date: string;
  characters: Character[];
}

export default function Overlay() {
  const router = useRouter();

  // campaignId normalmente vem em router.query.id (página /overlay/[id])
  // suportamos também caminhos /overlay/:campaignId/:characterId (extra segmento)
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [characterIdFromPath, setCharacterIdFromPath] = useState<string | null>(null);
  const [variationFromPath, setVariationFromPath] = useState<string | null>(null);

  // Query params úteis: token, layout, scale, safe, transparent
  const query = router.query;

  useEffect(() => {
    if (!router.asPath) return;
    // extrai segmentos após /overlay/
    // ex.: /overlay/123/456?token=abc
    const path = router.asPath.split("?")[0];
    const parts = path.split("/").filter(Boolean); // ['overlay','123','456']
    const overlayIndex = parts.indexOf("overlay");
    if (overlayIndex >= 0) {
      const id = parts[overlayIndex + 1];
      const char = parts[overlayIndex + 2] ?? null;
      const variation = parts[overlayIndex + 3] ?? null;
      setCampaignId(id ?? null);
      setCharacterIdFromPath(char);
      setVariationFromPath(variation);
    } else {
      // fallback para router.query.id
      const idQ = router.query.id;
      if (typeof idQ === "string") setCampaignId(idQ);
      else if (Array.isArray(idQ) && idQ.length > 0) setCampaignId(idQ[0]);
    }
  }, [router.asPath, router.query.id]);

  // SWR busca campanha (com refreshInterval como fallback)
  const swrKey = campaignId ? `/api/campanhas/${campaignId}` : null;
  const { data, error } = useSWR<Campanha>(swrKey, fetcher, { refreshInterval: 2000 });

  if (!campaignId)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        Aguardando ID da campanha...
      </div>
    );
  if (error)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        Falha ao carregar a campanha.
      </div>
    );
  if (!data)
    return <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">Carregando...</div>;

  // Se a dashboard passar um characterId no caminho /overlay/:campaignId/:characterId, renderizamos só esse personagem.
  const singleCharacterId = characterIdFromPath ?? (typeof query.characterId === "string" ? query.characterId : null);
  const variation = variationFromPath ?? (typeof query.variation === "string" ? query.variation : null);

  // Filtra personagens por visible flag (se existir e for false, ocultar)
  let charactersToShow = (data.characters ?? []).filter((c) => c.visible !== false);
  if (singleCharacterId) {
    const parsed = Number(singleCharacterId);
    charactersToShow = charactersToShow.filter((c) => c.id === parsed);
  }

  switch (data.system) {
    case "Mythic Bastionland":
      return (
        <div className="flex flex-rol justify-between flex-wrap gap-8 px-[2em]">
          {charactersToShow.map((character) => {
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
                {fatigadoStat?.value === true && (
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
    case "Ordem Paranormal - Determinação":
      return (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          {charactersToShow.map((character) => {
            const vidaStat = character.stats.find((stat) => stat.name === "Vida");
            const sanidadeStat = character.stats.find((stat) => stat.name === "Sanidade");
            const esforcoStat = character.stats.find((stat) => stat.name === "Esforço");
            const determinacaoStat = character.stats.find((stat) => stat.name === "Determinação");
            return (
              <div key={character.id} className="flex gap-[0.2em] relative w-[30em] h-[11em]">
                <img
                  src={character.icon}
                  alt={character.name}
                  className="size-[7.5em] aspect-square object-cover rounded-full outline-[0.25em] outline-gray-700 z-20 absolute left-[2em] top-[1em]"
                  style={{
                    backgroundColor: character.color,
                  }}
                />

                {data.system === "Ordem Paranormal" && (
                  <div className="absolute left-[2.25em] bottom-[0.5em] bg-gray-800 text-amber-400 size-[2em] flex justify-center items-center rounded-full  font-bold text-[1.4em] z-30 translate-y-[-50%] translate-x-[-50%] text-center [text-shadow:_0px_0px_8px_#FFB900]">
                    {esforcoStat?.value}
                  </div>
                )}
                <div
                  className="absolute font-normal  text-[1.75em] left-[2em] top-[0.7em] w-[15.5em] z-0 focus:outline-none pl-[3.75em] pb-[0.2em] text-white"
                  style={{
                    textShadow: `#FFF 0px 0px 5px, ${character.color} 0px 0px 10px, ${character.color} 0px 0px 15px, ${character.color} 0px 0px 20px, ${character.color} 0px 0px 30px, ${character.color} 0px 0px 40px, ${character.color} 0px 0px 50px, ${character.color} 0px 0px 75px`,
                  }}>
                  {character.name}
                </div>
                <div className="flex flex-col gap-[0.2em]  absolute left-[8.2em] top-[4em] w-[19.5em]">
                  <div
                    className="flex flex-col items-center p-[0.25em] rounded-r-[0.75em]  gap-[0.25em] bg-gray-700 w-full"
                    style={{
                      boxShadow: `${character.color} 0px 0px 20px`,
                    }}>
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

                    {data.system === "Ordem Paranormal" ? (
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
                    ) : (
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
                    )}
                  </div>

                  {variation === "2" ? null : (
                    <div className="flex justify-center gap-[1em]">
                      {character.stats.map((stat) => {
                        if (stat.max === undefined) {
                          return (
                            <div key={stat.name} className="flex flex-col items-center">
                              <div className="w-fit font-extrabold">{stat.name}</div>
                              {typeof stat.value !== "boolean" ? (
                                <div
                                  className={`min-w-[3ch] text-center font-bold border-b-2 `}
                                  style={{ borderColor: character.color }}>
                                  {stat.value}
                                </div>
                              ) : (
                                <div
                                  className={`min-w-[3ch] text-center font-bold border-b-2 `}
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    default:
      return (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          {charactersToShow.map((character) => (
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
                        return (
                          <div key={stat.name} className="w-fit font-bold">
                            {stat.name}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div className="flex flex-col gap-[0.2em]">
                    {character.stats.map((stat) => {
                      if (stat.max !== undefined) {
                        return (
                          <div
                            key={stat.name}
                            className="flex justify-center relative text-white bg-[#555555a2] rounded-[0.6em] py-[0.05em] w-[18em] px-[1.2em] z-0">
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
