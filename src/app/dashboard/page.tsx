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
  stats: Stat[];
}

interface Campanha {
  id: number;
  name: string;
  system: string;
  characters: Character[];
}

// Lista de sistemas fixos
const FIXED_SYSTEMS = ["Mythic Bastionland", "Ordem Paranormal", "Tormenta"];

export default function Dashboard() {
  const { data: campanhas, error, isLoading } = useSWR<Campanha[]>("/api/campanhas", fetcher);

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  // Estados para os novos formulários
  const [showAddCampaignForm, setShowAddCampaignForm] = useState(false);
  const [showAddCharacterForm, setShowAddCharacterForm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ name: "", system: FIXED_SYSTEMS[0] });
  const [newCharacterData, setNewCharacterData] = useState({ name: "", icon: "" });

  const [characterStats, setCharacterStats] = useState<Stat[]>([]);

  const selectedCampaign = campanhas?.find((c) => c.id === selectedCampaignId) || null;
  const selectedCharacter = selectedCampaign?.characters.find((char) => char.id === selectedCharacterId) || null;

  useEffect(() => {
    if (selectedCharacter) {
      setCharacterStats(selectedCharacter.stats);
    }
  }, [selectedCharacter]);

  if (error) return <div>Falha ao carregar as campanhas.</div>;
  if (isLoading) return <div>Carregando campanhas...</div>;
  if (!campanhas) return <div>Nenhuma campanha encontrada.</div>;

  const handleSelectCampaign = (campanha: Campanha) => {
    setSelectedCampaignId(campanha.id);
    setSelectedCharacterId(null);
    setShowAddCharacterForm(false);
  };

  const handleSelectCharacter = (personagem: Character) => {
    setSelectedCharacterId(personagem.id);
  };

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>, statName: string, field: "value" | "max") => {
    const newValue = parseInt(e.target.value);
    setCharacterStats(
      characterStats.map((stat) =>
        stat.name === statName ? { ...stat, [field]: isNaN(newValue) ? 0 : newValue } : stat
      )
    );
  };

  const handleSubmitStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCampaignId || !selectedCharacterId) return;

    const key = "/api/campanhas";

    const updatedCampanhas = campanhas.map((c) => {
      if (c.id === selectedCampaignId) {
        const updatedCharacters = c.characters.map((char) => {
          if (char.id === selectedCharacterId) {
            return { ...char, stats: characterStats };
          }
          return char;
        });
        return { ...c, characters: updatedCharacters };
      }
      return c;
    });

    mutate(key, updatedCampanhas, false);
    setSelectedCharacterId(null);

    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/${selectedCharacterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats: characterStats }),
    });

    if (!res.ok) {
      console.error("Erro ao atualizar os stats.");
      mutate(key);
    }
  };

  const handleAddCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/campanhas/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaignData),
    });

    if (res.ok) {
      console.log("Campanha adicionada com sucesso!");
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
      console.log("Personagem adicionado com sucesso!");
      setShowAddCharacterForm(false);
      setNewCharacterData({ name: "", icon: "" });
      mutate("/api/campanhas");
    }
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-rose-900 pb-[0.5em]">Dashboard</h1>

      {/* Lógica para renderizar o formulário de adicionar campanha */}
      {showAddCampaignForm ? (
        <div>
          <h2>Adicionar Nova Campanha</h2>
          <form onSubmit={handleAddCampaign}>
            <input
              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
              type="text"
              placeholder="Nome da Campanha"
              value={newCampaignData.name}
              onChange={(e) => setNewCampaignData({ ...newCampaignData, name: e.target.value })}
              required
            />
            <select
              className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
              value={newCampaignData.system}
              onChange={(e) => setNewCampaignData({ ...newCampaignData, system: e.target.value })}>
              {FIXED_SYSTEMS.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
            <button className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer" type="submit">
              Criar
            </button>
            <button
              className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
              type="button"
              onClick={() => setShowAddCampaignForm(false)}>
              Cancelar
            </button>
          </form>
        </div>
      ) : selectedCharacterId ? (
        /* Lógica para renderizar o formulário de edição de stats */
        <div>
          <h2 className="text-xl font-bold text-rose-900 pb-[0.5em]">Editando Stats de {selectedCharacter?.name}</h2>
          <form onSubmit={handleSubmitStats}>
            {characterStats.map((stat) => (
              <div key={stat.name}>
                <strong>{stat.name}</strong>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label htmlFor={`${stat.name}-value`}>Valor:</label>
                    <input
                      className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
                      type="number"
                      id={`${stat.name}-value`}
                      name={`${stat.name}-value`}
                      value={stat.value}
                      onChange={(e) => handleStatChange(e, stat.name, "value")}
                      max={stat.max}
                    />
                  </div>
                  {stat.max !== undefined && (
                    <div className="flex gap-2">
                      <label htmlFor={`${stat.name}-max`}>Máximo:</label>
                      <input
                        className="border-rose-900 py-[0.1em] px-[0.5em] mx-[0.5em] border-[0.15em] rounded-2xl"
                        type="number"
                        id={`${stat.name}-max`}
                        name={`${stat.name}-max`}
                        value={stat.max}
                        onChange={(e) => handleStatChange(e, stat.name, "max")}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer" type="submit">
              Salvar Stats
            </button>
            <button
              className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
              type="button"
              onClick={() => setSelectedCharacterId(null)}>
              Voltar
            </button>
          </form>
        </div>
      ) : showAddCharacterForm ? (
        /* Lógica para renderizar o formulário de adicionar personagem */
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
              placeholder="Caminho do Ícone (ex: /1/heroi.jpg)"
              value={newCharacterData.icon}
              onChange={(e) => setNewCharacterData({ ...newCharacterData, icon: e.target.value })}
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
      ) : selectedCampaignId ? (
        /* Lógica para renderizar a lista de personagens */
        <div>
          <h2 className="text-xl font-bold text-rose-900 pb-[0.5em]">Personagens de {selectedCampaign?.name}</h2>
          <div className="py-6">
            {selectedCampaign?.characters.map((personagem) => (
              <div className="flex flex-col" key={personagem.id}>
                {personagem.name}
                <button
                  className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
                  onClick={() => handleSelectCharacter(personagem)}>
                  Editar
                </button>
              </div>
            ))}
          </div>
          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
            onClick={() => setSelectedCampaignId(null)}>
            Voltar
          </button>
          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
            onClick={() => setShowAddCharacterForm(true)}>
            Adicionar Novo Personagem
          </button>
        </div>
      ) : (
        /* Lógica para renderizar a lista de campanhas */
        <div>
          <div className="text-xl font-bold pb-[0.5em]">Escolha a campanha:</div>
          <div className="flex gap-4">
            {campanhas.map((campanha) => (
              <div key={campanha.id} className="flex flex-col items-center">
                {campanha.system === "Ordem Paranormal" && (
                  <img src="ordem.png" className="size-26 rounded-full aspect-square object-contain bg-red-950" />
                )}
                {campanha.system === "Mythic Bastionland" && (
                  <img src="mythic.png" className="size-26 rounded-full aspect-square object-contain bg-[#1E282F]" />
                )}
                {campanha.system === "Tormenta" && (
                  <img src="tormenta.webp" className="size-26 rounded-full aspect-square object-contain bg-[#1E282F]" />
                )}
                <div className="text-lg font-bold">{campanha.name}</div>
                <button
                  className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
                  onClick={() => handleSelectCampaign(campanha)}>
                  Selecionar
                </button>
              </div>
            ))}
          </div>
          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer mt-4"
            onClick={() => setShowAddCampaignForm(true)}>
            Adicionar Nova Campanha
          </button>
        </div>
      )}
    </div>
  );
}
