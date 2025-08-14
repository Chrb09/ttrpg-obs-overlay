// pages/api/campanhas/[id]/personagens/add.tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id: campaignId } = req.query;
  const { name, icon, color } = req.body;
  const filePath = path.join(process.cwd(), "data.json");
  const systemsPath = path.join(process.cwd(), "systems.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    // Encontra a campanha
    const campanhaIndex = campanhas.findIndex((c: any) => c.id === parseInt(campaignId));
    if (campanhaIndex === -1) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    const campanha = campanhas[campanhaIndex];

    // Carrega a base de stats do sistema
    const systemsData = await fs.readFile(systemsPath, "utf-8");
    const systems = JSON.parse(systemsData);
    const baseStats = systems[campanha.system]?.stats || [];

    // Gerar novo ID para o personagem
    const newCharId = campanha.characters.length > 0 ? Math.max(...campanha.characters.map((c: any) => c.id)) + 1 : 1;

    const newCharacter = {
      id: newCharId,
      name,
      icon,
      color,
      stats: baseStats,
    };

    campanha.characters.push(newCharacter);

    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(201).json({ message: "Personagem adicionado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao adicionar personagem", error });
  }
}
