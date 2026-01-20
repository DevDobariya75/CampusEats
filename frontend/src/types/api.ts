export type Role = 'student' | 'shop_owner' | 'admin' | 'delivery_person';

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiListSuccess<T> = {
  success: true;
  count: number;
  total?: number;
  page?: number;
  pages?: number;
  data: T[];
};

export type ApiError = {
  success?: false;
  message?: string;
  error?: string;
  errors?: Array<{ type?: string; msg?: string; path?: string; location?: string }>;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    campus?: string;
  };
};

export type AuthResponse = {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    avatar?: string;
    address?: User['address'];
  };
};

export type Shop = {
  _id: string;
  name: string;
  description?: string;
  cuisine?: string[];
  image?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    campus?: string;
  };
  contact?: { phone?: string; email?: string };
  rating?: number;
  numReviews?: number;
  deliveryTime?: number;
  deliveryFee?: number;
  minOrder?: number;
  isOpen?: boolean;
};

export type MenuItem = {
  _id: string;
  name: string;
  shop: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
  calories?: number;
  preparationTime?: number;
  isAvailable?: boolean;
  rating?: number;
  numReviews?: number;
};

export type Order = {
  _id: string;
  user: any;
  shop: any;
  orderItems: Array<{
    menuItem: any;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>;
  itemsPrice: number;
  deliveryFee: number;
  taxPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

