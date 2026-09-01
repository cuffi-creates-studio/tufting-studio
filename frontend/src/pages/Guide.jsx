import React,{useRef,useState} from 'react'
import {
 ArrowRight,BookOpen,Boxes,Calculator,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,
 ClipboardList,Clock3,Coins,Download,Euro,FileText,FolderKanban,Grid3X3,Home,
 Image as ImageIcon,Images,MousePointer2,Move,PackageCheck,Palette,Play,Projector,
 Save,Search,Settings,SlidersHorizontal,Sparkles,Trash2,Upload,UserRound,
 WalletCards,WandSparkles,ZoomIn
} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const GUIDE=[
 page('dashboard',Home,'#7650d7','Paneli','Qendra e kontrollit të studios',[
  [Home,'Kartat e javës','Projekte, të përfunduara, në punë dhe kosto','metrics'],[Clock3,'Matësi i punës','Nis, ndalo dhe hap historikun e orëve','timer'],[CalendarDays,'Kalendari & terminet','Kalendari, statistikat dhe terminet në tre skeda','tabs'],[FolderKanban,'Projektet e fundit','Pesë punimet e fundit me status','cards'],[MousePointer2,'Veprimet e shpejta','Dizajn, Galeri, Projektor dhe Llogaritës','actions']],
  ['Hape Panelin për gjendjen e studios pa hyrë në çdo faqe.','Shtyp Nis kur fillon punën; Ndalo e ruan sesionin.','Ndërro tre skedat për kalendarin, statistikat dhe terminet.','Prek një projekt të fundit për të hapur Projektet.','Përdor veprimet e shpejta për të nisur punën që të duhet.'],
  [['Kartat llogaritëse','Numrat merren nga projektet dhe llogaritjet e ruajtura.'],['Matësi i kohës','Shfaq sesionin aktiv, kohën e sotme dhe lidhjen me historikun.'],['Terminet','“Shto termin” kërkon titull, datë dhe orë; X e heq termin.'],['Lidhjet','Kartat dhe butonat hapin faqen përkatëse pa humbur të dhënat.']],
  'Projektet dhe llogaritjet lexohen nga ruajtja e aplikacionit. Terminet ruhen në pajisje; orët ruhen te historiku.'),
 page('projects',FolderKanban,'#0ca892','Projektet','Biblioteka e punimeve të ruajtura',[
  [FolderKanban,'Projekt i ri','Emër, gjerësi, lartësi dhe shënime','form'],[ImageIcon,'Karta e projektit','Fotoja, emri dhe përmasat e punimit','cards'],[SlidersHorizontal,'Statusi','Në punë ose Përfunduar','status'],[Euro,'Kosto materiali','Kostoja e regjistruar për projektin','money'],[Trash2,'Fshirja','Konfirmim para heqjes së projektit','delete']],
  ['Shtyp “Projekt i ri” në krye të faqes.','Shkruaj emrin e detyrueshëm, përmasat dhe shënimet.','Shtyp “Krijo projektin” që karta të shfaqet në listë.','Ndrysho statusin nga menuja brenda kartës.','Përdor Fshi vetëm pasi të konfirmosh veprimin.'],
  [['Krijimi','Formulari ruan emrin, gjerësinë cm, lartësinë cm dhe shënimet.'],['Fotoja','Projektet nga Projektori kanë figurë, stil dhe paletë.'],['Statusi','Ndryshimi Në punë/Përfunduar ruhet menjëherë.'],['Kostoja','Karta shfaq material_cost kur ekziston në projekt.']],
  'Të njëjtat projekte përdoren nga Paneli, Galeria, Porositë dhe Projektori.'),
 page('gallery',Images,'#ff4f82','Galeria','Pamja vizuale e projekteve',[
  [Images,'Rrjeti i fotove','Çdo projekt si kartë me fotografi','photo-grid'],[Search,'Emri & përmasat','Emri dhe cm poshtë fotografisë','caption'],[CheckCircle2,'Statusi','Etiketë jeshile ose portokalli','status'],[ZoomIn,'Pamja e madhe','Prek foton për gjithë ekranin','zoom'],[FolderKanban,'Burimi','Lexon projektet; nuk ngarkon foto veçmas','link']],
  ['Ruaj fillimisht projektin nga Projektori ose Projektet.','Hap Galerinë dhe gjeje sipas fotos dhe emrit.','Kontrollo përmasat dhe statusin poshtë fotos.','Prek foton për ta parë të madhe.','Mbylle me X ose duke prekur sfondin e errët.'],
  [['Burimi','Galeria liston të gjitha projektet e ruajtura.'],['Pa fotografi','Në mungesë të image_data shfaqet simboli i leshit.'],['Zmadhimi','Vetëm kartat me fotografi hapen në pamjen e madhe.'],['Statusi','Përfunduar është jeshile; Në punë portokalli.']],
  'Galeria nuk krijon kopje; lexon të njëjtat të dhëna si faqja Projektet.'),
 page('design',WandSparkles,'#ff7a20','Studio Dizajni','Nga fotografi në model për tufting',[
  [Upload,'Ngarko fotografinë','Nga galeria ose kamera e telefonit','upload'],[WandSparkles,'Përpunimi','Origjinal, Skicë dhe Kartun','transform'],[Palette,'Paleta','6, 8, 10, 12 ose 16 ngjyra','palette'],[ImageIcon,'Paraqitja','Skeda dhe miniatura për krahasim','tabs'],[ArrowRight,'Vazhdo','Dërgo figurën, stilin dhe paletën te Projektori','send']],
  ['Zgjidh “Nga Galeria” ose “Bëj Foto” dhe përdor foto të qartë.','Programi krijon origjinalin, skicën, kartunin dhe paletën.','Zgjidh Skicë për konture, Kartun për zona të pastra ose Origjinal.','Ndrysho numrin e ngjyrave; fotografia ripërpunohet.','Shtyp “Vazhdo te veglat” për ta hapur rezultatin në Projektor.'],
  [['Ngarkimi','Ka hyrje të veçantë për galerinë dhe kamerën e pasme.'],['Stilet','Butonat e stilit dhe skedat e figurës sinkronizohen.'],['Paleta','Çdo ngjyrë tregon numrin dhe kodin HEX.'],['Projektori','Figura, stili dhe paleta kalojnë me sessionStorage.']],
  'Fotoja mbahet gjatë përpunimit; projekti ruhet përfundimisht nga Projektori.'),
 page('projector',Projector,'#5530bc','Projektori','Pozicionimi i modelit mbi kanavacë',[
  [Move,'Lëvizja','Shigjeta ose drag me mouse/gisht','move'],[ZoomIn,'Zmadhimi','Nga 20% deri në 300%','zoom-control'],[Grid3X3,'Rrjeta & pasqyra','Rrjetë 18/28/42 px dhe kthim horizontal','grid'],[SlidersHorizontal,'Pamja','Opacity dhe blend mode','sliders'],[Save,'Ruaj projektin','Kompreson foton dhe krijon projekt','save']],
  ['Hap një rezultat nga Studio Dizajni.','Aktivizo Lëvizjen dhe tërhiq figurën ose përdor shigjetat.','Rregullo zoom, transparencë, pasqyrë dhe rrjetë.','Përdor Qendro, Përshtat ose Fullscreen për saktësi.','Shtyp Ruaj, shkruaj emrin dhe prit kalimin te Projektet.'],
  [['Pozicioni','Mban x, y dhe zoom; Reset i kthen në fillim.'],['Rrjeta','Ndezet/fiket dhe kalon 18 → 28 → 42 px.'],['Përzierja','Normal, multiply, screen dhe overlay ndryshojnë pamjen.'],['Ruajtja','Ruhet foto, stil, paletë dhe shënim me cilësimet.']],
  'Heqja e fotos nga Projektori nuk fshin projektet. Projekti i ri ruhet me status Në punë.'),
 page('calculator',Calculator,'#e8932f','Llogaritësi','Kosto reale sipas peshës së leshit',[
  [Palette,'Leshi & ngjyra','Acrylic/Wool, emri dhe HEX','palette'],[Coins,'Topi','Gramatura dhe çmimi real','form'],[Calculator,'Peshimi','Pesha para dhe pesha e mbetur','weights'],[Euro,'Rezultati','Përdorimi, kostoja, mbetja dhe topat','result'],[Save,'Historiku','Ruaj, kontrollo ose fshi llogaritjen','history']],
  ['Zgjidh llojin dhe vendos emrin/kodin e ngjyrës.','Shkruaj gramaturën dhe çmimin e topit.','Pesho topin para dhe pjesën e mbetur pas punës.','Shkruaj edhe numrin e topave të plotë të harxhuar.','Kontrollo rezultatin dhe ruaje në historik.'],
  [['Formula','Topat e plotë × gramatura + (para − mbetur).'],['Kostoja','Çmimi/gram shumëzohet me gramët e përdorura.'],['Kontrolli','Mbetja nuk lejohet më e madhe se pesha para punës.'],['Historiku','Ruan ngjyrën, peshat, topat, përdorimin dhe koston.']],
  'Llogaritjet e ruajtura shfaqen në historik dhe përfshihen në statistikat e Panelit.'),
 page('materials',Boxes,'#159987','Materialet','Lista e thjeshtë e leshit dhe stokut',[
  [Boxes,'Lista','Emër, lloj, ngjyrë, çmim dhe stok','cards'],[MousePointer2,'Shto material','Hap formularin me butonin +','form'],[Palette,'Ngjyra','Zgjidh kodin e ngjyrës','palette'],[Coins,'Çmimi','Çmim për 100 g','money'],[Trash2,'Fshirja','Konfirmim para heqjes','delete']],
  ['Shtyp “Shto material”.','Zgjidh Acrylic/Wool dhe shkruaj emrin.','Vendos ngjyrën, çmimin për 100 g dhe stokun.','Shtyp Ruaj që materiali të shfaqet në listë.','Përdor Fshi dhe konfirmo kur nuk të duhet më.'],
  [['Emri','Është i detyrueshëm; pa emër materiali nuk ruhet.'],['Stoku','Regjistrohet në gram për planifikim.'],['Çmimi','Ruhet si çmim për 100 g.'],['Inventari','Inventari ka më shumë hollësi: markë, topa, alarme dhe raporte.']],
  'Lista rifreskohet pas çdo shtimi ose fshirjeje.'),
 page('work-hours',Clock3,'#2f7df7','Orët e punës','Koha reale dhe energjia e pajisjeve',[
  [Play,'Nis / Ndalo','Ruan fillimin, fundin dhe kohëzgjatjen','timer'],[Clock3,'Totalet','Sot, këtë javë dhe këtë muaj','metrics'],[Settings,'Pajisjet','Pistoleta dhe qethësja me fuqi W','device'],[Euro,'Energjia','kWh dhe kosto e sesionit','money'],[FileText,'Historiku','Çdo sesion i ndalur në tabelë','history']],
  ['Zgjidh modelin e pistoletës dhe qethësen para fillimit.','Shtyp Nis; matësi vazhdon edhe në Panel.','Nis/ndalo pajisjet që energjia të llogaritet saktë.','Shtyp Ndalo për të ruajtur kohën dhe konsumin.','Hap Historikun për të parë ose fshirë sesionet.'],
  [['Matësi','Ruhet ora e nisjes dhe llogaritet koha reale.'],['Pajisjet','Modeli cakton Watt; qethësja mund të marrë fuqinë nga etiketa.'],['Energjia','Kthehet në shpenzim automatik te Shpenzimet.'],['Fshirja','Heq edhe shpenzimin e lidhur të energjisë.']],
  'Çdo Ndalo ruan sesionin. Sesioni aktiv lexohet edhe nga Paneli.'),
 page('orders',ClipboardList,'#d56580','Porositë','Klientët, pagesat dhe afatet',[
  [UserRound,'Klienti & projekti','Lidhe me projekt ose shkruaje','form'],[Euro,'Pagesa','Çmimi, kapari dhe mbetja','money'],[CalendarDays,'Afati','Data dhe statusi i porosisë','status'],[Search,'Kërko & filtro','Sipas klientit, projektit dhe statusit','search'],[Download,'PDF','Faturë ose listë e filtruar','export']],
  ['Shtyp “Shto porosi” dhe shkruaj klientin.','Zgjidh projekt; emri dhe përmasat plotësohen, ose futi vetë.','Vendos çmimin, kaparin, statusin, afatin dhe shënimet.','Ruaje; mbetja = çmimi minus kapari.','Filtro, redakto me ••• ose krijo PDF.'],
  [['Projekti','Kopjon emrin, përmasat, foton dhe koston.'],['Pagesa','Balance llogaritet automatikisht dhe nuk bie nën zero.'],['Statuset','Në punë, Në pritje, Prit material, Përfunduar.'],['Raportet','PDF-të ruhen dhe mund të hapen përsëri.']],
  'Porosia ruan klientin, projektin, pagesën, afatin, foton dhe kostot e lidhura.'),
 page('inventory',PackageCheck,'#7c61be','Inventari','Stoku real, ngjyrat dhe alarmet',[
  [Boxes,'Materiali','Lloj, markë, emër dhe ngjyrë','form'],[Palette,'Katalogu','Familje ngjyrash dhe HEX personal','palette'],[PackageCheck,'Stoku','Topi, stoku total dhe minimumi','stock'],[Euro,'Vlera totale','Topat ekuivalent × çmimi','result'],[Download,'Eksportet','CSV, PDF dhe raportet','export']],
  ['Shtyp “Shto material” dhe zgjidh llojin.','Shkruaj markën/emrin dhe zgjidh ngjyrën.','Vendos gramaturën, stokun, çmimin dhe minimumin.','Ruaje; tabela tregon OK ose Stok i ulët.','Përdor CSV për të dhëna ose PDF për raport.'],
  [['Alarmi','Stok i ulët kur stock_g ≤ min_stock_g.'],['Vlera','Stoku ÷ gramatura × çmimi për top.'],['Katalogu','Ngjyrat ndahen në gjashtë familje.'],['Raportet','PDF ruan përmbledhjen; CSV të gjitha kolonat.']],
  'Redaktimi rifreskon grafikun, alarmet dhe vlerën totale.'),
 page('expenses',WalletCards,'#d88932','Shpenzimet','Buxheti dhe kostot reale të studios',[
  [WalletCards,'Shpenzimi','Kategori, përshkrim, shumë dhe datë','form'],[FolderKanban,'Projekti','Lidhe me projekt dhe pagesë','link'],[Search,'Muaji & kërkimi','Filtro sipas muajit, kategorisë dhe tekstit','search'],[Euro,'Përmbledhja','Total, mesatare dhe ndarje me kategori','money'],[Download,'PDF / Faturat','Raporte mujore të ruajtura','export']],
  ['Shtyp “Shto shpenzim” dhe zgjidh kategorinë.','Vendos përshkrimin, shumën, datën, projektin dhe pagesën.','Ruaje që të hyjë në tabelë dhe totalin e muajit.','Ndrysho muajin ose kërko për transaksionin.','Krijo PDF dhe rihape nga dokumentet e ruajtura.'],
  [['Kategoritë','Transport, Paketim, Energji, Materiale, Pajisje, Reklama, Të tjera.'],['Përmbledhja','Grafiku ndan totalin dhe llogarit mesataren.'],['Energjia','Orët e punës mund të krijojnë shpenzim automatik.'],['Redaktimi','••• hap formularin për ndryshim ose fshirje.']],
  'Shpenzimet e filtruara formojnë totalin mujor dhe raportin PDF.'),
 page('settings',Settings,'#68717e','Cilësimet','Profili dhe paraqitja e studios',[
  [UserRound,'Profili','Emri dhe fotografia e avatarit','profile'],[ImageIcon,'Logoja','Logoja e menusë së programit','upload'],[Settings,'Gjuha','Shqip, Deutsch ose English','tabs'],[CalendarDays,'Njoftimet','Ndez/fik terminet','toggle'],[Save,'Ruaj','Përditëson Panelin dhe menunë','save']],
  ['Shkruaj emrin e profilit.','Ngarko ose hiq fotografinë e avatarit.','Ngarko logon që shfaqet në menunë anësore.','Zgjidh gjuhën dhe njoftimet.','Shtyp Ruaj që Paneli dhe menuja të përditësohen.'],
  [['Fotografitë','Zvogëlohen dhe kompresohen para ruajtjes.'],['Profili','Përdoret në Panel, kokën dhe menunë anësore.'],['Gjuha','Ruhet dhe përdoret nga përkthimet.'],['Njoftimet','Çelësi ruan preferencën on/off.']],
  'Profili, fotoja, logoja, gjuha dhe njoftimet ruhen në pajisje.'),
]

function page(id,Icon,color,sq,subtitle,diagram,steps,details,storage){return{id,Icon,color,title:{sq,de:sq,en:sq},subtitle,diagram,steps,details,storage}}
const UI={sq:{title:'Si funksionon programi',subtitle:'Bllok i hapur me vizatime dhe shpjegim real për çdo faqe',chapters:'Kapitujt',spread:'Kapitulli',previous:'Mbrapa',next:'Tjetra',workflow:'Si përdoret, hap pas hapi',functions:'Çfarë bën realisht',storage:'Çfarë ruhet'},de:{title:'So funktioniert das Programm',subtitle:'Offenes Notizbuch mit echten Erklärungen',chapters:'Kapitel',spread:'Kapitel',previous:'Zurück',next:'Weiter',workflow:'Schritt für Schritt',functions:'Funktionen',storage:'Speicherung'},en:{title:'How the program works',subtitle:'An open notebook with real explanations',chapters:'Chapters',spread:'Chapter',previous:'Previous',next:'Next',workflow:'Step by step',functions:'What it really does',storage:'What is saved'}}

export default function Guide(){
 const {lang}=useI18n(),u=UI[lang]||UI.sq
 const [index,setIndex]=useState(0),[direction,setDirection]=useState('next'),touch=useRef(null),item=GUIDE[index]
 const go=n=>{const safe=Math.max(0,Math.min(GUIDE.length-1,n));if(safe===index)return;setDirection(safe>index?'next':'previous');setIndex(safe)}
 return <div className="knowledge-page guide-page mobile-standard-page"><MobilePageHeader title={u.title}/><header className="knowledge-title"><div><span className="knowledge-kicker"><BookOpen/>{u.chapters}</span><h1>{u.title}</h1><p>{u.subtitle}</p></div><div className="guide-count"><b>{String(index+1).padStart(2,'0')}</b><span>/ {GUIDE.length}</span></div></header><div className="guide-layout real-guide-layout"><aside className="guide-chapters"><strong>{u.chapters}</strong><div>{GUIDE.map((p,i)=><button key={p.id} className={i===index?'active':''} onClick={()=>go(i)} style={{'--chapter-color':p.color}}><span><p.Icon/></span><em>{String(i+1).padStart(2,'0')}</em><b>{p.title[lang]||p.title.sq}</b></button>)}</div></aside><section className="guide-book real-guide-book" tabIndex="0" onKeyDown={e=>{if(e.key==='ArrowLeft')go(index-1);if(e.key==='ArrowRight')go(index+1)}} onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current===null)return;const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>55)go(index+(dx<0?1:-1));touch.current=null}}><div className={`open-guide-book turn-${direction}`} key={item.id} style={{'--guide-color':item.color}}><div className="book-cover-under"/><div className="book-spine-shadow"/><div className="book-rings">{Array.from({length:11},(_,i)=><i key={i}/>)}</div><section className="guide-paper guide-paper-left"><span className="paper-corner-number">{index*2+1}</span><SketchNote item={item}/></section><section className="guide-paper guide-paper-right"><span className="paper-corner-number">{index*2+2}</span><Detailed item={item} u={u}/></section></div><footer className="guide-controls"><button disabled={index===0} onClick={()=>go(index-1)}><ChevronLeft/>{u.previous}</button><div className="guide-spread-label"><BookOpen/><b>{u.spread} {index+1}</b><span>{index*2+1}–{index*2+2}</span></div><button disabled={index===GUIDE.length-1} onClick={()=>go(index+1)}>{u.next}<ChevronRight/></button></footer></section></div></div>
}

const colors=['#a8dfc8','#f9d887','#f5afb9','#a9d6ef','#cab7e7']
function SketchNote({item}){return <div className="sketchnote-page"><div className="doodle-top"><Sparkles/><span>Tufting Studio</span><Sparkles/></div><h2>Si përdoret</h2><h3>{item.title.sq}</h3><p className="doodle-subtitle">{item.subtitle}</p><div className="doodle-grid">{item.diagram.map(([Icon,label,note,kind],i)=><article className="doodle-card" key={label} style={{'--doodle':colors[i]}}><span className="doodle-number">{i+1}</span><div className="doodle-card-title"><Icon/><b>{label}</b></div><MiniUi kind={kind}/><p>{note}</p></article>)}</div><div className="doodle-footer"><span>✦</span><b>Puno qartë, ruaj saktë!</b><span>✦</span></div></div>}
function Detailed({item,u}){const Icon=item.Icon;return <div className="detail-note-page"><div className="detail-page-head"><span><Icon/></span><div><small>Tufting Studio · Manuali</small><h2>{item.title.sq}</h2><p>{item.subtitle}</p></div></div><section className="detail-workflow"><h3><MousePointer2/>{u.workflow}</h3><ol>{item.steps.map((s,i)=><li key={s}><span>{i+1}</span><p>{s}</p></li>)}</ol></section><section className="detail-functions"><h3><Sparkles/>{u.functions}</h3><div>{item.details.map(([h,t],i)=><article key={h} style={{'--note':colors[i]}}><b>{h}</b><p>{t}</p></article>)}</div></section><aside className="detail-storage"><Save/><div><b>{u.storage}</b><p>{item.storage}</p></div></aside></div>}

function MiniUi({kind}){
 if(kind==='metrics')return <div className="mini-ui mini-metrics">{[1,2,3,4].map(x=><i key={x}/>)}</div>
 if(kind==='timer')return <div className="mini-ui mini-timer"><b>02:45:18</b><span><Play/> Nis</span></div>
 if(kind==='tabs')return <div className="mini-ui mini-tabs"><span/><span/><span/><div>{[1,2,3,4,5,6,7].map(x=><i key={x}/>)}</div></div>
 if(kind==='cards'||kind==='photo-grid')return <div className="mini-ui mini-cards">{[1,2,3].map(x=><span key={x}><i/><b/></span>)}</div>
 if(kind==='actions')return <div className="mini-ui mini-actions">{[1,2,3,4].map(x=><i key={x}/>)}</div>
 if(kind==='form')return <div className="mini-ui mini-form"><span/><span/><div><i/><i/></div><b>Ruaj</b></div>
 if(kind==='status')return <div className="mini-ui mini-status"><span>Në punë</span><span>Përfunduar</span><i/><i/></div>
 if(kind==='money'||kind==='result')return <div className="mini-ui mini-money"><b>€ 248.50</b><div><i/><i/><i/><i/></div></div>
 if(kind==='delete')return <div className="mini-ui mini-delete"><Trash2/><span>Ta fshij?</span><b>Po</b></div>
 if(kind==='caption')return <div className="mini-ui mini-caption"><i/><p><b/><span/></p></div>
 if(kind==='zoom'||kind==='zoom-control')return <div className="mini-ui mini-zoom"><span><ImageIcon/></span><div><b>−</b><i/><b>+</b></div></div>
 if(kind==='link'||kind==='send')return <div className="mini-ui mini-link"><FolderKanban/><ArrowRight/><Projector/></div>
 if(kind==='upload')return <div className="mini-ui mini-upload"><Upload/><span>Galeria</span><span>Kamera</span></div>
 if(kind==='transform')return <div className="mini-ui mini-transform"><ImageIcon/><ArrowRight/><WandSparkles/></div>
 if(kind==='palette')return <div className="mini-ui mini-palette">{['#ff6f82','#0ca892','#7650d7','#ffc64e','#2f7df7'].map(c=><i key={c} style={{background:c}}/>)}</div>
 if(kind==='move')return <div className="mini-ui mini-move"><Move/><span><i/><i/><i/><i/></span></div>
 if(kind==='grid')return <div className="mini-ui mini-grid"><Grid3X3/><span>18 · 28 · 42</span></div>
 if(kind==='sliders')return <div className="mini-ui mini-sliders"><i><b/></i><i><b/></i><span>overlay</span></div>
 if(kind==='save')return <div className="mini-ui mini-save"><Save/><span>Emri i projektit</span><b>Ruaj</b></div>
 if(kind==='weights')return <div className="mini-ui mini-weights"><span>100 g</span><b>−</b><span>60 g</span><b>= 40 g</b></div>
 if(kind==='history')return <div className="mini-ui mini-history">{[1,2,3].map(x=><span key={x}><i/><b/><em/></span>)}</div>
 if(kind==='device')return <div className="mini-ui mini-device"><Settings/><span>Gun 70W</span><span>Shearer 120W</span></div>
 if(kind==='search')return <div className="mini-ui mini-search"><span><Search/> Kërko…</span><div><i/><i/><i/></div></div>
 if(kind==='export')return <div className="mini-ui mini-export"><span><Download/> CSV</span><span>PDF</span><i/></div>
 if(kind==='stock')return <div className="mini-ui mini-stock"><span><i style={{width:'82%'}}/></span><span><i style={{width:'35%'}}/></span><b>Stok i ulët</b></div>
 if(kind==='profile')return <div className="mini-ui mini-profile"><UserRound/><span><i/><i/></span></div>
 if(kind==='toggle')return <div className="mini-ui mini-toggle"><span><i/></span><span className="on"><i/></span></div>
 return <div className="mini-ui mini-default"><CheckCircle2/><span/><span/></div>
}
