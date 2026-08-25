export const siteConfig = {
  businessName: 'Rebel Tech',
  legalName: 'Rebel Tech Oxford LLC',
  tagline: 'Connect. Repair. Install.',
  phone: '662-281-2970',
  phoneDisplay: '(662) 281-2970',
  email: 'info@rebeltechoxford.com',
  facebook: 'https://facebook.com/rebeltechoxford',
  city: 'Oxford, Mississippi',
  serviceArea: 'Oxford and surrounding areas',
  serviceAreaRules: {
    baseAddress: '118 Glen Alden Cir, Oxford, MS 38655',
    radiusMiles: 50,
    includedDriveMinutes: 15,
    travelRatePerMile: 2
  },
  domain: 'https://rebeltechoxford.com',
  customerPortal: {
    url: '/customer-portal'
  },
  assets: {
    hero: '/assets/rebel-tech-hero.png',
    icon: '/assets/rebel-tech-favicon.png',
    van: '/assets/rebel-tech-van.png'
  },
  video: {
    page: 'https://coverr.co/videos/home-wi-fi-close-up-of-woman-plugging-in-networking-cable',
    mp4: 'https://videos.pexels.com/video-files/1085656/1085656-hd_1920_1080_25fps.mp4'
  },
  services: [
    {
      title: 'Low Voltage Cabling & Network Infrastructure',
      icon: '⌁',
      text: 'Structured cabling, Cat5e/Cat6/Cat6A, Wi-Fi, data, voice, security infrastructure, network design, installation, and troubleshooting.'
    },
    {
      title: 'Computer & Phone Repair',
      icon: '▣',
      text: 'Computer and phone diagnostics, hardware and software repair, upgrades, troubleshooting, and quality device service.'
    },
    {
      title: 'AV Equipment & Smart Home Integration',
      icon: '⌂',
      text: 'Audio/video installation, displays, cameras, automation, smart-home integration, control systems, and connected technology.'
    },
    {
      title: 'Custom PCs, Servers & Business Hardware',
      icon: '▤',
      text: 'Custom gaming PCs, workstations, servers, laptops, and business hardware—built or sourced to fit the job, budget, and performance you need. We can also source Dell systems and enterprise-class server hardware when a proven platform makes sense.'
    },
    {
      title: 'Commercial & Residential',
      icon: '▥',
      text: 'Professional technology solutions for businesses and homes—from a single repair to complete infrastructure and installation projects.'
    }
  ],
  audiences: [
    {
      id: 'businesses',
      eyebrow: 'FOR BUSINESSES',
      title: 'Build it. Upgrade it. Keep it running.',
      icon: '▥',
      text: 'From new construction and structured cabling to small-business networks, Wi-Fi, POS technology, cameras, and modernizing systems you already have.',
      learnMore: 'Explore Business Technology',
      details: [
        'Build technology into a new space from the ground up with structured cabling, network infrastructure, Wi-Fi, cameras, AV, and other low-voltage systems.',
        'Improve an existing business without starting over—clean up networks, expand Wi-Fi coverage, replace aging equipment, and make the technology you already own work better together.',
        'Modernize operations when an older system is holding you back. For example, a restaurant may be ready to move from a traditional cash register to a modern POS platform such as Toast and add online ordering or delivery without the technology headache.',
        'Support the everyday technology behind small businesses, including networking, workstations, printers, displays, connectivity, troubleshooting, and practical upgrades.',
        'Source or build business hardware when it makes sense—from workstations and laptops to custom servers and enterprise-class systems for larger environments.'
      ]
    },
    {
      id: 'residents',
      eyebrow: 'FOR RESIDENTS',
      title: 'Fix it. Install it. Make it work.',
      icon: '⌂',
      text: 'Computers, phones, Wi-Fi, home technology, AV, smart devices, and all the frustrating tech problems that do not fit neatly into a category.',
      learnMore: 'Explore Residential Technology',
      details: [
        'Repair computers, laptops, phones, tablets, and other everyday devices—from hardware problems to software issues and upgrades.',
        'Fix home Wi-Fi and networking problems, including dead zones, unreliable connections, device setup, and expanding coverage.',
        'Install and configure TVs, audio/video equipment, home-office technology, printers, and other connected equipment.',
        'Handle the weird technology problems too. If something is supposed to work and it does not, start with us and we will help figure it out.',
        'Build a custom gaming PC or high-performance home workstation, or help choose and set up a new laptop or desktop that fits what you actually need.'
      ]
    },
    {
      id: 'connected',
      eyebrow: 'FOR HOMES & BUSINESSES',
      title: 'Connect everything.',
      icon: '◉',
      text: 'Smart technology, cameras, AV, networking, automation, displays, and connected devices that make homes and businesses work smarter.',
      learnMore: 'Explore Connected Technology',
      details: [
        'Install and integrate security cameras, video doorbells, smart devices, displays, and other connected technology.',
        'Build reliable networks that give connected devices the wired and wireless infrastructure they need.',
        'Bring AV, automation, smart-home features, and control systems together so technology feels less like a collection of gadgets and more like one system.',
        'Help both homeowners and businesses expand their technology over time without creating a tangled mess of incompatible equipment.'
      ]
    }
  ]
};
