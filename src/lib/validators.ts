import { z } from "zod";

// Form schemas aligned with current RHF value shapes
// We keep numeric fields as strings and coerce in mutations to avoid RHF type churn.

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  price: z
    .string()
    .regex(/^(\d+)?(\.\d{0,2})?$/, "Enter a valid price (e.g., 9.99)"),
  image: z.any().optional(),
});

export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean(),
});

export const videoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  url: z.string().url("Enter a valid URL"),
  published: z.boolean(),
});

export const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const faqFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  display_order: z
    .string()
    .regex(/^\d+$/, "Display order must be a non-negative integer"),
});

