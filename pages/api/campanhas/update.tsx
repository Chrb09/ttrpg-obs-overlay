// pages/api/campanhas/update.ts
import fs from "fs/promises";
import path from "path";
export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id, name, system } = req.body;
  const filePath = path.join(process.cwd(), "data.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);
    const index = campanhas.findIndex((c: any) => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    campanhas[index] = { ...campanhas[index], name, system };

    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(200).json({ message: "Campanha atualizada com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar a campanha", error });
  }
}
