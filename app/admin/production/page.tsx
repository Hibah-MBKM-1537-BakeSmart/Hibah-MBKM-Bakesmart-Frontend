"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Printer,
  Check,
  X,
  Eye,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
  Edit,
  Save,
  Lock,
  Package,
  ShoppingBag,
  AlertCircle,
  Wallet,
  PackageCheck,
  Calendar,
  ClipboardList,
  ChefHat,
  Star,
  Flame,
  Search,
  Hourglass,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Addon {
  addon_id: number;
  nama: string;
  harga: number;
  quantity?: number;
}

interface OrderProduct {
  id: number;
  product: {
    id: number;
    nama: string;
    gambar?: string;
  };
  jumlah: number;
  harga_beli: number;
  note?: string;
  addons?: Addon[];
}

interface Order {
  id: number;
  user: {
    id: number;
    nama: string;
    no_hp: string;
  };
  order_products: OrderProduct[];
  status: string;
  created_at: string;
  scheduled_date?: string;
  notes?: string;
  production_status?: "pending" | "in_production" | "completed";
}

interface ProductionData {
  success: boolean;
  data: Order[];
  summary: {
    totalOrders: number;
    totalItems: number;
    totalAddons: number;
  };
}

// Backend API response interfaces
interface BackendOrderProduct {
  product_id: number;
  product_name_id: string;
  product_name_en?: string;
  product_price: number;
  jumlah: number;
  harga_beli: number;
  note?: string;
}

interface BackendOrder {
  id: number;
  user_id: number;
  user?: {
    id: number;
    nama: string;
    no_hp: string;
  };
  total_harga: number;
  status: string;
  production_status?: "pending" | "in_production" | "completed";
  products: BackendOrderProduct[];
  created_at?: string;
  notes?: string;
}

interface OrderGroup {
  id: number;
  tanggal: string;
  orders: BackendOrder[];
}

// Transform backend data to frontend Order format
const transformBackendData = (groups: OrderGroup[]): Order[] => {
  const allOrders: Order[] = [];

  groups.forEach((group) => {
    group.orders.forEach((order) => {
      allOrders.push({
        id: order.id,
        user: {
          id: order.user?.id || order.user_id,
          nama: order.user?.nama || "Unknown",
          no_hp: order.user?.no_hp || "-",
        },
        order_products: order.products.map((p) => ({
          id: p.product_id,
          product: {
            id: p.product_id,
            nama: p.product_name_id,
          },
          jumlah: p.jumlah,
          harga_beli: p.harga_beli,
          note: p.note || "",
          addons: [],
        })),
        status: order.status,
        created_at: order.created_at || group.tanggal,
        scheduled_date: group.tanggal,
        notes: order.notes || "",
        production_status: order.production_status || "pending",
      });
    });
  });

  return allOrders;
};



function ProductionItemRow({
  item,
  orderNote,
}: {
  item: OrderProduct;
  orderNote?: string;
}) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{item.product.nama}</h4>
          <p className="text-sm text-gray-600 mt-1">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {item.jumlah} unit
            </span>
          </p>
          {item.note && (
            <p className="text-sm text-orange-600 mt-2 font-medium">
              📝 {item.note}
            </p>
          )}
          {orderNote && (
            <p className="text-sm text-purple-600 mt-2">💬 {orderNote}</p>
          )}
        </div>
      </div>

      {/* Addons Section */}
      {item.addons && item.addons.length > 0 && (
        <div className="mt-4 bg-amber-50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-amber-900 mb-3">
            🎁 Addons:
          </h5>
          <div className="grid grid-cols-1 gap-3">
            {item.addons.map((addon) => (
              <div
                key={addon.addon_id}
                className="flex items-center justify-between bg-white p-3 rounded border border-amber-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {addon.nama}
                  </p>
                  <p className="text-xs text-gray-600">
                    Rp {addon.harga.toLocaleString("id-ID")} / unit
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-700">
                    x{addon.quantity || 0}
                  </p>
                  <p className="text-xs text-gray-600">
                    Rp{" "}
                    {((addon.quantity || 0) * addon.harga).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductionOrderCard({
  order,
  onPrint,
  onMarkComplete,
}: {
  order: Order;
  onPrint: (order: Order) => void;
  onMarkComplete: (orderId: number) => void;
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(order.notes || "");

  const totalItems = order.order_products.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );

  const totalAmount = order.order_products.reduce((sum, item) => {
    const baseTotal = item.jumlah * item.harga_beli;
    const addonTotal =
      item.addons?.reduce(
        (addSum, addon) => addSum + (addon.quantity || 0) * addon.harga,
        0
      ) || 0;
    return sum + baseTotal + addonTotal;
  }, 0);

  const statusColors = {
    pending: "bg-yellow-50 border-yellow-300",
    in_production: "bg-blue-50 border-blue-300",
    completed: "bg-green-50 border-green-300",
  };

  const statusLabels = {
    pending: "Menunggu",
    in_production: "Produksi",
    completed: "Selesai",
  };

  const statusBadgeColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_production: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 ${statusColors[order.production_status || "pending"] ||
        "bg-gray-50 border-gray-300"
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-base text-gray-900">#{order.id}</h3>
          <p className="text-xs text-gray-600">{order.user.nama}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${statusBadgeColors[order.production_status || "pending"]
            }`}
        >
          {statusLabels[order.production_status || "pending"]}
        </span>
      </div>

      {/* Contact Info */}
      <div className="text-xs text-gray-600 mb-3 space-y-1">
        <p>📞 {order.user.no_hp}</p>
        <p>📦 {totalItems} items</p>
      </div>

      {/* Products List */}
      <div className="bg-white rounded p-3 border border-gray-200 mb-3 text-sm space-y-1">
        <p className="font-semibold text-gray-900 mb-2">Produk:</p>
        {order.order_products.map((item) => (
          <div key={item.id}>
            <p className="text-gray-900">
              {item.product.nama}{" "}
              <span className="text-blue-600 font-bold">x{item.jumlah}</span>
            </p>
            {item.note && (
              <p className="text-xs text-gray-600">📝 {item.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Notes Section */}
      {order.notes && (
        <div className="bg-purple-50 border border-purple-300 rounded p-3 mb-3 text-xs">
          <p className="font-semibold text-purple-900">📌 Catatan:</p>
          <p className="text-gray-700 mt-1">{order.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="text-xs text-gray-600 mb-4 space-y-1">
        <p>Dibuat: {new Date(order.created_at).toLocaleDateString("id-ID")}</p>
        <p>
          Jadwal:{" "}
          {new Date(order.scheduled_date || new Date()).toLocaleDateString(
            "id-ID"
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onPrint(order)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
        >
          👁️ View
        </button>
        {order.production_status !== "completed" && (
          <button
            onClick={() => onMarkComplete(order.id)}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
          >
            ✓ Selesai
          </button>
        )}
        {order.production_status === "completed" && (
          <button
            disabled
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-600 rounded text-xs font-medium cursor-not-allowed"
          >
            ✓ Selesai
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProductionPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  // Multi-select dates for Order tab (using Set for easy toggle)
  const [selectedOrderDates, setSelectedOrderDates] = useState<Set<string>>(new Set());
  // Multi-select dates for Production tab
  const [selectedProductionDates, setSelectedProductionDates] = useState<Set<string>>(new Set());
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productionTargets, setProductionTargets] = useState<
    Record<string, string>
  >({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "production">("orders");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "verifying"
  );
  const [productionStatusFilter, setProductionStatusFilter] = useState<
    "all" | "pending" | "in_production" | "completed"
  >("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "verifying" | "pending" | "paid" | "completed"
  >("all");
  const [showAllDates, setShowAllDates] = useState(true); // Default to show all dates for orders tab
  const [showAllProductionDates, setShowAllProductionDates] = useState(true); // Default to show all dates for production tab
  // Sorting state for orders table
  const [orderSortField, setOrderSortField] = useState<'id' | 'pelanggan' | 'status' | 'qty' | 'tanggal' | 'total'>('id');
  const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchProductionList();
  }, []);  // Remove dateRange dependency to always fetch all data

  const fetchProductionList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch order groups from backend API
      const response = await fetch('/api/orders/group');
      const result = await response.json();

      console.log('[Production] API Response:', result);

      // Backend returns { message: "Order retrieved", data: [...] } without status field
      // Check if we have data array (success case)
      if (Array.isArray(result.data)) {
        // Transform backend data to frontend Order format
        const transformedOrders = transformBackendData(result.data);
        console.log('[Production] Transformed orders:', transformedOrders.length);
        setAllOrders(transformedOrders);
        
        // Set orders to all paid/completed orders for production tracking
        // Production shows orders that are paid (ready for production) or completed
        const productionOrders = transformedOrders.filter((order: Order) => 
          order.status === "paid" || order.status === "completed"
        );
        console.log('[Production] Orders for production:', productionOrders.length);
        setOrders(productionOrders);
      } else if (result.status === 'error') {
        console.error('[Production] API error:', result.message);
        setError(result.message || 'Gagal memuat data dari server');
        setAllOrders([]);
        setOrders([]);
      } else {
        console.error('[Production] Unexpected response format:', result);
        setError('Format response tidak sesuai');
        setAllOrders([]);
        setOrders([]);
      }
    } catch (err) {
      console.error('[Production] Fetch error:', err);
      setError('Gagal memuat data. Pastikan backend server berjalan.');
      setAllOrders([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  // Compute filtered production orders based on selected dates
  const filteredProductionOrders = orders.filter((order: Order) => {
    if (showAllProductionDates || selectedProductionDates.size === 0) return true;
    const orderDate = order.scheduled_date
      ? order.scheduled_date.split("T")[0]
      : null;
    return orderDate && selectedProductionDates.has(orderDate);
  });

  const totalProducts = filteredProductionOrders.reduce(
    (sum, order) => sum + order.order_products.length,
    0
  );

  const totalAddons = filteredProductionOrders.reduce((sum, order) => {
    return (
      sum +
      order.order_products.reduce((itemSum, item) => {
        return (
          itemSum +
          (item.addons?.reduce(
            (addonSum, addon) => addonSum + (addon.quantity || 0),
            0
          ) || 0)
        );
      }, 0)
    );
  }, 0);

  const handlePrint = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalItems = order.order_products.reduce(
      (sum, p) => sum + p.jumlah,
      0
    );

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt #${order.id}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
            font-family: 'Courier New', monospace; 
            width: 78mm; 
            margin: 0 auto; 
            padding: 10px 5px; 
            font-size: 12px; 
            line-height: 1.4;
            color: #000;
          }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 12px; }
          .info { margin-bottom: 10px; font-size: 11px; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .item { margin-bottom: 8px; }
          .item-name { font-weight: bold; margin-bottom: 2px; }
          .item-details { display: flex; justify-content: space-between; font-size: 11px; }
          .addon { margin-left: 10px; font-size: 10px; font-style: italic; color: #444; }
          .total-section { margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; }
          .row { display: flex; justify-content: space-between; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          .feedback-link { margin-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BAKESMART</div>
          <div class="subtitle">Jl. Raya Bakesmart No. 123</div>
          <div class="subtitle">0812-3456-7890</div>
        </div>
        
        <div class="info">
          <div style="display: flex; justify-content: space-between;">
            <span>${new Date(order.created_at).toLocaleDateString(
      "id-ID"
    )}</span>
            <span>Admin</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>${new Date(order.created_at).toLocaleTimeString(
      "id-ID"
    )}</span>
            <span>${order.user.nama.substring(0, 15)}</span>
          </div>
          <div>No. #${order.id}</div>
        </div>

        <div class="divider"></div>

        <div class="items">
          ${order.order_products
        .map((item) => {
          const itemTotal = item.jumlah * item.harga_beli;
          const addonsTotal =
            item.addons?.reduce(
              (sum, addon) => sum + (addon.quantity || 0) * addon.harga,
              0
            ) || 0;
          const total = itemTotal + addonsTotal;

          return `
            <div class="item">
              <div class="item-name">${item.product.nama}</div>
              <div class="item-details">
                <span>${item.jumlah} x ${item.harga_beli.toLocaleString(
            "id-ID"
          )}</span>
                <span>Rp ${itemTotal.toLocaleString("id-ID")}</span>
              </div>
              ${item.addons && item.addons.length > 0
              ? item.addons
                .map(
                  (addon) => `
                  <div class="item-details addon">
                    <span>+ ${addon.nama} (${addon.quantity || 0}x)</span>
                    <span>Rp ${(
                      (addon.quantity || 0) * addon.harga
                    ).toLocaleString("id-ID")}</span>
                  </div>
                `
                )
                .join("")
              : ""
            }
            </div>
          `;
        })
        .join("")}
        </div>

        <div class="total-section">
          <div class="row">
            <span>Total</span>
            <span>Rp ${order.order_products
        .reduce((sum, item) => {
          const itemTotal = item.jumlah * item.harga_beli;
          const addonsTotal =
            item.addons?.reduce(
              (s, a) => s + (a.quantity || 0) * a.harga,
              0
            ) || 0;
          return sum + itemTotal + addonsTotal;
        }, 0)
        .toLocaleString("id-ID")}</span>
          </div>
          <div class="row">
            <span>Bayar (Cash)</span>
            <span>Rp ${order.order_products
        .reduce((sum, item) => {
          const itemTotal = item.jumlah * item.harga_beli;
          const addonsTotal =
            item.addons?.reduce(
              (s, a) => s + (a.quantity || 0) * a.harga,
              0
            ) || 0;
          return sum + itemTotal + addonsTotal;
        }, 0)
        .toLocaleString("id-ID")}</span>
          </div>
          <div class="row">
            <span>Kembali</span>
            <span>Rp 0</span>
          </div>
        </div>

        <div class="footer">

        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Group products by name and sum quantities
    const productMap: Record<
      string,
      {
        totalQty: number;
        withoutAddons: number;
        addons: Record<string, number>;
      }
    > = {};

    filteredProductionOrders.forEach((order) =>
      order.order_products.forEach((item) => {
        const productName = item.product.nama;
        if (!productMap[productName]) {
          productMap[productName] = {
            totalQty: 0,
            withoutAddons: 0,
            addons: {},
          };
        }
        productMap[productName].totalQty += item.jumlah;

        // Check if item has addons
        const hasAddons = item.addons && item.addons.length > 0;
        if (!hasAddons) {
          productMap[productName].withoutAddons += item.jumlah;
        }

        // Aggregate addons by name
        (item.addons || []).forEach((addon) => {
          if (!productMap[productName].addons[addon.nama]) {
            productMap[productName].addons[addon.nama] = 0;
          }
          productMap[productName].addons[addon.nama] += addon.quantity || 0;
        });
      })
    );

    // Convert to array format for rendering
    const allRows = Object.entries(productMap).map(([productName, data]) => ({
      product: productName,
      totalQty: data.totalQty,
      withoutAddons: data.withoutAddons,
      addons: Object.entries(data.addons).map(([addonName, qty]) => ({
        nama: addonName,
        quantity: qty,
      })),
    }));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Produksi ${selectedDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 10px; color: #000; background: #fff; }
          .header { margin-bottom: 15px; text-align: center; }
          .header h2 { font-size: 16px; margin-bottom: 5px; }
          .header p { font-size: 12px; color: #666; }
          .notes { background: #f5f5f5; padding: 10px; margin-bottom: 15px; border-left: 3px solid #333; font-size: 12px; }
          .notes-title { font-weight: bold; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th { 
            background: #333; 
            color: #fff; 
            padding: 8px; 
            text-align: left; 
            font-weight: bold;
            font-size: 12px;
            border: 1px solid #000;
          }
          td { 
            padding: 8px; 
            border: 1px solid #000;
            font-size: 12px;
            vertical-align: top;
          }
          .product-col { font-weight: bold; width: 35%; }
          .addon-col { width: 35%; }
          .qty-col { text-align: center; width: 15%; }
          .target-col { text-align: center; width: 15%; background: #fffacd; font-weight: bold; }
          .addon-item { font-size: 11px; color: #555; margin: 3px 0; }
          tr.addon-row { background: #f9f9f9; }
          @media print { 
            body { margin: 0; padding: 5px; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>DAFTAR PRODUKSI</h2>
          <p>Tanggal: ${showAllProductionDates || selectedProductionDates.size === 0 
            ? 'Semua Tanggal' 
            : Array.from(selectedProductionDates).sort().map(d => format(new Date(d), "dd MMM", { locale: idLocale })).join(", ")
          }</p>
          <p>Total ${filteredProductionOrders.length} Pesanan</p>
        </div>

        ${generalNotes
        ? `<div class="notes"><div class="notes-title">📌 CATATAN UMUM:</div>${generalNotes
          .split("\\n")
          .join("<br>")}</div>`
        : ""
      }

        <table>
          <thead>
            <tr>
              <th class="product-col">PRODUK</th>
              <th class="addon-col">ADDON</th>
              <th class="qty-col">QUANTITY</th>
              <th class="qty-col">TOTAL</th>
              <th class="target-col">TARGET</th>
            </tr>
          </thead>
          <tbody>
            ${allRows
        .map((row) => {
          const targetKey = row.product;
          const target = productionTargets[targetKey] || row.totalQty;

          // Count breakdown items: items without addons + number of different addons
          const breakdownItems: Array<{ label: string; qty: number }> =
            [];
          if (row.withoutAddons > 0) {
            breakdownItems.push({
              label: "(tanpa addon)",
              qty: row.withoutAddons,
            });
          }
          row.addons.forEach((addon) => {
            breakdownItems.push({
              label: addon.nama,
              qty: addon.quantity,
            });
          });

          // If no breakdown items, just show product row
          if (breakdownItems.length === 0) {
            return `
                  <tr>
                    <td class="product-col"><strong>${row.product}</strong></td>
                    <td class="addon-col">-</td>
                    <td class="qty-col">-</td>
                    <td class="qty-col">${row.totalQty}</td>
                    <td class="target-col">${target}</td>
                  </tr>
                `;
          }

          // If has breakdown items, show product with first breakdown item, then remaining items
          return `
                <tr>
                  <td class="product-col" rowspan="${breakdownItems.length
            }"><strong>${row.product}</strong></td>
                  <td class="addon-col"><span class="addon-item">└─ ${breakdownItems[0].label
            }</span></td>
                  <td class="qty-col">${breakdownItems[0].qty}</td>
                  <td class="qty-col" rowspan="${breakdownItems.length
            }"><strong>${row.totalQty}</strong></td>
                  <td class="target-col" rowspan="${breakdownItems.length
            }"><strong>${target}</strong></td>
                </tr>
                ${breakdownItems
              .slice(1)
              .map(
                (item) => `
                  <tr class="addon-row">
                    <td class="addon-col"><span class="addon-item">└─ ${item.label}</span></td>
                    <td class="qty-col">${item.qty}</td>
                  </tr>
                `
              )
              .join("")}
              `;
        })
        .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleMarkComplete = async (orderId: number) => {
    try {
      // Optimistic update - update local state first
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, production_status: "completed" as const }
            : order
        )
      );
      setAllOrders(
        allOrders.map((order) =>
          order.id === orderId
            ? { ...order, production_status: "completed" as const }
            : order
        )
      );

      // Call backend API to update production status
      const response = await fetch(`/api/orders/${orderId}/production`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ production_status: "completed" }),
      });

      if (!response.ok) {
        console.error("[Production] Failed to update production status");
        // Optionally revert or show error
      }
    } catch (err) {
      console.error("[Production] Error updating production status:", err);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    try {
      // Optimistic update
      setAllOrders(
        allOrders.map((o) =>
          o.id === orderId ? { ...o, status: "pending" as const } : o
        )
      );

      // Call backend API to update order status
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "pending" }),
      });

      if (!response.ok) {
        console.error("[Production] Failed to approve order");
      }
    } catch (err) {
      console.error("[Production] Error approving order:", err);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      // Optimistic update
      setAllOrders(allOrders.filter((o) => o.id !== orderId));

      // Call backend API to delete order
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("[Production] Failed to reject/delete order");
        // Optionally refetch data on error
      }
    } catch (err) {
      console.error("[Production] Error rejecting order:", err);
    }
  };

  const handleVerifyPayment = async (orderId: number) => {
    try {
      // Optimistic update
      setAllOrders(
        allOrders.map((o) =>
          o.id === orderId ? { ...o, status: "paid" as const } : o
        )
      );

      // Call backend API to update order status to paid
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        console.error("[Production] Failed to verify payment");
      }
    } catch (err) {
      console.error("[Production] Error verifying payment:", err);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      // Optimistic update
      setAllOrders(
        allOrders.map((o) =>
          o.id === orderId ? { ...o, status: "completed" as const } : o
        )
      );

      // Call backend API to update order status to completed
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        console.error("[Production] Failed to complete order");
      }
    } catch (err) {
      console.error("[Production] Error completing order:", err);
    }
  };

  // Handle date toggle for Orders tab (click to add/remove date)
  const handleOrderDateClick = (dateStr: string) => {
    setShowAllDates(false);
    setSelectedOrderDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
        // If no dates selected, show all
        if (newSet.size === 0) {
          setShowAllDates(true);
        }
      } else {
        // Max 7 dates
        if (newSet.size >= 7) {
          return prev; // Don't add more
        }
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  // Handle date toggle for Production tab
  const handleProductionDateClick = (dateStr: string) => {
    setShowAllProductionDates(false);
    setSelectedProductionDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
        // If no dates selected, show all
        if (newSet.size === 0) {
          setShowAllProductionDates(true);
        }
      } else {
        // Max 7 dates
        if (newSet.size >= 7) {
          return prev; // Don't add more
        }
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  // Helper function to check if order date matches selected dates
  const isOrderDateSelected = (orderDate: string | null): boolean => {
    if (showAllDates || selectedOrderDates.size === 0) return true;
    return orderDate ? selectedOrderDates.has(orderDate) : false;
  };

  const groupedOrders = {
    verifying: allOrders.filter((o) => {
      const orderDate = o.scheduled_date ? o.scheduled_date.split("T")[0] : null;
      return isOrderDateSelected(orderDate) && o.status === "verifying";
    }),
    pending: allOrders.filter((o) => {
      const orderDate = o.scheduled_date ? o.scheduled_date.split("T")[0] : null;
      return isOrderDateSelected(orderDate) && o.status === "pending";
    }),
    paid: allOrders.filter((o) => {
      const orderDate = o.scheduled_date ? o.scheduled_date.split("T")[0] : null;
      return isOrderDateSelected(orderDate) && o.status === "paid";
    }),
    completed: allOrders.filter((o) => {
      const orderDate = o.scheduled_date ? o.scheduled_date.split("T")[0] : null;
      return isOrderDateSelected(orderDate) && o.status === "completed";
    }),
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" /> Manajemen Order & Produksi
        </h1>
      </div>

      {/* Tab Navigation - Compact */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "orders"
            ? "border-b-2 border-[#9B6D49] text-[#9B6D49] -mb-px"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <ClipboardList size={16} /> Kelola Order
        </button>
        <button
          onClick={() => setActiveTab("production")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "production"
            ? "border-b-2 border-[#9B6D49] text-[#9B6D49] -mb-px"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <ChefHat size={16} /> Daftar Produksi
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {/* 7-Day Calendar View - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Filter
                {selectedOrderDates.size > 0 && !showAllDates && (
                  <span className="text-[10px] text-gray-500 font-normal ml-2">
                    ({selectedOrderDates.size}/7 tanggal dipilih)
                  </span>
                )}
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 7 }).map((_, i) => {
                  const currentDate = new Date(
                    new Date().getTime() + i * 24 * 60 * 60 * 1000
                  );
                  const dateStr = format(currentDate, "yyyy-MM-dd");
                  const dayName = format(currentDate, "EEE", {
                    locale: idLocale,
                  });
                  const dayNum = format(currentDate, "d");
                  const isSelected = selectedOrderDates.has(dateStr) && !showAllDates;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleOrderDateClick(dateStr)}
                      className={`relative px-3 py-2 rounded font-medium text-sm transition-colors ${
                        isSelected
                          ? "bg-[#9B6D49] text-white"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#9B6D49]"
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] ${
                        isSelected 
                          ? "bg-[#9B6D49] border-[#9B6D49] text-white" 
                          : "bg-white border-gray-300"
                      }`}>
                        {isSelected && "✓"}
                      </div>
                      <div className="text-xs font-bold">{dayName}</div>
                      <div className="text-base">{dayNum}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Range & Date Picker - Inline */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <button
                onClick={() => {
                  setShowAllDates(true);
                  setSelectedOrderDates(new Set());
                }}
                className={`px-3 py-2 border rounded font-medium ${showAllDates ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  const today = format(new Date(), "yyyy-MM-dd");
                  setSelectedOrderDates(new Set([today]));
                  setShowAllDates(false);
                }}
                className={`px-3 py-2 border rounded font-medium ${!showAllDates && selectedOrderDates.size === 1 && selectedOrderDates.has(format(new Date(), "yyyy-MM-dd")) ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => {
                  // Select all 7 days
                  const dates = new Set<string>();
                  for (let i = 0; i < 7; i++) {
                    dates.add(format(new Date(new Date().getTime() + i * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
                  }
                  setSelectedOrderDates(dates);
                  setShowAllDates(false);
                }}
                className={`px-3 py-2 border rounded font-medium ${!showAllDates && selectedOrderDates.size === 7 ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                7 Hari
              </button>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49] bg-white text-gray-700 font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="verifying">Verifikasi</option>
                <option value="pending">Menunggu Bayar</option>
                <option value="paid">Dibayar</option>
                <option value="completed">Selesai</option>
              </select>
              <input
                type="date"
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedOrderDates(new Set([e.target.value]));
                    setShowAllDates(false);
                  }
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49] font-medium"
              />
              <span className="text-gray-400 ml-auto">
                {showAllDates || selectedOrderDates.size === 0 ? (
                  "Semua Tanggal"
                ) : (
                  Array.from(selectedOrderDates).sort().map(d => 
                    format(new Date(d), "d MMM", { locale: idLocale })
                  ).join(", ")
                )}
              </span>
            </div>
          </div>

          {/* Summary Stats - Compact & Styled */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Total Order
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {groupedOrders.verifying.length +
                    groupedOrders.pending.length +
                    groupedOrders.paid.length +
                    groupedOrders.completed.length}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Verifikasi
                </p>
                <p className="text-xl font-bold text-orange-600 mt-0.5">
                  {groupedOrders.verifying.length}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Pembayaran
                </p>
                <p className="text-xl font-bold text-yellow-600 mt-0.5">
                  {groupedOrders.pending.length}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Selesai
                </p>
                <p className="text-xl font-bold text-green-600 mt-0.5">
                  {groupedOrders.completed.length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle size={18} />
              </div>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'id') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('id');
                          setOrderSortDirection('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {orderSortField === 'id' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'pelanggan') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('pelanggan');
                          setOrderSortDirection('asc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Pelanggan
                        {orderSortField === 'pelanggan' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'status') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('status');
                          setOrderSortDirection('asc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {orderSortField === 'status' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'qty') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('qty');
                          setOrderSortDirection('desc');
                        }
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Qty
                        {orderSortField === 'qty' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'tanggal') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('tanggal');
                          setOrderSortDirection('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Tanggal
                        {orderSortField === 'tanggal' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (orderSortField === 'total') {
                          setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setOrderSortField('total');
                          setOrderSortDirection('desc');
                        }
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total
                        {orderSortField === 'total' ? (
                          orderSortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allOrdersList = [
                      ...groupedOrders.verifying.map((o) => ({
                        ...o,
                        type: "verifying" as const,
                      })),
                      ...groupedOrders.pending.map((o) => ({
                        ...o,
                        type: "pending" as const,
                      })),
                      ...groupedOrders.paid.map((o) => ({
                        ...o,
                        type: "paid" as const,
                      })),
                      ...groupedOrders.completed.map((o) => ({
                        ...o,
                        type: "completed" as const,
                      })),
                    ].filter(
                      (o) =>
                        orderStatusFilter === "all" ||
                        o.type === orderStatusFilter
                    );

                    if (allOrdersList.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-10 text-center text-gray-500 text-sm"
                          >
                            Tidak ada pesanan pada periode ini
                          </td>
                        </tr>
                      );
                    }

                    // Sorting logic
                    const sortedOrders = [...allOrdersList].sort((a, b) => {
                      const statusOrder = { verifying: 0, pending: 1, paid: 2, completed: 3 };
                      let comparison = 0;
                      
                      const aTotalItems = a.order_products.reduce((sum, p) => sum + p.jumlah, 0);
                      const bTotalItems = b.order_products.reduce((sum, p) => sum + p.jumlah, 0);
                      const aTotalPrice = a.order_products.reduce((sum, p) => sum + p.jumlah * p.harga_beli, 0);
                      const bTotalPrice = b.order_products.reduce((sum, p) => sum + p.jumlah * p.harga_beli, 0);
                      
                      switch (orderSortField) {
                        case 'id':
                          comparison = a.id - b.id;
                          break;
                        case 'pelanggan':
                          comparison = a.user.nama.localeCompare(b.user.nama);
                          break;
                        case 'status':
                          comparison = statusOrder[a.type] - statusOrder[b.type];
                          break;
                        case 'qty':
                          comparison = aTotalItems - bTotalItems;
                          break;
                        case 'tanggal':
                          const dateA = new Date(a.scheduled_date || a.created_at).getTime();
                          const dateB = new Date(b.scheduled_date || b.created_at).getTime();
                          comparison = dateA - dateB;
                          break;
                        case 'total':
                          comparison = aTotalPrice - bTotalPrice;
                          break;
                        default:
                          comparison = 0;
                      }
                      
                      return orderSortDirection === 'asc' ? comparison : -comparison;
                    });

                    return sortedOrders.map((order) => {
                      const statusConfig = {
                        verifying: {
                          label: "Verifikasi",
                          icon: <Search size={14} className="mr-1" />,
                          bgColor: "bg-orange-100",
                          textColor: "text-orange-800",
                        },
                        pending: {
                          label: "Menunggu",
                          icon: <Hourglass size={14} className="mr-1" />,
                          bgColor: "bg-yellow-100",
                          textColor: "text-yellow-800",
                        },
                        paid: {
                          label: "Dibayar",
                          icon: <CreditCard size={14} className="mr-1" />,
                          bgColor: "bg-blue-100",
                          textColor: "text-blue-800",
                        },
                        completed: {
                          label: "Selesai",
                          icon: <CheckCircle size={14} className="mr-1" />,
                          bgColor: "bg-green-100",
                          textColor: "text-green-800",
                        },
                      };
                      const config = statusConfig[order.type];
                      const totalItems = order.order_products.reduce(
                        (sum, p) => sum + p.jumlah,
                        0
                      );
                      const totalPrice = order.order_products.reduce(
                        (sum, p) => sum + p.jumlah * p.harga_beli,
                        0
                      );

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.user.nama}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.user.no_hp}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center w-fit ${config.bgColor} ${config.textColor}`}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            {totalItems}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {format(
                              new Date(
                                order.scheduled_date || order.created_at
                              ),
                              "dd/MM/yy",
                              { locale: idLocale }
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Rp {totalPrice.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setEditedOrder(order);
                                  setIsEditingOrder(false);
                                }}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title={
                                  order.type === "verifying" ? "Edit" : "Lihat"
                                }
                              >
                                <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                              </button>
                              {order.type === "verifying" && (
                                <>
                                  <button
                                    onClick={() => handleApproveOrder(order.id)}
                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                    title="Terima"
                                  >
                                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Tolak"
                                  >
                                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                  </button>
                                </>
                              )}
                              {order.type === "pending" && (
                                <button
                                  onClick={() => handleVerifyPayment(order.id)}
                                  className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                  title="Verifikasi Pembayaran"
                                >
                                  <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                              )}
                              {order.type === "paid" && (
                                <button
                                  onClick={() => handleCompleteOrder(order.id)}
                                  className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                  title="Selesai / Kirim"
                                >
                                  <PackageCheck className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                              )}
                              {order.type === "completed" && (
                                <span className="p-2 inline-flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg">
                                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                </span>
                              )}
                              <a
                                href={`https://wa.me/62${order.user.no_hp.replace(
                                  /^0/,
                                  ""
                                )}?text=${encodeURIComponent(
                                  `Halo Kak ${order.user.nama}, berikut detail pesanan Anda:\n\n` +
                                  `*Pesanan #${order.id}*\n` +
                                  `Jadwal: ${format(
                                    new Date(
                                      order.scheduled_date || order.created_at
                                    ),
                                    "dd MMM yyyy",
                                    { locale: idLocale }
                                  )}\n\n` +
                                  `*Rincian Produk:*\n` +
                                  order.order_products
                                    .map(
                                      (p) =>
                                        `- ${p.product.nama} (${p.jumlah}x)`
                                    )
                                    .join("\n") +
                                  `\n\n*Total: Rp ${totalPrice.toLocaleString(
                                    "id-ID"
                                  )}*\n\n` +
                                  `Mohon ditunggu updatenya ya kak! Terima kasih`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTION TAB */}
      {activeTab === "production" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3">
            {/* 7-Day Calendar View */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Jadwal
                  {selectedProductionDates.size > 0 && !showAllProductionDates && (
                    <span className="text-[10px] text-gray-500 font-normal ml-2">
                      ({selectedProductionDates.size}/7 tanggal dipilih)
                    </span>
                  )}
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const currentDate = new Date(
                      new Date().getTime() + i * 24 * 60 * 60 * 1000
                    );
                    const dateStr = format(currentDate, "yyyy-MM-dd");
                    const dayName = format(currentDate, "EEE", {
                      locale: idLocale,
                    });
                    const dayNum = format(currentDate, "d");
                    const isSelected = selectedProductionDates.has(dateStr) && !showAllProductionDates;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleProductionDateClick(dateStr)}
                        className={`relative px-3 py-2 rounded font-medium text-sm transition-colors ${
                          isSelected
                            ? "bg-[#9B6D49] text-white"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#9B6D49]"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] ${
                          isSelected 
                            ? "bg-[#9B6D49] border-[#9B6D49] text-white" 
                            : "bg-white border-gray-300"
                        }`}>
                          {isSelected && "✓"}
                        </div>
                        <div className="text-xs font-bold">{dayName}</div>
                        <div className="text-base">{dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Range & Date Picker - Inline */}
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <button
                  onClick={() => {
                    setShowAllProductionDates(true);
                    setSelectedProductionDates(new Set());
                  }}
                  className={`px-3 py-2 border rounded font-medium ${showAllProductionDates ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => {
                    const today = format(new Date(), "yyyy-MM-dd");
                    setSelectedProductionDates(new Set([today]));
                    setShowAllProductionDates(false);
                  }}
                  className={`px-3 py-2 border rounded font-medium ${!showAllProductionDates && selectedProductionDates.size === 1 && selectedProductionDates.has(format(new Date(), "yyyy-MM-dd")) ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => {
                    // Select all 7 days
                    const dates = new Set<string>();
                    for (let i = 0; i < 7; i++) {
                      dates.add(format(new Date(new Date().getTime() + i * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
                    }
                    setSelectedProductionDates(dates);
                    setShowAllProductionDates(false);
                  }}
                  className={`px-3 py-2 border rounded font-medium ${!showAllProductionDates && selectedProductionDates.size === 7 ? 'bg-[#9B6D49] text-white border-[#9B6D49]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  7 Hari
                </button>
                <select
                  value={productionStatusFilter}
                  onChange={(e) =>
                    setProductionStatusFilter(
                      e.target.value as
                      | "all"
                      | "pending"
                      | "in_production"
                      | "completed"
                    )
                  }
                  className="px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49] bg-white text-gray-700 font-medium"
                >
                  <option value="all">Semua Status</option>
                  <option value="in_production">Proses Masak</option>
                  <option value="completed">Selesai Masak</option>
                </select>
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedProductionDates(new Set([e.target.value]));
                      setShowAllProductionDates(false);
                    }
                  }}
                  className="px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49] font-medium"
                />
                <span className="text-gray-400 ml-auto">
                  {showAllProductionDates || selectedProductionDates.size === 0 ? (
                    "Semua Tanggal"
                  ) : (
                    Array.from(selectedProductionDates).sort().map(d => 
                      format(new Date(d), "d MMM", { locale: idLocale })
                    ).join(", ")
                  )}
                </span>
              </div>
            </div>

            {/* Stats - More Compact */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <p className="text-[10px] text-gray-500">Order</p>
                <p className="text-lg font-bold text-blue-600">
                  {filteredProductionOrders.length}
                </p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <p className="text-[10px] text-gray-500">Produk</p>
                <p className="text-lg font-bold text-green-600">
                  {totalProducts}
                </p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <p className="text-[10px] text-gray-500">Addon</p>
                <p className="text-lg font-bold text-amber-600">
                  {totalAddons}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {filteredProductionOrders.length > 0 && (
              <button
                onClick={handlePrintAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors w-fit"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Semua ({filteredProductionOrders.length})
              </button>
            )}
          </div>

          {/* Production Target Form - Compact */}
          {filteredProductionOrders.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
              <h2 className="text-sm font-bold text-yellow-900 flex items-center gap-2">
                <Star size={16} className="text-yellow-600" /> TARGET PRODUKSI
              </h2>

              {/* General Notes */}
              <div>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  rows={2}
                  placeholder="Catatan umum (opsional)..."
                />
              </div>

              {/* Product Targets Grid - More Compact */}
              <div className="grid grid-cols-3 gap-2">
                {orders
                  .flatMap((order) =>
                    order.order_products.map((product) => product.product.nama)
                  )
                  .filter((name, idx, arr) => arr.indexOf(name) === idx)
                  .map((productName) => {
                    const totalQty = orders.reduce((sum, order) => {
                      const item = order.order_products.find(
                        (p) => p.product.nama === productName
                      );
                      return sum + (item?.jumlah || 0);
                    }, 0);

                    return (
                      <div
                        key={productName}
                        className="bg-white p-2 rounded border border-yellow-200"
                      >
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {productName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">
                            Order: {totalQty}
                          </span>
                          <input
                            type="number"
                            value={productionTargets[productName] || totalQty}
                            onChange={(e) =>
                              setProductionTargets({
                                ...productionTargets,
                                [productName]: e.target.value,
                              })
                            }
                            className="flex-1 w-12 px-2 py-0.5 border border-yellow-200 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            min="0"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">Memuat data produksi...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Production Orders List - Card Format */}
          {!loading && filteredProductionOrders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList size={16} /> Daftar (
                  {
                    filteredProductionOrders.filter((o) => {
                      const status = o.production_status || "pending";
                      if (productionStatusFilter === "all") return true;
                      if (productionStatusFilter === "in_production") {
                        return (
                          status === "pending" || status === "in_production"
                        );
                      }
                      return status === productionStatusFilter;
                    }).length
                  }
                  )
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProductionOrders
                  .filter((o) => {
                    const status = o.production_status || "pending";
                    if (productionStatusFilter === "all") return true;
                    if (productionStatusFilter === "in_production") {
                      return status === "pending" || status === "in_production";
                    }
                    return status === productionStatusFilter;
                  })
                  .map((order) => {
                    const totalItems = order.order_products.reduce(
                      (sum, p) => sum + p.jumlah,
                      0
                    );
                    const totalPrice = order.order_products.reduce(
                      (sum, p) => sum + p.jumlah * p.harga_beli,
                      0
                    );
                    const status = order.production_status || "pending";

                    const statusColor = {
                      pending: {
                        bg: "bg-yellow-50",
                        border: "border-yellow-300",
                        text: "text-yellow-800",
                        badge: "bg-yellow-100",
                      },
                      in_production: {
                        bg: "bg-blue-50",
                        border: "border-blue-300",
                        text: "text-blue-800",
                        badge: "bg-blue-100",
                      },
                      completed: {
                        bg: "bg-green-50",
                        border: "border-green-300",
                        text: "text-green-800",
                        badge: "bg-green-100",
                      },
                    };

                    const colors = statusColor[status];

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                      >
                        {/* Status Strip */}
                        <div
                          className={`h-1 w-full ${status === "pending"
                            ? "bg-yellow-400"
                            : status === "in_production"
                              ? "bg-blue-500"
                              : "bg-green-500"
                            }`}
                        />

                        <div className="p-3">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-gray-900">
                                #{order.id}
                              </span>
                              <span className="text-[10px] text-gray-400 ml-2">
                                {format(new Date(order.created_at), "dd MMM", {
                                  locale: idLocale,
                                })}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${colors.badge} ${colors.text}`}
                            >
                              {(status === "pending" ||
                                status === "in_production") && (
                                  <>
                                    <Flame size={10} /> Proses Masak
                                  </>
                                )}
                              {status === "completed" && (
                                <>
                                  <CheckCircle size={10} /> Selesai
                                </>
                              )}
                            </span>
                          </div>

                          {/* Main Info */}
                          <div className="mb-3">
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                              {order.order_products[0]?.product.nama}
                              {order.order_products.length > 1 &&
                                ` +${order.order_products.length - 1} lainnya`}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {totalItems} Items • Rp{" "}
                              {totalPrice.toLocaleString("id-ID")}
                            </p>
                          </div>

                          {/* Customer Mini Card */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                              {order.user.nama.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {order.user.nama}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {order.user.no_hp}
                              </p>
                            </div>
                          </div>

                          {/* Actions Footer */}
                          <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setEditedOrder(order);
                                  setIsEditingOrder(false);
                                }}
                                className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                              >
                                <Eye className="w-4 h-4" /> Preview
                              </button>
                              <button
                                onClick={() => handlePrint(order)}
                                className="flex-1 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
                              >
                                <Printer className="w-4 h-4" /> Cetak
                              </button>
                            </div>
                            <select
                              value={
                                status === "pending" ? "in_production" : status
                              }
                              onChange={async (e) => {
                                const newStatus = e.target.value as
                                  | "pending"
                                  | "in_production"
                                  | "completed";

                                // Optimistic update
                                setOrders(
                                  orders.map((o) =>
                                    o.id === order.id
                                      ? { ...o, production_status: newStatus }
                                      : o
                                  )
                                );
                                setAllOrders(
                                  allOrders.map((o) =>
                                    o.id === order.id
                                      ? { ...o, production_status: newStatus }
                                      : o
                                  )
                                );

                                // Call backend API
                                try {
                                  const response = await fetch(`/api/orders/${order.id}/production`, {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ production_status: newStatus }),
                                  });
                                  if (!response.ok) {
                                    console.error("[Production] Failed to update production status");
                                  }
                                } catch (err) {
                                  console.error("[Production] Error updating production status:", err);
                                }
                              }}

                              className={`w-full py-1.5 px-2 text-xs font-medium rounded-lg appearance-none text-center cursor-pointer focus:outline-none transition-colors ${status === "pending" ||
                                status === "in_production"
                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                            >
                              <option value="in_production">
                                Proses Masak
                              </option>
                              <option value="completed">Selesai</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProductionOrders.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600">
                Tidak ada pesanan untuk diproduksi pada tanggal ini
              </p>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && editedOrder && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Pesanan #{editedOrder.id}
              </h2>
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setEditedOrder(null);
                  setIsEditingOrder(false);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <XCircle size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">
                  👤 Informasi Pelanggan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Nama</p>
                    <p className="font-semibold text-gray-900">
                      {editedOrder.user.nama}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">No HP</p>
                    <p className="font-semibold text-gray-900">
                      {editedOrder.user.no_hp}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Dibuat</p>
                    <p className="font-semibold text-gray-900">
                      {format(
                        new Date(editedOrder.created_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: idLocale }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Jadwal</p>
                    <p className="font-semibold text-gray-900">
                      {format(
                        new Date(editedOrder.scheduled_date || new Date()),
                        "dd/MM/yyyy",
                        { locale: idLocale }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">📦 Produk</h3>
                  {editedOrder.status === "verifying" && (
                    <button
                      onClick={() => setIsEditingOrder(!isEditingOrder)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-medium transition-colors flex items-center gap-1.5"
                    >
                      {isEditingOrder ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      {isEditingOrder ? "Selesai Edit" : "Edit"}
                    </button>
                  )}
                  {editedOrder.status !== "verifying" && (
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Tidak Bisa Diubah
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {editedOrder.order_products.map((item, idx) => (
                    <div
                      key={item.id}
                      className="border border-gray-300 rounded p-3 bg-white"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Produk</p>
                          <p className="font-semibold text-gray-900">
                            {item.product.nama}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Jumlah</p>
                          {isEditingOrder ? (
                            <input
                              type="number"
                              value={item.jumlah}
                              onChange={(e) => {
                                const updated = { ...editedOrder };
                                updated.order_products[idx].jumlah =
                                  parseInt(e.target.value) || 0;
                                setEditedOrder(updated);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded font-semibold"
                              disabled={editedOrder.status !== "verifying"}
                            />
                          ) : (
                            <p className="font-semibold text-gray-900">
                              {item.jumlah} pcs
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Harga</p>
                          <p className="font-semibold text-gray-900">
                            Rp{" "}
                            {(item.harga_beli * item.jumlah).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                      {item.note && (
                        <p className="text-xs text-gray-600 mt-2">
                          📝 {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {editedOrder.notes && (
                <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                  <p className="font-bold text-purple-900 mb-2">📌 Catatan</p>
                  <p className="text-gray-700">{editedOrder.notes}</p>
                </div>
              )}

              {/* Status & Total */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-bold text-lg text-gray-900">
                      {editedOrder.status === "verifying" && "🔍 Verifikasi"}
                      {editedOrder.status === "pending" && "⏳ Menunggu"}
                      {editedOrder.status === "paid" && "💳 Dibayar"}
                      {editedOrder.status === "completed" && "✅ Selesai"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-bold text-lg text-blue-600">
                      Rp{" "}
                      {editedOrder.order_products
                        .reduce((sum, p) => sum + p.jumlah * p.harga_beli, 0)
                        .toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setEditedOrder(null);
                    setIsEditingOrder(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                {editedOrder.status === "verifying" && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveOrder(editedOrder.id);
                        setSelectedOrderId(null);
                        setEditedOrder(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Terima
                    </button>
                    <button
                      onClick={() => {
                        handleRejectOrder(editedOrder.id);
                        setSelectedOrderId(null);
                        setEditedOrder(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component untuk Order Management Card (Verifying, Pending, Paid, Completed)
function OrderManagementCard({
  order,
  type,
  onApprove,
  onReject,
  onVerifyPayment,
  onDone,
}: {
  order: Order;
  type: "verifying" | "pending" | "paid" | "completed";
  onApprove?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onVerifyPayment?: (orderId: number) => void;
  onDone?: (orderId: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor: Record<
    string,
    { bg: string; border: string; text: string; badge: string }
  > = {
    verifying: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-800",
      badge: "bg-orange-100 text-orange-800",
    },
    pending: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
    },
    paid: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-800",
    },
    completed: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-800",
      badge: "bg-green-100 text-green-800",
    },
  };

  const colors = statusColor[type];
  const totalItems = order.order_products.reduce((sum, p) => sum + p.jumlah, 0);
  const totalPrice = order.order_products.reduce(
    (sum, p) => sum + p.jumlah * p.harga_beli,
    0
  );

  const statusLabels = {
    verifying: "Verifikasi",
    pending: "Menunggu",
    paid: "Dibayar",
    completed: "Selesai",
  };

  return (
    <div
      className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 hover:shadow-md transition-shadow`}
    >
      {/* Header - Clickable */}
      <div
        className="flex items-start justify-between gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h3 className="font-bold text-base text-gray-900">#{order.id}</h3>
          <p className="text-xs text-gray-600 mt-1">{order.user.nama}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${colors.badge}`}
        >
          {statusLabels[type as keyof typeof statusLabels]}
        </span>
      </div>

      {/* Info Row */}
      <div className="text-xs text-gray-600 space-y-1 mb-3 pb-3 border-b border-gray-300">
        <p>📞 {order.user.no_hp}</p>
        <p>📦 {totalItems} items</p>
      </div>

      {/* Products Preview */}
      <div className="bg-white rounded p-3 border border-gray-200 mb-3 text-sm space-y-1">
        <p className="font-semibold text-gray-900 text-xs mb-2">Produk:</p>
        {order.order_products.map((item) => (
          <div key={item.id} className="text-xs">
            <p className="text-gray-900">
              {item.product.nama}{" "}
              <span className="text-blue-600 font-bold">x{item.jumlah}</span>
            </p>
            {item.note && <p className="text-gray-600">📝 {item.note}</p>}
          </div>
        ))}
      </div>

      {/* Notes (if exists) */}
      {order.notes && (
        <div className="bg-purple-50 border border-purple-300 rounded p-3 mb-3 text-xs">
          <p className="font-semibold text-purple-900">📌 Catatan:</p>
          <p className="text-gray-700 mt-1">{order.notes}</p>
        </div>
      )}

      {/* Expandable Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-300 space-y-3 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Waktu:</p>
            <p>
              Dibuat: {new Date(order.created_at).toLocaleDateString("id-ID")}
            </p>
            <p>
              Jadwal:{" "}
              {new Date(order.scheduled_date || new Date()).toLocaleDateString(
                "id-ID"
              )}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-300 mt-3">
        {type === "verifying" && (
          <>
            <button
              onClick={() => onApprove?.(order.id)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" /> Terima
            </button>
            <button
              onClick={() => onReject?.(order.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" /> Tolak
            </button>
          </>
        )}
        {type === "pending" && (
          <button
            onClick={() => onVerifyPayment?.(order.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-xs transition-colors"
          >
            ✓ Verifikasi
          </button>
        )}
        {type === "paid" && (
          <button
            onClick={() => onDone?.(order.id)}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded text-xs transition-colors"
          >
            ✓ Selesai Dikirim
          </button>
        )}
        {type === "completed" && (
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-600 font-bold py-2 px-3 rounded text-xs cursor-not-allowed"
          >
            ✓ Selesai
          </button>
        )}
      </div>
    </div>
  );
}
