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
import { JenisManager } from "@/components/adminPage/productsPage/JenisManager";
import { ProductDetailModal } from "@/components/adminPage/productsPage/ProductDetailModal";
import { EditProductModal } from "@/components/adminPage/productsPage/EditProductModal";
import { useToast } from "@/components/adminPage/Toast";
import { useJenis } from "@/app/contexts/JenisContext";
import { useSubJenis } from "@/app/contexts/SubJenisContext";
import { useProducts, Product } from "@/app/contexts/ProductsContext";

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
    <tr className={`hover:bg-gray-50 ${isGrouped ? 'bg-white' : ''}`}>
      {isGrouped && <td className="w-[40px]"></td>}
      <td className="px-3 lg:px-6 py-4 w-[280px]">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg mr-3 lg:mr-4 flex-shrink-0 relative">
            {product.gambars && product.gambars.length > 0 ? (
              <>
                <img
                  src={product.gambars[0].file_path}
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
        {editingStockId === product.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempStock}
              onChange={(e) => handleStockInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveStockEdit(product.id);
                } else if (e.key === "Escape") {
                  cancelStockEdit();
                }
              }}
              className="w-20 px-3 py-2 border-2 border-orange-500 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
              autoFocus
              placeholder="0"
            />
            <button
              onClick={() => saveStockEdit(product.id)}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
              title="Save"
            >
              <span className="text-base font-bold">✓</span>
            </button>
            <button
              onClick={cancelStockEdit}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              title="Cancel"
            >
              <span className="text-base font-bold">✕</span>
            </button>
          </div>
        ) : pendingStockChanges[product.id] !== undefined ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStockDecrement(product.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200 hover:border-red-300"
              disabled={pendingStockChanges[product.id] === 0}
              title="Decrease stock"
            >
              <Minus className="w-4 h-4 text-gray-600 hover:text-red-600" />
            </button>
            <div className="min-w-[45px] px-3 py-1.5 rounded-lg text-sm font-semibold bg-orange-100 text-orange-800 border-2 border-orange-400 shadow-md animate-pulse">
              {pendingStockChanges[product.id]}
            </div>
            <button
              onClick={() => handleStockIncrement(product.id)}
              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
              title="Increase stock"
            >
              <Plus className="w-4 h-4 text-gray-600 hover:text-green-600" />
            </button>
            <button
              onClick={() => confirmStockChange(product.id)}
              className="ml-2 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
              title="Confirm and save to database"
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => cancelStockChange(product.id)}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              title="Cancel changes"
            >
              ✕ Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStockDecrement(product.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200 hover:border-red-300"
              disabled={!product.stok || product.stok === 0}
              title="Decrease stock"
            >
              <Minus className="w-4 h-4 text-gray-600 hover:text-red-600" />
            </button>
            <button
              onClick={() => startEditingStock(product.id, product.stok || 0)}
              className={`min-w-[45px] px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                !product.stok || product.stok === 0
                  ? "bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
                  : product.stok < 10
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
              }`}
              title="Click to edit stock"
            >
              {product.stok ?? 0}
            </button>
            <button
              onClick={() => handleStockIncrement(product.id)}
              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
              title="Increase stock"
            >
              <Plus className="w-4 h-4 text-gray-600 hover:text-green-600" />
            </button>
          </div>
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
            onClick={() => handleEditProduct(product.id, product.nama || "Product")}
            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
            title="Edit Product"
          >
            <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id, product.nama || "Product")}
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

// Mock products moved to ProductsContext

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [groupBy, setGroupBy] = useState<"none" | "jenis" | "sub_jenis" | "jenis_sub_jenis">("none");
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
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<string>(""); // Changed to string to preserve user input
  const [pendingStockChanges, setPendingStockChanges] = useState<
    Record<number, number>
  >({}); // Track pending changes
  const { addToast, ToastContainer } = useToast();
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
        // Use nama_en for consistency (English names shown in table)
        const jenisNama = (j.nama_en || j.nama_id || j.nama)?.trim();
        if (jenisNama) jenisSet.add(jenisNama);
      });
    });
    return Array.from(jenisSet).sort();
  }, [products]);

  // Extract unique days from backend products
  const uniqueDays = React.useMemo(() => {
    // Define day order (Monday to Sunday)
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
        // Use nama_en for consistency (English names shown in table)
        const dayNama = h.nama_en || h.nama_id || h.nama;
        if (dayNama) daysSet.add(dayNama);
      });
    });

    // Sort days according to week order instead of alphabetically
    return Array.from(daysSet).sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      // If day not found in dayOrder, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [products]);

  // Combine 'all' with actual jenis from backend
  const categoryOptions = ["all", ...uniqueJenis];
  const dayOptions = ["all", ...uniqueDays];

  // Sort and filter products
  const filteredProducts = products
    .filter((product) => {
      // Add safety checks for undefined values
      if (!product || !product.nama) return false;

      // Search filter
      const matchesSearch = product.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Category filter - check all jenis for match using nama_en field
      const matchesCategory =
        selectedCategory === "all" ||
        product.jenis?.some((j) => {
          const jenisNama = (j.nama_en || j.nama_id || j.nama)?.trim();
          return jenisNama === selectedCategory;
        }) ||
        false;

      // Day filter - check all hari for match using nama_en field
      const matchesDay =
        selectedDay === "all" ||
        product.hari?.some((h) => {
          const dayNama = h.nama_en || h.nama_id || h.nama;
          return dayNama === selectedDay;
        }) ||
        false;

      // Price range filter
      const matchesPrice =
        product.harga >= priceRange.min && product.harga <= priceRange.max;

      // Stock range filter
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
          // Use day order for proper week sorting
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

  // Group products by Jenis, Sub Jenis, or Both (hierarchical)
  const groupedProducts = React.useMemo(() => {
    if (groupBy === "none") {
      return null;
    }

    const groups: Record<string, { 
      name: string; 
      nameEn: string; 
      products: Product[]; 
      type: 'jenis' | 'sub_jenis';
      parentId?: string;
    }> = {};

    if (groupBy === "jenis") {
      // Group by Jenis only
      filteredProducts.forEach((product) => {
        const jenis = product.jenis?.[0];
        const key = `jenis_${jenis?.id?.toString() || "uncategorized"}`;
        const name = jenis?.nama_id || "Tanpa Kategori";
        const nameEn = jenis?.nama_en || "Uncategorized";

        if (!groups[key]) {
          groups[key] = { name, nameEn, products: [], type: 'jenis' };
        }
        groups[key].products.push(product);
      });
    } else if (groupBy === "sub_jenis") {
      // Group by Sub Jenis only
      filteredProducts.forEach((product) => {
        const subJenis = product.sub_jenis?.[0];
        const key = `sub_${subJenis?.id?.toString() || "uncategorized"}`;
        const name = subJenis?.nama_id || "Tanpa Sub Kategori";
        const nameEn = subJenis?.nama_en || "Uncategorized";

        if (!groups[key]) {
          groups[key] = { name, nameEn, products: [], type: 'sub_jenis' };
        }
        groups[key].products.push(product);
      });
    } else if (groupBy === "jenis_sub_jenis") {
      // Group by Jenis first, then Sub Jenis (hierarchical)
      filteredProducts.forEach((product) => {
        const jenis = product.jenis?.[0];
        const subJenis = product.sub_jenis?.[0];
        
        const jenisKey = `jenis_${jenis?.id?.toString() || "uncategorized"}`;
        const jenisName = jenis?.nama_id || "Tanpa Kategori";
        const jenisNameEn = jenis?.nama_en || "Uncategorized";
        
        // Create jenis group if not exists
        if (!groups[jenisKey]) {
          groups[jenisKey] = { 
            name: jenisName, 
            nameEn: jenisNameEn, 
            products: [], 
            type: 'jenis' 
          };
        }
        
        // Create sub_jenis group under jenis
        const subKey = `${jenisKey}_sub_${subJenis?.id?.toString() || "uncategorized"}`;
        const subName = subJenis?.nama_id || "Tanpa Sub Kategori";
        const subNameEn = subJenis?.nama_en || "Uncategorized";
        
        if (!groups[subKey]) {
          groups[subKey] = { 
            name: subName, 
            nameEn: subNameEn, 
            products: [], 
            type: 'sub_jenis',
            parentId: jenisKey
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

  // Expand all groups
  const expandAllGroups = React.useCallback(() => {
    if (groupedProducts) {
      const allKeys = new Set<string>();
      Object.entries(groupedProducts).forEach(([key, group]) => {
        allKeys.add(key);
        // Also add parent keys for hierarchical mode
        if (group.parentId) {
          allKeys.add(group.parentId);
        }
      });
      setExpandedGroups(allKeys);
    }
  }, [groupedProducts]);

  // Collapse all groups
  const collapseAllGroups = React.useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  // Get all group keys (for dependency tracking)
  const groupKeys = React.useMemo(() => {
    if (!groupedProducts) return '';
    return Object.keys(groupedProducts).sort().join(',');
  }, [groupedProducts]);

  // Auto-expand all groups when groupBy changes or groups change
  React.useEffect(() => {
    if (groupBy !== "none" && groupedProducts) {
      const allKeys = new Set<string>();
      Object.entries(groupedProducts).forEach(([key, group]) => {
        allKeys.add(key);
        // Also add parent keys for hierarchical mode
        if (group.parentId) {
          allKeys.add(group.parentId);
        }
      });
      setExpandedGroups(allKeys);
    } else {
      setExpandedGroups(new Set());
    }
  }, [groupBy, groupKeys]);

  // Toggle sort
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

  // Get sort icon
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
      console.log(
        "Incrementing stock for product:",
        productId,
        "from",
        currentPending,
        "to",
        newStok
      );
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
        console.log(
          "Decrementing stock for product:",
          productId,
          "from",
          currentPending,
          "to",
          newStok
        );
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
      console.log(
        "Confirming stock change for product:",
        productId,
        "New stock:",
        newStok
      );
      await updateProduct(productId, { stok: newStok });

      // Remove from pending changes
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
      console.error("Error confirming stock change:", error);
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
    setTempStock(currentStock.toString()); // Convert to string
  };

  const handleStockInputChange = (value: string) => {
    // Allow only numbers, remove leading zeros except for "0"
    const cleanedValue = value.replace(/[^0-9]/g, "");
    setTempStock(cleanedValue);
  };

  const saveStockEdit = async (productId: number) => {
    try {
      const stockValue = parseInt(tempStock) || 0;
      console.log(
        "Saving stock edit for product:",
        productId,
        "New stock:",
        stockValue
      );
      await updateProduct(productId, { stok: stockValue });
      setEditingStockId(null);
      setTempStock("");
      addToast({
        type: "success",
        title: "Stock updated successfully!",
        message: `Stock has been updated to ${stockValue}.`,
      });
    } catch (error) {
      console.error("Error in saveStockEdit:", error);
      // Don't reset editingStockId so user can try again
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
      <ToastContainer />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Manage your bakery products and inventory
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx, .xls"
        />
      </div>

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
                  onChange={(e) => setGroupBy(e.target.value as "none" | "jenis" | "sub_jenis" | "jenis_sub_jenis")}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  <option value="none">Group By ....</option>
                  <option value="jenis">Group by Jenis</option>
                  <option value="sub_jenis">Group by Sub Jenis</option>
                  <option value="jenis_sub_jenis">Group by Jenis & Sub Jenis</option>
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
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Categories</span>
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
                {products.filter((p) => p.stok < 10).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">
                Out of Stock
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter((p) => p.stok === 0).length}
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
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200 w-full">
            <thead className="bg-gray-50">
              <tr>
                {groupBy !== "none" && (
                  <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap w-[40px]">
                    {/* Expand/Collapse column */}
                  </th>
                )}
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[280px]">
                  <button
                    onClick={() => handleSort("nama")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Product</span>
                    {getSortIcon("nama")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[140px]">
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Category</span>
                    {getSortIcon("category")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[180px]">
                  <button
                    onClick={() => handleSort("day")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Available Days</span>
                    {getSortIcon("day")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[130px]">
                  <button
                    onClick={() => handleSort("harga")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Price</span>
                    {getSortIcon("harga")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[180px]">
                  <button
                    onClick={() => handleSort("stok")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Order Limit</span>
                    {getSortIcon("stok")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[100px]">
                  <button
                    onClick={() => handleSort("sales")}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Sales</span>
                    {getSortIcon("sales")}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Grouped View */}
              {groupBy !== "none" && groupedProducts ? (
                (() => {
                  // Sort groups: jenis groups first (without parentId), then sub_jenis groups (with parentId) after their parent
                  const sortedEntries = Object.entries(groupedProducts).sort((a, b) => {
                    const [keyA, groupA] = a;
                    const [keyB, groupB] = b;
                    
                    // If both are jenis (no parentId), sort alphabetically
                    if (!groupA.parentId && !groupB.parentId) {
                      return groupA.name.localeCompare(groupB.name);
                    }
                    // If A is jenis and B is sub_jenis
                    if (!groupA.parentId && groupB.parentId) {
                      // If B's parent is A, B comes after A
                      if (groupB.parentId === keyA) return -1;
                      // Otherwise compare by parent
                      return keyA.localeCompare(groupB.parentId);
                    }
                    // If A is sub_jenis and B is jenis
                    if (groupA.parentId && !groupB.parentId) {
                      // If A's parent is B, A comes after B
                      if (groupA.parentId === keyB) return 1;
                      // Otherwise compare by parent
                      return groupA.parentId.localeCompare(keyB);
                    }
                    // Both are sub_jenis
                    if (groupA.parentId === groupB.parentId) {
                      return groupA.name.localeCompare(groupB.name);
                    }
                    return groupA.parentId!.localeCompare(groupB.parentId!);
                  });

                  return sortedEntries.map(([groupKey, group]) => {
                    // Skip jenis-only groups in jenis_sub_jenis mode (they're just parents)
                    if (groupBy === "jenis_sub_jenis" && group.type === "jenis" && group.products.length === 0) {
                      return null;
                    }

                    const isSubGroup = group.type === "sub_jenis" && group.parentId;
                    const parentGroup = isSubGroup ? groupedProducts[group.parentId!] : null;

                    return (
                      <React.Fragment key={groupKey}>
                        {/* Show parent header for first sub_jenis of each jenis */}
                        {groupBy === "jenis_sub_jenis" && isSubGroup && parentGroup && (
                          (() => {
                            // Check if this is the first sub_jenis for this parent
                            const siblingKeys = sortedEntries
                              .filter(([, g]) => g.parentId === group.parentId)
                              .map(([k]) => k);
                            const isFirstSibling = siblingKeys[0] === groupKey;
                            
                            if (isFirstSibling) {
                              return (
                                <tr 
                                  key={`parent-${group.parentId}`}
                                  className="bg-gradient-to-r from-orange-100 to-amber-100 cursor-pointer transition-colors"
                                  onClick={(e) => toggleGroup(group.parentId!, e)}
                                >
                                  <td colSpan={8} className="px-3 lg:px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <button 
                                        className="p-1 hover:bg-orange-200 rounded transition-colors"
                                        onClick={(e) => toggleGroup(group.parentId!, e)}
                                      >
                                        {expandedGroups.has(group.parentId!) ? (
                                          <ChevronDown className="w-5 h-5 text-orange-700" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-orange-700" />
                                        )}
                                      </button>
                                      <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-orange-700" />
                                        <span className="font-bold text-gray-900">
                                          {parentGroup.name}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          ({parentGroup.nameEn})
                                        </span>
                                      </div>
                                      <span className="ml-auto px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-300">
                                        {siblingKeys.reduce((total, key) => total + (groupedProducts[key]?.products.length || 0), 0)} produk
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        {/* Sub-group header (only show if parent is expanded in jenis_sub_jenis mode) */}
                        {groupBy === "jenis_sub_jenis" && isSubGroup ? (
                          expandedGroups.has(group.parentId!) && (
                            <>
                              <tr 
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-colors"
                                onClick={(e) => toggleGroup(groupKey, e)}
                              >
                                <td colSpan={8} className="px-3 lg:px-4 py-2.5 pl-10">
                                  <div className="flex items-center gap-3">
                                    <button 
                                      className="p-1 hover:bg-blue-200 rounded transition-colors"
                                      onClick={(e) => toggleGroup(groupKey, e)}
                                    >
                                      {expandedGroups.has(groupKey) ? (
                                        <ChevronDown className="w-4 h-4 text-blue-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-blue-600" />
                                      )}
                                    </button>
                                    <div className="flex items-center gap-2">
                                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                                      <span className="font-medium text-gray-700 text-sm">
                                        {group.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({group.nameEn})
                                      </span>
                                    </div>
                                    <span className="ml-auto px-2 py-0.5 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                                      {group.products.length} produk
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {/* Products in sub-group */}
                              {expandedGroups.has(groupKey) && group.products.map((product) => (
                                <ProductTableRow
                                  key={product.id}
                                  product={product}
                                  isGrouped={true}
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
                              ))}
                            </>
                          )
                        ) : (
                          /* Simple group header for jenis-only or sub_jenis-only mode */
                          <>
                            <tr 
                              className={`cursor-pointer transition-colors ${
                                group.type === 'jenis' 
                                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100' 
                                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                              }`}
                              onClick={(e) => toggleGroup(groupKey, e)}
                            >
                              <td colSpan={8} className="px-3 lg:px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <button 
                                    className={`p-1 rounded transition-colors ${
                                      group.type === 'jenis' ? 'hover:bg-orange-200' : 'hover:bg-blue-200'
                                    }`}
                                    onClick={(e) => toggleGroup(groupKey, e)}
                                  >
                                    {expandedGroups.has(groupKey) ? (
                                      <ChevronDown className={`w-5 h-5 ${group.type === 'jenis' ? 'text-orange-600' : 'text-blue-600'}`} />
                                    ) : (
                                      <ChevronRight className={`w-5 h-5 ${group.type === 'jenis' ? 'text-orange-600' : 'text-blue-600'}`} />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-2">
                                    {group.type === "jenis" ? (
                                      <Tag className="w-4 h-4 text-orange-600" />
                                    ) : (
                                      <Layers className="w-4 h-4 text-blue-600" />
                                    )}
                                    <span className="font-semibold text-gray-800">
                                      {group.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({group.nameEn})
                                    </span>
                                  </div>
                                  <span className="ml-auto px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                                    {group.products.length} produk
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Group Products */}
                            {expandedGroups.has(groupKey) && group.products.map((product) => (
                              <ProductTableRow
                                key={product.id}
                                product={product}
                                isGrouped={true}
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
                            ))}
                          </>
                        )}
                      </React.Fragment>
                    );
                  });
                })()
              ) : (
                /* Non-grouped View */
                filteredProducts.map((product) => (
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
              )}
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

      {/* Jenis/Category Manager Modal */}
      <JenisManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
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
