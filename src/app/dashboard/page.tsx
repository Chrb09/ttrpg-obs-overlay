"use client";
import { Colorful } from "@uiw/react-color";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Stat {
  name: string;
  value: number;
  max?: number;
  color: string;
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

interface SystemData {
  [key: string]: {
    bg_from_color: string;
    bg_to_color: string;
    image_name: string;
    stats: any[];
  };
}

// Lista de sistemas fixos
const FIXED_SYSTEMS = ["Mythic Bastionland", "Ordem Paranormal", "Tormenta", "Daggerheart"];

export default function Dashboard() {
  const { data: campanhas, error, isLoading } = useSWR<Campanha[]>("/api/campanhas", fetcher);
  const { data: systemsData, isLoading: systemsLoading } = useSWR<SystemData>("/api/systems", fetcher);

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  // Dentro do seu componente Dashboard
  const [visibleColorPickerId, setVisibleColorPickerId] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState<string>("#ff0000"); // Estado para a cor temporária
  // ...

  const [showAddCampaignForm, setShowAddCampaignForm] = useState(false);
  const [showAddCharacterForm, setShowAddCharacterForm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ name: "", system: systemsData ? systemsData[0] : "" });
  const [newCharacterFile, setNewCharacterFile] = useState<File | null>(null);
  const [newCharacterData, setNewCharacterData] = useState({ name: "", color: "#ff0000" });
  const selectedCampaign = campanhas?.find((c) => c.id === selectedCampaignId) || null;

  // Dentro do seu componente Dashboard, logo abaixo dos `useState`
  useEffect(() => {
    if (visibleColorPickerId !== null) {
      // Encontre o personagem cujo color picker foi aberto
      const character = selectedCampaign?.characters.find((c) => c.id === visibleColorPickerId);
      if (character) {
        // Sincroniza a cor temporária com a cor original do personagem
        setTempColor(character.color);
      }
    }
  }, [visibleColorPickerId, selectedCampaign]);

  if (error || systemsLoading) return <div>Falha ao carregar as campanhas ou sistemas.</div>;
  if (isLoading || !systemsData) return <div>Carregando...</div>;
  if (!campanhas) return <div>Nenhuma campanha encontrada.</div>;

  const handleUpdateCharacter = async (updatedChar: Character) => {
    if (!selectedCampaignId) return;

    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/${updatedChar.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedChar),
    });

    if (!res.ok) {
      console.error("Erro ao atualizar o personagem.");
      mutate("/api/campanhas");
    }
  };

  // Dentro do seu componente Dashboard
  const handleCopyUrl = async (campaignId: string) => {
    const overlayUrl = `${window.location.origin}/overlay/${campaignId}`;

    try {
      await navigator.clipboard.writeText(overlayUrl);
      alert("URL copiada para a área de transferência!");
    } catch (err) {
      console.error("Falha ao copiar a URL: ", err);
      alert("Erro ao copiar a URL. Por favor, tente novamente.");
    }
  };

  const handleCharacterDataChange = async (
    newValue: any, // O novo valor (string ou número)
    charId: number,
    field: "name" | "color" | "statValue" | "statMax",
    statName?: string
  ) => {
    const campanhaKey = "/api/campanhas";
    let updatedChar: Character | null = null; // Crie uma variável para o personagem atualizado
    const updatedCampanhas = campanhas.map((campanha) => {
      if (campanha.id === selectedCampaignId) {
        const updatedCharacters = campanha.characters.map((char) => {
          if (char.id === charId) {
            if (field === "statValue" || field === "statMax") {
              // Lógica para stats
              const updatedStats = char.stats.map((stat) => {
                if (stat.name === statName) {
                  let valueToUpdate = newValue;
                  if (typeof stat.value === "number") {
                    valueToUpdate = newValue === "" ? 0 : parseInt(newValue);
                  }
                  return { ...stat, [field === "statValue" ? "value" : "max"]: valueToUpdate };
                }
                return stat;
              });
              updatedChar = { ...char, stats: updatedStats };
            } else {
              // Lógica para nome e cor
              updatedChar = { ...char, [field]: newValue };
            }
            return updatedChar;
          }
          return char;
        });
        return { ...campanha, characters: updatedCharacters };
      }
      return campanha;
    });

    // Aguarda a atualização no banco de dados antes de atualizar o cache local
    if (updatedChar) {
      await handleUpdateCharacter(updatedChar);
    }

    mutate(campanhaKey, updatedCampanhas, false);
  };

  const handleSelectCampaign = (campanha: Campanha) => {
    setSelectedCampaignId(campanha.id);
    setShowAddCharacterForm(false);
  };

  const handleAddCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/campanhas/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaignData),
    });

    if (res.ok) {
      setShowAddCampaignForm(false);
      setNewCampaignData({ name: "", system: FIXED_SYSTEMS[0] });
      mutate("/api/campanhas");
    }
  };

  const handleAddCharacter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCampaignId) return;

    const formData = new FormData();
    formData.append("name", newCharacterData.name);
    formData.append("color", newCharacterData.color);

    // Anexa o arquivo APENAS se o usuário tiver selecionado um
    if (newCharacterFile) {
      formData.append("iconFile", newCharacterFile);
    }

    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/add`, {
      method: "POST",
      body: formData, // Envia o FormData em vez de JSON.stringify
    });

    if (res.ok) {
      setShowAddCharacterForm(false);
      setNewCharacterData({ name: "", color: "#ff0000" });
      setNewCharacterFile(null); // Limpa o estado do arquivo
      mutate("/api/campanhas");
    } else {
      console.error("Erro ao adicionar personagem.");
    }
  };

  return (
    <div className="container min-h-dvh bg-[#FEF3F2] py-[5em] !px-[5em]">
      <div className="flex justify-between">
        <div
          className="text-2xl font-bold text-rose-700 pb-[0.5em] cursor-pointer"
          onClick={() => setSelectedCampaignId(null)}>
          Home {selectedCampaignId && <span> {`> ${selectedCampaign?.name}`}</span>}
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
              className="w-fit font-semibold outline-[0.15em] outline-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
              onClick={() => setSelectedCampaignId(null)}>
              Voltar
            </button>
          </div>
          <div className="text font-medium pb-[0.5em]">Escolha o personagem:</div>
          <div className="flex gap-4">
            <div className=" flex flex-wrap gap-[2em]">
              {selectedCampaign?.characters.map((personagem) => (
                <div key={personagem.id} className="flex">
                  <div className="flex flex-col items-center gap-[0.5em] w-[9.5em] px-[1em] relative">
                    <img
                      src={personagem.icon}
                      alt={personagem.name}
                      className="size-[7.5em] aspect-square object-cover rounded-full select-none"
                      draggable={false}
                    />
                    <input
                      className="text-center font-bold text-2xl w-full focus:outline-none border-b-2 border-rose-700"
                      type="text"
                      value={personagem.name}
                      onChange={(e) => handleCharacterDataChange(e.target.value, personagem.id, "name")}
                    />

                    <button
                      className="w-fit font-bold  p-[0.5em] rounded-full size-[2.5em] absolute cursor-pointer bottom-[2.5em] left-[1em] transition-all duration-200 bg-gray-700 hover:bg-gray-800"
                      onClick={() => handleCopyUrl(`${selectedCampaign.id}/${personagem.id}`)} // Chama a função com o ID da campanha
                    >
                      <img src="copy.png" alt="Copiar URL" className="w-full h-full object-cover" draggable={false} />
                    </button>

                    <div
                      className="rounded-full size-[2em] absolute bottom-[2.5em] right-[1em] cursor-pointer z-0 outline-2"
                      style={{ backgroundColor: personagem.color }}
                      onClick={() => {
                        setVisibleColorPickerId(personagem.id);
                      }}
                    />

                    {visibleColorPickerId === personagem.id && (
                      <div className="absolute z-0 right-[1em] bottom-[-1em]" onClick={(e) => e.stopPropagation()}>
                        <Colorful color={tempColor} onChange={(color) => setTempColor(color.hex)} disableAlpha={true} />
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
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-[0.5em]">
                    <div className="flex flex-col gap-2">
                      {personagem.stats.map((stat) => {
                        if (stat.max !== undefined) {
                          return (
                            <div key={stat.name} className="flex gap-[0.5em] items-center ">
                              <div className="min-w-[4.75em] w-fit font-bold">{stat.name}</div>
                              <div className="flex justify-between relative text-white bg-[#555555a2] rounded-[0.6em] py-[0.05em] w-[15em] px-[1.2em] z-0">
                                <div
                                  className={`absolute rounded-[0.6em] h-full size-1.5 left-0 top-0 z-10 max-w-[100%]`}
                                  style={{
                                    width: `${(stat.value / stat.max) * 100}%`,
                                    backgroundColor: stat.color,
                                  }}
                                />
                                <button
                                  type="button"
                                  className="z-20 cursor-pointer"
                                  onClick={() =>
                                    handleCharacterDataChange(stat.value - 1, personagem.id, "statValue", stat.name)
                                  }>
                                  <img
                                    src="arrow.png"
                                    className="size-[0.75em] object-contain"
                                    alt="Aumentar"
                                    draggable={false}
                                  />
                                </button>
                                <div className="flex font-semibold z-20">
                                  <input
                                    className="w-[3ch] text-center focus:outline-none bg-transparent"
                                    type="number"
                                    value={stat.value}
                                    onChange={(e) =>
                                      handleCharacterDataChange(e.target.value, personagem.id, "statValue", stat.name)
                                    }
                                  />
                                  /
                                  <input
                                    className="w-[3ch] text-center focus:outline-none bg-transparent"
                                    type="number"
                                    value={stat.max}
                                    onChange={(e) =>
                                      handleCharacterDataChange(e.target.value, personagem.id, "statMax", stat.name)
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="z-20 cursor-pointer"
                                  onClick={() =>
                                    handleCharacterDataChange(stat.value + 1, personagem.id, "statValue", stat.name)
                                  }>
                                  <img
                                    src="arrow.png"
                                    className="size-[0.75em] object-contain rotate-180"
                                    alt="Aumentar"
                                    draggable={false}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className="flex gap-2">
                      {personagem.stats.map((stat) => {
                        if (stat.max === undefined) {
                          return (
                            <div key={stat.name} className="flex gap-[0.5em] items-center">
                              <div className="w-fit font-bold">{stat.name}</div>
                              {typeof stat.value === "number" && (
                                <input
                                  className="w-[3ch] text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
                                  type="number"
                                  value={stat.value}
                                  onChange={(e) =>
                                    handleCharacterDataChange(e.target.value, personagem.id, "statValue", stat.name)
                                  }
                                />
                              )}
                              {typeof stat.value === "string" && (
                                <input
                                  className="w-[10ch] text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
                                  type="text"
                                  value={stat.value}
                                  onChange={(e) =>
                                    handleCharacterDataChange(e.target.value, personagem.id, "statValue", stat.name)
                                  }
                                />
                              )}
                              {typeof stat.value === "boolean" && (
                                <input
                                  className="size-4 cursor-pointer"
                                  type="checkbox"
                                  checked={stat.value}
                                  onChange={(e) =>
                                    handleCharacterDataChange(e.target.checked, personagem.id, "statValue", stat.name)
                                  }
                                />
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
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-wrap gap-[1em]">
          <button
            className="w-fit font-semibold bg-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
            onClick={() => setShowAddCampaignForm(true)}>
            + Nova Campanha
          </button>
          <div className="font-medium pb-[0.5em]">Escolha a campanha:</div>
          <div className="flex flex-wrap gap-4">
            {campanhas.map((campanha) => {
              const systemDetails = systemsData?.[campanha.system];
              return (
                <div
                  key={campanha.id}
                  className={`flex text-white rounded-[1.25em] flex-col items-center px-[1.75em] pt-[1.5em] pb-[1.5em]`}
                  style={
                    systemDetails
                      ? {
                          background: `linear-gradient(0deg, ${systemDetails.bg_from_color} 0%, ${systemDetails.bg_to_color} 100%)`,
                        }
                      : {
                          background: `linear-gradient(0deg, #621333) 0%,  #CF5353 100%)`,
                        }
                  }>
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
                      className="w-fit font-bold bg-white px-[1.2em] pt-[0.15em] pb-[0.25em] rounded-[1em] text-[#1E212F] cursor-pointer mt-4 transition-all duration-200 hover:bg-gray-300 "
                      onClick={() => handleSelectCampaign(campanha)}>
                      Selecionar
                    </button>
                    <button
                      className="w-fit font-bold border-2 border-white p-[0.2em] rounded-[0.5em] text-[#1E212F] cursor-pointer mt-4 transition-all duration-200 hover:bg-gray-700"
                      onClick={() => handleCopyUrl(campanha.id.toString())} // Chama a função com o ID da campanha
                    >
                      <img src="copy.png" alt="Copiar URL" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <AnimatePresence>
        {showAddCampaignForm && !selectedCampaignId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="absolute top-0 left-0 z-10 w-full h-full bg-[#4608097e]" />
            <form
              className="absolute top-[50%] left-[50%] w-[20em] translate-x-[-50%] translate-y-[-50%] z-20 flex flex-col gap-[1em] bg-white justify-center px-[1.5em] py-[2em] rounded-[1.5em]"
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
                  value={newCampaignData.name}
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
                  className="w-full font-semibold outline-[0.15em] outline-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
                  type="button"
                  onClick={() => setShowAddCampaignForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCharacterForm && selectedCampaignId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="absolute top-0 left-0 z-50 w-full h-full bg-[#4608097e]" />
            <form
              className="absolute top-[50%] left-[50%] w-[20em] translate-x-[-50%] translate-y-[-50%] z-60 flex flex-col gap-[1em] bg-white justify-center px-[1.5em] py-[2em] rounded-[1.5em]"
              onSubmit={handleAddCharacter}>
              <div className="flex flex-col gap-[0.2em]">
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
              <div className="flex flex-col gap-[0.2em]">
                Foto do personagem
                <input
                  className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setNewCharacterFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-[0.2em]">
                Cor do personagem
                <Colorful
                  color={newCharacterData.color}
                  onChange={(color) => setNewCharacterData({ ...newCharacterData, color: color.hex })}
                  disableAlpha={true}
                />
              </div>
              <div className="flex justify-between gap-[0.75em]">
                <button
                  className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer  transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]"
                  type="submit">
                  Criar
                </button>
                <button
                  className="w-full font-semibold outline-[0.15em] outline-rose-700 px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-rose-700 cursor-pointer transition-all duration-200 hover:bg-rose-700 hover:text-white hover:translate-y-[-0.1em]"
                  type="button"
                  onClick={() => setShowAddCharacterForm(false)}>
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
