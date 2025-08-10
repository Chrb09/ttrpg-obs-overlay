// pages/api/campanhas/index.tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const filePath = path.join(process.cwd(), "data.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    return res.status(200).json(campanhas);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar as campanhas", error });
  }
}
