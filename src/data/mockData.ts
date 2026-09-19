import { Trip, ImagePreset, WeatherForecastHour } from '../types';

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'p1',
    title: 'Costa Amalfitana e Positano',
    location: 'Positano, Itália',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    category: 'Praia & Mar',
    photographer: 'Ricardo Gomez'
  },
  {
    id: 'p2',
    title: 'Quioto & Templo Kinkaku-ji',
    location: 'Quioto, Japão',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    category: 'Cultura & História',
    photographer: 'Sora Sagano'
  },
  {
    id: 'p3',
    title: 'Picos Alpinos em Zermatt',
    location: 'Zermatt, Suíça',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    category: 'Aventura Alpina',
    photographer: 'Dino Reichmuth'
  },
  {
    id: 'p4',
    title: 'Vista Panorâmica do Rio de Janeiro',
    location: 'Rio de Janeiro, Brasil',
    url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    category: 'Praia & Mar',
    photographer: 'Agustin Diaz'
  },
  {
    id: 'p5',
    title: 'Cúpula e Torre Eiffel ao Entardecer',
    location: 'Paris, França',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    category: 'Gastronomia',
    photographer: 'Anthony DELANOIX'
  },
  {
    id: 'p6',
    title: 'Casas Brancas de Oia & Mar Egeu',
    location: 'Santorini, Grécia',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    category: 'Praia & Mar',
    photographer: 'Heidi Kaden'
  },
  {
    id: 'p7',
    title: 'Terraços de Arroz e Floresta Tropical',
    location: 'Ubud, Bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    category: 'Relax & Spa',
    photographer: 'Geio Tischler'
  },
  {
    id: 'p8',
    title: 'Skyline Noturno de Manhattan',
    location: 'Nova York, EUA',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    category: 'Urbano & Compras',
    photographer: 'Luca Bravo'
  }
];

export const HOURLY_WEATHER_FORECAST: WeatherForecastHour[] = [
  { hour: '08:00', temp: '22°C', icon: 'Sun', condition: 'Ensolarado', rainChance: '5%' },
  { hour: '11:00', temp: '26°C', icon: 'Sun', condition: 'Céu Aberto', rainChance: '10%' },
  { hour: '14:00', temp: '28°C', icon: 'CloudSun', condition: 'Parcialmente Nublado', rainChance: '15%' },
  { hour: '17:00', temp: '25°C', icon: 'Sunset', condition: 'Pôr do Sol Dourado', rainChance: '5%' },
  { hour: '20:00', temp: '21°C', icon: 'Moon', condition: 'Brisa Marítima', rainChance: '0%' },
  { hour: '23:00', temp: '19°C', icon: 'CloudMoon', condition: 'Claro & Agradável', rainChance: '0%' }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-amalfi',
    title: 'Costa Amalfitana dos Sonhos',
    destination: 'Positano & Capri',
    country: 'Itália',
    flag: '🇮🇹',
    coverImageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    directImageLink: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    dateRange: '14 Out - 20 Out, 2026',
    daysCount: 6,
    budgetTotal: 3800,
    budgetSpent: 2150,
    currency: 'EUR (€)',
    status: 'active',
    rating: 4.95,
    tags: ['Praia & Mar', 'Gastronomia', 'Barco Privativo'],
    weatherSummary: {
      temp: '25°C',
      condition: 'Céu Aberto',
      icon: 'Sun'
    },
    budgetItems: [
      { id: 'b1', category: 'accommodation', name: 'Hotel Le Sirenuse (3 noites)', amount: 1200, paid: true, date: '14 Out' },
      { id: 'b2', category: 'transport', name: 'Barco Rápido Sorrento - Positano', amount: 90, paid: true, date: '14 Out' },
      { id: 'b3', category: 'activities', name: 'Passeio Privativo de Riva até Capri', amount: 480, paid: true, date: '16 Out' },
      { id: 'b4', category: 'food', name: 'Jantar Ristorante Da Adolfo', amount: 180, paid: true, date: '15 Out' },
      { id: 'b5', category: 'food', name: 'Degustação de Limoncello artesanal', amount: 65, paid: false, date: '17 Out' },
      { id: 'b6', category: 'shopping', name: 'Cerâmicas tradicionais de Vietri', amount: 135, paid: false, date: '18 Out' }
    ],
    days: [
      {
        dayNumber: 1,
        date: '14 Outubro',
        title: 'Chegada em Positano & Check-in Panorâmico',
        note: 'Check-in flexível com boas-vindas com prosecco e vista panorâmica para o penhasco.',
        weather: { temp: '24°C', condition: 'Ensolarado', rainProb: '0%', icon: 'Sun' },
        items: [
          {
            id: 'item-1',
            time: '10:30',
            title: 'Chegada de Barco no Porto de Positano',
            category: 'transport',
            location: 'Marina Grande, Positano',
            cost: 45,
            duration: '45m',
            imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
            notes: 'Transfer de malas incluso pelo concierge do cais.',
            rating: 4.9,
            isConfirmed: true,
            bookingCode: 'TR-7821-POS'
          },
          {
            id: 'item-2',
            time: '12:30',
            title: 'Almoço à Beira-Mar no Chez Black',
            category: 'food',
            location: 'Via del Brigantino 19, Positano',
            cost: 95,
            duration: '1h 30m',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            notes: 'Mesa reservada na varanda. Experimentar espaguete aos frutos do mar.',
            rating: 4.8,
            isConfirmed: true
          },
          {
            id: 'item-3',
            time: '16:00',
            title: 'Passeio pelas vielas de cerâmica e boutiques',
            category: 'culture',
            location: 'Centro Histórico & Igreja Santa Maria Assunta',
            cost: 0,
            duration: '2h',
            imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
            notes: 'Fotografia com iluminação dourada perfeita às 17h.',
            rating: 5.0,
            isConfirmed: true
          },
          {
            id: 'item-4',
            time: '19:30',
            title: 'Aperitivo no Franco’s Bar ao Pôr do Sol',
            category: 'relax',
            location: 'Via Cristoforo Colombo 30',
            cost: 60,
            duration: '2h',
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            notes: 'Chegar 15 minutos antes para garantir mesa na murada.',
            rating: 4.95,
            isConfirmed: false
          }
        ]
      },
      {
        dayNumber: 2,
        date: '15 Outubro',
        title: 'Trilha dos Deuses & Ravello',
        note: 'Vista espetacular a 600m acima do nível do mar por entre antigos vilarejos.',
        weather: { temp: '23°C', condition: 'Céu Limpo', rainProb: '10%', icon: 'Sun' },
        items: [
          {
            id: 'item-5',
            time: '08:30',
            title: 'Trilha Sentiero degli Dei (Caminho dos Deuses)',
            category: 'nature',
            location: 'De Bomerano até Nocelle',
            cost: 15,
            duration: '3h 30m',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            notes: 'Levar garrafa de água e tênis com boa tração.',
            rating: 5.0,
            isConfirmed: true
          },
          {
            id: 'item-6',
            time: '13:00',
            title: 'Almoço Rústico no Trattoria Santa Croce',
            category: 'food',
            location: 'Nocelle, Positano',
            cost: 50,
            duration: '1h 30m',
            imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
            notes: 'Massa fresca caseira com molho de nozes e limão siciliano.',
            rating: 4.85,
            isConfirmed: true
          },
          {
            id: 'item-7',
            time: '16:30',
            title: 'Jardins de Villa Cimbrone em Ravello',
            category: 'culture',
            location: 'Ravello, Salerno',
            cost: 20,
            duration: '2h',
            imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            notes: 'O famoso Terraço do Infinito com bustos romanos.',
            rating: 4.98,
            isConfirmed: true
          }
        ]
      },
      {
        dayNumber: 3,
        date: '16 Outubro',
        title: 'Navegação Exclusiva para Capri & Gruta Azul',
        note: 'Iate clássico privativo com paradas para mergulho nos Faraglioni.',
        weather: { temp: '26°C', condition: 'Ideal para Mar', rainProb: '0%', icon: 'Sun' },
        items: [
          {
            id: 'item-8',
            time: '09:00',
            title: 'Embarque no Riva Aquarama Privativo',
            category: 'transport',
            location: 'Molo di Positano',
            cost: 380,
            duration: '7h',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            notes: 'Toalhas, snorkel e champanhe a bordo.',
            rating: 5.0,
            isConfirmed: true,
            bookingCode: 'BOAT-CAPRI-09'
          },
          {
            id: 'item-9',
            time: '13:30',
            title: 'Almoço no La Fontelina Beach Club',
            category: 'food',
            location: 'Faraglioni di Capri',
            cost: 140,
            duration: '2h',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            notes: 'Reserva antecipada sob as pedras icônicas de Capri.',
            rating: 4.9,
            isConfirmed: true
          }
        ]
      }
    ]
  },
  {
    id: 'trip-kyoto',
    title: 'Quioto Místico & Templos Zen',
    destination: 'Quioto & Nara',
    country: 'Japão',
    flag: '🇯🇵',
    coverImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    directImageLink: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    dateRange: '02 Nov - 09 Nov, 2026',
    daysCount: 7,
    budgetTotal: 4200,
    budgetSpent: 1800,
    currency: 'JPY (¥)',
    status: 'upcoming',
    rating: 4.98,
    tags: ['Cultura & História', 'Templos Zen', 'Gastronomia Kaiseki'],
    weatherSummary: {
      temp: '18°C',
      condition: 'Outono Dourado',
      icon: 'CloudSun'
    },
    budgetItems: [
      { id: 'bk-1', category: 'accommodation', name: 'Ryokan Tradicional em Gion', amount: 1400, paid: true, date: '02 Nov' },
      { id: 'bk-2', category: 'transport', name: 'Japan Rail Pass 7 Dias', amount: 320, paid: true, date: '01 Nov' },
      { id: 'bk-3', category: 'food', name: 'Jantar Kaiseki 10 Tempos', amount: 250, paid: false, date: '04 Nov' }
    ],
    days: [
      {
        dayNumber: 1,
        date: '02 Novembro',
        title: 'Chegada ao Ryokan & Caminho dos Bambus de Arashiyama',
        note: 'Experimente a cerimônia do chá ao entardecer no jardim particular.',
        weather: { temp: '19°C', condition: 'Agradável', rainProb: '5%', icon: 'Sun' },
        items: [
          {
            id: 'item-k1',
            time: '07:30',
            title: 'Floresta de Bambu de Arashiyama',
            category: 'nature',
            location: 'Ukyo Ward, Quioto',
            cost: 0,
            duration: '2h',
            imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
            notes: 'Visita matinal para evitar aglomerações e ouvir o sussurro do vento.',
            rating: 5.0,
            isConfirmed: true
          },
          {
            id: 'item-k2',
            time: '11:00',
            title: 'Templo Tenryu-ji e Jardim Zen Histórico',
            category: 'culture',
            location: 'Saga, Quioto',
            cost: 15,
            duration: '1h 30m',
            imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
            notes: 'Patrimônio Mundial da UNESCO desde o século XIV.',
            rating: 4.95,
            isConfirmed: true
          }
        ]
      }
    ]
  },
  {
    id: 'trip-swiss',
    title: 'Travessia Alpina Suíça & Glaciares',
    destination: 'Zermatt & Interlaken',
    country: 'Suíça',
    flag: '🇨🇭',
    coverImageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    directImageLink: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    dateRange: '18 Dez - 25 Dez, 2026',
    daysCount: 7,
    budgetTotal: 5100,
    budgetSpent: 3400,
    currency: 'CHF (Fr)',
    status: 'upcoming',
    rating: 4.92,
    tags: ['Aventura Alpina', 'Neve & Esqui', 'Trens Panorâmicos'],
    weatherSummary: {
      temp: '-2°C',
      condition: 'Neve Fresca',
      icon: 'Snowflake'
    },
    budgetItems: [
      { id: 'bs-1', category: 'transport', name: 'Glacier Express Excellence Class', amount: 890, paid: true, date: '19 Dez' },
      { id: 'bs-2', category: 'accommodation', name: 'Chalet Zermatt Peak (4 noites)', amount: 2200, paid: true, date: '18 Dez' }
    ],
    days: [
      {
        dayNumber: 1,
        date: '18 Dezembro',
        title: 'Embarque no Glacier Express rumo a Zermatt',
        note: 'A viagem de trem mais famosa dos Alpes com teto envidraçado.',
        weather: { temp: '-1°C', condition: 'Nevando Leve', rainProb: '40%', icon: 'Snowflake' },
        items: [
          {
            id: 'item-s1',
            time: '09:50',
            title: 'Trem Panorâmico Glacier Express',
            category: 'transport',
            location: 'St. Moritz para Zermatt',
            cost: 280,
            duration: '6h',
            imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
            directImageLink: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
            notes: 'Almoço gourmet servido na poltrona durante a travessia do viaduto Landwasser.',
            rating: 5.0,
            isConfirmed: true
          }
        ]
      }
    ]
  }
];
