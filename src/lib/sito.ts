export const sito = {
  nome: 'Arcaland',
  sedi: [
    { citta: 'Reggio Emilia', ruolo: 'Sede commerciale' },
    { citta: 'Porto Viro', ruolo: 'Produzione' },
  ],
  menu: [
    { etichetta: 'Prodotti', href: '/prodotti' },
    { etichetta: 'Hexaplay', href: '/hexaplay' },
    { etichetta: 'Servizi', href: '/servizi' },
    { etichetta: 'Realizzazioni', href: '/realizzazioni' },
    { etichetta: 'Chi siamo', href: '/chi-siamo' },
    { etichetta: 'News', href: '/news' },
  ],
} as const;
