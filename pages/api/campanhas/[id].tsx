// pages/api/campanhas/[id].tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id } = req.query; // Pega o ID da URL
  const filePath = path.join(process.cwd(), "data.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    // Encontra a campanha pelo ID. Note que o ID do req.query é uma string.
    const campanha = campanhas.find((c: any) => c.id === parseInt(id));

    if (!campanha) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    return res.status(200).json(campanha);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar a campanha", error });
  }
}
