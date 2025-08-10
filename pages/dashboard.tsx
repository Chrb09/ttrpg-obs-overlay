// pages/dashboard.tsx
import React, { useState } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Campanha {
  id: string;
  name: string;
  system: string;
}

export default function Dashboard() {
  const { data, error, isLoading } = useSWR("/api/campanhas", fetcher);
  const [selectedCampaign, setSelectedCampaign] = useState<Campanha | null>(null);
  const [formData, setFormData] = useState({ id: "", name: "", system: "" });

  if (error) return <div>Falha ao carregar as campanhas.</div>;
  if (isLoading) return <div>Carregando campanhas...</div>;
  if (!data) return <div>Nenhuma campanha encontrada.</div>;

  // Função para pré-preencher o formulário
  const handleSelectCampaign = (campanha: Campanha) => {
    setSelectedCampaign(campanha);
    setFormData({ id: campanha.id, name: campanha.name, system: campanha.system });
  };

  // Função para controlar a mudança nos inputs do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para enviar os dados atualizados
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/campanhas/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      console.log("Campanha atualizada com sucesso!");
      setSelectedCampaign(null); // Limpa o formulário
      // 'mutate' força o SWR a buscar a lista novamente, atualizando a dashboard em tempo real!
      mutate("/api/campanhas");
    } else {
      console.error("Erro ao atualizar a campanha.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard de Campanhas</h1>
      <hr />

      {/* Lista de Campanhas */}
      <div>
        <h2>Lista de Campanhas</h2>
        <ul>
          {data.map((campanha: Campanha) => (
            <li key={campanha.id} style={{ marginBottom: "10px" }}>
              {campanha.name} ({campanha.system})
              <button onClick={() => handleSelectCampaign(campanha)} style={{ marginLeft: "10px" }}>
                Editar
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Formulário de Edição */}
      {selectedCampaign && (
        <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Editar {selectedCampaign.name}</h2>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={formData.id} />

            <div style={{ marginBottom: "10px" }}>
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label htmlFor="system">Sistema:</label>
              <input type="text" id="system" name="system" value={formData.system} onChange={handleChange} />
            </div>

            <button type="submit">Salvar Alterações</button>
            <button type="button" onClick={() => setSelectedCampaign(null)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
