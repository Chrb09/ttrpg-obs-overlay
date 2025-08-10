// pages/dashboard.tsx
import React, { useState } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interfaces atualizadas para refletir a estrutura do JSON
interface Stat {
  name: string;
  value: number;
  min: number;
  max: number;
}

interface Character {
  id: number;
  name: string;
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
  const [selectedCampaign, setSelectedCampaign] = useState<Campanha | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Estado para o formulário de stats
  const [characterStats, setCharacterStats] = useState<Stat[]>([]);

  if (error) return <div>Falha ao carregar as campanhas.</div>;
  if (isLoading) return <div>Carregando campanhas...</div>;
  if (!campanhas) return <div>Nenhuma campanha encontrada.</div>;

  // Função para selecionar uma campanha
  const handleSelectCampaign = (campanha: Campanha) => {
    setSelectedCampaign(campanha);
    setSelectedCharacter(null); // Limpa o personagem quando a campanha muda
  };

  // Função para selecionar um personagem
  const handleSelectCharacter = (personagem: Character) => {
    setSelectedCharacter(personagem);
    // Preenche o estado do formulário com os stats do personagem
    setCharacterStats(personagem.stats);
  };

  // Função para lidar com a mudança nos inputs de stats
  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>, statName: string) => {
    const newValue = parseInt(e.target.value);
    setCharacterStats(
      characterStats.map((stat) => (stat.name === statName ? { ...stat, value: isNaN(newValue) ? 0 : newValue } : stat))
    );
  };

  // Função para enviar os stats atualizados
  const handleSubmitStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCampaign || !selectedCharacter) return;

    const res = await fetch(`/api/campanhas/${selectedCampaign.id}/personagens/${selectedCharacter.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats: characterStats }),
    });

    if (res.ok) {
      console.log("Stats do personagem atualizados com sucesso!");
      setSelectedCharacter(null); // Limpa o formulário após salvar
      // 'mutate' força o SWR a buscar a lista de campanhas novamente
      mutate("/api/campanhas");
    } else {
      console.error("Erro ao atualizar os stats.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard de Campanhas</h1>
      <hr />

      {/* Lista de Campanhas */}
      <div>
        <h2>Campanhas</h2>
        <ul>
          {campanhas.map((campanha) => (
            <li key={campanha.id} style={{ marginBottom: "10px" }}>
              {campanha.name} ({campanha.system})
              <button onClick={() => handleSelectCampaign(campanha)} style={{ marginLeft: "10px" }}>
                Selecionar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Seção de Personagens */}
      {selectedCampaign && (
        <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Personagens de {selectedCampaign.name}</h2>
          <ul>
            {selectedCampaign.characters.map((personagem) => (
              <li key={personagem.id}>
                {personagem.name}
                <button onClick={() => handleSelectCharacter(personagem)} style={{ marginLeft: "10px" }}>
                  Editar Stats
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulário de Edição de Stats */}
      {selectedCharacter && (
        <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Editando Stats de {selectedCharacter.name}</h2>
          <form onSubmit={handleSubmitStats}>
            {characterStats.map((stat) => (
              <div key={stat.name} style={{ marginBottom: "10px" }}>
                <label htmlFor={stat.name}>{stat.name}:</label>
                <input
                  type="number"
                  id={stat.name}
                  name={stat.name}
                  value={stat.value}
                  min={stat.min}
                  max={stat.max}
                  onChange={(e) => handleStatChange(e, stat.name)}
                />
              </div>
            ))}
            <button type="submit">Salvar Stats</button>
            <button type="button" onClick={() => setSelectedCharacter(null)} style={{ marginLeft: "10px" }}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
