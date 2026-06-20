(function () {
  'use strict';

var WATCH_PRODUCTS = {
  carraway: {
    id: 'carraway',
    brand: 'TIVOX',
    name: 'Carraway Automatic Brown Croco Leather Watch',
    title: 'Men Automatic Brown Dial Multi-function Croco Leather Watch TWGX19995',
    sku: 'TWGX19995',
    price: 19995,
    salePrice: 9997,
    image: 'assets/img/NA-1.webp',
    images: ['assets/img/NA-1.webp', 'assets/img/NA-2.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: true,
    description: 'A refined automatic timepiece with a rich brown croco-pattern leather strap, exhibition caseback, and sunburst dial. Built for everyday elegance with precision engineering and a 42-hour power reserve.',
    specs: { caseShape: 'Round', dialDiameter: '42 MM', movement: 'Automatic', gender: 'Men', display: 'Analog', dialColour: 'Brown', dialMaterial: 'Stainless Steel', strapType: 'Croco Leather', strapColour: 'Brown', buckleType: 'Tang Buckle', glassMaterial: 'Sapphire', waterResistance: '5 ATM', caseThickness: '11.5 MM' }
  },
  'everett-two-tone': {
    id: 'everett-two-tone',
    brand: 'TIVOX',
    name: 'Everett Automatic Two-Tone Stainless Steel Watch',
    title: 'Men Automatic Two-Tone Dial Multi-function Stainless Steel Watch TWGX20995',
    sku: 'TWGX20995',
    price: 20995,
    image: 'assets/img/NA-2.webp',
    images: ['assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: false,
    description: 'Sophisticated two-tone automatic watch featuring a sunray dial, stainless steel bracelet, and exhibition caseback. A versatile daily wearer with premium finishing.',
    specs: { caseShape: 'Round', dialDiameter: '42 MM', movement: 'Automatic', gender: 'Men', display: 'Analog', dialColour: 'Silver', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Two-Tone', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '5 ATM', caseThickness: '11.8 MM' }
  },
  'everett-gold': {
    id: 'everett-gold',
    brand: 'TIVOX',
    name: 'Everett Automatic Gold-Tone Stainless Steel Watch',
    title: 'Men Automatic Gold Dial Multi-function Stainless Steel Watch TWGX20996',
    sku: 'TWGX20996',
    price: 20995,
    image: 'assets/img/NA-3.webp',
    images: ['assets/img/NA-3.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: false,
    description: 'Gold-tone automatic watch with a polished bracelet and warm champagne dial. Designed for occasions that call for understated luxury.',
    specs: { caseShape: 'Round', dialDiameter: '42 MM', movement: 'Automatic', gender: 'Men', display: 'Analog', dialColour: 'Gold', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Gold', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '5 ATM', caseThickness: '11.8 MM' }
  },
  machine: {
    id: 'machine',
    brand: 'TIVOX',
    name: 'Machine Automatic Brown Leather Watch',
    title: 'Men Automatic Brown Dial Multi-function Leather Watch TWGX21995',
    sku: 'TWGX21995',
    price: 20995,
    salePrice: 10497,
    image: 'assets/img/NA-4.webp',
    images: ['assets/img/NA-4.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: true,
    description: 'Bold automatic watch with industrial-inspired dial details and rich brown leather strap. Built for men who prefer strong, characterful design.',
    specs: { caseShape: 'Round', dialDiameter: '44 MM', movement: 'Automatic', gender: 'Men', display: 'Multi-Function', dialColour: 'Brown', dialMaterial: 'Stainless Steel', strapType: 'Leather', strapColour: 'Brown', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '5 ATM', caseThickness: '12.2 MM' }
  },
  townsman: {
    id: 'townsman',
    brand: 'TIVOX',
    name: 'Townsman Automatic Gold-Tone Stainless Steel Watch',
    title: 'Men Automatic Gold Dial Multi-function Stainless Steel Watch TWGX22995',
    sku: 'TWGX22995',
    price: 21995,
    salePrice: 15396,
    image: 'assets/img/NA-5.webp',
    images: ['assets/img/NA-5.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: true,
    description: 'Classic gold-tone automatic with a clean dial and integrated bracelet look. Perfect for boardroom to evening wear transitions.',
    specs: { caseShape: 'Round', dialDiameter: '43 MM', movement: 'Automatic', gender: 'Men', display: 'Analog', dialColour: 'Gold', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Gold', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '5 ATM', caseThickness: '11.6 MM' }
  },
  atlas: {
    id: 'atlas',
    brand: 'TIVOX',
    name: 'Atlas Automatic Stainless Steel Watch',
    title: 'Men Automatic Silver Dial Multi-function Stainless Steel Watch TWGX23495',
    sku: 'TWGX23495',
    price: 22495,
    salePrice: 15746,
    image: 'assets/img/NA-6.webp',
    images: ['assets/img/NA-6.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: false,
    description: 'Minimal silver-dial automatic with brushed steel case and bracelet. A timeless everyday watch with reliable automatic movement.',
    specs: { caseShape: 'Round', dialDiameter: '42 MM', movement: 'Automatic', gender: 'Men', display: 'Analog', dialColour: 'Silver', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Silver', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '10 ATM', caseThickness: '11.4 MM' }
  },
  minimalist: {
    id: 'minimalist',
    brand: 'TIVOX',
    name: 'Minimalist Slim Brown Leather Watch',
    title: 'Men Slim Brown Dial Analog Leather Watch TWGX18995',
    sku: 'TWGX18995',
    price: 18995,
    salePrice: 13296,
    image: 'assets/img/NA-7.webp',
    images: ['assets/img/NA-7.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-8.webp'],
    isNew: true,
    description: 'Ultra-slim profile watch with brown leather strap and clean dial. Designed for effortless style and all-day comfort.',
    specs: { caseShape: 'Round', dialDiameter: '40 MM', movement: 'Quartz', gender: 'Men', display: 'Analog', dialColour: 'Brown', dialMaterial: 'Stainless Steel', strapType: 'Leather', strapColour: 'Brown', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.5 MM' }
  },
  chronograph: {
    id: 'chronograph',
    brand: 'TIVOX',
    name: 'Chronograph Black Dial Rubber Strap Watch',
    title: 'Men Chronograph Black Dial Multi-function Rubber Strap Watch TWGX23995',
    sku: 'TWGX23995',
    price: 23995,
    salePrice: 16796,
    image: 'assets/img/NA-8.webp',
    images: ['assets/img/NA-8.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp'],
    isNew: false,
    description: 'Sport chronograph with black dial, tachymeter bezel, and durable rubber strap. Built for active lifestyles and weekend adventures.',
    specs: { caseShape: 'Round', dialDiameter: '44 MM', movement: 'Quartz', gender: 'Men', display: 'Chronograph', dialColour: 'Black', dialMaterial: 'Stainless Steel', strapType: 'Rubber', strapColour: 'Black', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '10 ATM', caseThickness: '12.5 MM' }
  },
  heritage: {
    id: 'heritage',
    brand: 'TIVOX',
    name: 'Classic Heritage Silver Mesh Watch',
    title: 'Men Heritage Silver Dial Analog Mesh Bracelet Watch TWGX19495',
    sku: 'TWGX19495',
    price: 19495,
    image: 'assets/img/NA-9.webp',
    images: ['assets/img/NA-9.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: false,
    description: 'Heritage-inspired silver mesh bracelet watch with vintage dial aesthetics. A nod to classic mid-century design with modern reliability.',
    specs: { caseShape: 'Round', dialDiameter: '38 MM', movement: 'Quartz', gender: 'Men', display: 'Analog', dialColour: 'Silver', dialMaterial: 'Stainless Steel', strapType: 'Mesh', strapColour: 'Silver', buckleType: 'Foldover Clasp', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '8.2 MM' }
  },
  voyager: {
    id: 'voyager',
    brand: 'TIVOX',
    name: 'Voyager GMT Blue Dial Watch',
    title: 'Men GMT Blue Dial Multi-function Stainless Steel Watch TWGX24995',
    sku: 'TWGX24995',
    price: 24995,
    image: 'assets/img/NA-10.webp',
    images: ['assets/img/NA-10.webp', 'assets/img/NA-2.webp', 'assets/img/NA-1.webp', 'assets/img/NA-3.webp', 'assets/img/NA-4.webp', 'assets/img/NA-5.webp', 'assets/img/NA-6.webp', 'assets/img/NA-7.webp', 'assets/img/NA-8.webp'],
    isNew: true,
    description: 'GMT traveller watch with blue dial and dual time zone functionality. Ideal for frequent flyers and global professionals.',
    specs: { caseShape: 'Round', dialDiameter: '42 MM', movement: 'Automatic', gender: 'Men', display: 'GMT', dialColour: 'Blue', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Silver', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '10 ATM', caseThickness: '12.0 MM' }
  },
  'raquel-blue-velvet': {
    id: 'raquel-blue-velvet',
    brand: 'RAQUEL',
    name: 'Raquel Mini Two-Hand Blue Velvet Watch',
    title: 'Women Mini Two-Hand Blue Velvet Analog Watch TWGX13495',
    sku: 'TWGX13495',
    price: 13495,
    image: 'assets/img/SR-1.webp',
    images: ['assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: false,
    description: 'Petite two-hand watch with luxurious blue velvet strap. Elegant and feminine, perfect for evening occasions.',
    specs: { caseShape: 'Round', dialDiameter: '28 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Blue', dialMaterial: 'Stainless Steel', strapType: 'Velvet', strapColour: 'Blue', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.0 MM' }
  },
  'raquel-gold-steel': {
    id: 'raquel-gold-steel',
    brand: 'RAQUEL',
    name: 'Raquel Three-Hand Gold-Tone Stainless Steel Watch',
    title: 'Women Three-Hand Gold-Tone Stainless Steel Analog Watch TWGX14995',
    sku: 'TWGX14995',
    price: 14995,
    image: 'assets/img/SR-2.webp',
    images: ['assets/img/SR-2.webp', 'assets/img/SR-1.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: false,
    description: 'Gold-tone three-hand watch with polished steel bracelet. Timeless feminine design for everyday elegance.',
    specs: { caseShape: 'Round', dialDiameter: '32 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Gold', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Gold', buckleType: 'Foldover Clasp', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '8.0 MM' }
  },
  'raquel-pink-leather': {
    id: 'raquel-pink-leather',
    brand: 'RAQUEL',
    name: 'Raquel Crystal Two-Hand Pink Leather Watch',
    title: 'Women Crystal Two-Hand Pink Leather Analog Watch TWGX13995',
    sku: 'TWGX13995',
    price: 13995,
    image: 'assets/img/SR-3.webp',
    images: ['assets/img/SR-3.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: false,
    description: 'Crystal-set bezel watch with soft pink leather strap. A sparkling accessory for special occasions.',
    specs: { caseShape: 'Round', dialDiameter: '30 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Pink', dialMaterial: 'Stainless Steel', strapType: 'Leather', strapColour: 'Pink', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.5 MM' }
  },
  'raquel-glitz-blue': {
    id: 'raquel-glitz-blue',
    brand: 'RAQUEL',
    name: 'Raquel Mini Two-Hand Glitz Blue Velvet Watch',
    title: 'Women Mini Glitz Two-Hand Blue Velvet Analog Watch TWGX14495',
    sku: 'TWGX14495',
    price: 14495,
    image: 'assets/img/SR-4.webp',
    images: ['assets/img/SR-4.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: true,
    description: 'Glitz mini watch with crystal indices and blue velvet strap. Delicate glamour for the fashion-forward woman.',
    specs: { caseShape: 'Round', dialDiameter: '26 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Blue', dialMaterial: 'Stainless Steel', strapType: 'Velvet', strapColour: 'Blue', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '6.8 MM' }
  },
  'raquel-brown-leather': {
    id: 'raquel-brown-leather',
    brand: 'RAQUEL',
    name: 'Raquel Two-Hand Brown Leather Watch',
    title: 'Women Two-Hand Brown Leather Analog Watch TWGX13795',
    sku: 'TWGX13795',
    price: 13795,
    image: 'assets/img/SR-5.webp',
    images: ['assets/img/SR-5.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: true,
    description: 'Classic two-hand watch with warm brown leather strap. Versatile everyday piece with refined feminine appeal.',
    specs: { caseShape: 'Round', dialDiameter: '32 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'White', dialMaterial: 'Stainless Steel', strapType: 'Leather', strapColour: 'Brown', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.8 MM' }
  },
  'raquel-silver-mesh': {
    id: 'raquel-silver-mesh',
    brand: 'RAQUEL',
    name: 'Raquel Automatic Silver Dial Mesh Watch',
    title: 'Women Automatic Silver Dial Mesh Bracelet Watch TWGX16995',
    sku: 'TWGX16995',
    price: 16995,
    image: 'assets/img/SR-6.webp',
    images: ['assets/img/SR-6.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-7.webp', 'assets/img/SR-8.webp'],
    isNew: false,
    description: 'Automatic movement watch with silver dial and mesh bracelet. Premium craftsmanship in a feminine silhouette.',
    specs: { caseShape: 'Round', dialDiameter: '34 MM', movement: 'Automatic', gender: 'Women', display: 'Analog', dialColour: 'Silver', dialMaterial: 'Stainless Steel', strapType: 'Mesh', strapColour: 'Silver', buckleType: 'Foldover Clasp', glassMaterial: 'Sapphire', waterResistance: '5 ATM', caseThickness: '9.5 MM' }
  },
  'raquel-rose-gold': {
    id: 'raquel-rose-gold',
    brand: 'RAQUEL',
    name: 'Raquel Mini Rose Gold Bracelet Watch',
    title: 'Women Mini Rose Gold Bracelet Analog Watch TWGX12995',
    sku: 'TWGX12995',
    price: 12995,
    image: 'assets/img/SR-7.webp',
    images: ['assets/img/SR-7.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-8.webp'],
    isNew: true,
    description: 'Mini rose gold bracelet watch with delicate case proportions. A dainty statement piece for modern women.',
    specs: { caseShape: 'Round', dialDiameter: '24 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Rose Gold', dialMaterial: 'Stainless Steel', strapType: 'Bracelet', strapColour: 'Rose Gold', buckleType: 'Jewelry Clasp', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '6.5 MM' }
  },
  'raquel-sport-chrono': {
    id: 'raquel-sport-chrono',
    brand: 'RAQUEL',
    name: 'Raquel Sport Chronograph Black Watch',
    title: 'Women Sport Chronograph Black Dial Analog Watch TWGX17495',
    sku: 'TWGX17495',
    price: 17495,
    image: 'assets/img/SR-8.webp',
    images: ['assets/img/SR-8.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp'],
    isNew: false,
    description: 'Sport chronograph with black dial and active styling. Functional timing features meet feminine design.',
    specs: { caseShape: 'Round', dialDiameter: '36 MM', movement: 'Quartz', gender: 'Women', display: 'Chronograph', dialColour: 'Black', dialMaterial: 'Stainless Steel', strapType: 'Silicone', strapColour: 'Black', buckleType: 'Tang Buckle', glassMaterial: 'Mineral', waterResistance: '5 ATM', caseThickness: '10.0 MM' }
  },
  'raquel-mop': {
    id: 'raquel-mop',
    brand: 'RAQUEL',
    name: 'Raquel Mini Mother of Pearl Watch',
    title: 'Women Mini Mother of Pearl Dial Analog Watch TWGX15495',
    sku: 'TWGX15495',
    price: 15495,
    image: 'assets/img/SR-9.webp',
    images: ['assets/img/SR-9.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp'],
    isNew: false,
    description: 'Mother of pearl dial mini watch with iridescent shimmer. An exquisite piece for collectors and gift givers.',
    specs: { caseShape: 'Round', dialDiameter: '28 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Mother of Pearl', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Silver', buckleType: 'Foldover Clasp', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.2 MM' }
  },
  'raquel-two-tone-glitz': {
    id: 'raquel-two-tone-glitz',
    brand: 'RAQUEL',
    name: 'Raquel Two-Tone Glitz Watch',
    title: 'Women Two-Tone Glitz Analog Stainless Steel Watch TWGX14996',
    sku: 'TWGX14996',
    price: 14995,
    image: 'assets/img/SR-10.webp',
    images: ['assets/img/SR-10.webp', 'assets/img/SR-1.webp', 'assets/img/SR-2.webp', 'assets/img/SR-3.webp', 'assets/img/SR-4.webp', 'assets/img/SR-5.webp', 'assets/img/SR-6.webp', 'assets/img/SR-7.webp'],
    isNew: true,
    description: 'Two-tone glitz watch combining gold and silver tones with crystal accents. Bold yet wearable everyday luxury.',
    specs: { caseShape: 'Round', dialDiameter: '30 MM', movement: 'Quartz', gender: 'Women', display: 'Analog', dialColour: 'Two-Tone', dialMaterial: 'Stainless Steel', strapType: 'Stainless Steel', strapColour: 'Two-Tone', buckleType: 'Foldover Clasp', glassMaterial: 'Mineral', waterResistance: '3 ATM', caseThickness: '7.6 MM' }
  }
};

  function getWatchProduct(id) {
    return WATCH_PRODUCTS[id] || WATCH_PRODUCTS.carraway;
  }

  function watchProductUrl(id) {
    return 'product.html?id=' + encodeURIComponent(id);
  }

  function initWatchProductLinks() {
    document.querySelectorAll('a[data-product]').forEach(function (el) {
      var id = el.getAttribute('data-product');
      if (id) el.setAttribute('href', watchProductUrl(id));
    });
  }

  function initProductLinkClicks() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[data-product]');
      if (!link) return;

      var id = link.getAttribute('data-product');
      if (!id) return;

      event.preventDefault();
      window.location.href = watchProductUrl(id);
    });
  }

  function formatPrice(amount) {
    return '₹ ' + amount.toLocaleString('en-IN') + '.00';
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get('id') || 'carraway';
  }

  function renderThumbs(container, images, mainImg) {
    container.innerHTML = '';
    images.forEach(function (src, index) {
      var btn = document.createElement('button');
      btn.className = 'watch-pdp__thumb' + (index === 0 ? ' is-active' : '');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.setAttribute('data-watch-pdp-thumb', src);

      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.width = 72;
      img.height = 72;
      if (index > 0) img.loading = 'lazy';
      img.decoding = 'async';
      btn.appendChild(img);
      container.appendChild(btn);

      btn.addEventListener('click', function () {
        mainImg.src = src;
        container.querySelectorAll('.watch-pdp__thumb').forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
      });
    });
  }

  function renderSpecTable(table, specs) {
    var rows = [
      ['Dial Material', specs.dialMaterial],
      ['Strap Type', specs.strapType],
      ['Strap Colour', specs.strapColour],
      ['Buckle Type', specs.buckleType],
      ['Glass Material', specs.glassMaterial],
      ['Water Resistance', specs.waterResistance],
      ['Case Thickness', specs.caseThickness]
    ];

    table.innerHTML = rows.map(function (row) {
      return '<div class="watch-pdp__spec-row"><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
    }).join('');
  }

  function renderRelated(container, currentId) {
    var products = Object.values(WATCH_PRODUCTS).filter(function (p) {
      return p.id !== currentId;
    });
    var related = products.slice(0, 4);

    container.innerHTML = related.map(function (p) {
      var displayPrice = p.salePrice || p.price;
      return (
        '<a href="' + watchProductUrl(p.id) + '" class="watch-pdp__related-card">' +
        '<div class="watch-pdp__related-media">' +
        '<img src="' + p.image + '" alt="' + p.name + '" width="200" height="200" loading="lazy" decoding="async" />' +
        '</div>' +
        '<p class="watch-pdp__related-name">' + p.name + '</p>' +
        '<p class="watch-pdp__related-price">' + formatPrice(displayPrice) + '</p>' +
        '</a>'
      );
    }).join('');
  }

  function initRelatedCarousel(track) {
    var section = track.closest('[data-watch-pdp-related-section]');
    if (!section) return;

    var viewport = section.querySelector('[data-watch-pdp-related-viewport]');
    var prevBtn = section.querySelector('[data-watch-pdp-related-prev]');
    var nextBtn = section.querySelector('[data-watch-pdp-related-next]');
    var offset = 0;

    function isCarouselMode() {
      return window.matchMedia('(max-width: 768px)').matches;
    }

    function getCards() {
      return track.querySelectorAll('.watch-pdp__related-card');
    }

    function getStep() {
      var cards = getCards();
      if (!cards.length) return 0;
      return cards[0].getBoundingClientRect().width;
    }

    function getMaxOffset() {
      if (!isCarouselMode() || !viewport) return 0;
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function applyScroll(targetOffset) {
      var maxOffset = getMaxOffset();

      if (!isCarouselMode()) {
        offset = 0;
        track.style.transform = 'none';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      offset = Math.min(maxOffset, Math.max(0, targetOffset));
      track.style.transform = 'translateX(-' + offset + 'px)';

      var atStart = offset <= 2;
      var atEnd = offset >= maxOffset - 2;

      if (prevBtn) prevBtn.disabled = atStart || maxOffset <= 0;
      if (nextBtn) nextBtn.disabled = atEnd || maxOffset <= 0;
    }

    if (prevBtn && !prevBtn.dataset.watchRelatedBound) {
      prevBtn.dataset.watchRelatedBound = 'true';
      prevBtn.addEventListener('click', function () {
        applyScroll(offset - getStep());
      });
    }

    if (nextBtn && !nextBtn.dataset.watchRelatedBound) {
      nextBtn.dataset.watchRelatedBound = 'true';
      nextBtn.addEventListener('click', function () {
        applyScroll(offset + getStep());
      });
    }

    if (!section.dataset.watchRelatedResizeBound) {
      section.dataset.watchRelatedResizeBound = 'true';
      window.addEventListener('resize', function () {
        applyScroll(isCarouselMode() ? offset : 0);
      });
    }

    applyScroll(0);
  }

  function loadProduct() {
    if (!document.querySelector('[data-watch-pdp-main]')) return;

    var product = getWatchProduct(getProductId());
    var displayPrice = product.salePrice || product.price;
    var emiAmount = Math.round(displayPrice / 6);
    var points = Math.round(displayPrice / 100);
    var specs = product.specs;

    document.title = product.name + ' — ' + product.brand;

    var breadcrumb = document.querySelector('[data-watch-pdp-breadcrumb]');
    if (breadcrumb) breadcrumb.textContent = product.title;

    var brand = document.querySelector('[data-watch-pdp-brand]');
    if (brand) brand.textContent = product.brand;

    var newBadge = document.querySelector('[data-watch-pdp-new]');
    if (newBadge) newBadge.hidden = !product.isNew;

    var title = document.querySelector('[data-watch-pdp-title]');
    if (title) title.textContent = product.title;

    var sku = document.querySelector('[data-watch-pdp-sku]');
    if (sku) sku.textContent = product.sku;

    var price = document.querySelector('[data-watch-pdp-price]');
    if (price) price.textContent = formatPrice(displayPrice);

    var emi = document.querySelector('[data-watch-pdp-emi]');
    if (emi) {
      emi.textContent = 'EMI Starting From ₹' + emiAmount.toLocaleString('en-IN') + '/- for 2/6/9 months. 0% Interest on EMI with Snapmint.';
    }

    var pointsEl = document.querySelector('[data-watch-pdp-points]');
    if (pointsEl) pointsEl.textContent = 'Earn upto ' + points + ' Points on this purchase';

    var desc = document.querySelector('[data-watch-pdp-desc]');
    if (desc) desc.textContent = product.description;

    var stickyTitle = document.querySelector('[data-watch-pdp-sticky-title]');
    if (stickyTitle) stickyTitle.textContent = product.brand + ' | ' + product.title;

    var stickyPrice = document.querySelector('[data-watch-pdp-sticky-price]');
    if (stickyPrice) stickyPrice.textContent = formatPrice(displayPrice);

    var mainImg = document.querySelector('[data-watch-pdp-main]');
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.brand + ' ' + product.name;
    }

    var thumbs = document.querySelector('[data-watch-pdp-thumbs]');
    if (thumbs && mainImg) renderThumbs(thumbs, product.images, mainImg);

    var specValues = document.querySelectorAll('[data-watch-pdp-spec]');
    var specKeys = ['caseShape', 'dialDiameter', 'movement', 'gender', 'display', 'dialColour'];
    specValues.forEach(function (el, i) {
      if (specs[specKeys[i]]) el.textContent = specs[specKeys[i]];
    });

    var specTable = document.querySelector('[data-watch-pdp-spec-table]');
    if (specTable) renderSpecTable(specTable, specs);

    var related = document.querySelector('[data-watch-pdp-related]');
    if (related) {
      renderRelated(related, product.id);
      initRelatedCarousel(related);
    }
  }

  function initProductPageUi() {
    var wishBtn = document.querySelector('[data-watch-pdp-wish]');
    if (wishBtn) {
      wishBtn.addEventListener('click', function () {
        var icon = wishBtn.querySelector('i');
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
      });
    }

    var acc = document.querySelector('[data-watch-pdp-acc]');
    if (acc) {
      acc.querySelectorAll('.watch-pdp__acc-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.watch-pdp__acc-item');
          var isOpen = item.classList.contains('is-open');

          acc.querySelectorAll('.watch-pdp__acc-item').forEach(function (el) {
            el.classList.remove('is-open');
            el.querySelector('.watch-pdp__acc-btn').setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }

    var sticky = document.querySelector('[data-watch-pdp-sticky]');
    var stickyToggle = document.querySelector('[data-watch-pdp-sticky-toggle]');
    if (sticky && stickyToggle) {
      stickyToggle.addEventListener('click', function () {
        sticky.classList.toggle('is-collapsed');
        document.body.classList.toggle('watch-pdp-page--no-sticky');
      });
    }
  }

  function init() {
    initWatchProductLinks();
    initProductLinkClicks();
    initProductPageUi();
    loadProduct();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
