import { Metadata } from "next";
import { TypeProduct, BlogType } from "@/libs/typings";

type MetadataType = "product" | "Article" | "static" | "explorer";

type GenerateMetadataParams = {
  locale: string;
  slug: string;
  type: MetadataType;
  data?: TypeProduct | BlogType; // Permet de passer des données dynamiques ou statiques
  query?: string; // Paramètre pour les termes de recherche si applicable
  titleOverride?: string; // Permet de passer un titre personnalisé
  translations: (key: string, options?: { defaultValue?: string }) => string;
};

type ExtendedMetadata = Metadata & {
  canonical?: string;
  script?: { type: string; content: string }[];
};

export async function generateGenericMetadata({
  locale,
  slug,
  type,
  data,
  query,
  titleOverride,
  translations,
}: GenerateMetadataParams): Promise<ExtendedMetadata> {
  const defaultImage =
    "https://image.noelshack.com/fichiers/2024/34/2/1724186995-banner-adessya.jpg";

  // Définir le titre en fonction des données, du titre passé (titleOverride), ou selon le type
  const title = titleOverride
    ? `${titleOverride} - Adessya`
    : data
    ? `${(data as TypeProduct | BlogType).title} - Adessya`
    : type === "explorer"
    ? `Explorer${query ? ` : ${query}` : ""} - Adessya`
    : translations(`${type}NotFoundTitle`, {
        defaultValue: `${
          type === "product" ? "Produit" : "Article"
        } non trouvé - Adessya`,
      });

  const articleContent = data?.article?.en || data?.article?.fr || {};
  const shortArticleDesc = articleContent?.blocks
    ? articleContent.blocks
        .find((block: any) => block.type === "paragraph")
        ?.data.text.slice(0, 100)
    : null;

  const descProduct = type === "product" ? data?.description : null;

  const description =
    descProduct ||
    shortArticleDesc ||
    translations(
      `default${type === "product" ? "Product" : "Article"}Description`,
      {
        defaultValue:
          type === "product"
            ? "Découvrez ce produit incroyable sur Adessya."
            : "Découvrez cet article incroyable sur Adessya.",
      }
    );

  const keywords =
    type === "product"
      ? (data as TypeProduct)?.tags?.join(", ") ||
        translations("defaultKeywords", {
          defaultValue: "produits, ecommerce, adessya",
        })
      : type === "explorer"
      ? `explorer, produits, ${query ? query : "recherche"}, ecommerce`
      : (data as BlogType)?.tags?.join(", ") ||
        translations("defaultKeywords", {
          defaultValue: "blog, articles, adessya",
        });

  const canonical =
    type === "static"
      ? `${process.env.BASE_URL}`
      : `${process.env.BASE_URL}/${type}/${slug}`;

  const robots = {
    index: true,
    follow: true,
    maxSnippet: -1,
    maxImagePreview: "large",
  };

  const images =
    type === "product"
      ? (data as TypeProduct).previews?.length
        ? [
            {
              url: (data as TypeProduct).previews[0],
              width: 800,
              height: 600,
              alt: title,
            },
          ]
        : [
            {
              url: defaultImage,
              width: 800,
              height: 600,
              alt: "Image par défaut",
            },
          ]
      : [
          {
            url: defaultImage,
            width: 800,
            height: 600,
            alt: "Image par défaut",
          },
        ];

  // Ajouter Dublin Core metadata
  const dublinCore = [
    {
      name: "DC.title",
      content: title,
    },
    {
      name: "DC.description",
      content: description,
    },
    {
      name: "DC.creator",
      content: "Adessya",
    },
    {
      name: "DC.subject",
      content: keywords,
    },
    {
      name: "DC.language",
      content: locale,
    },
  ];

  // Breadcrumb structured data
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.BASE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: type === "product" ? "Produits" : "Explorer",
        item: `${process.env.BASE_URL}/${type}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data ? data.title : "404",
        item:
          type === "static"
            ? `${process.env.BASE_URL}`
            : `${process.env.BASE_URL}/${type}/${slug}`,
      },
    ],
  };

  // Ajouter structured data pour les avis si c'est un produit
  const aggregateRating =
    type === "product" && (data as TypeProduct)?.totalReviews
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (data as TypeProduct)?.rating.toString(),
            reviewCount: (data as TypeProduct)?.totalReviews.toString(),
          },
        }
      : null;

  // Définir les métadonnées par défaut si le produit ou le blog n'est pas trouvé
  if (!data) {
    return {
      title,
      description: translations(`${type}NotFoundDescription`, {
        defaultValue: `${
          type === "product" ? "Le produit" : "L'article"
        } que vous recherchez n'est pas disponible.`,
      }),
      keywords,
      canonical,
      robots,
      openGraph: {
        title,
        description: translations(`${type}NotFoundDescription`, {
          defaultValue: `${
            type === "product" ? "Le produit" : "L'article"
          } que vous recherchez n'est pas disponible.`,
        }),
        url: canonical,
        siteName: "Adessya",
        images,
        locale: locale || "fr_FR",
        type: type === "product" ? "website" : "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: translations(`${type}NotFoundDescription`, {
          defaultValue: `${
            type === "product" ? "Le produit" : "L'article"
          } que vous recherchez n'est pas disponible.`,
        }),
        images: [defaultImage],
      },
      script: [
        {
          type: "application/ld+json",
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === "product" ? "Product" : "Article",
            name: title,
            image: images.map((img) => img.url),
            description: description,
            ...(type === "product"
              ? {
                  sku: "N/A",
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "USD",
                    price: "0",
                    availability: "https://schema.org/OutOfStock",
                    url: canonical,
                  },
                  brand: {
                    "@type": "Brand",
                    name: "Adessya",
                  },
                }
              : {
                  author: {
                    "@type": "Person",
                    name: "Adessya",
                  },
                  datePublished: new Date().toISOString(),
                }),
          }),
        },
        {
          type: "application/ld+json",
          content: JSON.stringify(breadcrumbs),
        },
        ...dublinCore.map((meta) => ({
          type: "application/ld+json",
          content: JSON.stringify(meta),
        })),
      ].filter(Boolean), // Supprimer les valeurs null
    };
  }

  // Générer les métadonnées spécifiques si le produit ou le blog est trouvé
  return {
    title,
    description:
      data.description ||
      translations(
        `default${type === "product" ? "Product" : "Article"}Description`,
        {
          defaultValue:
            type === "product"
              ? "Découvrez ce produit incroyable sur Adessya."
              : "Découvrez cet article incroyable sur Adessya.",
        }
      ),
    keywords,
    canonical,
    robots,
    openGraph: {
      title,
      description:
        data.description ||
        translations(
          `default${type === "product" ? "Product" : "Article"}Description`,
          {
            defaultValue:
              type === "product"
                ? "Découvrez ce produit incroyable sur Adessya."
                : "Découvrez cet article incroyable sur Adessya.",
          }
        ),
      url: canonical,
      siteName: "Adessya",
      images,
      locale: locale || "fr_FR",
      type: type === "product" ? "website" : "article",
      ...(type === "product" &&
      (data as TypeProduct).pricing?.[0]?.plans?.[0]?.price
        ? {
            "product:price:amount": (
              data as TypeProduct
            ).pricing[0].plans[0].price.toString(),
            "product:price:currency":
              (data as TypeProduct).pricing[0].devise || "USD",
            "product:availability": "in stock",
          }
        : {}),
      ...(type === "Article" && (data as BlogType).enableAt
        ? {
            "article:published_time": (data as BlogType).enableAt,
            "article:author": "Adessya",
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        data.description ||
        translations(
          `default${type === "product" ? "Product" : "Article"}Description`,
          {
            defaultValue:
              type === "product"
                ? "Découvrez ce produit incroyable sur Adessya."
                : "Découvrez cet article incroyable sur Adessya.",
          }
        ),
      images:
        type === "product"
          ? [(data as TypeProduct).previews[0]] || [defaultImage]
          : [(data as BlogType).preview || defaultImage],
    },
    script: [
      {
        type: "application/ld+json",
        content: JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "product" ? "Product" : "Article",
          name: title,
          image: images.map((img) => img.url),
          description: description,
          ...(type === "product"
            ? {
                sku: (data as TypeProduct)._id,
                offers: {
                  "@type": "Offer",
                  priceCurrency:
                    (data as TypeProduct).pricing?.[0]?.devise || "USD",
                  price:
                    (data as TypeProduct).pricing?.[0]?.plans?.[0]?.price ||
                    "0",
                  availability: "https://schema.org/InStock",
                  url: canonical,
                },
                brand: {
                  "@type": "Brand",
                  name: "Adessya",
                },
              }
            : {
                author: {
                  "@type": "Person",
                  name: "Adessya",
                },
                datePublished:
                  (data as BlogType).enableAt || new Date().toISOString(),
              }),
        }),
      },
      aggregateRating && {
        type: "application/ld+json",
        content: JSON.stringify(aggregateRating),
      },
      {
        type: "application/ld+json",
        content: JSON.stringify(breadcrumbs),
      },
      ...dublinCore.map((meta) => ({
        type: "application/ld+json",
        content: JSON.stringify(meta),
      })),
    ].filter(Boolean), // Supprimer les valeurs null
  };
}