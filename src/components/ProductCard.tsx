import { type FC } from "react";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="rounded-lg border p-6 shadow-sm hover:shadow-elevated transition-shadow">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="mb-4 aspect-[4/3] w-full object-cover rounded-md"
        />
      )}
      <div className="font-medium">{product.name}</div>
      <div className="text-muted-foreground text-sm">
        {product.description}
      </div>
    </div>
  );
};
