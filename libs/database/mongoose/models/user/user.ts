import { Schema, model, models, set } from "mongoose";
set("strictQuery", false);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: [true, "We need an email to create an account."],
      unique: true,
      trim: true,
      maxLength: 150,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    emailVerification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        trim: true,
      },
      verificationToken: {
        type: String,
        trim: true,
      },
      verificationTokenExpires: {
        type: Date,
        trim: true,
      },
    },
    password: {
      type: String,
      trim: true,
      require: false,
      maxLength: 128,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    passwordResetRequestTimestamp: {
      type: Number,
      default: null,
    },

    picture: {
      type: String,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    address: {
      name: {
        type: String,
        required: false,
        trim: true,
        maxLength: 100,
      },
      street: {
        type: String,
        required: false,
        trim: true,
        maxLength: 200,
      },
      city: {
        type: String,
        required: false,
        trim: true,
        maxLength: 100,
      },
      state: {
        type: String,
        required: false,
        trim: true,
        maxLength: 100,
      },
      zipCode: {
        type: String,
        required: false,
        trim: true,
        maxLength: 20,
      },
      country: {
        type: String,
        required: false,
        trim: true,
        maxLength: 100,
      },
    },

    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    integrations: {
      github: {
        accessToken: { type: String, trim: true },
        refreshToken: { type: String, trim: true },
        tokenExpiresAt: { type: Date, trim: true },
      },
      discord: {
        accessToken: { type: String, trim: true },
        refreshToken: { type: String, trim: true },
        tokenExpiresAt: { type: Date, trim: true },
      },
      stripe: {
        accountId: { type: String, trim: true },
        isAssociate: { type: Boolean },
      },
    },
    settings: {
      account: {
        emailFollowsMe: { type: Boolean, default: true },
        emailAnswersMyPost: { type: Boolean, default: true },
        emailMentionMe: { type: Boolean, default: true },
      },
      seller: {
        emailPurchaseProduct: { type: Boolean, default: true },
        emailStripePayement: { type: Boolean, default: true },
        emailStripLitiges: { type: Boolean, default: true },
      },
      application: {
        newLaunchesProjects: { type: Boolean, default: false },
        monthlyProdoctUpdate: { type: Boolean, default: true },
        subscribeNewslater: { type: Boolean, default: false },
      },
    },
    favorites: [
      { type: Schema.Types.ObjectId, ref: "Marketplace", default: null },
    ],
    sellerProfile: {
      logo: {
        type: String,
        default: "", // Valeur par défaut pour le logo
      },
      marketplaceName: {
        type: String,
        default: "Default Marketplace", // Valeur par défaut pour le nom du marketplace
      },
      status: {
        type: String,
        default: "Active", // Valeur par défaut pour le statut
      },
      description: {
        type: String,
        maxlength: 300,
        default: "Default description", // Valeur par défaut pour la description
      },
      tags: {
        type: [String],
        default: ["#default"], // Valeur par défaut pour les tags
      },
      socialLinks: {
        type: [
          {
            platform: {
              type: String,
              default: "", // Valeur par défaut pour la plateforme
            },
            url: {
              type: String,
              default: "", // Valeur par défaut pour l'URL
            },
          },
        ],
        default: [], // Valeur par défaut pour les liens sociaux
      },
    },

    affiliateId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

export default models.User || model("User", userSchema);
