/**
 * Verbindliche Rechtstexte der SYMMEDIS-Website.
 *
 * Wortlaut aus dem freigegebenen Entwurf (Stand: 30. Juli 2026). Inhalte
 * werden nicht gekürzt, umformuliert oder „vereinfacht“ – nur die Typografie
 * (Überschriftenhierarchie, Listen, Abstände) wird für Web und Druck gesetzt.
 *
 * Blockmodell je Dokument:
 *   { t: 'p',       text }          – Absatz
 *   { t: 'lines',   items: [...] }  – zusammengehörige Zeilen (Adresse o. Ä.)
 *   { t: 'h2',      text }          – Abschnittsüberschrift
 *   { t: 'h3',      text }          – Unterüberschrift
 *   { t: 'ol',      items: [...] }  – nummerierte Liste
 *   { t: 'ul',      items: [...] }  – Aufzählung
 * E-Mail-Adressen im Text werden im Renderer automatisch zu mailto-Links.
 */

export const IMPRESSUM = {
  id: 'impressum',
  titel: 'Impressum',
  stand: 'Stand: 30. Juli 2026',
  seo: {
    title: 'Impressum | SYMMEDIS',
    description:
      'Impressum von SYMMEDIS – Anbieterkennzeichnung gemäß § 5 Digitale-Dienste-Gesetz (DDG).',
  },
  blocks: [
    { t: 'p', text: 'Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)' },
    {
      t: 'lines',
      items: [
        'SYMMEDIS',
        'Alfred Michael Waizmann',
        'Am Kugelanger 7',
        '83629 Weyarn',
        'Deutschland',
        'Telefon: +49 (0) 80 20 / 90 89 24',
        'E-Mail: amw@symmedis.de',
      ],
    },
    { t: 'h3', text: 'Umsatzsteuer-Identifikationsnummer' },
    {
      t: 'lines',
      items: [
        'Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:',
        'DE212839276',
      ],
    },
    { t: 'h3', text: 'Verantwortlich für journalistisch-redaktionelle Inhalte' },
    {
      t: 'lines',
      items: [
        'Verantwortlich gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):',
        'Alfred Michael Waizmann',
        'David Constantin Waizmann',
        'Am Kugelanger 7',
        '83629 Weyarn',
      ],
    },
    { t: 'h3', text: 'Haftung für externe Links' },
    {
      t: 'p',
      text: 'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für die Inhalte der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.',
    },
  ],
}

export const AGB = {
  id: 'agb',
  titel: 'Allgemeine Geschäftsbedingungen',
  stand: 'Stand: 30. Juli 2026',
  hinweis:
    'Diese Allgemeinen Geschäftsbedingungen gelten ausschließlich im Geschäftsverkehr mit Unternehmern (B2B). Verträge mit Verbrauchern werden auf ihrer Grundlage nicht geschlossen.',
  seo: {
    title: 'AGB | SYMMEDIS',
    description:
      'Allgemeine Geschäftsbedingungen von SYMMEDIS für Beratungs-, Analyse- und Digitalleistungen im B2B-Bereich.',
  },
  blocks: [
    { t: 'h2', text: '1. Geltungsbereich' },
    {
      t: 'ol',
      items: [
        'Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Verträge über Beratungs-, Analyse-, Strategie-, Kommunikations-, Marketing-, Digital-, Software- und sonstige Dienstleistungen von SYMMEDIS, Alfred Michael Waizmann, Am Kugelanger 7, 83629 Weyarn, nachfolgend „SYMMEDIS“, gegenüber Unternehmern im Sinne des § 14 BGB, juristischen Personen des öffentlichen Rechts und öffentlich-rechtlichen Sondervermögen.',
        'Verträge mit Verbrauchern werden auf Grundlage dieser AGB nicht geschlossen.',
        'Abweichende Geschäftsbedingungen des Auftraggebers gelten nur, wenn SYMMEDIS ihrer Geltung ausdrücklich in Textform zugestimmt hat.',
        'Individuelle Vereinbarungen im Angebot, in einer Leistungsbeschreibung oder in einem Einzelvertrag haben Vorrang vor diesen AGB.',
      ],
    },
    { t: 'h2', text: '2. Vertragsgegenstand' },
    {
      t: 'ol',
      items: [
        'SYMMEDIS erbringt insbesondere strategische Ursachenanalysen, Positionierungs-, Kommunikations-, Marketing-, Vertriebs-, E-Commerce-, Webdesign-, KI- und Digitalberatungsleistungen sowie softwaregestützte Analyse-, Dokumentations- und Projektleistungen.',
        'Der konkrete Leistungsumfang ergibt sich aus dem jeweiligen Angebot, der Leistungsbeschreibung oder dem Einzelvertrag.',
        'Soweit nicht ausdrücklich ein bestimmter Erfolg als geschuldet vereinbart wird, erbringt SYMMEDIS Dienstleistungen. Ein bestimmter wirtschaftlicher, vertrieblicher, kommunikativer oder technischer Erfolg ist nicht geschuldet.',
        'Strategische Empfehlungen beruhen auf den vom Auftraggeber bereitgestellten Informationen sowie auf der fachlichen Bewertung von SYMMEDIS. Sie ersetzen keine medizinische, heilkundliche, rechtliche, steuerliche oder behördliche Beratung.',
        'SYMMEDIS erbringt keine medizinischen Leistungen und trifft keine Diagnose- oder Therapieentscheidungen für Patienten.',
      ],
    },
    { t: 'h2', text: '3. Vertragsschluss' },
    {
      t: 'ol',
      items: [
        'Präsentationen, Website-Inhalte, Erstgespräche und unverbindliche Einschätzungen stellen noch kein verbindliches Vertragsangebot dar.',
        'Ein Vertrag kommt durch die Annahme eines individuellen Angebots, durch Unterzeichnung eines Einzelvertrags, durch eine ausdrückliche Auftragsbestätigung oder durch den einvernehmlichen Beginn der Leistungserbringung zustande.',
        'Änderungen oder Ergänzungen des Leistungsumfangs bedürfen mindestens der Textform.',
      ],
    },
    { t: 'h2', text: '4. Leistungserbringung und Projektablauf' },
    {
      t: 'ol',
      items: [
        'SYMMEDIS erbringt die vereinbarten Leistungen nach fachlichem Ermessen und unter Berücksichtigung des vereinbarten Projektziels.',
        'Angaben zu Zeiträumen, insbesondere eine typische Analysedauer von 10 bis 14 Tagen, setzen voraus, dass der Auftraggeber alle erforderlichen Informationen, Unterlagen, Zugänge und Freigaben rechtzeitig und vollständig bereitstellt.',
        'Teilleistungen sind zulässig, soweit sie für den Auftraggeber zumutbar sind.',
        'SYMMEDIS darf zur Leistungserbringung geeignete Mitarbeiter, freie Mitarbeiter und fachkundige Subunternehmer einsetzen. SYMMEDIS bleibt für die vertragsgemäße Leistung verantwortlich.',
        'Nicht im Angebot enthaltene Zusatzleistungen werden nur nach vorheriger Abstimmung erbracht und gesondert vergütet.',
      ],
    },
    { t: 'h2', text: '5. Mitwirkungspflichten des Auftraggebers' },
    {
      t: 'ol',
      items: [
        'Der Auftraggeber stellt alle für das Projekt erforderlichen Informationen, Unterlagen, Ansprechpartner, Zugänge, Freigaben und Entscheidungen rechtzeitig, vollständig und in geeigneter Form zur Verfügung.',
        'Der Auftraggeber gewährleistet, dass die von ihm bereitgestellten Inhalte, Daten, Bilder, Marken, Texte, Zugänge und sonstigen Materialien rechtmäßig genutzt und an SYMMEDIS übermittelt werden dürfen.',
        'Personenbezogene Daten, insbesondere Gesundheits- oder Patientendaten, dürfen nur übermittelt werden, wenn dies ausdrücklich vereinbart, erforderlich und datenschutzrechtlich zulässig ist. Ohne ausdrückliche Vereinbarung sind solche Daten vor der Übermittlung zu anonymisieren.',
        'Verzögerungen oder Mehraufwand, die auf verspäteter, unvollständiger oder fehlerhafter Mitwirkung beruhen, gehen nicht zulasten von SYMMEDIS. Vereinbarte Fristen verlängern sich angemessen. Nach vorherigem Hinweis darf zusätzlicher Aufwand gesondert berechnet werden.',
      ],
    },
    { t: 'h2', text: '6. Termine, Verzögerungen und höhere Gewalt' },
    {
      t: 'ol',
      items: [
        'Termine und Fristen sind nur verbindlich, wenn sie ausdrücklich als verbindlich vereinbart wurden.',
        'Ereignisse außerhalb des zumutbaren Einflussbereichs von SYMMEDIS, insbesondere Ausfälle von Infrastruktur oder Drittanbietern, Cyberangriffe, Energie- oder Netzausfälle, behördliche Maßnahmen, Streiks, Naturereignisse oder sonstige Fälle höherer Gewalt, verlängern Leistungsfristen angemessen.',
        'SYMMEDIS informiert den Auftraggeber über wesentliche Verzögerungen, sobald dies zumutbar möglich ist.',
      ],
    },
    { t: 'h2', text: '7. Vergütung und Zahlungsbedingungen' },
    {
      t: 'ol',
      items: [
        'Die Vergütung ergibt sich aus dem jeweiligen Angebot oder Einzelvertrag. Der typische Investitionsrahmen für eine Ursachenanalyse kann – abhängig von Umfang, Datenlage, Unternehmensgröße sowie Anzahl der Märkte oder Produktbereiche – 7.500 bis 10.000 Euro netto betragen.',
        'Sämtliche Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer.',
        'Soweit nichts anderes vereinbart ist, darf SYMMEDIS angemessene Abschlagszahlungen entsprechend dem Projektfortschritt verlangen.',
        'Rechnungen sind innerhalb von 14 Kalendertagen ab Zugang ohne Abzug fällig, sofern im Angebot nichts anderes vereinbart ist.',
        'Reise-, Übernachtungs-, Versand-, Lizenz- und sonstige erforderliche Fremdkosten werden nur berechnet, wenn dies vereinbart oder vom Auftraggeber freigegeben wurde.',
        'Bei Zahlungsverzug gelten die gesetzlichen Vorschriften. SYMMEDIS darf nach vorheriger Mahnung weitere Leistungen bis zur Zahlung zurückhalten, soweit dies angemessen ist.',
      ],
    },
    { t: 'h2', text: '8. Änderungswünsche' },
    {
      t: 'ol',
      items: [
        'Änderungswünsche nach Vertragsschluss werden hinsichtlich Auswirkungen auf Aufwand, Vergütung und Termine geprüft.',
        'SYMMEDIS ist erst nach einer Einigung über die Änderung zu deren Umsetzung verpflichtet.',
        'Geringfügige fachlich oder technisch notwendige Anpassungen, die den vereinbarten Vertragszweck nicht beeinträchtigen, bleiben zulässig.',
      ],
    },
    { t: 'h2', text: '9. Software, Portale und Zugänge' },
    {
      t: 'ol',
      items: [
        'Soweit SYMMEDIS dem Auftraggeber im Rahmen eines Projekts Zugriff auf Software, Dashboards, Kundenportale oder digitale Arbeitsbereiche gewährt, erhält der Auftraggeber für die vereinbarte Vertragsdauer ein einfaches, nicht ausschließliches, nicht übertragbares und auf den Vertragszweck beschränktes Nutzungsrecht.',
        'Zugänge dürfen nur den vereinbarten berechtigten Personen zur Verfügung gestellt werden. Zugangsdaten sind vertraulich zu behandeln und vor unbefugtem Zugriff zu schützen.',
        'Eine dauerhafte Verfügbarkeit bestimmter Funktionen ist nur geschuldet, wenn dies ausdrücklich vereinbart ist. Wartung, Sicherheitsmaßnahmen und technisch erforderliche Änderungen können vorübergehende Einschränkungen verursachen.',
        'Reverse Engineering, Umgehung technischer Schutzmaßnahmen, automatisiertes Auslesen, Weiterverkauf oder unbefugte Weitergabe von Zugängen ist untersagt, soweit nicht zwingendes Recht entgegensteht.',
        'Demo-Bereiche sind ausschließlich zu Demonstrations- und Testzwecken bestimmt. Dargestellte Beispieldaten sind fiktiv und dürfen nicht als reale Kunden-, Patienten- oder Unternehmensergebnisse verstanden werden.',
      ],
    },
    { t: 'h2', text: '10. Nutzungsrechte an Arbeitsergebnissen' },
    {
      t: 'ol',
      items: [
        'Nach vollständiger Zahlung erhält der Auftraggeber an den individuell für ihn erstellten und vereinbarten Arbeitsergebnissen die im Angebot beschriebenen Nutzungsrechte.',
        'Soweit im Angebot nichts anderes geregelt ist, erhält der Auftraggeber ein einfaches, zeitlich und räumlich unbeschränktes Nutzungsrecht für eigene geschäftliche Zwecke.',
        'Vorbestehende Methoden, Modelle, Vorlagen, Software, Bibliotheken, Analyseverfahren, Know-how, allgemeine Konzepte und wiederverwendbare Bestandteile von SYMMEDIS verbleiben bei SYMMEDIS.',
        'Rechte Dritter, insbesondere an Bildern, Schriften, Software, Datenbanken oder Plattformen, richten sich nach den jeweiligen Lizenzbedingungen.',
        'Offene Arbeitsdateien, Quellcodes oder interne Methodendokumentationen sind nur geschuldet, wenn dies ausdrücklich vereinbart wurde.',
      ],
    },
    { t: 'h2', text: '11. Vertraulichkeit' },
    {
      t: 'ol',
      items: [
        'Beide Parteien behandeln alle als vertraulich erkennbaren oder bezeichneten geschäftlichen, technischen und organisatorischen Informationen der jeweils anderen Partei vertraulich.',
        'Die Verpflichtung gilt nicht für Informationen, die bereits öffentlich bekannt waren, rechtmäßig von Dritten erlangt wurden, unabhängig entwickelt wurden oder aufgrund gesetzlicher Verpflichtung offengelegt werden müssen.',
        'Gesetzliche Geheimhaltungs- und Datenschutzpflichten bleiben unberührt.',
      ],
    },
    { t: 'h2', text: '12. Datenschutz' },
    {
      t: 'ol',
      items: [
        'Beide Parteien beachten die anwendbaren Datenschutzvorschriften.',
        'Soweit SYMMEDIS personenbezogene Daten im Auftrag des Auftraggebers verarbeitet, schließen die Parteien vor Beginn der Verarbeitung eine erforderliche Vereinbarung zur Auftragsverarbeitung.',
        'Der Auftraggeber bleibt für die Rechtmäßigkeit der Datenerhebung und Datenübermittlung verantwortlich, soweit er über Zwecke und Mittel der Verarbeitung entscheidet.',
        'Ohne ausdrückliche Vereinbarung sollen keine besonderen Kategorien personenbezogener Daten, insbesondere Gesundheitsdaten, an SYMMEDIS übermittelt werden.',
      ],
    },
    { t: 'h2', text: '13. Rechte Dritter und Freistellung' },
    {
      t: 'ol',
      items: [
        'Der Auftraggeber versichert, dass die von ihm bereitgestellten Materialien und Anweisungen keine Rechte Dritter verletzen.',
        'Wird SYMMEDIS wegen einer vom Auftraggeber zu vertretenden Rechtsverletzung durch bereitgestellte Inhalte oder Weisungen in Anspruch genommen, stellt der Auftraggeber SYMMEDIS von berechtigten Ansprüchen und angemessenen Kosten der Rechtsverteidigung frei. Dies gilt nicht, soweit der Auftraggeber die Rechtsverletzung nicht zu vertreten hat.',
        'SYMMEDIS informiert den Auftraggeber unverzüglich über entsprechende Ansprüche und stimmt die Rechtsverteidigung angemessen mit ihm ab.',
      ],
    },
    { t: 'h2', text: '14. Mängel und Beanstandungen' },
    {
      t: 'ol',
      items: [
        'Der Auftraggeber prüft übermittelte Arbeitsergebnisse zeitnah und teilt erkennbare Beanstandungen nachvollziehbar mit.',
        'Bei berechtigten Beanstandungen erhält SYMMEDIS zunächst Gelegenheit zur angemessenen Nachbesserung, soweit die Leistung ihrer Art nach einer Nachbesserung zugänglich ist.',
        'Geschmackliche oder strategische Abweichungen von subjektiven Erwartungen sind kein Mangel, wenn die vereinbarte Leistung fachgerecht erbracht wurde.',
      ],
    },
    { t: 'h2', text: '15. Haftung' },
    {
      t: 'ol',
      items: [
        'SYMMEDIS haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit, für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, bei arglistigem Verschweigen eines Mangels, bei Übernahme einer Garantie sowie nach zwingenden gesetzlichen Vorschriften.',
        'Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist die Haftung auf den vertragstypischen, bei Vertragsschluss vorhersehbaren Schaden begrenzt. Wesentliche Vertragspflichten sind solche, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Auftraggeber regelmäßig vertrauen darf.',
        'Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.',
        'Die vorstehenden Haftungsbeschränkungen gelten auch zugunsten der gesetzlichen Vertreter, Mitarbeiter und Erfüllungsgehilfen von SYMMEDIS.',
        'Eine Haftung für den wirtschaftlichen Erfolg empfohlener Maßnahmen, Entscheidungen des Auftraggebers oder Leistungen externer Anbieter wird nicht übernommen, soweit SYMMEDIS keine ausdrückliche Garantie abgegeben hat.',
      ],
    },
    { t: 'h2', text: '16. Vertragsdauer und Kündigung' },
    {
      t: 'ol',
      items: [
        'Vertragsdauer und ordentliche Kündigung richten sich nach dem jeweiligen Angebot oder Einzelvertrag.',
        'Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.',
        'Kündigungen bedürfen mindestens der Textform.',
        'Im Fall einer vorzeitigen Vertragsbeendigung sind die bis zum Wirksamwerden der Kündigung erbrachten Leistungen sowie verbindlich eingegangene Fremdkosten zu vergüten.',
        'Nach Vertragsende enden zeitlich beschränkte Zugangs- und Nutzungsrechte, sofern nichts anderes vereinbart wurde.',
      ],
    },
    { t: 'h2', text: '17. Referenznennung' },
    {
      t: 'p',
      text: 'SYMMEDIS darf Namen, Marken, Logos, Projektdetails oder Ergebnisse des Auftraggebers nur mit dessen vorheriger ausdrücklicher Zustimmung als Referenz veröffentlichen.',
    },
    { t: 'h2', text: '18. Schlussbestimmungen' },
    {
      t: 'ol',
      items: [
        'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
        'Erfüllungsort ist der Sitz von SYMMEDIS, soweit nichts anderes vereinbart ist.',
        'Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist – soweit gesetzlich zulässig – der Sitz von SYMMEDIS Gerichtsstand.',
        'Änderungen und Ergänzungen des Vertrags bedürfen mindestens der Textform, sofern nicht eine strengere Form gesetzlich vorgeschrieben ist.',
        'Sollten einzelne Bestimmungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung treten die gesetzlichen Vorschriften.',
      ],
    },
  ],
}

export const DATENSCHUTZ = {
  id: 'datenschutz',
  titel: 'Datenschutzerklärung',
  stand: 'Stand: 30. Juli 2026',
  seo: {
    title: 'Datenschutzerklärung | SYMMEDIS',
    description:
      'Datenschutzerklärung von SYMMEDIS – Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.',
  },
  blocks: [
    { t: 'h2', text: '1. Verantwortlicher' },
    { t: 'p', text: 'Verantwortlich für die Datenverarbeitung auf dieser Website ist:' },
    {
      t: 'lines',
      items: [
        'SYMMEDIS',
        'Alfred Michael Waizmann',
        'Am Kugelanger 7',
        '83629 Weyarn',
        'Deutschland',
        'Telefon: +49 (0) 80 20 / 90 89 24',
        'E-Mail: amw@symmedis.de',
      ],
    },
    {
      t: 'p',
      text: 'Ein Datenschutzbeauftragter ist derzeit nicht benannt. Sollte künftig eine gesetzliche Benennungspflicht bestehen oder ein Datenschutzbeauftragter bestellt werden, wird diese Erklärung entsprechend aktualisiert.',
    },
    { t: 'h2', text: '2. Allgemeine Hinweise' },
    {
      t: 'p',
      text: 'Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website, zur Kommunikation, zur Bearbeitung von Anfragen, zur Durchführung vorvertraglicher Maßnahmen, zur Vertragserfüllung oder aufgrund einer gesetzlichen Verpflichtung erforderlich ist.',
    },
    {
      t: 'p',
      text: 'Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare Person beziehen.',
    },
    { t: 'h2', text: '3. Hosting über GitHub Pages' },
    {
      t: 'p',
      text: 'Diese Website wird derzeit über GitHub Pages bereitgestellt. Anbieter sind je nach Verarbeitungskontext insbesondere GitHub B.V., Prins Bernhardplein 200, 1097 JB Amsterdam, Niederlande, und GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA.',
    },
    {
      t: 'p',
      text: 'Beim Aufruf einer GitHub-Pages-Website wird die IP-Adresse des Besuchers von GitHub zu Sicherheitszwecken protokolliert und gespeichert. Darüber hinaus können technisch erforderliche Verbindungs- und Nutzungsdaten verarbeitet werden, insbesondere:',
    },
    {
      t: 'ul',
      items: [
        'IP-Adresse,',
        'Datum und Uhrzeit des Zugriffs,',
        'aufgerufene Seite oder Datei,',
        'übertragene Datenmenge,',
        'Browsertyp und Browserversion,',
        'Betriebssystem,',
        'Referrer-URL,',
        'Status der Serverantwort.',
      ],
    },
    {
      t: 'p',
      text: 'Die Verarbeitung dient der sicheren und stabilen Bereitstellung der Website, der Fehleranalyse und dem Schutz vor Missbrauch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren, zuverlässigen und technisch funktionsfähigen Bereitstellung unseres Internetauftritts.',
    },
    {
      t: 'p',
      text: 'Bei einer Verarbeitung durch GitHub in den USA kann eine Übermittlung personenbezogener Daten in ein Drittland nicht ausgeschlossen werden. Weitere Informationen enthält die jeweils aktuelle Datenschutzerklärung von GitHub.',
    },
    {
      t: 'p',
      text: 'Die Speicherdauer wird im Wesentlichen durch GitHub bestimmt. Wir selbst erhalten über GitHub Pages grundsätzlich keinen frei verfügbaren Zugriff auf personenbezogene Serverprotokolle, soweit nicht im Einzelfall zusätzliche GitHub-Funktionen eingesetzt werden.',
    },
    { t: 'h2', text: '4. Kontaktaufnahme per E-Mail oder Telefon' },
    {
      t: 'p',
      text: 'Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Daten, insbesondere:',
    },
    {
      t: 'ul',
      items: [
        'Name,',
        'Kontaktdaten,',
        'Unternehmen,',
        'Inhalt der Anfrage,',
        'gegebenenfalls weitere freiwillig übermittelte Informationen.',
      ],
    },
    { t: 'p', text: 'Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage.' },
    {
      t: 'p',
      text: 'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn Ihre Anfrage auf einen Vertrag oder vorvertragliche Maßnahmen gerichtet ist. In anderen Fällen erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sachgerechten Bearbeitung geschäftlicher Anfragen und Kommunikation.',
    },
    {
      t: 'p',
      text: 'Anfragen werden gelöscht, wenn sie abschließend bearbeitet sind und keine gesetzlichen Aufbewahrungspflichten oder berechtigten Gründe für eine weitere Speicherung bestehen. Handels- und steuerrechtlich relevante Unterlagen werden entsprechend den gesetzlichen Aufbewahrungsfristen gespeichert.',
    },
    {
      t: 'p',
      text: 'Bitte übermitteln Sie per unverschlüsselter E-Mail keine Patienten-, Gesundheits- oder sonstigen besonders sensiblen Daten.',
    },
    { t: 'h2', text: '5. Termin- und Kontaktformular' },
    {
      t: 'p',
      text: 'Soweit auf der Website ein Formular zur Termin- oder Kontaktanfrage eingesetzt wird, verarbeiten wir die dort eingegebenen Daten zur Bearbeitung der Anfrage und zur Anbahnung einer möglichen Zusammenarbeit.',
    },
    { t: 'p', text: 'Hierzu können gehören:' },
    {
      t: 'ul',
      items: [
        'Name,',
        'Unternehmen,',
        'E-Mail-Adresse,',
        'freiwillige Angaben zur geschäftlichen Situation,',
        'gewünschter Termin,',
        'technische Metadaten des Formularaufrufs.',
      ],
    },
    {
      t: 'p',
      text: 'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage vorvertraglichen Maßnahmen dient. Im Übrigen ist Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO.',
    },
    {
      t: 'p',
      text: 'Pflichtfelder werden auf das für die Bearbeitung erforderliche Maß beschränkt. Gesundheits- oder Patientendaten sollen über das Formular nicht übermittelt werden.',
    },
    {
      t: 'p',
      text: 'Solange das auf der Demo-Website sichtbare Formular ausschließlich lokal eine Demonstration anzeigt und keine Daten übermittelt oder speichert, muss dieser Umstand unmittelbar am Formular klar erkennbar bleiben. Vor Aktivierung einer echten Übermittlung muss die Datenschutzerklärung an den tatsächlich eingesetzten Empfänger, die Datenflüsse und die Speicherdauer angepasst werden.',
    },
    { t: 'h2', text: '6. Externe Terminbuchung' },
    {
      t: 'p',
      text: 'Soweit künftig über die Konfiguration VITE_BOOKING_URL ein externer Terminbuchungsdienst verlinkt oder eingebunden wird, gelten ergänzend die Datenschutzinformationen des jeweiligen Anbieters.',
    },
    {
      t: 'p',
      text: 'Eine bloße Verlinkung soll erst nach einer bewussten Handlung des Nutzers aufgerufen werden. Eine direkte Einbettung, bei der bereits beim Seitenaufruf Daten an den Anbieter übertragen werden, darf erst nach datenschutzrechtlicher Prüfung und – soweit erforderlich – wirksamer Einwilligung aktiviert werden.',
    },
    { t: 'p', text: 'Vor der Aktivierung müssen mindestens ergänzt werden:' },
    {
      t: 'ul',
      items: [
        'Name und Anschrift des Anbieters,',
        'verarbeitete Daten,',
        'Zweck,',
        'Rechtsgrundlage,',
        'Empfänger,',
        'Drittlandtransfer,',
        'Speicherdauer,',
        'Widerrufsmöglichkeit.',
      ],
    },
    { t: 'h2', text: '7. Demo, Login, Kunden- und Mitarbeiterportal' },
    {
      t: 'p',
      text: 'Die öffentlich zugänglichen Demo-, Login-, Kundenportal- und Mitarbeiterportalbereiche können derzeit ausschließlich Demonstrationszwecken dienen.',
    },
    {
      t: 'p',
      text: 'Soweit Eingaben nur lokal im Browser verarbeitet und nicht an einen Server übertragen werden, findet durch SYMMEDIS keine serverseitige Speicherung dieser Eingaben statt. Die durch den Aufruf entstehenden Hostingdaten bleiben hiervon unberührt.',
    },
    {
      t: 'p',
      text: 'Vor Aktivierung echter Benutzerkonten, Authentifizierung, serverseitiger Speicherung oder produktiver Portale muss diese Datenschutzerklärung um die tatsächlichen Verarbeitungsprozesse ergänzt werden. Dazu gehören insbesondere:',
    },
    {
      t: 'ul',
      items: [
        'Registrierung und Anmeldung,',
        'Benutzerstammdaten,',
        'Rollen und Berechtigungen,',
        'Projekt- und Kommunikationsdaten,',
        'Dokumente,',
        'Protokollierung sicherheitsrelevanter Vorgänge,',
        'Speicherdauer,',
        'Empfänger und Auftragsverarbeiter.',
      ],
    },
    {
      t: 'p',
      text: 'In Demo-Bereiche dürfen keine realen Patienten-, Gesundheits-, Kunden- oder vertraulichen Unternehmensdaten eingegeben werden.',
    },
    { t: 'h2', text: '8. Lokale Speicherung und Theme-Einstellung' },
    {
      t: 'p',
      text: 'Die Website kann technisch notwendige Informationen lokal im Browser speichern, beispielsweise die vom Nutzer gewählte Darstellung im Hell- oder Dunkelmodus.',
    },
    {
      t: 'p',
      text: 'Soweit eine Speicherung oder ein Zugriff auf Informationen in der Endeinrichtung unbedingt erforderlich ist, um eine vom Nutzer ausdrücklich gewünschte Funktion bereitzustellen, erfolgt dies auf Grundlage von § 25 Abs. 2 Nr. 2 TDDDG. Eine weitergehende personenbezogene Verarbeitung kann auf Art. 6 Abs. 1 lit. f DSGVO beruhen.',
    },
    {
      t: 'p',
      text: 'Nicht erforderliche Analyse-, Marketing- oder Trackingtechnologien werden nicht ohne vorherige wirksame Einwilligung eingesetzt.',
    },
    { t: 'h2', text: '9. Cookies, Analyse und Tracking' },
    {
      t: 'p',
      text: 'Nach aktuellem Stand setzt die Website keine eigenen nicht erforderlichen Analyse-, Werbe- oder Trackingcookies ein.',
    },
    {
      t: 'p',
      text: 'Ein Einwilligungsbanner ist nur dann einzusetzen, wenn künftig Technologien verwendet werden, die eine Einwilligung nach § 25 TDDDG oder Art. 6 Abs. 1 lit. a DSGVO erfordern.',
    },
    {
      t: 'p',
      text: 'Vor Aktivierung von Analyse-, Marketing-, Video-, Karten-, Chat-, Schrift-, Social-Media- oder sonstigen Drittinhalten muss geprüft werden, ob bereits beim Laden personenbezogene Daten an Dritte übertragen oder Informationen auf dem Endgerät gespeichert beziehungsweise ausgelesen werden.',
    },
    { t: 'h2', text: '10. Externe Links und LinkedIn' },
    {
      t: 'p',
      text: 'Diese Website enthält Links zu externen Websites, insbesondere zu LinkedIn-Profilen.',
    },
    {
      t: 'p',
      text: 'Beim bloßen Anzeigen eines normalen externen Links werden grundsätzlich noch keine personenbezogenen Daten an die verlinkte Plattform übertragen. Erst wenn Sie den Link anklicken, verlassen Sie unsere Website und es gelten die Datenschutzbestimmungen des jeweiligen Anbieters.',
    },
    {
      t: 'p',
      text: 'Eine direkte Einbettung von LinkedIn-Plugins, Feeds, Tracking-Pixeln oder vergleichbaren Technologien ist derzeit nicht vorgesehen. Sollte eine solche Einbindung erfolgen, muss diese Datenschutzerklärung vorab angepasst und eine gegebenenfalls erforderliche Einwilligung umgesetzt werden.',
    },
    { t: 'h2', text: '11. Empfänger von Daten' },
    {
      t: 'p',
      text: 'Personenbezogene Daten erhalten nur diejenigen Stellen, die sie zur Erfüllung der jeweiligen Zwecke benötigen.',
    },
    { t: 'p', text: 'Empfänger können insbesondere sein:' },
    {
      t: 'ul',
      items: [
        'Hosting- und IT-Dienstleister,',
        'Kommunikationsdienstleister,',
        'fachkundige Auftragnehmer und Subunternehmer,',
        'Steuerberater, Rechtsberater oder Behörden, soweit dies erforderlich oder gesetzlich vorgeschrieben ist,',
        'später eingesetzte Buchungs-, CRM- oder Plattformanbieter nach entsprechender Aktualisierung dieser Erklärung.',
      ],
    },
    { t: 'p', text: 'Soweit erforderlich, werden Verträge zur Auftragsverarbeitung abgeschlossen.' },
    { t: 'h2', text: '12. Drittlandübermittlungen' },
    {
      t: 'p',
      text: 'Eine Verarbeitung außerhalb der Europäischen Union oder des Europäischen Wirtschaftsraums kann insbesondere durch GitHub oder künftig eingesetzte Drittanbieter erfolgen.',
    },
    {
      t: 'p',
      text: 'Eine Übermittlung erfolgt nur, wenn die gesetzlichen Voraussetzungen erfüllt sind, beispielsweise aufgrund eines Angemessenheitsbeschlusses, geeigneter Garantien oder einer gesetzlichen Ausnahme. Welche konkrete Grundlage verwendet wird, richtet sich nach dem jeweiligen Anbieter und Verarbeitungsvorgang.',
    },
    { t: 'h2', text: '13. Speicherdauer' },
    {
      t: 'p',
      text: 'Wir speichern personenbezogene Daten nur so lange, wie dies für den jeweiligen Zweck erforderlich ist.',
    },
    {
      t: 'p',
      text: 'Darüber hinaus können gesetzliche Aufbewahrungspflichten bestehen. Daten werden außerdem gespeichert, soweit dies zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist.',
    },
    {
      t: 'p',
      text: 'Für Daten, die ausschließlich durch externe Anbieter verarbeitet werden, gelten ergänzend deren Speicher- und Löschkonzepte.',
    },
    { t: 'h2', text: '14. Rechtsgrundlagen' },
    { t: 'p', text: 'Je nach Verarbeitung stützen wir uns insbesondere auf:' },
    {
      t: 'ul',
      items: [
        'Art. 6 Abs. 1 lit. a DSGVO – Einwilligung,',
        'Art. 6 Abs. 1 lit. b DSGVO – Vertrag und vorvertragliche Maßnahmen,',
        'Art. 6 Abs. 1 lit. c DSGVO – rechtliche Verpflichtung,',
        'Art. 6 Abs. 1 lit. f DSGVO – berechtigte Interessen,',
        '§ 25 Abs. 2 Nr. 2 TDDDG – technisch unbedingt erforderliche Speicherung oder Zugriff auf Endgeräte.',
      ],
    },
    { t: 'h2', text: '15. Ihre Rechte' },
    {
      t: 'p',
      text: 'Sie haben im Rahmen der gesetzlichen Voraussetzungen insbesondere das Recht auf:',
    },
    {
      t: 'ul',
      items: [
        'Auskunft nach Art. 15 DSGVO,',
        'Berichtigung nach Art. 16 DSGVO,',
        'Löschung nach Art. 17 DSGVO,',
        'Einschränkung der Verarbeitung nach Art. 18 DSGVO,',
        'Datenübertragbarkeit nach Art. 20 DSGVO,',
        'Widerspruch nach Art. 21 DSGVO,',
        'Widerruf einer Einwilligung mit Wirkung für die Zukunft.',
      ],
    },
    {
      t: 'p',
      text: 'Zur Ausübung Ihrer Rechte können Sie sich an die oben angegebenen Kontaktdaten wenden.',
    },
    { t: 'h2', text: '16. Widerspruchsrecht' },
    {
      t: 'p',
      text: 'Soweit die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, haben Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, das Recht, jederzeit Widerspruch gegen die Verarbeitung einzulegen.',
    },
    {
      t: 'p',
      text: 'Wir verarbeiten die betreffenden Daten anschließend nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.',
    },
    { t: 'h2', text: '17. Beschwerderecht' },
    { t: 'p', text: 'Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.' },
    {
      t: 'p',
      text: 'Für nicht-öffentliche Unternehmen mit Sitz in Bayern ist regelmäßig zuständig:',
    },
    {
      t: 'lines',
      items: [
        'Bayerisches Landesamt für Datenschutzaufsicht',
        'Promenade 18',
        '91522 Ansbach',
        'Deutschland',
        'Telefon: +49 (0) 981 / 180093-0',
        'E-Mail: poststelle@lda.bayern.de',
      ],
    },
    { t: 'h2', text: '18. Datensicherheit' },
    {
      t: 'p',
      text: 'Wir treffen angemessene technische und organisatorische Maßnahmen, um personenbezogene Daten vor Verlust, Manipulation und unberechtigtem Zugriff zu schützen.',
    },
    {
      t: 'p',
      text: 'Die Datenübertragung im Internet kann dennoch Sicherheitsrisiken aufweisen. Vertrauliche oder besonders sensible Daten sollten nicht ohne geeignete Schutzmaßnahmen übermittelt werden.',
    },
    { t: 'h2', text: '19. Automatisierte Entscheidungen' },
    {
      t: 'p',
      text: 'Eine ausschließlich automatisierte Entscheidungsfindung im Sinne von Art. 22 DSGVO findet über diese Website derzeit nicht statt.',
    },
    {
      t: 'p',
      text: 'Die strategischen Ergebnisse der SYMMEDIS-Leistungen werden nicht ausschließlich automatisiert freigegeben, sondern menschlich geprüft und eingeordnet.',
    },
    { t: 'h2', text: '20. Aktualisierung dieser Datenschutzerklärung' },
    {
      t: 'p',
      text: 'Wir passen diese Datenschutzerklärung an, wenn sich die Website, eingesetzte Dienste, technische Funktionen oder rechtliche Anforderungen ändern.',
    },
    { t: 'p', text: 'Maßgeblich ist die jeweils auf der Website veröffentlichte Fassung.' },
  ],
}

export const RECHTSSEITEN = { impressum: IMPRESSUM, datenschutz: DATENSCHUTZ, agb: AGB }
