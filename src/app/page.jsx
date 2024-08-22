"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define the form schema with Zod
const formSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  image: z
    .any()
    .refine((files) => files?.[0], "Image is required")
    .optional(),
});

export default function ImageUploadForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [watermarkImage,setWatermarkImage]=useState()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      image: null,
    },
  });

  async function onSubmit(values) {
    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("watermark", values.description);
    try {
      const response = await fetch("http://localhost:5000/watermark", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const image_path=data.watermark_image
      const img=image_path.split("\\").pop().split("/").pop()
      setWatermarkImage(img);
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-lg font-semibold mb-4">
        Upload Image and Watermark{" "}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload Field */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      field.onChange(e.target.files);
                      setSelectedImage(e.target.files[0]);
                    }}
                    className="border border-gray-300 p-2 rounded"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Description Input Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Watermark</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Try 'Penta.svg'"
                    {...field}
                    className="border border-gray-300 p-2 rounded"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Submit
          </Button>
        </form>
      </Form>
      {watermarkImage && (
        <div>
          <h2>Watermarked Image</h2>
          <img src={"/"+watermarkImage} alt="Watermarked" />
        </div>
      )}
    </div>
  );
}
