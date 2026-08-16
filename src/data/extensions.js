export const EXTENSIONS = [
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', status: 'ready', value: 'Deals, Firmen, Kontakte und Funnel-Signale für Vertriebsursachen.' },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', status: 'planned', value: 'Enterprise-CRM, Opportunities und Pipeline-Historie.' },
  { id: 'ga4', name: 'Google Analytics 4', category: 'Analytics', status: 'ready', value: 'Traffic, Conversion, Landingpages und Journey-Signale.' },
  { id: 'search-console', name: 'Google Search Console', category: 'Analytics', status: 'ready', value: 'Suchnachfrage, Rankings, CTR und organische Nachfrage.' },
  { id: 'google-ads', name: 'Google Ads', category: 'Ads', status: 'ready', value: 'Spend, Kampagnen, Keywords und Conversion-Effizienz.' },
  { id: 'meta-ads', name: 'Meta Ads', category: 'Ads', status: 'ready', value: 'Paid-Social-Performance, Creatives und Funnel-Signale.' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', status: 'ready', value: 'B2B-Reichweite, Content-Frequenz und Engagement-Signale.' },
  { id: 'google-drive', name: 'Google Drive', category: 'Storage', status: 'ready', value: 'Freigegebene Kundenunterlagen automatisiert synchronisieren.' },
  { id: 'sharepoint', name: 'Microsoft SharePoint', category: 'Storage', status: 'planned', value: 'Enterprise-Dokumente und Projektordner anbinden.' },
  { id: 'slack', name: 'Slack', category: 'Communication', status: 'ready', value: 'Freigaben, Eskalationen und Analyse-Updates in Teams bringen.' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', status: 'planned', value: 'Enterprise-Benachrichtigungen und Review-Workflows.' },
  { id: 'zapier', name: 'Zapier / Make', category: 'Automation', status: 'ready', value: 'No-code Automationen über Webhooks und standardisierte Events.' },
  { id: 'finance-csv', name: 'Finance Import', category: 'Finance', status: 'ready', value: 'CSV/XLSX-Umsatz, Margen und Produktmix als Diagnose-Signale.' },
]

export const PLATFORM_EXTENSIONS = [
  { id: 'vector', name: 'pgvector', value: 'Semantische Suche und Retrieval über Projektwissen.' },
  { id: 'pg_trgm', name: 'pg_trgm', value: 'Fehlertolerante Global Search über Inhalte und Dokumente.' },
  { id: 'pg_cron', name: 'pg_cron', value: 'Zeitgesteuerte Sync-, Digest- und Reminder-Jobs.' },
  { id: 'pg_net', name: 'pg_net', value: 'Asynchrone HTTP-/Edge-Function-Aufrufe aus Postgres.' },
  { id: 'unaccent', name: 'unaccent', value: 'Robuste Suche unabhängig von Akzenten und Schreibvarianten.' },
]
