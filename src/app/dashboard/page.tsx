"use client";
import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Stat {
  name: string;
  value: number;
  max: number;
  barColor: string;
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

export default function Dashboard() {
  const { data: campanhas, error, isLoading } = useSWR<Campanha[]>("/api/campanhas", fetcher);

  // Agora guardamos apenas os IDs no estado
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  const [characterStats, setCharacterStats] = useState<Stat[]>([]);

  // O componente sempre obtém a campanha e o personagem mais recentes do cache SWR
  const selectedCampaign = campanhas?.find((c) => c.id === selectedCampaignId) || null;
  const selectedCharacter = selectedCampaign?.characters.find((char) => char.id === selectedCharacterId) || null;

  // Usa useEffect para atualizar o estado do formulário sempre que o personagem selecionado mudar
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

    // Constrói o novo objeto de dados para o cache SWR
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

    // Atualiza o cache do SWR imediatamente
    mutate(key, updatedCampanhas, false);

    // Envia a requisição PUT para a API em segundo plano
    const res = await fetch(`/api/campanhas/${selectedCampaignId}/personagens/${selectedCharacterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats: characterStats }),
    });

    if (!res.ok) {
      console.error("Erro ao atualizar os stats.");
      // Se a requisição falhar, SWR revalida e reverte a UI para o estado anterior
      mutate(key);
    }
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-rose-900 pb-[0.5em]">Dashboard de Campanhas</h1>

      {/* Seção de Personagens */}
      {selectedCampaign ? (
        <div>
          <h2>Personagens de {selectedCampaign.name}</h2>
          <ul>
            {selectedCampaign.characters.map((personagem) => (
              <li key={personagem.id}>
                {personagem.name}
                <button onClick={() => handleSelectCharacter(personagem)}>Editar Stats</button>
              </li>
            ))}
          </ul>

          <button
            className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
            onClick={() => setSelectedCampaignId(null)}>
            Voltar
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xl font-bold  pb-[0.5em]">Escolha a campanha:</div>
          <div className="flex gap-4">
            {campanhas.map((campanha) => (
              <div key={campanha.id} className="flex flex-col items-center">
                {campanha.system == "Ordem Paranormal" ? (
                  <img src="ordem.png" className="size-26 rounded-full aspect-square object-contain bg-red-950" />
                ) : null}
                {campanha.system == "Mythic Bastionland" ? (
                  <img src="ordem.png" className="size-26 rounded-full aspect-square object-contain bg-blue-950" />
                ) : null}
                <div className="text-lg font-bold">{campanha.name}</div>
                <button
                  className="w-fit bg-rose-900 px-3 py-1 rounded-2xl text-white cursor-pointer"
                  onClick={() => handleSelectCampaign(campanha)}>
                  Selecionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Edição de Stats */}
      {selectedCharacter && (
        <div>
          <h2>Editando Stats de {selectedCharacter.name}</h2>
          <form onSubmit={handleSubmitStats}>
            {characterStats.map((stat) => (
              <div key={stat.name}>
                <strong>{stat.name}</strong>
                <div>
                  <div>
                    <label htmlFor={`${stat.name}-value`}>Valor:</label>
                    <input
                      type="number"
                      id={`${stat.name}-value`}
                      name={`${stat.name}-value`}
                      value={stat.value}
                      onChange={(e) => handleStatChange(e, stat.name, "value")}
                      max={stat.max}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${stat.name}-max`}>Máximo:</label>
                    <input
                      type="number"
                      id={`${stat.name}-max`}
                      name={`${stat.name}-max`}
                      value={stat.max}
                      onChange={(e) => handleStatChange(e, stat.name, "max")}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="submit">Salvar Stats</button>
            <button type="button" onClick={() => setSelectedCharacterId(null)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
