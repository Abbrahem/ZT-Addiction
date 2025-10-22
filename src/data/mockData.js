// Mock data for development
export const mockProducts = [
  {
    _id: '1',
    name: 'Dior Sauvage',
    priceEGP: 350,
    description: 'A powerful and noble fragrance with fresh and woody notes',
    collection: 'Winter Samples',
    size: '10ml',
    sizes: ['10ml'],
    images: [],
    soldOut: false
  },
  {
    _id: '2',
    name: 'Chanel Bleu de Chanel',
    priceEGP: 400,
    description: 'An aromatic woody fragrance that embodies freedom',
    collection: 'Winter Samples',
    size: '10ml',
    sizes: ['10ml'],
    images: [],
    soldOut: false
  },
  {
    _id: '3',
    name: 'Tom Ford Oud Wood',
    priceEGP: 500,
    description: 'A composition of exotic, smoky woods including rare oud',
    collection: 'Winter Samples',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    _id: '4',
    name: 'Versace Eros',
    priceEGP: 300,
    description: 'A fresh oriental woody fragrance with mint and vanilla',
    collection: 'Summer Samples',
    size: '10ml',
    sizes: ['10ml'],
    images: [],
    soldOut: false
  },
  {
    _id: '5',
    name: 'Acqua di Gio',
    priceEGP: 350,
    description: 'A fresh aquatic fragrance inspired by the sea',
    collection: 'Summer Samples',
    size: '10ml',
    sizes: ['10ml'],
    images: [],
    soldOut: true
  },
  {
    _id: '6',
    name: 'Luxury Perfume Bundle',
    priceEGP: 1200,
    description: 'A collection of 5 premium perfume samples',
    collection: 'Bundles',
    size: '50ml',
    sizes: ['50ml'],
    images: [],
    soldOut: false
  }
];

export const mockOrders = [
  {
    _id: 'order1',
    items: [
      {
        productId: '1',
        name: 'Dior Sauvage',
        size: '10ml',
        quantity: 2,
        price: 350,
        image: ''
      }
    ],
    customer: {
      name: 'Ahmed Mohamed',
      address: 'Cairo, Egypt',
      phone1: '01012345678',
      phone2: '01087654321'
    },
    shippingFee: 120,
    total: 820,
    status: 'pending',
    createdAt: new Date('2024-01-15')
  }
];
