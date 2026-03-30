// `qrcode` native requires libcairo canvas binaries on Node which crash Vercel lambdas
// Temporary mock to unblock the CI/CD pipeline while migrating to a pure JS SVG QR library
export async function generateQRCode(url: string): Promise<string> {
  return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#fff"/><text x="10" y="20" fill="#000">QR Mock</text></svg>`).toString("base64")}`;
}
