// Redimensiona uma imagem no navegador ANTES de enviar pro Supabase —
// evita subir fotos de celular com 4000px/vários MB quando o app só
// precisa de um ícone pequeno. Sem isso, o upload fica lento e o
// armazenamento enche rápido, mesmo que a exibição na tela pareça normal.
export function redimensionarImagem(file: File, tamanhoMax = 400, qualidade = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => { img.src = e.target?.result as string }
    reader.onerror = reject
    reader.readAsDataURL(file)

    img.onload = () => {
      let { width, height } = img
      if (width > height && width > tamanhoMax) {
        height = Math.round((height * tamanhoMax) / width)
        width = tamanhoMax
      } else if (height > tamanhoMax) {
        width = Math.round((width * tamanhoMax) / height)
        height = tamanhoMax
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return } // se algo falhar, sobe o arquivo original em vez de travar

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          const novoNome = file.name.replace(/\.\w+$/, '.jpg')
          resolve(new File([blob], novoNome, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        qualidade
      )
    }
    img.onerror = () => resolve(file) // se não conseguir carregar, sobe original
  })
}