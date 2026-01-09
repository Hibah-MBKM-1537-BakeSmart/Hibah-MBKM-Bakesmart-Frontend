"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Settings,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Layers,
  ChevronDown,
  ChevronRight,
  Tag,
} from "lucide-react";
import { AddProductModal } from "@/components/adminPage/productsPage/AddProductModal";
import { ProductDetailModal } from "@/components/adminPage/productsPage/ProductDetailModal";
import { EditProductModal } from "@/components/adminPage/productsPage/EditProductModal";
import { useToast } from "@/components/adminPage/Toast";
import { useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { useProducts, Product } from "@/app/contexts/ProductsContext";
import { getImageUrl } from "@/lib/utils";

// ProductTableRow Component for reusability
interface ProductTableRowProps {
  product: Product;
  isGrouped: boolean;
  editingStockId: number | null;
  tempStock: string;
  pendingStockChanges: Record<number, number>;
  formatPrice: (price: number) => string;
  handleStockInputChange: (value: string) => void;
  saveStockEdit: (productId: number) => void;
  cancelStockEdit: () => void;
  handleStockDecrement: (productId: number) => void;
  handleStockIncrement: (productId: number) => void;
  confirmStockChange: (productId: number) => void;
  cancelStockChange: (productId: number) => void;
  startEditingStock: (productId: number, currentStock: number) => void;
  handleViewProduct: (productId: number) => void;
  handleEditProduct: (productId: number, productName: string) => void;
  handleDeleteProduct: (productId: number, productName: string) => void;
}

function ProductTableRow({
  product,
  isGrouped,
  editingStockId,
  tempStock,
  pendingStockChanges,
  formatPrice,
  handleStockInputChange,
  saveStockEdit,
  cancelStockEdit,
  handleStockDecrement,
  handleStockIncrement,
  confirmStockChange,
  cancelStockChange,
  startEditingStock,
  handleViewProduct,
  handleEditProduct,
  handleDeleteProduct,
}: ProductTableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 ${isGrouped ? "bg-white" : ""}`}>
      {isGrouped && <td className="w-[40px]"></td>}
      <td className="px-3 lg:px-6 py-4 w-[280px]">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg mr-3 lg:mr-4 flex-shrink-0 relative">
            {product.gambars && product.gambars.length > 0 ? (
              <>
                <img
                  src={getImageUrl(product.gambars[0].file_path)}
                  alt={product.nama}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.parentElement?.querySelector(
                      ".fallback-icon"
                    ) as HTMLElement;
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
                <div
                  className="fallback-icon absolute inset-0 w-10 h-10 bg-orange-100 rounded-lg items-center justify-center"
                  style={{ display: "none" }}
                >
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
              </>
            ) : (
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {product.nama}
            </div>
            <div className="text-xs lg:text-sm text-gray-500 truncate max-w-[150px] lg:max-w-xs">
              {product.deskripsi}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 lg:px-6 py-4 whitespace-nowrap w-[140px]">
        <span className="inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {product.jenis?.[0]?.nama_en ||
            product.jenis?.[0]?.nama_id ||
            "Unknown"}
        </span>
      </td>
      <td className="px-3 lg:px-6 py-4 w-[180px]">
        <div className="flex flex-wrap gap-1">
          {product.hari && product.hari.length > 0 ? (
            product.hari.map((day) => (
              <span
                key={day.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {day.nama_id || day.nama}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No days set</span>
          )}
        </div>
      </td>
      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900 w-[130px]">
        {product.harga ? formatPrice(product.harga) : "Rp 0"}
      </td>
      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-[180px]">
        {product.isDaily ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {product.daily_stock ?? 0}
            </div>
            <span className="text-xs text-gray-500">units/day</span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">N/A</span>
        )}
      </td>
      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 w-[100px]">
        {product.sales ?? 0}
      </td>
      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-[140px]">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleViewProduct(product.id)}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() =>
              handleEditProduct(product.id, product.nama || "Product")
            }
            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
            title="Edit Product"
          >
            <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() =>
              handleDeleteProduct(product.id, product.nama || "Product")
            }
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ProductsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [groupBy, setGroupBy] = useState<
    "none" | "jenis" | "sub_jenis" | "jenis_sub_jenis"
  >("none");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<
    "nama" | "category" | "day" | "harga" | "stok" | "sales"
  >("nama");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000000,
  });
  const [stockRange, setStockRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<string>("");
  const [pendingStockChanges, setPendingStockChanges] = useState<
    Record<number, number>
  >({});
  const { addToast } = useToast();
  const { jenisList } = useJenis();
  const { subJenisList } = useSubJenis();
  const {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    exportProduct,
    importProduct,
  } = useProducts();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportProduct();
      addToast({
        type: "success",
        title: "Export successful",
        message: "Products exported successfully.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Export failed",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importProduct(file);
      addToast({
        type: "success",
        title: "Import successful",
        message: "Products imported successfully.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Import failed",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Extract unique jenis from backend products
  const uniqueJenis = React.useMemo(() => {
    const jenisSet = new Set<string>();
    products.forEach((product) => {
      product.jenis?.forEach((j) => {
        const jenisNama = (j.nama_en || j.nama_id || j.nama)?.trim();
        if (jenisNama) jenisSet.add(jenisNama);
      });
    });
    return Array.from(jenisSet).sort();
  }, [products]);

  // Extract unique days from backend products
  const uniqueDays = React.useMemo(() => {
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const daysSet = new Set<string>();

    products.forEach((product) => {
      product.hari?.forEach((h) => {
        const dayNama = h.nama_en || h.nama_id || h.nama;
        if (dayNama) daysSet.add(dayNama);
      });
    });

    return Array.from(daysSet).sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [products]);

  const categoryOptions = ["all", ...uniqueJenis];
  const dayOptions = ["all", ...uniqueDays];

  // Sort and filter products
  const filteredProducts = products
    .filter((product) => {
      if (!product || !product.nama) return false;

      const matchesSearch = product.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.jenis?.some((j) => {
          const jenisNama = (j.nama_en || j.nama_id || j.nama)?.trim();
          return jenisNama === selectedCategory;
        }) ||
        false;

      const matchesDay =
        selectedDay === "all" ||
        product.hari?.some((h) => {
          const dayNama = h.nama_en || h.nama_id || h.nama;
          return dayNama === selectedDay;
        }) ||
        false;

      const matchesPrice =
        product.harga >= priceRange.min && product.harga <= priceRange.max;

      const matchesStock =
        (product.stok ?? 0) >= stockRange.min &&
        (product.stok ?? 0) <= stockRange.max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDay &&
        matchesPrice &&
        matchesStock
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "nama":
          comparison = a.nama.localeCompare(b.nama);
          break;
        case "category":
          const categoryA =
            a.jenis?.[0]?.nama_en || a.jenis?.[0]?.nama_id || "";
          const categoryB =
            b.jenis?.[0]?.nama_en || b.jenis?.[0]?.nama_id || "";
          comparison = categoryA.localeCompare(categoryB);
          break;
        case "day":
          const dayA = a.hari?.[0]?.nama_en || a.hari?.[0]?.nama_id || "";
          const dayB = b.hari?.[0]?.nama_en || b.hari?.[0]?.nama_id || "";
          const dayOrder = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ];
          const indexA = dayOrder.indexOf(dayA);
          const indexB = dayOrder.indexOf(dayB);
          if (indexA !== -1 && indexB !== -1) {
            comparison = indexA - indexB;
          } else {
            comparison = dayA.localeCompare(dayB);
          }
          break;
        case "harga":
          comparison = a.harga - b.harga;
          break;
        case "stok":
          comparison = (a.stok ?? 0) - (b.stok ?? 0);
          break;
        case "sales":
          comparison = (a.sales ?? 0) - (b.sales ?? 0);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Group products
  const groupedProducts = React.useMemo(() => {
    if (groupBy === "none") {
      return null;
    }

    const groups: Record<
      string,
      {
        name: string;
        nameEn: string;
        products: Product[];
        type: "jenis" | "sub_jenis";
        parentId?: string;
      }
    > = {};

    if (groupBy === "jenis") {
      filteredProducts.forEach((product) => {
        const jenis = product.jenis?.[0];
        const key = `jenis_${jenis?.id?.toString() || "uncategorized"}`;
        const name = jenis?.nama_id || "Tanpa Kategori";
        const nameEn = jenis?.nama_en || "Uncategorized";

        if (!groups[key]) {
          groups[key] = { name, nameEn, products: [], type: "jenis" };
        }
        groups[key].products.push(product);
      });
    } else if (groupBy === "sub_jenis") {
      filteredProducts.forEach((product) => {
        const subJenis = product.sub_jenis?.[0];
        const key = `sub_${subJenis?.id?.toString() || "uncategorized"}`;
        const name = subJenis?.nama_id || "Tanpa Sub Kategori";
        const nameEn = subJenis?.nama_en || "Uncategorized";

        if (!groups[key]) {
          groups[key] = { name, nameEn, products: [], type: "sub_jenis" };
        }
        groups[key].products.push(product);
      });
    } else if (groupBy === "jenis_sub_jenis") {
      filteredProducts.forEach((product) => {
        const jenis = product.jenis?.[0];
        const subJenis = product.sub_jenis?.[0];

        const jenisKey = `jenis_${jenis?.id?.toString() || "uncategorized"}`;
        const jenisName = jenis?.nama_id || "Tanpa Kategori";
        const jenisNameEn = jenis?.nama_en || "Uncategorized";

        if (!groups[jenisKey]) {
          groups[jenisKey] = {
            name: jenisName,
            nameEn: jenisNameEn,
            products: [],
            type: "jenis",
          };
        }

        const subKey = `${jenisKey}_sub_${
          subJenis?.id?.toString() || "uncategorized"
        }`;
        const subName = subJenis?.nama_id || "Tanpa Sub Kategori";
        const subNameEn = subJenis?.nama_en || "Uncategorized";

        if (!groups[subKey]) {
          groups[subKey] = {
            name: subName,
            nameEn: subNameEn,
            products: [],
            type: "sub_jenis",
            parentId: jenisKey,
          };
        }
        groups[subKey].products.push(product);
      });
    }

    return groups;
  }, [filteredProducts, groupBy]);

  // Toggle group expansion
  const toggleGroup = (groupKey: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const expandAllGroups = React.useCallback(() => {
    if (groupedProducts) {
      const allKeys = new Set<string>();
      Object.entries(groupedProducts).forEach(([key, group]) => {
        allKeys.add(key);
        if (group.parentId) {
          allKeys.add(group.parentId);
        }
      });
      setExpandedGroups(allKeys);
    }
  }, [groupedProducts]);

  const collapseAllGroups = React.useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const groupKeys = React.useMemo(() => {
    if (!groupedProducts) return "";
    return Object.keys(groupedProducts).sort().join(",");
  }, [groupedProducts]);

  React.useEffect(() => {
    if (groupBy !== "none" && groupedProducts) {
      const allKeys = new Set<string>();
      Object.entries(groupedProducts).forEach(([key, group]) => {
        allKeys.add(key);
        if (group.parentId) {
          allKeys.add(group.parentId);
        }
      });
      setExpandedGroups(allKeys);
    } else {
      setExpandedGroups(new Set());
    }
  }, [groupBy, groupKeys]);

  const handleSort = (
    field: "nama" | "category" | "day" | "harga" | "stok" | "sales"
  ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (
    field: "nama" | "category" | "day" | "harga" | "stok" | "sales"
  ) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddProduct = async (newProductData: Partial<Product>) => {
    try {
      await addProduct(newProductData);
      setShowAddModal(false);

      addToast({
        type: "success",
        title: "Product added successfully!",
        message: `${newProductData.nama} has been added to product catalog.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to add product",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleDeleteProduct = async (
    productId: number,
    productName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete product "${productName}"?`
      )
    ) {
      try {
        await deleteProduct(productId);
        addToast({
          type: "success",
          title: "Product deleted successfully!",
          message: `${productName} has been removed from product catalog.`,
        });
      } catch (error) {
        addToast({
          type: "error",
          title: "Failed to delete product",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }
  };

  const handleEditProduct = (productId: number, productName: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowEditModal(true);
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!selectedProduct) return;

    try {
      await updateProduct(selectedProduct.id, productData);
      setShowEditModal(false);
      setSelectedProduct(null);

      addToast({
        type: "success",
        title: "Product updated successfully!",
        message: `${
          productData.nama || selectedProduct.nama
        } has been updated.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to update product",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleViewProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductDetail(true);
    }
  };

  const handleStockIncrement = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && typeof product.stok === "number") {
      const currentPending = pendingStockChanges[productId] ?? product.stok;
      const newStok = currentPending + 1;
      setPendingStockChanges((prev) => ({
        ...prev,
        [productId]: newStok,
      }));
    }
  };

  const handleStockDecrement = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && typeof product.stok === "number") {
      const currentPending = pendingStockChanges[productId] ?? product.stok;
      if (currentPending > 0) {
        const newStok = currentPending - 1;
        setPendingStockChanges((prev) => ({
          ...prev,
          [productId]: newStok,
        }));
      }
    }
  };

  const confirmStockChange = async (productId: number) => {
    const newStok = pendingStockChanges[productId];
    if (newStok === undefined) return;

    try {
      await updateProduct(productId, { stok: newStok });
      setPendingStockChanges((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      addToast({
        type: "success",
        title: "Stock updated!",
        message: `Stock has been updated to ${newStok}.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to update stock",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const cancelStockChange = (productId: number) => {
    setPendingStockChanges((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const startEditingStock = (productId: number, currentStock: number) => {
    setEditingStockId(productId);
    setTempStock(currentStock.toString());
  };

  const handleStockInputChange = (value: string) => {
    const cleanedValue = value.replace(/[^0-9]/g, "");
    setTempStock(cleanedValue);
  };

  const saveStockEdit = async (productId: number) => {
    try {
      const stockValue = parseInt(tempStock) || 0;
      await updateProduct(productId, { stok: stockValue });
      setEditingStockId(null);
      setTempStock("");
      addToast({
        type: "success",
        title: "Stock updated successfully!",
        message: `Stock has been updated to ${stockValue}.`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to update stock",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setTempStock("");
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="space-y-4">
          {/* Search and Category Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Days Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day === "all" ? "All Days" : day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group By Filter */}
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={groupBy}
                  onChange={(e) =>
                    setGroupBy(
                      e.target.value as
                        | "none"
                        | "jenis"
                        | "sub_jenis"
                        | "jenis_sub_jenis"
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  <option value="none">Group By ....</option>
                  <option value="jenis">Group by Jenis</option>
                  <option value="sub_jenis">Group by Sub Jenis</option>
                  <option value="jenis_sub_jenis">
                    Group by Jenis & Sub Jenis
                  </option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex items-center justify-center space-x-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 bg-[#9B6D49] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f47] transition-colors whitespace-nowrap text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      min: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      max: Number(e.target.value) || 1000000,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Stock Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Stock Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={stockRange.min || ""}
                  onChange={(e) =>
                    setStockRange((prev) => ({
                      ...prev,
                      min: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={stockRange.max || ""}
                  onChange={(e) =>
                    setStockRange((prev) => ({
                      ...prev,
                      max: Number(e.target.value) || 1000,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {groupBy !== "none" && groupedProducts && (
                  <span className="ml-2 text-orange-600">
                    ({Object.keys(groupedProducts).length} groups)
                  </span>
                )}
              </div>
              {groupBy !== "none" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAllGroups}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={collapseAllGroups}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDay("all");
                setGroupBy("none");
                setExpandedGroups(new Set());
                setPriceRange({ min: 0, max: 1000000 });
                setStockRange({ min: 0, max: 1000 });
                setSortField("nama");
                setSortDirection("asc");
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter((p) => (p.stok ?? 0) < 10).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">
                Out of Stock
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter((p) => (p.stok ?? 0) === 0).length}
              </p>
            </div>
            <div className="bg-red-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {groupBy !== "none" && <th className="w-[40px]"></th>}
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[280px]"
                  onClick={() => handleSort("nama")}
                >
                  <div className="flex items-center">
                    Product
                    {getSortIcon("nama")}
                  </div>
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[140px]"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {getSortIcon("category")}
                  </div>
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[180px]"
                  onClick={() => handleSort("day")}
                >
                  <div className="flex items-center">
                    Available Days
                    {getSortIcon("day")}
                  </div>
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[130px]"
                  onClick={() => handleSort("harga")}
                >
                  <div className="flex items-center">
                    Price
                    {getSortIcon("harga")}
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                  <div className="flex items-center">Daily Stock</div>
                </th>
                <th
                  className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-[100px]"
                  onClick={() => handleSort("sales")}
                >
                  <div className="flex items-center">
                    Sales
                    {getSortIcon("sales")}
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupBy === "none"
                ? filteredProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      isGrouped={false}
                      editingStockId={editingStockId}
                      tempStock={tempStock}
                      pendingStockChanges={pendingStockChanges}
                      formatPrice={formatPrice}
                      handleStockInputChange={handleStockInputChange}
                      saveStockEdit={saveStockEdit}
                      cancelStockEdit={cancelStockEdit}
                      handleStockDecrement={handleStockDecrement}
                      handleStockIncrement={handleStockIncrement}
                      confirmStockChange={confirmStockChange}
                      cancelStockChange={cancelStockChange}
                      startEditingStock={startEditingStock}
                      handleViewProduct={handleViewProduct}
                      handleEditProduct={handleEditProduct}
                      handleDeleteProduct={handleDeleteProduct}
                    />
                  ))
                : groupedProducts &&
                  Object.entries(groupedProducts)
                    .filter(([, group]) => !group.parentId)
                    .map(([groupKey, group]) => (
                      <React.Fragment key={groupKey}>
                        <tr
                          className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                          onClick={(e) => toggleGroup(groupKey, e)}
                        >
                          <td colSpan={9} className="px-3 lg:px-6 py-3">
                            <div className="flex items-center">
                              {expandedGroups.has(groupKey) ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                              )}
                              <Tag className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="font-medium text-gray-900">
                                {group.name}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({group.nameEn})
                              </span>
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                {group.products.length} products
                              </span>
                            </div>
                          </td>
                        </tr>
                        {expandedGroups.has(groupKey) &&
                          (groupBy === "jenis_sub_jenis"
                            ? Object.entries(groupedProducts)
                                .filter(
                                  ([, subGroup]) =>
                                    subGroup.parentId === groupKey
                                )
                                .map(([subKey, subGroup]) => (
                                  <React.Fragment key={subKey}>
                                    <tr
                                      className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                                      onClick={(e) => toggleGroup(subKey, e)}
                                    >
                                      <td
                                        colSpan={9}
                                        className="px-3 lg:px-6 py-2 pl-10"
                                      >
                                        <div className="flex items-center">
                                          {expandedGroups.has(subKey) ? (
                                            <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                                          )}
                                          <Layers className="w-4 h-4 mr-2 text-blue-500" />
                                          <span className="font-medium text-gray-700">
                                            {subGroup.name}
                                          </span>
                                          <span className="ml-2 text-sm text-gray-400">
                                            ({subGroup.nameEn})
                                          </span>
                                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {subGroup.products.length} products
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                    {expandedGroups.has(subKey) &&
                                      subGroup.products.map((product) => (
                                        <ProductTableRow
                                          key={product.id}
                                          product={product}
                                          isGrouped={true}
                                          editingStockId={editingStockId}
                                          tempStock={tempStock}
                                          pendingStockChanges={
                                            pendingStockChanges
                                          }
                                          formatPrice={formatPrice}
                                          handleStockInputChange={
                                            handleStockInputChange
                                          }
                                          saveStockEdit={saveStockEdit}
                                          cancelStockEdit={cancelStockEdit}
                                          handleStockDecrement={
                                            handleStockDecrement
                                          }
                                          handleStockIncrement={
                                            handleStockIncrement
                                          }
                                          confirmStockChange={
                                            confirmStockChange
                                          }
                                          cancelStockChange={cancelStockChange}
                                          startEditingStock={startEditingStock}
                                          handleViewProduct={handleViewProduct}
                                          handleEditProduct={handleEditProduct}
                                          handleDeleteProduct={
                                            handleDeleteProduct
                                          }
                                        />
                                      ))}
                                  </React.Fragment>
                                ))
                            : group.products.map((product) => (
                                <ProductTableRow
                                  key={product.id}
                                  product={product}
                                  isGrouped={true}
                                  editingStockId={editingStockId}
                                  tempStock={tempStock}
                                  pendingStockChanges={pendingStockChanges}
                                  formatPrice={formatPrice}
                                  handleStockInputChange={
                                    handleStockInputChange
                                  }
                                  saveStockEdit={saveStockEdit}
                                  cancelStockEdit={cancelStockEdit}
                                  handleStockDecrement={handleStockDecrement}
                                  handleStockIncrement={handleStockIncrement}
                                  confirmStockChange={confirmStockChange}
                                  cancelStockChange={cancelStockChange}
                                  startEditingStock={startEditingStock}
                                  handleViewProduct={handleViewProduct}
                                  handleEditProduct={handleEditProduct}
                                  handleDeleteProduct={handleDeleteProduct}
                                />
                              )))}
                      </React.Fragment>
                    ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onEditProduct={handleUpdateProduct}
        product={selectedProduct}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showProductDetail}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}
