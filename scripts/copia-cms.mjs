// Copia Sveltia CMS dal pacchetto npm nel sito, così il pannello non dipende da un CDN esterno.
import { copyFileSync } from 'node:fs';
copyFileSync('node_modules/@sveltia/cms/dist/sveltia-cms.js', 'public/admin/sveltia-cms.js');
