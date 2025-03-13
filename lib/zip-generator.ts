import JSZip from "jszip"
import type { GeneratedFile } from "./code-generator"

export async function createZipFile(files: GeneratedFile[]): Promise<Blob> {
  const zip = new JSZip()

  // Add files to the zip
  files.forEach((file) => {
    // Create directories if needed
    const path = file.path
    if (path.includes("/")) {
      const dir = path.substring(0, path.lastIndexOf("/"))
      zip.folder(dir)
    }

    // Add the file
    zip.file(file.path, file.content)
  })

  // Generate the zip file
  const blob = await zip.generateAsync({ type: "blob" })
  return blob
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}

