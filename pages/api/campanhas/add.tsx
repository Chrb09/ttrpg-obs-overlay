// pages/api/campanhas/add.tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { name, system } = req.body;
  const filePath = path.join(process.cwd(), "data.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    // Gerar um novo ID (simplesmente o próximo número)
    const newId = campanhas.length > 0 ? Math.max(...campanhas.map((c: any) => c.id)) + 1 : 1;

    const newCampanha = {
      id: newId,
      name,
      system,
      characters: [],
    };

    campanhas.push(newCampanha);

    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(201).json({ message: "Campanha adicionada com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao adicionar campanha", error });
  }
}
