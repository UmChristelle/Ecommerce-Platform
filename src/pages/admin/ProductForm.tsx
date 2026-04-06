import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "../../utils/validators";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "../../api/categories";
import { createProduct, updateProduct, getProductById } from "../../api/products";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errors";

const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: { images: [""] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" as never });
  const watchedImages = useWatch({ control, name: "images" });

  useEffect(() => {
    if (existingProduct) {
      reset({
        title: existingProduct.title,
        description: existingProduct.description,
        brand: existingProduct.brand,
        price: existingProduct.price,
        stock: existingProduct.stock,
        categoryId: existingProduct.categoryId,
        images: existingProduct.images?.length ? existingProduct.images : [""],
      });
    }
  }, [existingProduct, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductFormData) =>
      isEditing ? updateProduct(id!, data) : createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(isEditing ? "Product updated!" : "Product created!");
      navigate("/admin");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to save product")),
  });

  if ((isEditing && loadingProduct) || loadingCats) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex items-start sm:items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Package size={24} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? "Update product details" : "Fill in the form to add a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data: ProductFormData) => mutate(data))} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-800 border-b pb-3">Basic Information</h2>
          <Input label="Product Title" placeholder="iPhone 15 Pro" error={errors.title?.message} {...register("title")} />
          <Input label="Brand" placeholder="Apple" error={errors.brand?.message} {...register("brand")} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(min. 20 chars)</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className={`input-field resize-none ${errors.description ? "input-error" : ""}`}
              placeholder="Describe the product in detail..."
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              {...register("categoryId")}
              className={`input-field ${errors.categoryId ? "input-error" : ""}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-800 border-b pb-3">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="99.99"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Stock Quantity"
              type="number"
              step="1"
              min="0"
              placeholder="50"
              error={errors.stock?.message}
              {...register("stock")}
            />
          </div>
        </div>

        {/* Images */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-semibold text-gray-800">Product Images</h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => append("" as never)}
              className="gap-1.5 w-full sm:w-auto"
            >
              <Plus size={14} /> Add Image URL
            </Button>
          </div>
          {errors.images?.root && <p className="text-xs text-red-500">{errors.images.root.message}</p>}
          {errors.images?.message && <p className="text-xs text-red-500">{errors.images.message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="flex-1 w-full">
                <Input
                  placeholder="https://example.com/image.jpg"
                  error={errors.images?.[index]?.message}
                  {...register(`images.${index}` as const, {
                    onChange: () => setPreviewIndex(index),
                  })}
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-0.5 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {previewIndex === index && (
                <img
                  src={watchedImages?.[index] ?? ""}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate("/admin")} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" isLoading={isPending} size="lg" className="w-full sm:w-auto">
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
