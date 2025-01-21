import { Schema, Types } from "mongoose";
import conversation from "./database/mongoose/models/global/conversation";

export type TypeUser = {
  _id?: string;
  image?: string;
  name: string;
  email: string;
  emailVerification: {
    isVerified: boolean;
    verifiedAt?: Date;
    verificationToken?: string;
    verificationTokenExpires?: Date;
  };
  affiliateId?: string;
  password?: string;
  isAdmin?: boolean;
  address?: AddressType;
  isOAuthUser: boolean;
  integrations: {
    github?: {
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    };
    discord?: {
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    };
    stripe?: {
      accountId?: string;
      isAssociate?: boolean;
    };
  };
  settings: {
    account: {
      emailFollowsMe: boolean;
      emailAnswersMyPost: boolean;
      emailMentionMe: boolean;
    };
    seller: {
      emailPurchaseProduct: boolean;
      emailStripePayement: boolean;
      emailStripLitiges: boolean;
    };
    application: {
      newLaunchesProjects: boolean;
      monthlyProdoctUpdate: boolean;
      subscribeNewslater: boolean;
    };
  };
  favorites: String[];
  sellerProfile?: TypeSellerProfile;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserAccess {
  id: string;
  type: ContentTypeEnum;
  title: string;
  description: string;
  status: "active" | "expired";
  purchaseDate: string;
  expiresAt?: string;
  features?: string[];
  constents: [
    {
      type: string;
      url?: string;
      title?: string;
    }
  ];
  warnings?: string[];
  price?: number;
}

export type AddressType = {
  name: string; // Nom de la personne ou entité associée à l'adresse
  street: string; // Rue et numéro
  city: string; // Ville
  state?: string; // État ou région (facultatif)
  zipCode: string; // Code postal
  country: string; // Pays
};

export interface TypeSellerProfile {
  logo?: string;
  userId: string; // Référence vers l'utilisateur
  marketplaceName?: string;
  status?: string;
  description?: string;
  tags?: string[]; // Liste de chaînes de caractères pour les tags
  socialLinks?: TypeSocialLink[]; // Liste d'objets pour les liens sociaux
  createdAt: Date; // Ajouté automatiquement par Mongoose
  updatedAt: Date; // Ajouté automatiquement par Mongoose
}

// Typage pour les liens sociaux
export interface TypeSocialLink {
  platform: string;
  url: string;
}

export interface ImagePreview {
  _id?: string;
  url: string;
  width: number;
  height: number;
  name: string;
}

export type TypeProduct = {
  _id: string;
  slug: string;
  previews: [ImagePreview[]];
  title: string;
  description: string;
  type: ContentTypeEnum;
  tags: Array<string>;
  pricing: Array<Pricing>;
  features: {
    icon?: string;
    title: string;
    description: string;
  };
  contentIds: Array<{ string }>;
  faqs: {
    question: string;
    answer: string;
  }[];
  categorie: Schema.Types.ObjectId | string | TypeCategory;
  author: Schema.Types.ObjectId | string;
  rating: number;
  totalReviews: number;
  isPublish?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TypeCategory = {
  _id: string;
  slug: string;
  name: {
    en: string;
    fr: string;
    [key: string]: string;
  };
  description?: {
    en?: string;
    fr?: string;
    [key: string]: string;
  };
  subcat?: Array<{
    _id: Schema.Types.ObjectId | string;
    slug: string;
    name: {
      en: string;
      fr: string;
      [key: string]: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export interface TypeReview {
  _id: string;
  marketplace: string;
  user:
    | string
    | {
        _id: string;
        name?: string;
        picture?: string;
      };
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  likes: number;
  likedBy: string[]; // Liste des utilisateurs qui ont liké
  dislikes: number;
  dislikedBy: string[]; // Liste des utilisateurs qui ont disliké
  reported: boolean;
  reports?: {
    user: string; // Utilisateur qui a signalé
    reason: string; // Raison du signalement
    comment?: string; // commenntaire du signalement
    reportedAt: string; // Date du signalement
  }[];
  createdAt: string;
  updatedAt: string;
}

export type SettingOption = {
  id: string;
  label: string;
  checked: boolean;
};

export type CourseType = "quiz" | "content";
export interface SubContent {
  _id?: Schema.Types.ObjectId | string;
  uuid: string;
  title: string;
  type: CourseType;
  data: object;
}

export type CourseQuestion = {
  uuid: string; // Identifiant unique de la question
  text: string; // Énoncé de la question
  options: {
    uuid: string; // Identifiant unique de l'option
    value: string; // Texte de l'option
  }[]; // Liste des options disponibles
  correctAnswer: string; // UUID de l'option correcte
  createdAt: Date; // Date de création de la question
};

export interface Chapter {
  _id?: Schema.Types.ObjectId | string;
  uuid: string;
  title: string;
  type: CourseType;
  data: object;
  questions: CourseQuestion[];
  subContent: SubContent[];
}
export interface CourseState {
  title: string;
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  selectedSubContent: SubContent | null;
}

import { Types } from "mongoose";

// Enum pour les types de contenu
export type ContentTypeEnum =
  | "course"
  | "saas"
  | "freelance"
  | "groupe-privee"
  | "group-discord"
  | "group-telegram"
  | "github-code"
  | "tradingview-indicator";

export type Currency = "eur" | "usd" | "gbp" | "cad" | "jpy";

export interface Plan {
  _id: string;
  price: number;
  duration: PlanDurationType;
}

export interface FreeTrial {
  trial: boolean;
  duration: number;
}

export type PlanDurationType =
  | "lifetime"
  | "sub-monthly"
  | "sub-three-monthly"
  | "sub-six-monthly"
  | "sub-yearly";

export type PricingPlan = {
  _id: string;
  price: number;
  duration: PlanDurationType;
};

export type Pricing = {
  _id: string;
  title: string;
  description?: string;
  type: "lifetime" | "subscription";
  contents: Array<ContentTypeEnum>;
  plans: Array<PricingPlan>;
  devise: Currency;
  freeTrial: FreeTrial;
  discount: number;
  isActive: boolean;
};
export type PricingTier = Pricing;

// Type pour les sous-contenus des chapitres
export interface SubContentType {
  uuid: string;
  title: string;
  data: any;
}

// Type pour les chapitres du cours
export interface ChapterType {
  uuid: string;
  title: string;
  data: any;
  questions: CourseQuestion[];
  subContent: SubContentType[];
}

// Type pour le cours
export interface CourseType {
  title: string;
  chapters: ChapterType[];
}

export interface SaasType {
  oauth_app_id: string;
  apiKeys: Array<{ string }>;
  webhooks: Array<{ string }>;
}

// Type pour le contenu principal
export interface ContentType {
  type: ContentTypeEnum;
  details: string;
  course?: CourseType; // Présent uniquement si type === "course"
}

// Interface principale pour MarketplaceContents
export interface TypeMarketplaceContents {
  _id: string; // Ou Types.ObjectId
  authorId: string; // ID de l'utilisateur
  marketplaceId: string; // ID du Marketplace
  contents: ContentType[];
  type: ContentTypeEnum;
  course?: CourseType;
  saas?: SaasType;
  freelance?: any;
  groupePrivee?: any;
  groupDiscord?: any;
  groupTelegram?: any;
  githubCode?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageType {
  _id: string;
  senderId: string;
  message: string;
  createdAt: Date;
}
export interface ConversationType {
  _id: string;
  senderId: string;
  receiverId?: string;
  messages: MessageType[];
  role: "user" | "modo" | "chatbot";
  status: "open" | "close";
  createdAt: Date;
}

export interface StripeDetails {
  session_id?: string;
  customer_id?: string;
  payment_intent_id?: string;
  refund_id?: string;
  charge_id?: string;
}

export interface OrderItem {
  _id: string;
  name: string;
  slug?: string;
  quantity: number;
  image: string;
  price: number;
  currency: string;
  tva?: number;
  priceHT?: number;
  plan: object;
}

export interface Address {
  fullName?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface PaymentSplit {
  stripeFee: number;
  seller: number;
  platformFee: number;
  affiliateFee: number;
}

export type StatusOrder =
  | "isPending"
  | "isFreeTrial"
  | "isCancel"
  | "isPaid"
  | "isRefund"
  | "isRefundAsked"
  | "isPartialRefund";
export type CurrencyType = "eur" | "usd" | "gbp" | "cad" | "jpy";
export interface OrderType {
  _id: string;
  invoiceId: string;
  user: string;
  stripeDetails?: StripeDetails;
  paymentResultStripe?: object;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  itemsPrice: number;
  subtotal: number;
  taxPrice: number;
  taxRate: number;
  discount: number;
  totalPrice: number;
  currency: CurrencyType;
  durationType: "lifetime" | "subscription";
  payementSplit: PaymentSplit;
  isCancel: boolean;
  isPaid: boolean;
  isRefund: boolean;
  isRefundAsked: boolean;
  status: StatusOrder;
  cancelAt?: Date;
  paidAt?: Date;
  sendedAt?: Date;
  refundAskAt?: Date;
  refundAt?: Date;
  paymentAllowedEndAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionType {
  _id?: string; // ID MongoDB de l'abonnement
  stripeSubscriptionId: string; // ID de l'abonnement Stripe
  customerId: string; // ID du client Stripe
  user: string | Partial<TypeUser>; // Référence à l'utilisateur associé
  seller: string; // ID du vendeur du produit

  plan: {
    name: string;
    amount: number;
    currency: CurrencyType;
    interval: PlanDurationType;
  };

  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "unpaid"
    | "trialing";

  currentPeriodStart: Date; // Début de la période de facturation
  currentPeriodEnd: Date; // Fin de la période de facturation

  cancelAtPeriodEnd: boolean; // Si l'abonnement est annulé à la fin de la période
  isAutoRenew: boolean; // Si l'abonnement est configuré pour un renouvellement automatique
  canceledAt?: Date; // Date d'annulation (si applicable)
  paymentAllowedEndAt?: Date;

  createdAt: Date; // Date de création (gérée automatiquement par MongoDB)
  updatedAt: Date; // Date de mise à jour (gérée automatiquement par MongoDB)
}

export interface BlogType {
  _id: string;
  slug: string;
  title: Array<{
    en: object;
    fr: object;
    [key]: object;
  }>;
  preview: string;
  article: Array<{
    en: object;
    fr: object;
    [key]: object;
  }>;
  tags: Array<String>;
  isPublish: boolean;
  categorie: TypeCategory;
  totalViews: number;
  enableAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchProductsResult {
  error?: any;
  products: TypeProduct[] | null;
  totalProducts: number;
  priceCounts: {
    free: number;
    under25: number;
    between25And50: number;
    between50And100: number;
    over100: number;
  };
}

export interface ApiKey {
  _id: string;
  user_id: string;
  product_id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface ApiLog {
  _id: string;
  event: string;
  status: "success" | "error";
  timestamp: string;
  message: string;
  method?: string;
  endpoint?: string;
  responseTime?: number;
  requestId?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface Webhook {
  _id: string;
  user_id: string;
  product_id: string;
  url: string;
  events: string[];
  active: boolean;
  secretKey?: string;
  retryCount?: number;
  lastDelivery?: {
    status: "success" | "error";
    timestamp: string;
    responseCode?: number;
  };
}

export interface OAuthProvider {
  id: string;
  name: string;
  company: string;
  logo: string;
  permissions: Permission[];
  redirectUrl: string;
  cancelUrl: string;
  usersCount: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  title: string;
  description?: string;
  icon: string;
}

export interface OAuthApp {
  _id?: string;
  contentId?: Schema.Types.ObjectId;
  name: string;
  company: string;
  logo: ImagePreview[];
  website: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OAuthAppFormData {
  name: string;
  company: string;
  logo: string;
  website: string;
  description: string;
}

export type QuestionStatus = "pending" | "answered" | "rejected";
export interface Question {
  _id: string;
  productId: string;
  user: string;
  question: string;
  responce?: string;
  status: QuestionStatus;
  votes: number;
  updatedAt: string;
  createdAt: string;
}

export interface DisputeMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  status: "pending" | "resolved" | "rejected";
  priority: "high" | "medium" | "low";
  description: string;
  createdAt: string;
  messages: DisputeMessage[];
  amount?: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  status: "sent" | "delivered" | "read";
  images?: string[]; // Ajout du support des images
}

export interface Conversation {
  id: string;
  participant: Participant;
  messages: Message[];
  lastMessage: {
    content: string;
    timestamp: string;
    status: "sent" | "delivered" | "read";
  };
  unreadCount: number;
}
