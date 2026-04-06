import type {
  AuthPayload,
  Cart,
  CartItem,
  Category,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductVariant,
  User,
} from "../types";

const getData = <T>(payload: unknown): T | undefined => {
  if (!payload || typeof payload !== "object") return undefined;

  const record = payload as Record<string, unknown>;
  if ("data" in record) {
    return record.data as T;
  }

  return payload as T;
};

const toImageUrl = (image: unknown): string => {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && "url" in image) {
    return String((image as Record<string, unknown>).url ?? "");
  }

  return "";
};

export const normalizeImageObjects = (images: unknown): ProductImage[] => {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (typeof image === "string") {
        return { url: image };
      }

      if (image && typeof image === "object") {
        const record = image as Record<string, unknown>;
        return {
          url: String(record.url ?? ""),
          format: record.format ? String(record.format) : undefined,
          size: typeof record.size === "number" ? record.size : undefined,
          createdAt: record.createdAt ? String(record.createdAt) : undefined,
        };
      }

      return null;
    })
    .filter((image): image is ProductImage => !!image?.url);
};

export const normalizeVariants = (variants: unknown): ProductVariant[] => {
  if (!Array.isArray(variants)) return [];

  return variants.reduce<ProductVariant[]>((acc, variant) => {
      if (!variant || typeof variant !== "object") return acc;
      const record = variant as Record<string, unknown>;
      const id = String(record.id ?? "");
      if (!id) return acc;
      acc.push({
        id,
        color: record.color ? String(record.color) : undefined,
        size: record.size ? String(record.size) : undefined,
        sku: record.sku ? String(record.sku) : undefined,
        price: Number(record.price ?? 0),
        stock: Number(record.stock ?? 0),
        images: Array.isArray(record.images) ? record.images.map(toImageUrl).filter(Boolean) : [],
      });
      return acc;
    }, []);
};

export const normalizeCategory = (category: unknown): Category => {
  const record = (category ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? record._id ?? ""),
    name: String(record.name ?? ""),
    description: record.description ? String(record.description) : undefined,
  };
};

export const normalizeProduct = (product: unknown): Product => {
  const record = (product ?? {}) as Record<string, unknown>;
  const images = normalizeImageObjects(record.images);
  const categoryRecord =
    record.category && typeof record.category === "object"
      ? (record.category as Record<string, unknown>)
      : undefined;

  return {
    id: String(record.id ?? record._id ?? ""),
    title: String(record.title ?? record.name ?? ""),
    description: String(record.description ?? ""),
    price: Number(record.price ?? 0),
    brand: String(record.brand ?? ""),
    stock: Number(record.stock ?? 0),
    images: images.map((image) => image.url),
    imageObjects: images,
    variants: normalizeVariants(record.variants),
    category: record.category ? normalizeCategory(record.category) : { id: "", name: "" },
    categoryId: String(record.categoryId ?? categoryRecord?.id ?? ""),
    createdAt: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? ""),
  };
};

export const normalizeProductsResponse = (payload: unknown): Product[] => {
  const data = getData<Record<string, unknown>>(payload);

  if (data?.grouped && typeof data.grouped === "object") {
    const grouped = data.grouped as Record<string, unknown[]>;
    const merged = Object.values(grouped).flat();

    return merged.map(normalizeProduct);
  }

  if (Array.isArray(data?.data)) return data.data.map(normalizeProduct);
  if (Array.isArray(data)) return data.map(normalizeProduct);

  return [];
};

export const normalizeProductResponse = (payload: unknown): Product => {
  const data = getData<Record<string, unknown>>(payload);
  const product = (data?.product ?? data) as unknown;

  return normalizeProduct(product);
};

export const normalizeUser = (user: unknown, fallbackEmail = ""): User => {
  const record = (user ?? {}) as Record<string, unknown>;
  const email = String(record.email ?? fallbackEmail);

  return {
    id: String(record.id ?? record._id ?? crypto.randomUUID()),
    name: String(record.name ?? email.split("@")[0] ?? "User"),
    email,
    role: (String(record.role ?? "USER").toUpperCase() as User["role"]) ?? "USER",
  };
};

export const normalizeAuthResponse = (payload: unknown, fallbackEmail = ""): AuthPayload => {
  const data = getData<Record<string, unknown>>(payload) ?? {};

  return {
    token: data.token ? String(data.token) : null,
    user: normalizeUser(data.user, fallbackEmail),
  };
};

const normalizeOrderItemProduct = (product: unknown): Product => {
  return normalizeProduct(product);
};

export const normalizeCartItem = (item: unknown): CartItem => {
  const record = (item ?? {}) as Record<string, unknown>;
  const variant = normalizeVariants(record.variant ? [record.variant] : [])[0];
  const fallbackProduct = normalizeOrderItemProduct({
    id: record.productId,
    name: record.productName,
    category: record.category ? { name: record.category } : undefined,
    price: record.unitPrice,
    stock: variant?.stock ?? 0,
    variants: variant ? [variant] : [],
    images: variant?.images ?? [],
  });

  return {
    id: String(record.id ?? ""),
    productId: String(record.productId ?? ""),
    quantity: Number(record.quantity ?? 0),
    unitPrice: Number(record.unitPrice ?? fallbackProduct.price ?? 0),
    subtotal: Number(record.subtotal ?? 0),
    variantId: variant?.id,
    variant,
    product: record.product ? normalizeOrderItemProduct(record.product) : fallbackProduct,
  };
};

export const normalizeCartResponse = (payload: unknown): Cart => {
  const data = getData<Record<string, unknown>>(payload);
  const cart = (data?.cart ?? data ?? {}) as Record<string, unknown>;
  const items = Array.isArray(cart.items) ? cart.items.map(normalizeCartItem) : [];

  return {
    id: String(cart.id ?? ""),
    userId: String(cart.userId ?? ""),
    items,
    total: Number(cart.total ?? items.reduce((sum, item) => sum + item.subtotal, 0)),
    itemCount: Number(cart.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0)),
  };
};

export const normalizeOrderItem = (item: unknown): OrderItem => {
  const record = (item ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ""),
    productId: String(record.productId ?? ""),
    variantId: record.variantId ? String(record.variantId) : undefined,
    quantity: Number(record.quantity ?? 0),
    price: Number(record.price ?? 0),
    product: record.product ? normalizeOrderItemProduct(record.product) : normalizeProduct({ id: record.productId }),
  };
};

export const normalizeOrder = (order: unknown): Order => {
  const record = (order ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ""),
    userId: String(record.userId ?? ""),
    status: String(record.status ?? "PENDING") as Order["status"],
    paymentMethod: (record.paymentMethod ? String(record.paymentMethod) : undefined) as Order["paymentMethod"],
    total: Number(record.total ?? 0),
    items: Array.isArray(record.items) ? record.items.map(normalizeOrderItem) : [],
    shippingAddress: record.shippingAddress ? String(record.shippingAddress) : "",
    city: record.city ? String(record.city) : "",
    postalCode: record.postalCode ? String(record.postalCode) : undefined,
    phoneNumber: record.phoneNumber ? String(record.phoneNumber) : "",
    fullName: record.fullName ? String(record.fullName) : "",
    createdAt: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? ""),
  };
};

export const normalizeOrdersResponse = (payload: unknown): Order[] => {
  const data = getData<unknown>(payload);

  if (Array.isArray(data)) return data.map(normalizeOrder);

  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).data)) {
    return ((data as Record<string, unknown>).data as unknown[]).map(normalizeOrder);
  }

  return [];
};

export const normalizeOrderResponse = (payload: unknown): Order => {
  const data = getData<Record<string, unknown>>(payload);
  const order = (data?.order ?? data) as unknown;

  return normalizeOrder(order);
};
