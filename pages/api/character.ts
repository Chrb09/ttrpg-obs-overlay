import type { NextApiRequest, NextApiResponse } from "next";
import { readData, writeData } from "../../lib/data";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = readData();

  if (req.method === "GET") {
    const campaignId = req.query.campaignId as string;
    const campaign = data.campaigns.find((c: any) => c.id === campaignId);
    if (!campaign) return res.status(404).json({ error: "Campanha não encontrada" });
    return res.status(200).json(campaign.characters);
  }

  if (req.method === "POST") {
    const campaignId = req.query.campaignId as string;
    const updatedChar = req.body;
    const campaign = data.campaigns.find((c: any) => c.id === campaignId);
    if (!campaign) return res.status(404).json({ error: "Campanha não encontrada" });

    const index = campaign.characters.findIndex((ch: any) => ch.id === updatedChar.id);
    if (index >= 0) {
      campaign.characters[index] = { ...campaign.characters[index], ...updatedChar };
    } else {
      campaign.characters.push(updatedChar);
    }

    writeData(data);

    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
