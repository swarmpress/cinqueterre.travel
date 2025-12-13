#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const UPDATED_AT = "2025-12-12T23:00:00.000Z";

// Template data for each page type
const templates = {
  'getting-here': (village) => ({
    hero: {
      eyebrow: "Accès & Transports",
      title: `Comment Se Rendre ${village === 'cinque-terre' ? 'aux Cinque Terre' : 'à ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Tous les moyens de transport pour rejoindre ${village === 'cinque-terre' ? 'les cinq villages' : village.charAt(0).toUpperCase() + village.slice(1)}. Trains, voiture, avion, bateau : planifiez votre voyage facilement.`,
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80"
    },
    features: [
      { icon: "train", title: "En Train", description: "Le moyen le plus pratique. Trains régionaux depuis La Spezia ou Levanto. Carte Cinque Terre inclut trains illimités." },
      { icon: "car", title: "En Voiture", description: "Parkings limités et chers. Déconseillé. Mieux vaut garer à La Spezia/Levanto et prendre le train." },
      { icon: "plane", title: "En Avion", description: "Aéroports de Pise (90km) ou Gênes (120km). Puis train jusqu'à La Spezia." },
      { icon: "ship", title: "En Bateau", description: "Ferries saisonniers depuis Portofino, Santa Margherita, La Spezia (avril-octobre)." },
      { icon: "bus", title: "En Bus", description: "Services locaux depuis villes voisines. Moins pratique que le train." },
      { icon: "info", title: "Depuis La Spezia", description: "Hub principal. Trains toutes les 15-30min. 5-10min par village." }
    ],
    stats: [
      { value: "15-30min", label: "Fréquence des Trains" },
      { value: "5-10€", label: "Billet Train Aller-Retour" },
      { value: "18€", label: "Carte Cinque Terre 1 Jour" },
      { value: "Toute l'année", label: "Trains Disponibles" }
    ]
  }),

  'things-to-do': (village) => ({
    hero: {
      eyebrow: "Activités & Expériences",
      title: `Que Faire ${village === 'cinque-terre' ? 'aux Cinque Terre' : 'à ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Découvrez les meilleures activités : randonnées, plages, gastronomie, culture locale. Un programme complet pour profiter au maximum de votre séjour.`,
      image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80"
    },
    features: [
      { icon: "compass", title: "Randonnées Côtières", description: "Sentiers panoramiques reliant les villages avec vues spectaculaires sur la Méditerranée." },
      { icon: "utensils", title: "Gastronomie Locale", description: "Dégustez pesto, focaccia, fruits de mer frais et vin Sciacchetrà dans les trattorias." },
      { icon: "camera", title: "Photographie", description: "Villages colorés, couchers de soleil, paysages marins : paradis des photographes." },
      { icon: "wine", title: "Dégustation de Vins", description: "Visitez les vignobles en terrasses et dégustez les vins blancs locaux." },
      { icon: "sailboat", title: "Excursions en Bateau", description: "Admirez les villages depuis la mer, découvrez criques cachées." },
      { icon: "snorkel", title: "Plongée & Snorkeling", description: "Eaux cristallines riches en vie marine. Location d'équipement disponible." }
    ],
    stats: [
      { value: "50+", label: "Activités Disponibles" },
      { value: "120km", label: "de Sentiers" },
      { value: "6", label: "Plages Principales" },
      { value: "100+", label: "Restaurants" }
    ]
  }),

  'weather': (village) => ({
    hero: {
      eyebrow: "Climat & Météo",
      title: `Météo ${village === 'cinque-terre' ? 'des Cinque Terre' : 'de ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Climat méditerranéen doux toute l'année. Découvrez les meilleures périodes pour visiter et quoi emporter selon la saison.`,
      image: "https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=1200&q=80"
    },
    features: [
      { icon: "sun", title: "Printemps (Mars-Mai)", description: "15-22°C. Idéal pour randonnées. Fleurs en bloom. Moins de touristes." },
      { icon: "thermometer-sun", title: "Été (Juin-Août)", description: "25-32°C. Haute saison. Parfait pour la plage. Très fréquenté." },
      { icon: "leaf", title: "Automne (Sept-Nov)", description: "18-25°C. Excellente période. Mer encore chaude. Vendanges." },
      { icon: "cloud-rain", title: "Hiver (Déc-Fév)", description: "8-15°C. Basse saison. Pluies possibles. Calme et authentique." },
      { icon: "droplet", title: "Précipitations", description: "Octobre-novembre les plus humides. Étés secs. Toujours possible pluie courte." },
      { icon: "waves", title: "Température Mer", description: "22-26°C en été, 14-18°C en hiver. Baignade juin à septembre." }
    ],
    stats: [
      { value: "300+", label: "Jours de Soleil/An" },
      { value: "25°C", label: "Température Moyenne Été" },
      { value: "Avril-Oct", label: "Meilleure Période" },
      { value: "22-26°C", label: "Température Mer (Été)" }
    ]
  }),

  'faq': (village) => ({
    hero: {
      eyebrow: "Questions Fréquentes",
      title: `FAQ ${village === 'cinque-terre' ? 'Cinque Terre' : village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Toutes les réponses à vos questions sur la visite ${village === 'cinque-terre' ? 'des cinque villages' : 'de ' + village.charAt(0).toUpperCase() + village.slice(1)}. Pratique, accès, hébergement, activités.`,
      image: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=1200&q=80"
    },
    features: [
      { icon: "help-circle", title: "Combien de temps rester ?", description: "Minimum 2-3 jours pour voir tous les villages. 4-5 jours idéal pour randonner et explorer." },
      { icon: "ticket", title: "Ai-je besoin de la Carte Cinque Terre ?", description: "Oui si vous randonnez sur sentiers payants. Inclut aussi trains illimités. 7,50-18€/jour." },
      { icon: "calendar", title: "Meilleure période pour visiter ?", description: "Avril-mai et septembre-octobre. Moins de foule, météo excellente, prix modérés." },
      { icon: "users", title: "Les Cinque Terre sont-elles surpeuplées ?", description: "Oui en juillet-août et weekends. Visitez en semaine, hors saison, ou arrivez très tôt." },
      { icon: "luggage", title: "Où laisser mes bagages ?", description: "Consignes aux gares de La Spezia, Monterosso, Riomaggiore. 5-8€/bagage/jour." },
      { icon: "accessibility", title: "Accessible en fauteuil roulant ?", description: "Difficile. Villages très pentus avec escaliers. Monterosso le plus accessible." }
    ],
    stats: [
      { value: "2-3 jours", label: "Durée Minimum" },
      { value: "7,50-18€", label: "Carte Cinque Terre" },
      { value: "Avril-Oct", label: "Haute Saison" },
      { value: "5", label: "Villages à Visiter" }
    ]
  }),

  'agriturismi': (village) => ({
    hero: {
      eyebrow: "Séjours à la Ferme",
      title: `Agritourismes ${village === 'cinque-terre' ? 'des Cinque Terre' : 'de ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Séjournez dans des fermes traditionnelles des collines environnantes. Produits locaux, vues panoramiques, authenticité garantie.`,
      image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200&q=80"
    },
    features: [
      { icon: "home", title: "Hébergement Authentique", description: "Chambres dans fermes rénovées avec charme rustique et confort moderne." },
      { icon: "utensils", title: "Cuisine Maison", description: "Repas préparés avec produits de la ferme : légumes, huile d'olive, vin." },
      { icon: "wine", title: "Vignobles & Oliveraies", description: "Découvrez la production locale, dégustez vins et huile d'olive artisanaux." },
      { icon: "mountain", title: "Vues Panoramiques", description: "Situés en hauteur avec vues spectaculaires sur mer et villages." },
      { icon: "leaf", title: "Nature & Tranquillité", description: "Éloignés de la foule des villages. Calme et repos assurés." },
      { icon: "car", title: "Voiture Recommandée", description: "Accès souvent difficile en transport public. Location voiture utile." }
    ],
    stats: [
      { value: "20+", label: "Agritourismes dans la Région" },
      { value: "60-120€", "label": "Prix Nuit (Chambre Double)" },
      { value: "15-25€", label: "Repas Typique" },
      { value: "5-10km", label: "Distance des Villages" }
    ]
  }),

  'apartments': (village) => ({
    hero: {
      eyebrow: "Locations de Vacances",
      title: `Appartements ${village === 'cinque-terre' ? 'des Cinque Terre' : 'de ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Louez un appartement pour plus d'indépendance et d'espace. Cuisine équipée, séjour en famille, vie de quartier authentique.`,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"
    },
    features: [
      { icon: "key", title: "Indépendance Totale", description: "Votre propre espace avec cuisine, salon, parfait pour familles ou longs séjours." },
      { icon: "chef-hat", title: "Cuisine Équipée", description: "Préparez vos repas avec produits du marché local. Économisez sur restaurants." },
      { icon: "wifi", title: "Confort Moderne", description: "WiFi, climatisation, lave-linge dans la plupart des appartements." },
      { icon: "users", title: "Idéal Familles", description: "Plus d'espace qu'une chambre d'hôtel. Options 2-4 chambres disponibles." },
      { icon: "map-pin", title: "Emplacements Variés", description: "Centre historique, proche gare, vue mer. Large choix selon préférences." },
      { icon: "clock", title: "Flexibilité", description: "Séjours courts ou longs. Check-in/out souvent flexible." }
    ],
    stats: [
      { value: "200+", label: "Appartements Disponibles" },
      { value: "80-250€", label: "Prix/Nuit Selon Taille" },
      { value: "3 nuits", label: "Séjour Minimum Souvent" },
      { value: "2-6", label: "Capacité Personnes" }
    ]
  }),

  'boat-tours': (village) => ({
    hero: {
      eyebrow: "Excursions Maritimes",
      title: `Excursions en Bateau ${village === 'cinque-terre' ? 'aux Cinque Terre' : 'depuis ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Admirez les villages colorés depuis la mer. Ferries entre villages, tours panoramiques, excursions au coucher du soleil. Perspective unique garantie.`,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
    },
    features: [
      { icon: "sailboat", title: "Ferries Entre Villages", description: "Service régulier La Spezia-Portovenere-5 Terre. Avril à octobre." },
      { icon: "anchor", title: "Tours Panoramiques", description: "Circuits complets de 2-3h avec arrêts baignade dans criques isolées." },
      { icon: "sunset", title: "Excursions Coucher de Soleil", description: "Soirées spéciales avec apéritif à bord. Magique et romantique." },
      { icon: "kayak", title: "Kayak de Mer", description: "Location kayak pour explorer à votre rythme. Guides disponibles." },
      { icon: "snorkel", title: "Plongée & Snorkeling", description: "Excursions vers spots de plongée. Équipement fourni." },
      { icon: "fishing", title: "Pêche Traditionnelle", description: "Sorties avec pêcheurs locaux. Expérience authentique." }
    },
    stats: [
      { value: "25-35€", label: "Ferry Journée Complète" },
      { value: "50-80€", label: "Tour Guidé 2-3h" },
      { value: "Avril-Oct", label: "Saison Opération" },
      { value: "6-8 départs", label: "Par Jour (Haute Saison)" }
    ]
  }),

  'camping': (village) => ({
    hero: {
      eyebrow: "Camping & Nature",
      title: `Camping ${village === 'cinque-terre' ? 'près des Cinque Terre' : 'près de ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Campings dans les environs pour budgets serrés et amoureux de nature. Proche des villages, bien équipés, ambiance conviviale.`,
      image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80"
    },
    features: [
      { icon: "tent", title: "Emplacements Tentes", description: "Emplacements ombragés pour tentes. Sanitaires modernes, douches chaudes." },
      { icon: "caravan", title: "Camping-cars & Caravanes", description: "Emplacements avec branchements électriques. Stations service." },
      { icon: "home", title: "Bungalows & Mobil-homes", description: "Hébergements confort sans tente. Cuisine, salle de bain privée." },
      { icon: "swimming-pool", title: "Piscines", description: "La plupart ont piscines. Idéal après randonnées." },
      { icon: "utensils", title: "Restaurants & Supérettes", description: "Services sur place. Cuisine commune disponible." },
      { icon: "train", title: "Navettes Gares", description: "Beaucoup offrent navettes gratuites vers gares ferroviaires." }
    ],
    stats: [
      { value: "15-30€", label: "Emplacement Tente/Nuit" },
      { value: "50-100€", label: "Bungalow/Nuit" },
      { value: "5-15min", label: "des Gares" },
      { value: "Avril-Oct", label: "Ouverture Principale" }
    ]
  }),

  'insights': (village) => ({
    hero: {
      eyebrow: "Conseils d'Experts",
      title: `Conseils & Astuces ${village === 'cinque-terre' ? 'Cinque Terre' : village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Conseils pratiques de locaux et experts pour profiter au maximum de votre séjour. Évitez les pièges à touristes, découvrez les secrets.`,
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
    },
    features: [
      { icon: "sunrise", title: "Partez Tôt", description: "Villages magiques au lever du soleil avant arrivée des foules. Lumière photographique parfaite." },
      { icon: "calendar", title: "Évitez Juillet-Août", description: "Haute saison bondée et chère. Préférez mai-juin ou septembre-octobre." },
      { icon: "train", title: "Utilisez les Trains", description: "Oubliez la voiture. Trains fréquents, pratiques, économiques entre villages." },
      { icon: "backpack", title: "Voyagez Léger", description: "Escaliers partout. Valise à roulettes légère ou sac à dos recommandé." },
      { icon: "ticket", title: "Carte Cinque Terre Card", description: "Rentable si vous randonnez. Compare avec tickets trains individuels." },
      { icon: "utensils", title: "Mangez où Mangent les Locaux", description: "Ruelles intérieures ont souvent meilleurs restaurants, loin des touristes." }
    ],
    stats: [
      { value: "7h-9h", label: "Meilleure Heure Visite" },
      { value: "2-3L", label: "Eau à Emporter Randonnée" },
      { value: "Avril-Mai", label: "Période Optimale" },
      { value: "Sept-Oct", label: "Aussi Excellente" }
    ]
  }),

  'maps': (village) => ({
    hero: {
      eyebrow: "Cartes & Plans",
      title: `Cartes ${village === 'cinque-terre' ? 'des Cinque Terre' : 'de ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Cartes détaillées des villages, sentiers de randonnée, points d'intérêt. Planifiez vos itinéraires et explorations.`,
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80"
    },
    features: [
      { icon: "map", title: "Cartes des Villages", description: "Plans détaillés de chaque village avec rues, monuments, services." },
      { icon: "compass", title: "Sentiers de Randonnée", description: "Cartes topographiques des sentiers avec distances, dénivelés, temps." },
      { icon: "train", title: "Réseau Ferroviaire", description: "Horaires et connexions trains entre villages et villes voisines." },
      { icon: "anchor", title: "Ports & Embarcadères", description: "Emplacements ferries, locations bateaux, points d'embarquement." },
      { icon: "camera", title: "Points de Vue", description: "Meilleurs spots photo marqués. Couchers de soleil, panoramas." },
      { icon: "info", title: "Services Pratiques", description: "Offices tourisme, distributeurs, pharmacies, supermarchés localisés." }
    ],
    stats: [
      { value: "12km", label: "Sentiers Côtiers" },
      { value: "120km", label: "Total Sentiers Région" },
      { value: "5", label: "Gares Principales" },
      { value: "20+", label: "Points de Vue" }
    ]
  }),

  'sights': (village) => ({
    hero: {
      eyebrow: "Sites & Monuments",
      title: `Sites à Voir ${village === 'cinque-terre' ? 'aux Cinque Terre' : 'à ' + village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Découvrez les monuments historiques, églises, fortifications et points de vue panoramiques. Le patrimoine culturel des Cinque Terre.`,
      image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80"
    },
    features: [
      { icon: "church", title: "Églises Historiques", description: "Sanctuaires médiévaux, églises baroques, chapelles perchées. Architecture religieuse riche." },
      { icon: "castle", title: "Fortifications Génoises", description: "Tours de guet, châteaux, remparts datant de l'époque de la République de Gênes." },
      { icon: "camera", title: "Points de Vue", description: "Belvédères panoramiques sur mer et villages. Parfaits pour photographie." },
      { icon: "landmark", title: "Centres Historiques", description: "Ruelles médiévales, maisons-tours colorées, places pittoresques." },
      { icon: "anchor", title: "Ports & Marines", description: "Petits ports de pêche traditionnels, marines colorées, bateaux typiques." },
      { icon: "leaf", title: "Vignobles en Terrasses", description: "Paysages culturels uniques classés UNESCO. Murs en pierre séculaires." }
    ],
    stats: [
      { value: "12+", label: "Églises & Sanctuaires" },
      { value: "5", label: "Fortifications Majeures" },
      { value: "1997", label: "Classement UNESCO" },
      { value: "100+", label: "Monuments Historiques" }
    ]
  }),

  'blog': (village) => ({
    hero: {
      eyebrow: "Récits & Guides",
      title: `Blog ${village === 'cinque-terre' ? 'Cinque Terre' : village.charAt(0).toUpperCase() + village.slice(1)}`,
      subtitle: `Récits de voyage, guides pratiques, conseils d'initiés. Tout ce que vous devez savoir pour un séjour réussi.`,
      image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80"
    },
    features: [
      { icon: "book-open", title: "Guides Complets", description: "Itinéraires détaillés, planification jour par jour, budgets et conseils pratiques." },
      { icon: "users", title: "Expériences Voyageurs", description: "Récits authentiques de visiteurs. Ce qui a marché, les erreurs à éviter." },
      { icon: "camera", title: "Photographie", description: "Meilleurs spots photo, conseils techniques, horaires optimaux pour lumière." },
      { icon: "utensils", title: "Gastronomie", description: "Restaurants testés, recettes locales, où trouver les meilleures spécialités." },
      { icon: "compass", title: "Randonnées", description: "Descriptions détaillées sentiers, niveaux difficulté, équipement nécessaire." },
      { icon: "calendar", title: "Saisons & Événements", description: "Quand partir, festivals à ne pas manquer, avantages de chaque saison." }
    ],
    stats: [
      { value: "50+", label: "Articles Publiés" },
      { value: "10+", label: "Guides Complets" },
      { value: "100+", label: "Photos HD" },
      { value: "Hebdo", label: "Nouveaux Articles" }
    ]
  })
};

// Common footer for all pages
const footer = {
  "type": "footer-section",
  "variant": "4-column-simple",
  "companyName": "Cinqueterre.travel",
  "companyDescription": "Votre guide complet des plus beaux villages côtiers d'Italie.",
  "copyright": "© 2025 Cinqueterre.travel. Tous droits réservés.",
  "columns": [
    {
      "title": "Villages",
      "links": [
        { "label": "Monterosso", "url": "/fr/monterosso" },
        { "label": "Vernazza", "url": "/fr/vernazza" },
        { "label": "Corniglia", "url": "/fr/corniglia" },
        { "label": "Manarola", "url": "/fr/manarola" },
        { "label": "Riomaggiore", "url": "/fr/riomaggiore" }
      ]
    },
    {
      "title": "Planifier",
      "links": [
        { "label": "Comment S'y Rendre", "url": "/fr/cinque-terre/getting-here" },
        { "label": "Où Dormir", "url": "/fr/cinque-terre/hotels" },
        { "label": "Restaurants", "url": "/fr/cinque-terre/restaurants" },
        { "label": "Carte", "url": "/fr/cinque-terre/maps" }
      ]
    },
    {
      "title": "Activités",
      "links": [
        { "label": "Randonnées", "url": "/fr/cinque-terre/hiking" },
        { "label": "Plages", "url": "/fr/cinque-terre/beaches" },
        { "label": "Excursions Bateau", "url": "/fr/cinque-terre/boat-tours" },
        { "label": "Événements", "url": "/fr/cinque-terre/events" }
      ]
    },
    {
      "title": "Infos",
      "links": [
        { "label": "Météo", "url": "/fr/cinque-terre/weather" },
        { "label": "FAQ", "url": "/fr/cinque-terre/faq" },
        { "label": "Conseils", "url": "/fr/cinque-terre/insights" },
        { "label": "Blog", "url": "/fr/cinque-terre/blog" }
      ]
    }
  ],
  "socialLinks": [
    { "platform": "instagram", "url": "https://instagram.com/cinqueterre" },
    { "platform": "facebook", "url": "https://facebook.com/cinqueterre" }
  ]
};

function buildBody(pageType, village) {
  const template = templates[pageType];
  if (!template) {
    console.log(`No template for ${pageType}, using generic template`);
    return buildGenericBody(pageType, village);
  }

  const data = template(village);
  const body = [];

  // Hero section
  body.push({
    type: "hero-section",
    variant: "split-with-image",
    eyebrow: data.hero.eyebrow,
    title: data.hero.title,
    subtitle: data.hero.subtitle,
    buttons: [
      { text: "En Savoir Plus", url: "#details", variant: "primary" },
      { text: "Voir Tous les Villages", url: "/fr/cinque-terre/overview", variant: "secondary" }
    ],
    image: data.hero.image
  });

  // Stats if available
  if (data.stats) {
    body.push({
      type: "stats-section",
      variant: "simple-grid",
      eyebrow: "En un coup d'œil",
      title: "Informations Clés",
      stats: data.stats
    });
  }

  // Features
  body.push({
    type: "feature-section",
    variant: "simple-3x2-grid",
    eyebrow: "Détails",
    title: "Ce Qu'il Faut Savoir",
    features: data.features
  });

  // CTA
  body.push({
    type: "cta-section",
    variant: "simple-centered-with-gradient",
    title: "Planifiez Votre Visite",
    subtitle: `Découvrez tout ce dont vous avez besoin pour visiter ${village === 'cinque-terre' ? 'les Cinque Terre' : village.charAt(0).toUpperCase() + village.slice(1)}.`,
    buttons: [
      { text: "Hébergements", url: "/fr/" + village + "/hotels", variant: "primary" },
      { text: "Que Faire", url: "/fr/" + village + "/things-to-do", variant: "secondary" }
    ]
  });

  // Footer
  body.push(footer);

  return body;
}

function buildGenericBody(pageType, village) {
  // Fallback for page types without specific templates
  return [
    {
      type: "hero-section",
      variant: "split-with-image",
      eyebrow: "Découvrez",
      title: village.charAt(0).toUpperCase() + village.slice(1) + " - " + pageType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      subtitle: `Explorez ${village.charAt(0).toUpperCase() + village.slice(1)} et découvrez tout ce que ce magnifique village a à offrir.`,
      buttons: [
        { text: "En Savoir Plus", url: "#", variant: "primary" },
        { text: "Retour", url: "/fr/" + village, variant: "secondary" }
      ],
      image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80"
    },
    {
      type: "feature-section",
      variant: "simple-3x2-grid",
      eyebrow: "À Découvrir",
      title: "Points Forts",
      features: [
        { icon: "map-pin", title: "Emplacement", description: "Au cœur des Cinque Terre, facilement accessible." },
        { icon: "compass", title: "À Explorer", description: "De nombreuses activités et sites à découvrir." },
        { icon: "camera", title: "Photographie", description: "Paysages et vues à couper le souffle." },
        { icon: "utensils", title: "Gastronomie", description: "Cuisine locale authentique et savoureuse." }
      ]
    },
    footer
  ];
}

function populatePage(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Skip if already has content
    if (content.body && content.body.length > 0) {
      console.log(`Skipping ${filePath} - already has content`);
      return;
    }

    // Extract village and page type from metadata or slug
    const village = content.metadata?.city || 'cinque-terre';
    const pageType = content.metadata?.page_type || content.page_type;

    // Build body
    content.body = buildBody(pageType, village);
    content.updated_at = UPDATED_AT;

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log(`✓ Populated ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function findEmptyPages(dir) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (!content.body || content.body.length === 0) {
            files.push(fullPath);
          }
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// Main execution
const frPagesDir = '/Users/drietsch/agentpress/cinqueterre.travel/content/pages/fr';
console.log('Finding empty French pages...\n');

const emptyPages = findEmptyPages(frPagesDir);
console.log(`Found ${emptyPages.length} empty pages\n`);

emptyPages.forEach(populatePage);

console.log(`\n✓ Complete! Populated ${emptyPages.length} pages`);
