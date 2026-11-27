# TurboMastin

Sito vetrina Astro statico, pronto per revisione del cliente, **non autorizzato al rilascio definitivo**. Il committente ha autorizzato il repository pubblico Marchettoh/turbomastin e una sola anteprima pubblica temporanea su https://turbomastin.dallaviaweb.it. Informative e dati aziendali restano da completare. Il sito esistente, il dominio principale e la posta non devono essere modificati. La pubblicazione dell’anteprima non equivale all’approvazione del rilascio definitivo.

## Avvio e comandi

Richiede Node 24 e npm. Installazione riproducibile: `npm ci`.

- `npm run dev`: sviluppo locale.
- `npm run build`: preview statica in `dist/`, sempre noindex senza RELEASE.
- `npm run check`: controllo TypeScript/Astro. `tsconfig.json` estende Astro strict e carica `astro/client`, che tipizza `import.meta.env` senza ricorrere ad any.
- `npm run preview`: serve la build su http://localhost:4321.
- `npx playwright install chromium`, poi `npm test` con preview avviata: test browser e screenshot in `artifacts/`.
- `npm run release:check`: deve fallire finché mancano i dati di rilascio.
- `npm audit`: controllo dipendenze da ripetere prima del rilascio.

Non aprire direttamente index.html da disco: usare un server HTTP. Non rendere pubblica una preview con dati riservati. Noindex e robots non sono protezioni di accesso: per un’anteprima riservata serve un hosting con autenticazione. Il committente ha autorizzato questa anteprima come pubblica, senza password. Nessuna credenziale nel repository. Report e screenshot in artifacts/ rimangono locali, esclusi dal repository pubblico. `ASTRO_TELEMETRY_DISABLED=1` disattiva la telemetria del tool di sviluppo/build (non è codice del sito).

## Organizzazione e manutenzione

- `src/data/business.ts`: nome, telefono, email, indirizzo, orari, link esterno, servizi e conferme di rilascio. Domenica: chiuso, confermato dal committente il 25/11/2026.
- `src/pages/index.astro`: testi editoriali e struttura della homepage.
- `src/layouts/Layout.astro`: metadati, header, footer, menu progressivo.
- `src/components/Footer.astro`: compone richiamo telefonico petrolio compatto, sezione “Ci trovi qui” con mappa su avorio e infine footer completo sabbia caldo, cromaticamente distinto. La mappa è fuori dal tag footer e lo precede. La home abilita `contactFooter` sul Layout; il footer contiene indirizzo, orari, email e un solo collegamento WhatsApp con numero. Sulle pagine informative resta la chiusura compatta. Non duplicare i recapiti in una seconda sezione. Firma autorizzata: “Frame Lab”, collegata a https://www.framelabweb.it.
- `src/styles/global.css`: token, tipografia, layout e responsive.
- `src/components/Mechanical.astro`: illustrazione tecnica vettoriale originale, non foto dell’officina.
- `src/pages/privacy.astro`: bozza da completare con un consulente/titolare, non consulenza legale.
- `public/`: favicon e licenze, senza richieste remote.
- `materials/legacy-content.txt`: recupero testuale e inventario parziale URL precedenti.
- `tests/browser.mjs`: test ripetibili; `artifacts/`: risultati e screenshot effettivi. Report leggibile in `artifacts/VERIFICA.md`.
- `tests/static-server.mjs`: server esclusivamente QA per `dist-nested/` sulla porta 4322 con prefisso `/turbomastin/`; non fa parte del sito o della pubblicazione. Astro 7 consente un solo processo preview per progetto: questo fixture permette di verificare il percorso annidato senza interrompere l’anteprima del cliente.

Per aggiornare orari e recapiti modificare solo i dati centrali; mantenere separati numero leggibile e URI tel. Per cambiare servizi aggiornare l’array senza estendere l’offerta non confermata. Per i testi di presentazione modificare index. Dopo ogni modifica: build e test. Non aggiungere WhatsApp senza recapito o URL confermato. Non equiparare preparazione alla revisione a centro revisioni, né controllo centraline a elaborazioni.

Fotografie: il committente ha fornito `public/officina.jpeg` (1125 × 750), usata in hero e nella galleria come la stessa foto, non come lavori differenti. Provenienza, titolarità e consenso all’uso da confermare: `release.assetRightsApproved` resta false. Nessun servizio o rapporto con i marchi visibili viene dedotto dalla fotografia. `src/data/photos.ts` centralizza immagine, alt, didascalia e provenienza. `Gallery.astro` crea automaticamente una griglia per più foto, con ingrandimento in dialog nativo, Escape e ripristino focus; senza JS il link apre il file. Con una sola immagine non si simula un portfolio di lavori. Per completarlo servono fotografie autentiche degli interventi con descrizioni confermate: aggiungerle a `src/assets/`, importarle in photos.ts e inserirle nell’array. Non mostrare targhe o persone identificabili non autorizzate. Picture Astro produce AVIF/WebP/JPEG, dimensioni e srcset, caricamento eager in hero e lazy in galleria. Non copiare fotografie/font dal sito di riferimento.

### Sequenza fotografica sotto i servizi

`src/components/WorkStory.astro` mostra “Un lavoro, da vicino” fra servizi e CTA. I dati sono in `workStory` dentro `src/data/photos.ts`: titolo, descrizione e tre foto dello stesso intervento, ognuna con image importata, alt, didascalia, provenienza e stage (`Prima`, `Durante`, `Risultato`). Non sono procedure standard promesse al cliente, ma etichette per documentare un intervento realmente fotografato. Non usare la foto panoramica tre volte come se fossero tre passaggi.

Finché mancano le immagini, l’anteprima mostra tre spazi esplicitamente etichettati “Fotografia da inserire”. Con `RELEASE=true` la sezione viene omessa del tutto se non sono presenti tutti e tre i passaggi con metadati compilati: i segnaposto non entrano nel rilascio. Quando si aggiungono le foto, validare diritti e didascalie, verificare l’ingrandimento e ripetere test e screenshot. La descrizione deve riferirsi al lavoro reale, senza dedurre prestazioni aggiuntive. L’ingrandimento riusa il dialog della galleria; nessuna libreria aggiuntiva.

## Hosting, GitHub e proprietà

Repository autorizzato per la sola anteprima: Marchettoh/turbomastin, pubblico, sotto il controllo del committente di questa fase di sviluppo. Per il sito definitivo concordare proprietà e accessi con il cliente dell’officina: amministrazione, 2FA e recupero sotto il suo controllo, sviluppatore collaboratore revocabile. Non dipendere da un solo account personale dello sviluppatore. Concordare manutenzione, backup, costi e responsabilità.

**Hosting definitivo da chiarire:** le condizioni GitHub Pages ricontrollate il 25/11/2026 limitano l’uso come hosting gratuito per attività online e siti principalmente destinati a facilitare transazioni commerciali. Per il sito aziendale definitivo l’idoneità resta da verificare; l’assenza di checkout non è una garanzia. L’autorizzazione riguarda una preview di progetto per revisione e non risolve questa valutazione per la produzione. Non è stato scelto autonomamente un hosting diverso. `dist/` resta trasferibile a un altro hosting statico.

Fonte: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Anteprima pubblica temporanea autorizzata

- Dominio: `https://turbomastin.dallaviaweb.it`, base `/`, hosting GitHub Pages. Il repository è pubblico su esplicita conferma; nessun abbonamento attivato.
- Workflow separato `.github/workflows/preview.yml`: avvio solo manuale, con conferma `authorize_preview=true`. Non pubblica a ogni push.
- Build con `PUBLIC_PREVIEW=true`, `RELEASE=false`, `SITE_URL=https://turbomastin.dallaviaweb.it`, `BASE_PATH=/`. Non impostare approvazioni legali mancanti per far funzionare la preview.
- `node scripts/preview-check.mjs` valida l’ambiente; dopo la build ripeterlo con `--built`. Deve trovare noindex/nofollow e avviso di anteprima in tutte le pagine HTML, robots Disallow, privacy in bozza e nessun canonical di produzione. Genera CNAME nell’artifact. `node tests/preview.mjs` verifica anche il rifiuto di dominio/base errati e build di produzione.
- Il workflow di produzione pages.yml e release-check.mjs restano invariati. Le conferme release restano false finché realmente completate.
- Configurare Pages con sorgente GitHub Actions e Custom domain PRIMA di aggiungere DNS. Su Cloudflare, dopo verifica di eventuali record esistenti: tipo CNAME, nome `turbomastin`, destinazione `marchettoh.github.io`, modalità Solo DNS (nuvola grigia), TTL Auto. Non modificare root, www, MX o TXT. Se esiste un record incompatibile, fermarsi e chiedere autorizzazione prima di sostituirlo.
- Verificare risoluzione DNS, emissione certificato, HTTPS e poi abilitare Enforce HTTPS. Fino a questi controlli il collegamento del dominio non è concluso. Nessuna modifica automatica ai DNS è prevista da questo workflow.
- L’anteprima è pubblica: noindex non equivale a un controllo degli accessi. La pagina mostra l’avviso di revisione e identifica GitHub Pages come hosting dell’anteprima. Ripetere l’audit su rete/storage una volta online.
- Per dismetterla, su nuova autorizzazione rimuovere prima il DNS del solo sottodominio e poi disabilitare Pages/rimuovere il dominio, evitando record abbandonati. Non eliminare repository o materiali senza approvazione specifica.

## Configurazione site/base e rilascio

Nessun dominio è stato inventato. Il fallback tecnico `https://example.invalid` non viene emesso come canonical in preview, sitemap vuota, robots Disallow e meta noindex. `SITE_URL` deve contenere origine HTTPS reale (non un sottopercorso); `BASE_PATH` deve iniziare e terminare con `/`.

- Dominio personalizzato: `SITE_URL=https://DOMINIO-DEL-CLIENTE`, `BASE_PATH=/`, `CUSTOM_DOMAIN=true`.
- Project Pages senza dominio: `SITE_URL=https://ACCOUNT.github.io`, `BASE_PATH=/REPOSITORY/`, `CUSTOM_DOMAIN=false`. Sostituire ACCOUNT/REPOSITORY con valori reali, non pubblicare questi esempi.
- Impostare `RELEASE=true` solo dopo approvazioni. Aggiornare `release` nei dati con informazioni reali e conferme documentate. Completare integralmente privacy. Il controllo fallisce anche se si impostano i booleani senza rivedere i passaggi incompleti dell’informativa.
- Eseguire `npm run release:check` e poi `npm run build` nello stesso ambiente configurato. Non aggirare i controlli. In release vengono emessi canonical, sitemap homepage e JSON-LD AutoRepair senza coordinate, rating, fascia prezzo o domenica.
- Verificare che non rimangano segnaposto nelle pagine e che l’indirizzo definitivo sia corretto in canonical, Open Graph, robots e sitemap. Privacy e 404 restano noindex. Open Graph testuale, nessuna immagine social fotografica inventata.

Il workflow `.github/workflows/pages.yml` parte **solo manualmente**, non al push. Configurare repository Pages con sorgente GitHub Actions e variabili SITE_URL, BASE_PATH, CUSTOM_DOMAIN. Creare ambiente `production` con revisore richiesto e nessun bypass dove il piano lo consente; deploy in `github-pages`. Permessi: lettura codice per build, pages write e id-token write solo per deploy. Prima del vero rilascio ripetere test sull’artifact prodotto e audit delle dipendenze. Il file CNAME generato dal controllo è utile per portabilità/hosting da branch; su Pages con Actions la fonte autorevole è Settings → Pages → Custom domain, non CNAME.

## Dominio, DNS e HTTPS — solo dopo autorizzazione specifica

1. Dominio registrato a nome del cliente, account registrar e recupero sotto il suo controllo. Non viene fornita né promessa una casella email. Conservare turbomastin@tiscali.it.
2. Esportare zona DNS completa dal registrar prima di qualsiasi modifica: A, AAAA, CNAME, ALIAS/ANAME, MX, TXT (SPF, DKIM, DMARC e verifiche), CAA, NS, TTL. L’export registrar è necessario: le interrogazioni pubbliche non inventariano tutti i nomi. Salvare fuori dal repo pubblico.
3. Preservare MX e TXT della posta e ogni servizio non web. Non eliminare record alla cieca. Preparare diff preciso dei soli record web e ottenere approvazione. Il dominio definitivo non è noto: nessun inventario DNS è stato eseguito.
4. Verificare prima la proprietà del dominio in GitHub (TXT indicato dall’account) e aggiungerlo in Settings → Pages PRIMA di puntare DNS, per ridurre il rischio takeover. No wildcard.
5. Secondo documentazione consultata: apex può usare ALIAS/ANAME verso il dominio Pages effettivo oppure i quattro A `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. IPv6 opzionale: `2606:50c0:8000::153` fino a `2606:50c0:8003::153`. Per www: CNAME verso `ACCOUNT.github.io`, non verso il nome repository. Ricontrollare la documentazione prima dell’intervento; non copiare valori se si sceglie un altro hosting.
6. Controllare con `Resolve-DnsName DOMINIO -Type A` (e AAAA/MX/TXT) in PowerShell e con resolver indipendenti. Valutare eventuali CAA esistenti con il gestore. Attendere corretta propagazione e certificato, poi abilitare Enforce HTTPS.
7. Verificare HTTPS con certificato valido, redirect HTTP→HTTPS e variante www/apex scelta, nessun mixed content, asset e 404. Non dichiarare concluso il passaggio senza controlli reali. Ripetere test rete/cookie/storage sul dominio effettivo.

Documentazione consultata 25/11/2026:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https

## Inventario privacy e risorse

Direzione artistica rivista su richiesta del committente: rétro-contemporanea, palette autonoma petrolio/avorio/ottone approvata dal committente, titoli slab, fotografia ad arco e dettagli da insegna. Riferimento di atmosfera esaminato: https://lagastronomiafood.com/ ; nessun suo codice, font proprietario o fotografia viene riutilizzato. `artifacts/reference-desktop.png` è una cattura locale per analisi, non un asset pubblicato dal sito.

Codice applicativo: script nativi per menu, dialog fotografico e consenso. Nessun analytics, pixel o sessionStorage; font, CSS, JS e grafica sono locali. WhatsApp (393 930 5804, +39) è stato confermato dal cliente ed è un link esterno, non un widget. L’iframe Google Maps fornito dal cliente è l’unico contenuto facoltativo: non esiste nel DOM prima del consenso e viene rimosso alla revoca. Nessun preconnect/prefetch verso Google. Il banner consente rifiuto, accettazione e personalizzazione; la categoria Maps non è preselezionata. La scelta, anche negativa, viene conservata per sei mesi nel solo localStorage, chiave turbomastin:privacy:v1 con versione, maps, updatedAt ed expiresAt. Se storage non disponibile si usa memoria solo per la pagina. Il footer riapre sempre le preferenze; revocare rimuove l’iframe ma non può cancellare cookie già impostati sui domini Google. Senza JavaScript restano link esterni e informative, senza iframe.

Recensioni: `src/data/reviews.ts` contiene tre brevi estratti della scheda Google Maps fornita dal cliente, consultata direttamente il 25/11/2026. `materials/reviews-source.txt` documenta la provenienza; `Reviews.astro` mostra autori, fonte e data di consultazione. Non è un feed live; non vengono inventate date esatte, stelle o valutazioni aggregate. Prima del rilascio approvare selezione, attribuzioni e condizioni della ripubblicazione (`release.reviewSelectionApproved` resta false). Nessun widget o API a pagamento attivato.

Test consenso: `npm run test:consent`, con preview in esecuzione, verifica rete/storage prima della scelta, rifiuto persistente, accettazione, personalizzazione, revoca, sincronizzazione fra schede, scadenza e indisponibilità storage. Distingue risposte simulate per i test deterministici e una prova reale di Google Maps. Report: `artifacts/consent-report.json` e `artifacts/CONSENSO.md`. Nel test reale sono stati osservati dopo il consenso domini Google, Maps API, gstatic, Places API e font Google interni all’iframe; i font della pagina restano locali. Nessun cookie osservato in quel profilo headless: ciò non garantisce assenza di cookie su altri browser/account o dopo interazioni. Non registrare valori di cookie nel repository. Ripetere audit sul dominio definitivo.

Font: Alfa Slab One 400 e DM Sans 400/500, subset latin, font-display swap e preload del solo display, da pacchetti Fontsource bloccati nel lockfile. Licenza SIL OFL 1.1 letta nei pacchetti e inclusa in `public/licenses/fonts.txt`; la build contiene anche fallback WOFF, i browser moderni richiedono WOFF2. Non modificati. Nessun Google Fonts remoto.

Grafica: wordmark, favicon e illustrazione tecnica SVG realizzati per questo progetto, nessuna libreria icone, nessuno stock né asset del tema precedente. Frecce/segni sono testo decorativo escluso dalla lettura. L’illustrazione non raffigura una fotografia dell’officina né un servizio aggiuntivo. Wordmark da approvare. Nessun codice del tema Total riutilizzato, quindi nessun suo credito trasferito. Codice e grafica da consegnare contrattualmente al cliente; nessuna licenza open-source del progetto commerciale viene imposta automaticamente. Licenze dipendenze nei rispettivi pacchetti.

Indicazioni italiane consultate: Garante, Linee guida cookie e altri strumenti di tracciamento 10 giugno 2021, https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876 . Con la successiva richiesta del cliente di incorporare Maps, è stato introdotto un vero controllo preventivo del consenso; non un banner decorativo. L’informativa descrive anche Google Maps, WhatsApp, recensioni statiche e preferenza tecnica. Ruoli, basi giuridiche, trasferimenti e conservazione dei fornitori restano da validare prima del rilascio. Non è una dichiarazione di conformità garantita.

In produzione il fornitore hosting può trattare IP, log e metadati tecnici anche senza cookie. Da validare: contratto e ruoli, eventuali responsabili/subfornitori e CDN, localizzazione e trasferimenti/garanzie, conservazione log, misure di sicurezza, casella email Tiscali e gestione telefonica. Nessun audit del servizio di produzione ancora possibile: non scelto/attivato. Se si aggiungono strumenti soggetti a consenso, bloccarli prima della scelta, implementare accetta/rifiuta/personalizza/revoca e ripetere audit effettivo; un semplice banner non basta.

## Migrazione, backup e ripristino

Il recupero in materials è solo testuale e parziale. Prima del passaggio acquisire dal titolare backup completo WordPress (database, wp-content, configurazioni) ed export URL; non salvare credenziali, messaggi clienti o database in GitHub pubblico. Inventario osservato: home `/` e contatti `/?page_id=55`. Verificare altri URL tramite export, sitemap e strumenti del titolare. Nuove destinazioni: home e `/#contatti`.

Redirect dal vecchio dominio richiedono accesso e supporto dell’origine Altervista: verificarli col gestore, testare stato e destinazione, non promettere redirect server-side. Un query parameter WordPress non è gestibile come redirect server-side da GitHub Pages. Se non supportato, mantenere il vecchio sito e un avviso/link approvato; non cancellarlo.

Backup nuovo sito: conservare sorgenti, lockfile, tag/revisione approvata, artifact dist e questa guida su spazio del cliente, più copia separata verificata. Verificare che un clone pulito con npm ci e build ricrei il sito. Le copie del vecchio sito con dati personali devono avere accesso ristretto e conservazione definita dal titolare.

Rollback: conservare prima del passaggio zona DNS e hosting precedente funzionante; in caso di errore ripristinare artifact approvato o, con nuova autorizzazione, i soli record web precedenti usando l’export, senza toccare email. Considerare cache e TTL. Ricontrollare HTTPS e recapiti. Non distruggere backup o vecchio hosting fino ad approvazione finale.

## Checklist di rilascio e dati mancanti

- [ ] Ragione sociale reale (TurboMastin è nome commerciale), dati fiscali pertinenti e altri dati obbligatori applicabili.
- [ ] Titolare del trattamento e indirizzo, contatto privacy, finalità e basi giuridiche validate.
- [ ] Telefono, email, indirizzo e orari complessivi riconfermati dal cliente. Domenica chiuso già confermato il 25/11/2026.
- [ ] Hosting/fornitori, ruoli, trasferimenti e conservazione definiti; informative completate e approvate.
- [ ] Approvazione esplicita dei testi, dell’offerta e del wordmark.
- [ ] Diritti su immagini/grafica/font: validare la foto officina.jpeg fornita dal committente e le future fotografie dei lavori.
- [ ] Dominio definitivo, intestazione e accessi cliente; nessun dominio prenotato dal progetto.
- [x] WhatsApp confermato dal committente: 393 930 5804 con prefisso +39, link esterno distinto dal fisso.
- [ ] Approvazione della selezione di recensioni, attribuzioni e condizioni della ripubblicazione; riconfermare la fonte prima del rilascio.
- [ ] Idoneità GitHub Pages chiarita e condizioni ricontrollate; altrimenti scegliere hosting con il cliente.
- [ ] Modalità di manutenzione successiva, responsabilità e accessi concordati.
- [ ] Backup completo e inventario URL, piano redirect realmente supportato e rollback approvati.
- [ ] Audit produzione rete/cookie/storage e HTTPS, test accessibilità, reflow/zoom e dispositivi reali.
- [ ] Nessun segnaposto, nessun example.invalid, canonical e sitemap corretti; staging non indicizzabile, produzione indicizzabile solo dopo approvazione.
- [ ] Approvazione finale del cliente prima di avviare manualmente workflow o cambiare DNS.

## Limiti noti

Nessuna certificazione WCAG o garanzia legale. Test headless non equivalgono a Safari, screen reader o dispositivi reali. Informative ancora bozze. Una sola fotografia fornita; galleria lavori da completare con altre foto e didascalie confermate. Screenshot originale non disponibile. Backup origine non completo. Nessun DNS, HTTPS produzione, accesso GitHub o email verificato con invio/chiamata reale. I link tel/email vengono controllati senza effettuare chiamate o inviare messaggi. I risultati misurati sono in artifacts; non sono dati di utenti reali. Leggere il report test prima del rilascio.
