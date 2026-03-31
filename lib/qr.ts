import QRCode from "qrcode";

export async function generateQRCode(url: string): Promise<string> {
  const svg = await QRCode.toString(url, { type: "svg", width: 256, margin: 2 });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
