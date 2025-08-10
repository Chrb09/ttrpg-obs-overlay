// pages/api/campanhas/[id]/personagens/[charId].tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id: campaignId, charId } = req.query; // Pega o ID da campanha e do personagem
  const { stats } = req.body; // Pega o array de stats atualizado do corpo da requisição

  const filePath = path.join(process.cwd(), "data.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    // Encontra a campanha
    const campanhaIndex = campanhas.findIndex((c: any) => c.id === parseInt(campaignId));
    if (campanhaIndex === -1) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    // Encontra o personagem
    const personagemIndex = campanhas[campanhaIndex].characters.findIndex((char: any) => char.id === parseInt(charId));
    if (personagemIndex === -1) {
      return res.status(404).json({ message: "Personagem não encontrado" });
    }

    // Atualiza os stats do personagem
    const personagemAtualizado = {
      ...campanhas[campanhaIndex].characters[personagemIndex],
      stats: stats, // Substitui o array de stats pelo novo
    };

    campanhas[campanhaIndex].characters[personagemIndex] = personagemAtualizado;

    // Salva as mudanças no arquivo JSON
    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(200).json({ message: "Stats do personagem atualizados com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar stats do personagem", error });
  }
}
