function latin1Bytes(text){
  const map={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159}
  const out=[]
  for(const ch of String(text)){
    const cp=ch.codePointAt(0)
    if(cp<=255)out.push(cp)
    else if(map[ch]!=null)out.push(map[ch])
    else out.push(63)
  }
  return out
}
function escPdf(s){return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function pdfDate(){const d=new Date();const p=n=>String(n).padStart(2,'0');return `D:${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`}

export function makeBusinessPdf({title='',subtitle='',lines=[],filename='tufting-report.pdf'}){
  const pageLines=[]
  for(const line of lines){
    const s=String(line??'')
    if(s.length<=92) pageLines.push(s)
    else{
      let rest=s
      while(rest.length>92){let cut=rest.lastIndexOf(' ',92);if(cut<50)cut=92;pageLines.push(rest.slice(0,cut));rest=rest.slice(cut).trim()}
      if(rest)pageLines.push(rest)
    }
  }
  const pages=[]
  const perPage=38
  for(let i=0;i<pageLines.length||i===0;i+=perPage)pages.push(pageLines.slice(i,i+perPage))

  const objects=[]
  const add=o=>{objects.push(o);return objects.length}
  const fontId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const boldId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  const pagesId=add('PAGES_PLACEHOLDER')
  const pageIds=[]

  for(let pi=0;pi<pages.length;pi++){
    const content=[]
    content.push('BT /F2 19 Tf 50 790 Td ('+escPdf(title)+') Tj ET')
    if(subtitle)content.push('BT /F1 10 Tf 50 770 Td ('+escPdf(subtitle)+') Tj ET')
    content.push('0.82 0.49 0.10 RG 1.2 w 50 758 m 545 758 l S')
    let y=735
    for(const line of pages[pi]){
      const bold=line.startsWith('#')
      const clean=bold?line.replace(/^#+\s*/,''):line
      content.push(`BT /${bold?'F2':'F1'} ${bold?'11':'10'} Tf 50 ${y} Td (${escPdf(clean)}) Tj ET`)
      y-=17
    }
    content.push(`BT /F1 8 Tf 50 35 Td (Tufting Studio  -  ${pi+1}/${pages.length}) Tj ET`)
    const stream=content.join('\n')
    const streamId=add(`<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}\nendstream`)
    const pageId=add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldId} 0 R >> >> /Contents ${streamId} 0 R >>`)
    pageIds.push(pageId)
  }
  objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  const infoId=add(`<< /Title (${escPdf(title)}) /Creator (Tufting Studio) /CreationDate (${pdfDate()}) >>`)

  const chunks=[]
  const push=s=>chunks.push(...latin1Bytes(s))
  push('%PDF-1.4\n%âãÏÓ\n')
  const offsets=[0]
  for(let i=0;i<objects.length;i++){
    offsets.push(chunks.length)
    push(`${i+1} 0 obj\n${objects[i]}\nendobj\n`)
  }
  const xref=chunks.length
  push(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`)
  for(let i=1;i<offsets.length;i++)push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`)
  push(`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF`)
  const blob=new Blob([new Uint8Array(chunks)],{type:'application/pdf'})
  const url=URL.createObjectURL(blob)
  window.open(url,'_blank','noopener,noreferrer')
  setTimeout(()=>URL.revokeObjectURL(url),120000)
  return filename.endsWith('.pdf')?filename:`${filename}.pdf`
}

export function reportLinesFromRows(headers,rows){
  return rows.map(row=>headers.map((h,i)=>`${h}: ${row[i]??'—'}`).join('   |   '))
}
