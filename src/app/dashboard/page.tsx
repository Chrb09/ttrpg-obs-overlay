"use client";
import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

  // Função para lidar com a mudança dos dados do personagem
  const handleCharacterDataChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    charId: number,
    field: "name" | "icon" | "color" | "statValue" | "statMax",
    statName?: string
  ) => {
    const campanhaKey = "/api/campanhas";
    const updatedCampanhas = campanhas.map((campanha) => {
      if (campanha.id === selectedCampaignId) {
        const updatedCharacters = campanha.characters.map((char) => {
          if (char.id === charId) {
            if (field === "statValue" || field === "statMax") {
              const updatedStats = char.stats.map((stat) => {
                if (stat.name === statName) {
                  const newValue = parseInt(e.target.value);
                  return { ...stat, [field === "statValue" ? "value" : "max"]: isNaN(newValue) ? 0 : newValue };
                }
                return stat;
              });
              return { ...char, stats: updatedStats };
            } else {
              return { ...char, [field]: e.target.value };
            }
          }
          return char;
        });
        return { ...campanha, characters: updatedCharacters };
      }
      return campanha;
    });

    mutate(campanhaKey, updatedCampanhas, false);
  };

  // Função para salvar as alterações do personagem
  const handleSubmitCharacter = async (e: React.FormEvent<HTMLFormElement>, char: Character) => {
    e.preventDefault();

    if (!selectedCampaignId) return;

    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/${char.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(char),
    });

    if (!res.ok) {
      console.error("Erro ao atualizar o personagem.");
      mutate("/api/campanhas");
    }
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
          <h2>Adicionar Personagem a {selectedCampaign?.name}</h2>
          <form onSubmit={handleAddCharacter}>
            <input
              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
              type="text"
              placeholder="Nome do Personagem"
              value={newCharacterData.name}
              onChange={(e) => setNewCharacterData({ ...newCharacterData, name: e.target.value })}
              required
            />
            <input
              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
              type="text"
              placeholder="Caminho do Ícone"
              value={newCharacterData.icon}
              onChange={(e) => setNewCharacterData({ ...newCharacterData, icon: e.target.value })}
              required
            />
            <input
              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
              type="color"
              placeholder="Cor do Personagem"
              value={newCharacterData.color}
              onChange={(e) => setNewCharacterData({ ...newCharacterData, color: e.target.value })}
              required
            />
            <button className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer" type="submit">
              Criar Personagem
            </button>
            <button
              className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
              type="button"
              onClick={() => setShowAddCharacterForm(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
      {selectedCampaignId ? (
        <div>
          <h2 className="text-xl font-bold text-rose-900 pb-[0.5em]">Personagens de {selectedCampaign?.name}</h2>
          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
            onClick={() => setSelectedCampaignId(null)}>
            Voltar para Campanhas
          </button>
          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
            onClick={() => setShowAddCharacterForm(true)}>
            Adicionar Novo Personagem
          </button>
          <div className="py-6 flex flex-col gap-8">
            {selectedCampaign?.characters.map((personagem) => (
              <form
                key={personagem.id}
                onSubmit={(e) => handleSubmitCharacter(e, personagem)}
                className="p-4 border rounded-lg shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={personagem.icon}
                    alt={personagem.name}
                    className="size-20 aspect-square object-cover rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <label>
                        Nome:
                        <input
                          className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
                          type="text"
                          value={personagem.name}
                          onChange={(e) => handleCharacterDataChange(e, personagem.id, "name")}
                        />
                      </label>
                      <label>
                        Ícone (URL):
                        <input
                          className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
                          type="text"
                          value={personagem.icon}
                          onChange={(e) => handleCharacterDataChange(e, personagem.id, "icon")}
                        />
                      </label>
                      <label className="flex items-center">
                        Cor:
                        <input
                          className="w-8 h-8 rounded-full ml-2"
                          type="color"
                          value={personagem.color}
                          onChange={(e) => handleCharacterDataChange(e, personagem.id, "color")}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Stats:</h3>
                <div className="flex flex-col gap-2">
                  {personagem.stats.map((stat) => (
                    <div key={stat.name} className="flex gap-4 items-center">
                      <strong className="w-24">{stat.name}:</strong>
                      <div className="flex-1 flex gap-2">
                        <label>
                          Valor:
                          <input
                            className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl w-24"
                            type="number"
                            value={stat.value}
                            onChange={(e) => handleCharacterDataChange(e, personagem.id, "statValue", stat.name)}
                          />
                        </label>
                        {stat.max !== undefined && (
                          <label>
                            Máximo:
                            <input
                              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl w-24"
                              type="number"
                              value={stat.max}
                              onChange={(e) => handleCharacterDataChange(e, personagem.id, "statMax", stat.name)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer mt-4"
                  type="submit">
                  Salvar Alterações
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-wrap gap-[1em]">
          <button
            className="w-fit font-semibold bg-rose-700 px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer mt-4"
            onClick={() => setShowAddCampaignForm(true)}>
            + Nova Campanha
          </button>
          <div className="text-lg font-medium pb-[0.5em]">Escolha a campanha:</div>
          <div className="flex gap-4">
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
                    className="w-fit font-bold bg-white px-[1em] text-lg  pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-[#1E212F] cursor-pointer mt-4"
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
