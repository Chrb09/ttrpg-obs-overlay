import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data.json");

export function readData() {
  const jsonData = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(jsonData);
}

export function writeData(data: any) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
