// Dashboard.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Colorful } from "@uiw/react-color";
import { AnimatePresence, motion } from "motion/react";
import useSWR, { mutate } from "swr";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/** ---------- Types ---------- */
interface Stat {
  name: string;
  value: number | string | boolean;
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

interface SystemData {
  [key: string]: {
    bg_from_color: string;
    bg_to_color: string;
    image_name: string;
    stats: any[];
  };
}

/** ---------- Utils & Hooks ---------- */

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function clamp(n: number, min = 0, max = Infinity) {
  return Math.max(min, Math.min(max, n));
}

/** ---------- Component ---------- */
export default function Dashboard() {
  // Data
  const { data: campanhas, error, isLoading } = useSWR<Campanha[]>("/api/campanhas", fetcher);
  const {
    data: systemsData,
    error: systemsError,
    isLoading: systemsLoading,
  } = useSWR<SystemData>("/api/systems", fetcher);

  // UI state
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [visibleColorPickerId, setVisibleColorPickerId] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState<string>("#ff0000");
  const [showAddCampaignForm, setShowAddCampaignForm] = useState(false);
  const [showAddCharacterForm, setShowAddCharacterForm] = useState(false);

  // new campaign/character form states
  const [newCampaignData, setNewCampaignData] = useState({
    name: "",
    system: systemsData ? Object.keys(systemsData)[0] : "Ordem Paranormal",
  });
  const [newCharacterFile, setNewCharacterFile] = useState<File | null>(null);
  const [newCharacterPreview, setNewCharacterPreview] = useState<string | null>(null);
  const [newCharacterData, setNewCharacterData] = useState({ name: "", color: "#ff0000" });

  // overlay controls per-campaign (persisted in localStorage so stream PC can reuse)
  const [campaignSettings, setCampaignSettings] = useState<
    Record<number, { layout: string; scale: number; safeArea: number; transparent: boolean }>
  >({});

  // refs & click outside
  const colorRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // ephemeral selected campaign object
  const selectedCampaign = useMemo(
    () => campanhas?.find((c) => c.id === selectedCampaignId) ?? null,
    [campanhas, selectedCampaignId]
  );

  // keep tempColor synced when opening color picker
  useEffect(() => {
    if (visibleColorPickerId !== null) {
      const char = selectedCampaign?.characters.find((c) => c.id === visibleColorPickerId);
      if (char) setTempColor(char.color);
    }
  }, [visibleColorPickerId, selectedCampaign]);

  // close modals / color picker on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddCharacterForm(false);
        setShowAddCampaignForm(false);
        setVisibleColorPickerId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /** ---------- Helpers for optimistic update ---------- */

  const updateCharacterOnServer = useCallback(
    async (campaignId: number, charId: number, charPayload: Partial<Character>) => {
      // sends patch/put to backend. API must accept partial updates; adapt if not.
      const res = await fetch(`/api/campanhas/${campaignId}/personagens/${charId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(charPayload),
      });
      if (!res.ok) throw new Error("Falha ao atualizar personagem no servidor");
      return res.json();
    },
    []
  );

  const handleCharacterDataChange = useCallback(
    async (
      newValue: any,
      charId: number,
      field: "name" | "color" | "visible" | "statValue" | "statMax",
      statName?: string
    ) => {
      if (!campanhas || !selectedCampaignId) return;
      const key = "/api/campanhas";

      // build optimistic updated campanhas
      const previous = campanhas;
      const updatedCampanhas = campanhas.map((campanha) => {
        if (campanha.id !== selectedCampaignId) return campanha;
        return {
          ...campanha,
          characters: campanha.characters.map((ch) => {
            if (ch.id !== charId) return ch;
            let updated = { ...ch };
            if (field === "statValue" || field === "statMax") {
              updated = {
                ...updated,
                stats: updated.stats.map((s) => {
                  if (s.name !== statName) return s;
                  if (field === "statValue") {
                    const parsed = typeof s.value === "number" ? (newValue === "" ? 0 : parseInt(newValue)) : newValue;
                    const clamped = typeof parsed === "number" && s.max ? clamp(parsed, 0, s.max) : parsed;
                    return { ...s, value: clamped };
                  } else {
                    const parsedMax = parseInt((newValue as string) || "0");
                    return { ...s, max: parsedMax };
                  }
                }),
              };
            } else {
              // name, color, visible, locked
              updated = { ...updated, [field]: newValue };
            }
            return updated;
          }),
        };
      });

      // optimistic mutate
      mutate(key, updatedCampanhas, false);

      // determine payload for server (send only character)
      try {
        const campanha = updatedCampanhas.find((c) => c.id === selectedCampaignId)!;
        const char = campanha.characters.find((c) => c.id === charId)!;
        await updateCharacterOnServer(selectedCampaignId, charId, char);
        // revalidate to ensure server wins
        mutate(key);
      } catch (err) {
        console.error(err);
        // rollback
        mutate(key, previous, false);
        toast.error("Não foi possível salvar. Alterações revertidas.");
      }
    },
    [campanhas, selectedCampaignId, updateCharacterOnServer]
  );

  /** ---------- Additional features ---------- */

  // toggle visibility (quick action)
  const toggleCharacterVisibility = useCallback(
    (charId: number) => {
      const char = selectedCampaign?.characters.find((c) => c.id === charId);
      if (!char) return;
      handleCharacterDataChange(!char.visible, charId, "visible");
    },
    [selectedCampaign, handleCharacterDataChange]
  );

  // copy overlay URL (with layout/scale settings)
  const handleCopyUrl = useCallback(
    async (campaignId: string | number, characterId?: string | number) => {
      const base = `${window.location.origin}/overlay/${campaignId}${characterId ? `?characterId=${characterId}` : ""}`;
      try {
        await navigator.clipboard.writeText(base);
        toast.success("URL copiada para a área de transferência!", {
          position: "bottom-right",
          autoClose: 3000,
          transition: Slide,
        });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao copiar a URL.", { position: "bottom-right", autoClose: 3000, transition: Slide });
      }
    },
    [campaignSettings]
  );

  /** ---------- Add campaign / character ---------- */

  const handleAddCampaign = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const res = await fetch("/api/campanhas/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaignData),
      });
      if (res.ok) {
        setShowAddCampaignForm(false);
        toast.success("Campanha adicionada com sucesso!", {
          position: "bottom-right",
          autoClose: 3000,
          transition: Slide,
        });
        setNewCampaignData({ name: "", system: systemsData ? Object.keys(systemsData)[0] : "Ordem Paranormal" });
        mutate("/api/campanhas");
      } else {
        toast.error("Erro ao criar campanha.");
      }
    },
    [newCampaignData, systemsData]
  );

  // preview selected file
  useEffect(() => {
    if (!newCharacterFile) {
      setNewCharacterPreview(null);
      return;
    }
    const url = URL.createObjectURL(newCharacterFile);
    setNewCharacterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newCharacterFile]);

  const handleAddCharacter = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedCampaignId) return;

      const formData = new FormData();
      formData.append("name", newCharacterData.name);
      formData.append("color", newCharacterData.color);

      if (newCharacterFile) {
        formData.append("iconFile", newCharacterFile);
      }

      const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/add`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setShowAddCharacterForm(false);
        setNewCharacterData({ name: "", color: "#ff0000" });
        setNewCharacterFile(null);
        setNewCharacterPreview(null);
        toast.success("Personagem adicionado com sucesso!", { position: "bottom-right", autoClose: 2500 });
        mutate("/api/campanhas");
      } else {
        toast.error("Erro ao adicionar personagem.");
      }
    },
    [selectedCampaignId, newCharacterData, newCharacterFile]
  );

  /** ---------- JSX ---------- */

  if (error || systemsError)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        Falha ao carregar as campanhas ou sistemas.
      </div>
    );
  if (isLoading || systemsLoading)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        <svg
          className="text-gray-300 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24">
          <path
            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"></path>
          <path
            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-pink-500"></path>
        </svg>
        Carregando...
      </div>
    );
  if (!campanhas)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        Nenhuma campanha encontrada.
      </div>
    );
  if (!systemsData)
    return (
      <div className="w-full min-h-dvh bg-white flex items-center justify-center flex-col">
        Nenhum sistema encontrado.
      </div>
    );

  return (
    <div ref={wrapperRef} className="container min-h-dvh bg-[#FEF3F2] py-[5em] !px-[3.5em] max-md:!px-[2em]">
      <div className="flex justify-between items-center pb-[1.5em]  max-md:flex-col-reverse">
        <div
          className="text-2xl font-bold text-rose-700 pb-[0.5em] cursor-pointer flex gap-[0.35em]"
          onClick={() => setSelectedCampaignId(null)}>
          Dashboard
          <AnimatePresence>
            {selectedCampaignId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {`> ${selectedCampaign?.name}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-3xl font-bold text-gray-900 flex items-center gap-[0.5em]">
          <img src="logo.png" className="size-[2.5em]" alt="" />
          TTRPG OBS Overlay
        </div>
      </div>

      {selectedCampaignId ? (
        <div className="flex flex-col flex-wrap gap-[1em]">
          <div className="flex gap-[0.5em]">
            <button
              className="w-fit font-semibold bg-rose-700  px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
              onClick={() => setShowAddCharacterForm(true)}>
              + Novo Personagem
            </button>
            <button
              className="w-fit font-semibold outline-[0.15em] outline-rose-700 px-[1em] outline-offset-[-0.15em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
              onClick={() => setSelectedCampaignId(null)}>
              Voltar
            </button>
          </div>

          <div className="text font-medium pb-[0.5em]">Escolha o personagem:</div>

          <div className="flex gap-4 max-xs:justify-center">
            <div className="grid grid-cols-3 max-xs:grid-cols-1 max-2xl:grid-cols-2 gap-[2em] max-xl:text-[0.9em]">
              {selectedCampaign?.characters.length === 0 && (
                <div className="text-center">Nenhum personagem encontrado.</div>
              )}
              <AnimatePresence>
                {selectedCampaign?.characters.map((personagem) => (
                  <motion.div
                    key={personagem.id}
                    className="flex max-lg:flex-col max-lg:items-center max-lg:gap-[1em]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="flex flex-col items-center w-[9.5em] px-[1em] relative">
                      <img
                        src={personagem.icon}
                        alt={personagem.name}
                        className="size-[6.5em] aspect-square object-cover rounded-full select-none"
                        draggable={false}
                      />
                      <input
                        className="text-center font-bold text-2xl w-full focus:outline-none border-b-2 border-rose-700"
                        type="text"
                        value={personagem.name}
                        onChange={(e) => handleCharacterDataChange(e.target.value, personagem.id, "name")}
                        aria-label={`Nome ${personagem.name}`}
                      />

                      <div className="absolute left-[0] bottom-[2.5em] flex flex-col justify-between gap-[0.2em]">
                        <button
                          title="Copiar URL deste personagem"
                          className="font-bold  flex items-center justify-center rounded-full size-[1.80em] cursor-pointer  transition-all duration-200 bg-gray-700 hover:bg-gray-800 hover:size-[2.10em]"
                          onClick={() => handleCopyUrl(selectedCampaign!.id, personagem.id)}>
                          <img src="copy.png" alt="Copiar URL" className="size-[1em] object-cover" draggable={false} />
                        </button>

                        <button
                          title={personagem.visible ? "Esconder no overlay" : "Mostrar no overlay"}
                          className="font-bold  flex items-center justify-center rounded-full size-[1.80em] cursor-pointer transition-all duration-200 bg-gray-700 hover:bg-gray-800 hover:size-[2.10em]"
                          onClick={() => toggleCharacterVisibility(personagem.id)}>
                          <img
                            src={`${personagem.visible ? "show" : "hide"}.png`}
                            alt="Tornar Visível"
                            className="size-[1em] object-cover"
                            draggable={false}
                          />
                        </button>

                        <div
                          title="Alterar cor do personagem"
                          ref={personagem.id === visibleColorPickerId ? colorRef : null}
                          className="rounded-full size-[1.80em]transition-all duration-200 cursor-pointer size-[1.80em] z-0 border-[0.15em] hover:size-[2.10em]"
                          style={{ backgroundColor: personagem.color }}
                          onClick={() => {
                            setVisibleColorPickerId(personagem.id);
                          }}
                        />
                      </div>
                      <AnimatePresence>
                        {visibleColorPickerId === personagem.id && (
                          <motion.div
                            className="absolute z-0 right-[1em] bottom-[-1em]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}>
                            <Colorful
                              color={tempColor}
                              onChange={(color) => setTempColor(color.hex)}
                              disableAlpha={true}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  handleCharacterDataChange(tempColor, personagem.id, "color");
                                  setVisibleColorPickerId(null);
                                }}
                                className="w-full font-semibold bg-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]">
                                Salvar
                              </button>
                              <button
                                onClick={() => setVisibleColorPickerId(null)}
                                className="w-full font-semibold border-[0.15em] border-rose-700 bg-white px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]">
                                Cancelar
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-[0.5em]">
                      <div className="flex gap-[0.5em] relative max-xs:justify-center">
                        <div className="flex flex-col gap-[0.5em] max-sm:absolute max-sm:gap-[1.65em] max-sm:left-[50%] max-sm:translate-x-[-50%] max-sm:text-center max-sm:items-center">
                          {personagem.stats.map((stat) =>
                            stat.max !== undefined ? (
                              <div key={stat.name} className="w-fit font-bold max-lg:min-w-fit">
                                {stat.name}
                              </div>
                            ) : null
                          )}
                        </div>

                        <div className="flex flex-col gap-[0.5em] max-sm:gap-[1.55em] max-sm:pt-[1.55em]">
                          {personagem.stats.map((stat) =>
                            stat.max !== undefined ? (
                              <div
                                key={stat.name}
                                className="flex justify-between relative text-white bg-[#555555a2] rounded-[0.6em] py-[0.05em] w-[15em] px-[1.2em] z-0">
                                <motion.div
                                  className={`absolute rounded-[0.6em] h-full size-1.5 left-0 top-0 z-10 max-w-[100%]`}
                                  style={{
                                    width: `${(Number(stat.value) / Number(stat.max || 1)) * 100}%`,
                                    backgroundColor: stat.color || personagem.color,
                                  }}
                                  initial={false}
                                  animate={{ width: `${(Number(stat.value) / Number(stat.max || 1)) * 100}%` }}
                                />
                                <button
                                  type="button"
                                  className="z-20 cursor-pointer"
                                  onClick={() =>
                                    handleCharacterDataChange(
                                      Number(stat.value) - 1,
                                      personagem.id,
                                      "statValue",
                                      stat.name
                                    )
                                  }>
                                  <img
                                    src="arrow.png"
                                    className="size-[0.75em] object-contain"
                                    alt="Diminuir"
                                    draggable={false}
                                  />
                                </button>

                                <div className="flex font-semibold z-20">
                                  <input
                                    className="w-[3ch] text-center focus:outline-none bg-transparent"
                                    type="number"
                                    value={stat.value as number}
                                    onChange={(e) =>
                                      handleCharacterDataChange(
                                        e.target.value === "" ? 0 : parseInt(e.target.value),
                                        personagem.id,
                                        "statValue",
                                        stat.name
                                      )
                                    }
                                  />
                                  /
                                  <input
                                    className="w-[3ch] text-center focus:outline-none bg-transparent"
                                    type="number"
                                    value={stat.max}
                                    onChange={(e) =>
                                      handleCharacterDataChange(
                                        parseInt(e.target.value || "0"),
                                        personagem.id,
                                        "statMax",
                                        stat.name
                                      )
                                    }
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="z-20 cursor-pointer"
                                  onClick={() =>
                                    handleCharacterDataChange(
                                      Number(stat.value) + 1,
                                      personagem.id,
                                      "statValue",
                                      stat.name
                                    )
                                  }>
                                  <img
                                    src="arrow.png"
                                    className="size-[0.75em] object-contain rotate-180"
                                    alt="Aumentar"
                                    draggable={false}
                                  />
                                </button>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>

                      <div className="flex gap-x-[0.9em] flex-wrap">
                        {personagem.stats.map((stat) =>
                          stat.max === undefined ? (
                            <div key={stat.name} className="flex gap-[0.5em] items-center">
                              <div className="w-fit font-bold">{stat.name}</div>
                              {typeof stat.value === "number" && (
                                <input
                                  className="w-[3ch] text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
                                  type="number"
                                  value={stat.value as number}
                                  onChange={(e) =>
                                    handleCharacterDataChange(
                                      e.target.value === "" ? 0 : parseInt(e.target.value),
                                      personagem.id,
                                      "statValue",
                                      stat.name
                                    )
                                  }
                                />
                              )}
                              {typeof stat.value === "string" && (
                                <input
                                  className="w-[10ch] text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
                                  type="text"
                                  value={String(stat.value)}
                                  onChange={(e) =>
                                    handleCharacterDataChange(e.target.value, personagem.id, "statValue", stat.name)
                                  }
                                />
                              )}
                              {typeof stat.value === "boolean" && (
                                <input
                                  className="size-[1em] cursor-pointer"
                                  type="checkbox"
                                  checked={Boolean(stat.value)}
                                  onChange={(e) =>
                                    handleCharacterDataChange(e.target.checked, personagem.id, "statValue", stat.name)
                                  }
                                />
                              )}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        // Campaign list view
        <div className="flex flex-col flex-wrap gap-[1em]">
          <button
            className="w-fit font-semibold bg-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
            onClick={() => setShowAddCampaignForm(true)}>
            + Nova Campanha
          </button>
          <div className="font-medium pb-[0.5em]">Escolha a campanha:</div>
          <div className="grid max-sm:grid-cols-1 max-lg:grid-cols-2 max-xl:grid-cols-3 grid-cols-4 gap-4 w-full justify-center">
            {campanhas.length === 0 && <div className="text-center">Nenhuma campanha encontrada.</div>}
            <AnimatePresence>
              {campanhas
                .slice()
                .reverse()
                .map((campanha) => {
                  const systemDetails = systemsData?.[campanha.system];
                  return (
                    <motion.div
                      key={campanha.id}
                      className={`flex text-white rounded-[1.25em] flex-col items-center px-[1.75em] pt-[1.5em] pb-[1.5em]`}
                      style={
                        systemDetails
                          ? {
                              background: `linear-gradient(0deg, ${systemDetails.bg_from_color} 0%, ${systemDetails.bg_to_color} 100%)`,
                            }
                          : { background: `#CF5353` }
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}>
                      <img
                        src={systemDetails ? systemDetails.image_name : "generico.webp"}
                        className="w-[15em] h-[8em] object-contain"
                        alt={campanha.system}
                      />
                      <div className="text-2xl font-bold py-[0.5em]">{campanha.name}</div>
                      <div className="flex flex-col gap-[0.2em] w-full">
                        <div className="flex justify-between w-full">
                          <div className="font-bold">ID:</div>
                          {campanha.id}
                        </div>
                        <div className="flex justify-between w-full">
                          <div className="font-bold">Jogadores:</div>
                          {campanha.characters.length}
                        </div>

                        <div className="flex justify-between w-full">
                          <div className="font-bold">Criação:</div>
                          {campanha.date}
                        </div>
                      </div>
                      <div className="flex gap-[0.5em]">
                        <button
                          className="w-fit font-bold bg-white px-[1.2em] pt-[0.05em] pb-[0.15em] rounded-[0.75em] text-[#1E212F] cursor-pointer mt-4 transition-all duration-200 hover:bg-gray-300 "
                          onClick={() => setSelectedCampaignId(campanha.id)}>
                          Selecionar
                        </button>

                        <button
                          title="Copiar URL da campanha"
                          className="w-fit font-bold border-2 border-white p-[0.2em] rounded-[0.5em] text-[#1E212F] cursor-pointer mt-4 transition-all duration-200 hover:bg-gray-700"
                          onClick={() => {
                            handleCopyUrl(campanha.id);
                          }}>
                          <img className="size-[1.5em]" src="copy.png" alt="Copiar URL" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
          <ToastContainer />
        </div>
      )}

      <AnimatePresence>
        {showAddCharacterForm && selectedCampaignId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 z-50 w-full h-full bg-[#4608097e]">
            <form
              className="absolute top-[50%] left-[50%] w-[20em] translate-x-[-50%] translate-y-[-50%] z-60 flex flex-col gap-[1em] bg-white justify-center items-center px-[1.5em] py-[2em] rounded-[1.5em]"
              onSubmit={handleAddCharacter}>
              {newCharacterPreview ? (
                <img src={newCharacterPreview} className="size-[8em] object-cover rounded-full" alt="preview" />
              ) : (
                <img src="default-icon.png" className="size-[8em] object-cover rounded-full" alt="preview" />
              )}
              <div className="flex flex-col gap-[0.2em] w-full">
                Nome do personagem
                <input
                  className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                  type="text"
                  placeholder="Nome do personagem"
                  value={newCharacterData.name}
                  onChange={(e) => setNewCharacterData({ ...newCharacterData, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-[0.2em] w-full">
                Foto do personagem
                <input
                  className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setNewCharacterFile(e.target.files[0])}
                />
              </div>
              <div className="flex flex-col gap-[0.2em] items-center w-full">
                Cor do personagem
                <Colorful
                  color={newCharacterData.color}
                  onChange={(color) => setNewCharacterData({ ...newCharacterData, color: color.hex })}
                  disableAlpha={true}
                />
              </div>
              <div className="flex justify-between gap-[0.75em] w-full">
                <button
                  className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer  transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
                  type="submit">
                  Criar
                </button>
                <button
                  className="w-full font-semibold outline-[0.15em] outline-rose-700 px-[1em] outline-offset-[-0.15em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
                  type="button"
                  onClick={() => setShowAddCharacterForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCampaignForm && !selectedCampaignId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 z-10 w-full h-full bg-[#4608097e]">
            <form
              className="fixed top-[50%] left-[50%] w-[20em] translate-x-[-50%] translate-y-[-50%] z-20 flex flex-col gap-[1em] bg-white justify-center px-[1.5em] py-[2em] rounded-[1.5em]"
              onSubmit={handleAddCampaign}>
              <div className="flex flex-col gap-[0.2em]">
                Nome da campanha
                <input
                  className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                  type="text"
                  placeholder="Nome da Campanha"
                  value={newCampaignData.name}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-[0.2em]">
                Sistema
                <select
                  className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em] cursor-pointer"
                  value={newCampaignData.system}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, system: e.target.value })}
                  required>
                  {Object.keys(systemsData).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between gap-[0.75em]">
                <button
                  className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer  transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
                  type="submit">
                  Criar
                </button>
                <button
                  className="w-full font-semibold outline-[0.15em] outline-rose-700 px-[1em] outline-offset-[-0.15em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
                  type="button"
                  onClick={() => setShowAddCampaignForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
