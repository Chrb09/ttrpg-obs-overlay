// pages/api/systems.tsx
import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  try {
    const systemsPath = path.join(process.cwd(), "systems.json");
    const systemsData = await fs.readFile(systemsPath, "utf-8");
    const systems = JSON.parse(systemsData);
    // Retorna o objeto completo, não apenas as chaves
    return res.status(200).json(systems);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao carregar os sistemas", error });
  }
}
