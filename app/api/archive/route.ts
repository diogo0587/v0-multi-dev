import { NextResponse } from "next/server"
import JSZip from "jszip"

type GeneratedFile = {
  path: string
  content: string
  language?: string
}

export async function POST(request: Request) {
  try {
    const { files, name }: { files: GeneratedFile[]; name?: string } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo para compactar" }, { status: 400 })
    }

    const zip = new JSZip()
    for (const f of files) {
      const p = (f.path || "arquivo.txt").replace(/^\/+/, "")
      zip.file(p, f.content || "")
    }

    const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })

    // Converte Buffer para Uint8Array (ArrayBufferView) compatível com BodyInit
    const uint8 = new Uint8Array(content.buffer, content.byteOffset, content.byteLength)

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${name || "arquivos-gerados"}.zip"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao gerar ZIP" },
      { status: 500 },
    )
  }
}