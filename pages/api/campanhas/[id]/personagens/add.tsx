// pages/api/campanhas/[id]/personagens/add.tsx
import fs from "fs/promises";
import path from "path";
import { IncomingForm } from "formidable";

// Desabilita o body-parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id: campaignId } = req.query;

  // Processa o FormData
  const form = new IncomingForm(); // Usa a classe importada diretamente
  const formData: any = await new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  // Extrai os dados do formulário e o arquivo opcional
  const name = formData.fields.name?.[0];
  const color = formData.fields.color?.[0];
  const iconFile = formData.files.iconFile?.[0]; // O nome do campo deve ser o mesmo do frontend

  console.log("Arquivo do ícone recebido:", !!iconFile);

  const filePath = path.join(process.cwd(), "data.json");
  const systemsPath = path.join(process.cwd(), "systems.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    const campanhas = JSON.parse(jsonData);

    const campanhaIndex = campanhas.findIndex((c: any) => c.id === parseInt(campaignId));
    if (campanhaIndex === -1) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    const campanha = campanhas[campanhaIndex];
    const systemsData = await fs.readFile(systemsPath, "utf-8");
    const systems = JSON.parse(systemsData);
    const baseStats = systems[campanha.system]?.stats || [];
    const newCharId = campanha.characters.length > 0 ? Math.max(...campanha.characters.map((c: any) => c.id)) + 1 : 1;

    // --- Lógica para o ícone ---
    let iconPath: string;
    const uploadDir = path.join(process.cwd(), "public", "uploads", campaignId);
    await fs.mkdir(uploadDir, { recursive: true });

    if (iconFile) {
      // Se o usuário enviou um arquivo
      const fileExtension = path.extname(iconFile.originalFilename);
      const newFileName = `${newCharId}${fileExtension}`;
      const destinationPath = path.join(uploadDir, newFileName);
      await fs.rename(iconFile.filepath, destinationPath);
      iconPath = `/uploads/${campaignId}/${newFileName}`;
      console.log("Caminho temporário do arquivo:", iconFile.filepath);
      console.log("Caminho de destino:", destinationPath);
    } else {
      // Se não, usa o ícone padrão
      const defaultIconPath = path.join(process.cwd(), "public", "default-icon.png");
      const newFileName = `${newCharId}.png`;
      const destinationPath = path.join(uploadDir, newFileName);
      await fs.copyFile(defaultIconPath, destinationPath);
      iconPath = `/uploads/${campaignId}/${newFileName}`;
      console.log("Usando ícone padrão. Caminho de destino:", destinationPath);
      const defaultIconExists = await fs
        .access(defaultIconPath)
        .then(() => true)
        .catch(() => false);
      console.log("Ícone padrão existe:", defaultIconExists);
    }
    // -------------------------

    const newCharacter = {
      id: newCharId,
      name,
      icon: iconPath,
      color,
      stats: baseStats,
    };

    campanha.characters.push(newCharacter);
    await fs.writeFile(filePath, JSON.stringify(campanhas, null, 2));

    return res.status(201).json({ message: "Personagem adicionado com sucesso" });
  } catch (error) {
    console.error("Erro detalhado no servidor:", error);
    return res.status(500).json({ message: "Erro ao adicionar personagem", error: error.message });
  }
}
