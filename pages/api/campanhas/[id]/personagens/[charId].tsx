// pages/api/campanhas/[id]/personagens/[charId].tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id: campaignId, charId } = req.query;
  const updatedData = req.body; // Pega o objeto completo com todos os dados atualizados

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

    // Pega o personagem atual
    const personagemExistente = campanhas[campanhaIndex].characters[personagemIndex];

    // Atualiza o personagem combinando os dados existentes com os novos dados
    const personagemAtualizado = {
      ...personagemExistente,
      ...updatedData, // Sobrescreve as propriedades com os dados da requisição
      id: personagemExistente.id, // Garante que o ID não seja alterado
    };

    campanhas[campanhaIndex].characters[personagemIndex] = personagemAtualizado;

    // Salva as mudanças no arquivo JSON
    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(200).json({ message: "Personagem atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar o personagem", error });
  }
}
