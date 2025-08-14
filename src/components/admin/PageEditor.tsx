import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
};

type PageFormValues = {
  title: string;
  content: string;
};

interface PageEditorProps {
  slug: string;
  title: string;
}

const fetchPage = async (slug: string): Promise<Page | null> => {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

export const PageEditor = ({ slug, title }: PageEditorProps) => {
  const form = useForm<PageFormValues>({
    defaultValues: { title: "", content: "" },
  });
  const queryClient = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => fetchPage(slug),
  });

  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title || title,
        content: page.content || "",
      });
    } else {
      form.reset({
        title: title,
        content: "",
      });
    }
  }, [page, form, title]);

  const mutation = useMutation({
    mutationFn: async (values: PageFormValues) => {
      if (page) {
        // Update existing page
        const { error } = await supabase
          .from("pages")
          .update({
            title: values.title,
            content: values.content,
          })
          .eq("id", page.id);
        if (error) throw error;
      } else {
        // Create new page
        const { error } = await supabase.from("pages").insert({
          slug,
          title: values.title,
          content: values.content,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", slug] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({ title: page ? "Page updated" : "Page created" });
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} Page</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[300px]"
                      placeholder="Enter the page content in Markdown format..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {page ? "Update Page" : "Create Page"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};