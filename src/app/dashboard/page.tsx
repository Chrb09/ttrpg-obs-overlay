"use client";
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

// Lista de sistemas fixos
const FIXED_SYSTEMS = ["Mythic Bastionland", "Ordem Paranormal", "Tormenta"];

export default function Dashboard() {
  const { data: campanhas, error, isLoading } = useSWR<Campanha[]>("/api/campanhas", fetcher);

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const [showAddCampaignForm, setShowAddCampaignForm] = useState(false);
  const [showAddCharacterForm, setShowAddCharacterForm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ name: "", system: FIXED_SYSTEMS[0] });
  const [newCharacterData, setNewCharacterData] = useState({ name: "", icon: "", color: "#ffffff" });

  const selectedCampaign = campanhas?.find((c) => c.id === selectedCampaignId) || null;

  if (error) return <div>Falha ao carregar as campanhas.</div>;
  if (isLoading) return <div>Carregando campanhas...</div>;
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

  const handleCharacterDataChange = async (
    newValue: any, // O novo valor (string ou número)
    charId: number,
    field: "name" | "icon" | "color" | "statValue" | "statMax",
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
              // Lógica para nome, ícone e cor
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

    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCharacterData),
    });

    if (res.ok) {
      setShowAddCharacterForm(false);
      setNewCharacterData({ name: "", icon: "", color: "#ffffff" });
      mutate("/api/campanhas");
    }
  };

  return (
    <div className="container min-h-dvh bg-[#FEF3F2] py-[5em] !px-[5em]">
      <div className="flex justify-between">
        <div className="text-2xl font-bold text-rose-700 pb-[0.5em]">Home</div>
        <div className="text-3xl font-bold text-rose-700">TTRPG OBS Overlay</div>
      </div>
      {showAddCampaignForm && !selectedCampaignId && (
        <div>
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
                className="w-full border-rose-700 border-[0.15em] py-[0.45em] px-[0.5em] rounded-[0.85em]"
                value={newCampaignData.system}
                onChange={(e) => setNewCampaignData({ ...newCampaignData, system: e.target.value })}>
                {FIXED_SYSTEMS.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between gap-[0.75em]">
              <button
                className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
                type="submit">
                Criar
              </button>
              <button
                className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
                type="button"
                onClick={() => setShowAddCampaignForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddCharacterForm && selectedCampaignId && (
        <div>
          <div className="absolute top-0 left-0 z-10 w-full h-full bg-[#4608097e]" />
          <form
            className="absolute top-[50%] left-[50%] w-[20em] translate-x-[-50%] translate-y-[-50%] z-20 flex flex-col gap-[1em] bg-white justify-center px-[1.5em] py-[2em] rounded-[1.5em]"
            onSubmit={handleAddCharacter}>
            <div className="flex flex-col gap-[0.2em]">
              Nome do personagem
              <input
                className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                type="text"
                placeholder="Nome da Campanha"
                value={newCharacterData.name}
                onChange={(e) => setNewCharacterData({ ...newCharacterData, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-[0.2em]">
              Foto do personagem
              <input
                className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                type="text"
                placeholder="Caminho do Ícone"
                value={newCharacterData.icon}
                onChange={(e) => setNewCharacterData({ ...newCharacterData, icon: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-[0.2em]">
              Cor do personagem
              <input
                className="w-full border-rose-700 border-[0.15em] py-[0.35em] px-[0.5em] rounded-[0.85em]"
                type="color"
                placeholder="Cor do Personagem"
                value={newCharacterData.color}
                onChange={(e) => setNewCharacterData({ ...newCharacterData, color: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-between gap-[0.75em]">
              <button
                className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
                type="submit">
                Criar
              </button>
              <button
                className="w-full font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
                type="button"
                onClick={() => setShowAddCharacterForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedCampaignId ? (
        <div className="flex flex-col flex-wrap gap-[1em]">
          <div className="flex gap-[0.5em]">
            <button
              className="w-fit font-semibold bg-rose-700 px-[1em]   pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
              onClick={() => setShowAddCharacterForm(true)}>
              + Novo Personagem
            </button>
            <button
              className="w-fit font-semibold bg-rose-700 px-[1em]   pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
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
                      className="size-[7.5em] aspect-square object-cover rounded-full"
                    />
                    <input
                      className="text-center font-bold text-2xl w-full focus:outline-none"
                      type="text"
                      value={personagem.name}
                      onChange={(e) => handleCharacterDataChange(e.target.value, personagem.id, "name")}
                      disabled
                    />

                    <input
                      className="text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
                      type="text"
                      value={personagem.color}
                      onChange={(e) => handleCharacterDataChange(e.target.value, personagem.id, "color")}
                      hidden
                    />

                    <input
                      type="text"
                      value={personagem.icon}
                      onChange={(e) => handleCharacterDataChange(e.target.value, personagem.id, "icon")}
                      hidden
                    />
                  </div>
                  <div className="flex flex-col gap-[0.5em]">
                    <div className="flex flex-col gap-2">
                      {personagem.stats.map((stat) => {
                        if (stat.max !== undefined) {
                          return (
                            <div key={stat.name} className="flex gap-[0.5em] items-center ">
                              <div className="min-w-[4em] w-fit font-bold">{stat.name}</div>
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
                                  -
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
                                  +
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
                                  className="text-center font-bold text-gray-600 border-b-2 border-rose-700 focus:outline-none"
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
            className="w-fit font-semibold bg-rose-700 px-[1em]   pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
            onClick={() => setShowAddCampaignForm(true)}>
            + Nova Campanha
          </button>
          <div className="font-medium pb-[0.5em]">Escolha a campanha:</div>
          <div className="flex flex-wrap gap-4">
            {campanhas.map((campanha) => (
              <div
                key={campanha.id}
                className={`flex text-white rounded-[1.25em] flex-col items-center px-[1.75em] pt-[1.5em] pb-[1.5em] ${
                  campanha.system == "Ordem Paranormal"
                    ? "bg-linear-to-t from-[#2C2D88] to-[#431A4B]"
                    : campanha.system == "Mythic Bastionland"
                    ? "bg-linear-to-t from-[#246569] to-[#1E212F]"
                    : campanha.system == "Tormenta"
                    ? "bg-linear-to-t from-[#A62124] to-[#460809]"
                    : "bg-[#000000]"
                }`}>
                <img
                  src={
                    campanha.system == "Ordem Paranormal"
                      ? "ordem.png"
                      : campanha.system == "Mythic Bastionland"
                      ? "mythic.png"
                      : campanha.system == "Tormenta"
                      ? "tormenta.webp"
                      : "generico.png"
                  }
                  className="w-[15em] h-[8em] object-contain"
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
                    className="w-fit font-bold bg-white px-[1.2em] pt-[0.15em] pb-[0.25em] rounded-[1em] text-[#1E212F] cursor-pointer mt-4"
                    onClick={() => handleSelectCampaign(campanha)}>
                    Selecionar
                  </button>
                  <button className="w-fit font-bold border-2 border-white  p-[0.2em] rounded-[0.5em] text-[#1E212F] cursor-pointer mt-4">
                    <img src="copy.png" alt="" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
