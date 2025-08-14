import fs from "fs/promises";
import path from "path";

export default async function handler(req: any, res: any) {
  try {
    const systemsPath = path.join(process.cwd(), "systems.json");
    const systemsData = await fs.readFile(systemsPath, "utf-8");
    const systems = JSON.parse(systemsData);

    // Retorna apenas as chaves (nomes dos sistemas) do objeto JSON
    const systemNames = Object.keys(systems);

    return res.status(200).json(systemNames);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao carregar os sistemas", error });
  }
}
