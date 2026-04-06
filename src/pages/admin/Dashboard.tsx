import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, RefreshCw, ShoppingBag, Tag, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, deleteProduct } from "../../api/products";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../../api/categories";
import { getAllOrders, updateOrderStatus } from "../../api/orders";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Input from "../../components/ui/Input";
import type { Category, OrderStatus } from "../../types";
import { categorySchema, type CategoryFormData } from "../../utils/validators";

const statusColors: Record<OrderStatus, "yellow" | "blue" | "purple" | "green" | "red"> = {
  PENDING: "yellow",
  PAID: "blue",
  PROCESSING: "blue",
  SHIPPED: "purple",
  DELIVERED: "green",
  CANCELLED: "red",
};

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

const Dashboard = () => {
  const qc = useQueryClient();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "categories">("products");

  const { data: products = [], isLoading: loadingProducts } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: orders = [], isLoading: loadingOrders } = useQuery({ queryKey: ["allOrders"], queryFn: getAllOrders });
  const { data: categories = [], isLoading: loadingCats } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const { mutate: delProduct, isPending: deletingProduct } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleteProductId(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const { mutate: delCategory, isPending: deletingCat } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteCategoryId(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    reValidateMode: "onBlur",
  });

  const { mutate: saveCat, isPending: savingCat } = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (editingCat) return updateCategory(editingCat.id, data);
      return createCategory(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(editingCat ? "Category updated" : "Category created");
      setCatModalOpen(false);
      setEditingCat(null);
      reset();
    },
    onError: () => toast.error("Failed to save category"),
  });

  const openEditCat = (category: Category) => {
    setEditingCat(category);
    setValue("name", category.name);
    setValue("description", category.description ?? "");
    setCatModalOpen(true);
  };

  const tabs = [
    { id: "products", label: "Products", icon: <Package size={16} />, count: products.length },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={16} />, count: orders.length },
    { id: "categories", label: "Categories", icon: <Tag size={16} />, count: categories.length },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button
            variant="secondary"
            className="gap-2 w-full sm:w-auto"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["products"] });
              qc.invalidateQueries({ queryKey: ["allOrders"] });
              qc.invalidateQueries({ queryKey: ["categories"] });
            }}
          >
            <RefreshCw size={16} /> Refresh
          </Button>
          <Link to="/admin/product/new" className="w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto"><Plus size={16} /> Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Products", value: products.length, color: "bg-blue-50 text-blue-600", icon: <Package size={20} /> },
          { label: "Total Orders", value: orders.length, color: "bg-green-50 text-green-600", icon: <ShoppingBag size={20} /> },
          { label: "Categories", value: categories.length, color: "bg-purple-50 text-purple-600", icon: <Tag size={20} /> },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px shrink-0 whitespace-nowrap ${
              activeTab === tab.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loadingProducts ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Product", "Brand", "Category", "Price", "Stock", "Actions"].map((heading) => (
                      <th key={heading} className="text-left px-4 py-3 font-semibold text-gray-600">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=P"; }}
                          />
                          <span className="font-medium text-gray-900 max-w-[180px] truncate">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.brand}</td>
                      <td className="px-4 py-3"><Badge label={product.category?.name ?? "-"} color="blue" /></td>
                      <td className="px-4 py-3 font-semibold text-primary-600">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge label={String(product.stock)} color={product.stock > 0 ? "green" : "red"} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/product/${product.id}/edit`}>
                            <button className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"><Pencil size={14} /></button>
                          </Link>
                          <button onClick={() => setDeleteProductId(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loadingOrders ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Order ID", "Customer", "Items", "Total", "Status", "Update Status"].map((heading) => (
                      <th key={heading} className="text-left px-4 py-3 font-semibold text-gray-600">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-gray-700">{order.fullName || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{order.items?.length ?? 0} items</td>
                      <td className="px-4 py-3 font-semibold text-primary-600">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge label={order.status} color={statusColors[order.status]} /></td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={order.status}
                          onChange={(e) => updateStatus({ id: order.id, status: e.target.value as OrderStatus })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[140px]"
                        >
                          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-2 w-full sm:w-auto" onClick={() => { setEditingCat(null); reset(); setCatModalOpen(true); }}>
              <Plus size={14} /> Add Category
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingCats ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Name", "Description", "Actions"].map((heading) => (
                        <th key={heading} className="text-left px-4 py-3 font-semibold text-gray-600">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                        <td className="px-4 py-3 text-gray-500">{category.description || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditCat(category)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteCategoryId(category.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        title="Delete Product"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteProductId(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deletingProduct} onClick={() => deleteProductId && delProduct(deleteProductId)}>Delete</Button>
          </>
        }
      >
        <p className="text-gray-600">Are you sure you want to delete this product? This action cannot be undone.</p>
      </Modal>

      <Modal
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        title="Delete Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteCategoryId(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deletingCat} onClick={() => deleteCategoryId && delCategory(deleteCategoryId)}>Delete</Button>
          </>
        }
      >
        <p className="text-gray-600">Are you sure you want to delete this category?</p>
      </Modal>

      <Modal
        isOpen={catModalOpen}
        onClose={() => { setCatModalOpen(false); setEditingCat(null); reset(); }}
        title={editingCat ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatModalOpen(false)}>Cancel</Button>
            <Button isLoading={savingCat} onClick={handleSubmit((data) => saveCat(data))}>
              {editingCat ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Category Name" placeholder="Electronics" error={errors.name?.message} {...register("name")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea {...register("description")} className="input-field resize-none h-20" placeholder="Brief description..." />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
