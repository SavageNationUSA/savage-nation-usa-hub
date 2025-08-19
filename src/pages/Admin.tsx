import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageEditor } from "@/components/admin/PageEditor";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  productFormSchema,
  blogFormSchema,
  videoFormSchema,
  pageFormSchema,
  faqFormSchema,
} from "@/lib/validators";
import { CrudTable } from "@/components/admin/CrudTable";
import { useOptimisticDelete } from "@/hooks/useOptimisticDelete";
import { CrudTable } from "@/components/admin/CrudTable";
import { useOptimisticDelete } from "@/hooks/useOptimisticDelete";

// Product Types
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
};

// Blog Types
type Blog = {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  created_at: string;
};

// Video Types
type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  published: boolean;
  created_at: string;
};

// Page Types
type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
};

// FAQ Types
type Faq = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
};

const ProductsManager = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteMutation = useOptimisticDelete<Product>({
    queryKey: ["products"],
    deleteFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted" });
    },
  });

  return (
    <CrudTable
      title="Products"
      isLoading={isLoading}
      isError={isError}
      items={data}
      toolbar={<CreateProductDialog />}
      headers={["Image", "Name", "Description", "Price", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(product: Product) => (
        <TableRow key={product.id}>
          <TableCell>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-16 w-16 object-cover rounded"
              />
            ) : null}
          </TableCell>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>{product.description}</TableCell>
          <TableCell>
            {product.price != null ? formatCurrency(product.price) : ""}
          </TableCell>
          <TableCell className="text-right space-x-2">
            <EditProductDialog product={product} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(product.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
};