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
  Truck,
  Edit3,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
  Edit,
  Save,
  Lock,
  Package,
  ShoppingBag,
  Users,
  AlertCircle,
  Wallet,
  PackageCheck,
  Calendar,
  ClipboardList,
  ChefHat,
  Star,
  StickyNote,
  Flame,
  Search,
  Hourglass,
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

// Demo data untuk testing
const DEMO_PRODUCTION_DATA = (): Order[] => [
  // VERIFYING STATUS
  {
    id: 2001,
    user: {
      id: 201,
      nama: "Ahmad Rizki",
      no_hp: "085804065841",
    },
    order_products: [
      {
        id: 601,
        product: {
          id: 1,
          nama: "Roti Tawar",
          gambar: "/img/roti-tawar.jpg",
        },
        jumlah: 3,
        harga_beli: 15000,
        note: "Dipanggang golden",
        addons: [
          { addon_id: 1, nama: "Topping Coklat", harga: 2000, quantity: 2 },
        ],
      },
    ],
    status: "verifying",
    created_at: "2025-12-25T08:00:00Z",
    scheduled_date: "2025-12-25",
    notes: "Pesanan baru - menunggu verifikasi",
  },
  // PENDING STATUS
  {
    id: 2002,
    user: {
      id: 202,
      nama: "Siti Nur",
      no_hp: "08222333444",
    },
    order_products: [
      {
        id: 602,
        product: {
          id: 2,
          nama: "Cupcakes",
          gambar: "/img/cupcakes.jpg",
        },
        jumlah: 12,
        harga_beli: 8000,
        note: "Warna merah muda",
        addons: [
          {
            addon_id: 4,
            nama: "Frosting Strawberry",
            harga: 2000,
            quantity: 10,
          },
        ],
      },
    ],
    status: "pending",
    created_at: "2025-12-24T14:30:00Z",
    scheduled_date: "2025-12-25",
    notes: "Menunggu bukti pembayaran",
  },
  // PAID STATUS
  {
    id: 1001,
    user: {
      id: 101,
      nama: "John Doe",
      no_hp: "08123456789",
    },
    order_products: [
      {
        id: 501,
        product: {
          id: 1,
          nama: "Roti Tawar",
          gambar: "/img/roti-tawar.jpg",
        },
        jumlah: 5,
        harga_beli: 15000,
        note: "Dipanggang hingga golden brown",
        addons: [
          { addon_id: 1, nama: "Topping Coklat", harga: 2000, quantity: 3 },
          { addon_id: 2, nama: "Keju Cheddar", harga: 3000, quantity: 2 },
        ],
      },
      {
        id: 502,
        product: {
          id: 3,
          nama: "Donuts",
          gambar: "/img/donuts.jpg",
        },
        jumlah: 10,
        harga_beli: 5000,
        note: "",
        addons: [{ addon_id: 3, nama: "Sprinkles", harga: 1000, quantity: 10 }],
      },
    ],
    status: "paid",
    created_at: "2025-12-25T09:00:00Z",
    scheduled_date: "2025-12-25",
    notes: "Pesanan untuk acara kantor",
    production_status: "pending",
  },
  {
    id: 1002,
    user: {
      id: 102,
      nama: "Jane Smith",
      no_hp: "08987654321",
    },
    order_products: [
      {
        id: 503,
        product: {
          id: 2,
          nama: "Cupcakes",
          gambar: "/img/cupcakes.jpg",
        },
        jumlah: 20,
        harga_beli: 8000,
        note: "Warna pink dan biru",
        addons: [
          { addon_id: 4, nama: "Frosting Vanila", harga: 2000, quantity: 15 },
        ],
      },
    ],
    status: "paid",
    created_at: "2025-12-25T10:30:00Z",
    scheduled_date: "2025-12-25",
    notes: "",
    production_status: "in_production",
  },
  {
    id: 1003,
    user: {
      id: 103,
      nama: "Budi Santoso",
      no_hp: "08765432100",
    },
    order_products: [
      {
        id: 504,
        product: {
          id: 4,
          nama: "Roti Tawar",
          gambar: "/img/roti-tawar.jpg",
        },
        jumlah: 4,
        harga_beli: 8000,
        note: "Pesanan dari warung ABC",
        addons: [
          { addon_id: 5, nama: "Addon Coklat", harga: 2000, quantity: 3 },
          { addon_id: 7, nama: "Addon Potong", harga: 1500, quantity: 2 },
        ],
      },
      {
        id: 507,
        product: {
          id: 3,
          nama: "Croissant",
          gambar: "/img/croissant.jpg",
        },
        jumlah: 6,
        harga_beli: 10000,
        note: "",
        addons: [],
      },
    ],
    status: "paid",
    created_at: "2025-12-25T11:00:00Z",
    scheduled_date: "2025-12-25",
    notes: "⭐ TARGET: Siap jam 2 siang untuk pengiriman",
    production_status: "pending",
  },
  // COMPLETED STATUS
  {
    id: 2003,
    user: {
      id: 203,
      nama: "Dewi Lestari",
      no_hp: "08444555666",
    },
    order_products: [
      {
        id: 605,
        product: {
          id: 5,
          nama: "Bread Pudding",
          gambar: "/img/bread-pudding.jpg",
        },
        jumlah: 5,
        harga_beli: 20000,
        note: "",
        addons: [],
      },
    ],
    status: "completed",
    created_at: "2025-12-23T09:00:00Z",
    scheduled_date: "2025-12-23",
    notes: "Sudah dikirim",
    production_status: "completed",
  },
];

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
      className={`border-2 rounded-lg p-4 ${
        statusColors[order.production_status || "pending"] ||
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
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            statusBadgeColors[order.production_status || "pending"]
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
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(
      new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
  });
  const [orderDateRange, setOrderDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(
      new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
  });
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
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchProductionList();
  }, [dateRange]);

  const fetchProductionList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load semua orders (untuk all tabs)
      const allDemoData = DEMO_PRODUCTION_DATA();
      setAllOrders(allDemoData);

      // Filter hanya yang status paid dan dalam range tanggal untuk production list
      const filteredOrders = allDemoData.filter((order) => {
        const orderDate = order.scheduled_date
          ? order.scheduled_date.split("T")[0]
          : null;
        return (
          orderDate &&
          orderDate >= dateRange.start &&
          orderDate <= dateRange.end &&
          order.status === "paid"
        );
      });

      setOrders(filteredOrders);
    } catch (err) {
      console.log("Error loading data");
      setError("Gagal memuat data");
      const allDemoData = DEMO_PRODUCTION_DATA();
      setAllOrders(allDemoData);
      const filteredOrders = allDemoData.filter((order) => {
        const orderDate = order.scheduled_date
          ? order.scheduled_date.split("T")[0]
          : null;
        return (
          orderDate &&
          orderDate >= dateRange.start &&
          orderDate <= dateRange.end &&
          order.status === "paid"
        );
      });
      setOrders(filteredOrders);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = orders.reduce(
    (sum, order) => sum + order.order_products.length,
    0
  );

  const totalAddons = orders.reduce((sum, order) => {
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

    // Flatten products into rows untuk single order
    const rows = order.order_products.flatMap((item) => {
      if (item.addons && item.addons.length > 0) {
        return item.addons.map((addon) => ({
          product: item.product.nama,
          quantity: item.jumlah,
          addon: addon.nama,
          addonQty: addon.quantity || 0,
        }));
      } else {
        return [
          {
            product: item.product.nama,
            quantity: item.jumlah,
            addon: "",
            addonQty: 0,
          },
        ];
      }
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pesanan ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 10px; color: #000; background: #fff; }
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
            vertical-align: middle;
          }
          .product-col { font-weight: bold; }
          .qty-col { text-align: center; width: 80px; }
          .addon-col { }
          .addon-qty-col { text-align: center; width: 60px; }
          @media print { 
            body { margin: 0; padding: 5px; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th class="product-col">PRODUK</th>
              <th class="qty-col">QTY</th>
              <th class="addon-col">ADDON</th>
              <th class="addon-qty-col">QTY</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                <td class="product-col">${row.product}</td>
                <td class="qty-col">${row.quantity}</td>
                <td class="addon-col">${row.addon}</td>
                <td class="addon-qty-col">${row.addonQty || ""}</td>
              </tr>
            `
              )
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

    orders.forEach((order) =>
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
          <p>Tanggal: ${format(new Date(dateRange.start), "dd MMMM yyyy", {
            locale: idLocale,
          })} - ${format(new Date(dateRange.end), "dd MMMM yyyy", {
      locale: idLocale,
    })}</p>
          <p>Total ${orders.length} Pesanan</p>
        </div>

        ${
          generalNotes
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
                  <td class="product-col" rowspan="${
                    breakdownItems.length
                  }"><strong>${row.product}</strong></td>
                  <td class="addon-col"><span class="addon-item">└─ ${
                    breakdownItems[0].label
                  }</span></td>
                  <td class="qty-col">${breakdownItems[0].qty}</td>
                  <td class="qty-col" rowspan="${
                    breakdownItems.length
                  }"><strong>${row.totalQty}</strong></td>
                  <td class="target-col" rowspan="${
                    breakdownItems.length
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
      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, production_status: "completed" as const }
            : order
        )
      );

      // Attempt to call backend API
      await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.log("Status updated locally");
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    setAllOrders(
      allOrders.map((o) =>
        o.id === orderId ? { ...o, status: "pending" as const } : o
      )
    );
  };

  const handleRejectOrder = async (orderId: number) => {
    setAllOrders(allOrders.filter((o) => o.id !== orderId));
  };

  const handleVerifyPayment = async (orderId: number) => {
    setAllOrders(
      allOrders.map((o) =>
        o.id === orderId ? { ...o, status: "paid" as const } : o
      )
    );
  };

  const handleCompleteOrder = async (orderId: number) => {
    setAllOrders(
      allOrders.map((o) =>
        o.id === orderId ? { ...o, status: "completed" as const } : o
      )
    );
  };

  const groupedOrders = {
    verifying: allOrders.filter((o) => {
      const orderDate = o.scheduled_date
        ? o.scheduled_date.split("T")[0]
        : null;
      return (
        o.status === "verifying" &&
        orderDate &&
        orderDate >= orderDateRange.start &&
        orderDate <= orderDateRange.end
      );
    }),
    pending: allOrders.filter((o) => {
      const orderDate = o.scheduled_date
        ? o.scheduled_date.split("T")[0]
        : null;
      return (
        o.status === "pending" &&
        orderDate &&
        orderDate >= orderDateRange.start &&
        orderDate <= orderDateRange.end
      );
    }),
    paid: allOrders.filter((o) => {
      const orderDate = o.scheduled_date
        ? o.scheduled_date.split("T")[0]
        : null;
      return (
        o.status === "paid" &&
        orderDate &&
        orderDate >= orderDateRange.start &&
        orderDate <= orderDateRange.end
      );
    }),
    completed: allOrders.filter((o) => {
      const orderDate = o.scheduled_date
        ? o.scheduled_date.split("T")[0]
        : null;
      return (
        o.status === "completed" &&
        orderDate &&
        orderDate >= orderDateRange.start &&
        orderDate <= orderDateRange.end
      );
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
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-b-2 border-[#9B6D49] text-[#9B6D49] -mb-px"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardList size={16} /> Kelola Order
        </button>
        <button
          onClick={() => setActiveTab("production")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "production"
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
                  const isStart = dateStr === orderDateRange.start;
                  const isEnd = dateStr === orderDateRange.end;
                  const isInRange =
                    dateStr >= orderDateRange.start &&
                    dateStr <= orderDateRange.end;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setOrderDateRange({ start: dateStr, end: dateStr });
                      }}
                      className={`px-2.5 py-1.5 rounded font-medium text-xs transition-colors ${
                        isStart && isEnd
                          ? "bg-[#9B6D49] text-white"
                          : isInRange
                          ? "bg-[#e8dcc8] text-[#9B6D49]"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#9B6D49]"
                      }`}
                    >
                      <div className="text-[10px] font-bold">{dayName}</div>
                      <div className="text-sm">{dayNum}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Range & Date Picker - Inline */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <button
                onClick={() => {
                  const today = format(new Date(), "yyyy-MM-dd");
                  setOrderDateRange({ start: today, end: today });
                }}
                className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100"
              >
                Hari Ini
              </button>
              <button
                onClick={() => {
                  const start = format(new Date(), "yyyy-MM-dd");
                  const end = format(
                    new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
                    "yyyy-MM-dd"
                  );
                  setOrderDateRange({ start, end });
                }}
                className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100"
              >
                7 Hari
              </button>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49] bg-white text-gray-700"
              >
                <option value="all">Semua Status</option>
                <option value="verifying">Verifikasi</option>
                <option value="pending">Menunggu Bayar</option>
                <option value="paid">Dibayar</option>
                <option value="completed">Selesai</option>
              </select>
              <input
                type="date"
                value={orderDateRange.start}
                onChange={(e) => {
                  setOrderDateRange({
                    start: e.target.value,
                    end: e.target.value,
                  });
                }}
                className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49]"
              />
              <span className="text-gray-400 ml-auto">
                {format(new Date(orderDateRange.start), "d MMM", {
                  locale: idLocale,
                })}{" "}
                -{" "}
                {format(new Date(orderDateRange.end), "d MMM yyyy", {
                  locale: idLocale,
                })}
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Tgl
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Tidak ada pesanan pada periode ini
                          </td>
                        </tr>
                      );
                    }

                    return allOrdersList.map((order) => {
                      const statusConfig = {
                        verifying: {
                          label: "Verifikasi",
                          icon: <Search size={12} className="mr-1" />,
                          bgColor: "bg-orange-100",
                          textColor: "text-orange-800",
                        },
                        pending: {
                          label: "Menunggu",
                          icon: <Hourglass size={12} className="mr-1" />,
                          bgColor: "bg-yellow-100",
                          textColor: "text-yellow-800",
                        },
                        paid: {
                          label: "Dibayar",
                          icon: <CreditCard size={12} className="mr-1" />,
                          bgColor: "bg-blue-100",
                          textColor: "text-blue-800",
                        },
                        completed: {
                          label: "Selesai",
                          icon: <CheckCircle size={12} className="mr-1" />,
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
                          <td className="px-3 py-2 text-xs font-medium text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-xs font-medium text-gray-900">
                              {order.user.nama}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {order.user.no_hp}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center w-fit ${config.bgColor} ${config.textColor}`}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-gray-600">
                            {totalItems}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">
                            {format(
                              new Date(
                                order.scheduled_date || order.created_at
                              ),
                              "dd/MM/yy",
                              { locale: idLocale }
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-medium text-gray-900">
                            Rp {totalPrice.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setEditedOrder(order);
                                  setIsEditingOrder(false);
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                title={
                                  order.type === "verifying" ? "Edit" : "Lihat"
                                }
                              >
                                <Eye size={14} />
                              </button>
                              {order.type === "verifying" && (
                                <>
                                  <button
                                    onClick={() => handleApproveOrder(order.id)}
                                    className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                                    title="Terima"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                    title="Tolak"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </>
                              )}
                              {order.type === "pending" && (
                                <button
                                  onClick={() => handleVerifyPayment(order.id)}
                                  className="w-7 h-7 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
                                  title="Verifikasi Pembayaran"
                                >
                                  <Wallet size={14} />
                                </button>
                              )}
                              {order.type === "paid" && (
                                <button
                                  onClick={() => handleCompleteOrder(order.id)}
                                  className="w-7 h-7 flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
                                  title="Selesai / Kirim"
                                >
                                  <PackageCheck size={14} />
                                </button>
                              )}
                              {order.type === "completed" && (
                                <span className="w-7 h-7 flex items-center justify-center bg-gray-50 text-gray-400 rounded-md">
                                  <CheckCircle size={14} />
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
                                className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle size={14} />
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Jadwal
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
                    const isStart = dateStr === dateRange.start;
                    const isEnd = dateStr === dateRange.end;
                    const isInRange =
                      dateStr >= dateRange.start && dateStr <= dateRange.end;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setDateRange({ start: dateStr, end: dateStr });
                        }}
                        className={`px-2.5 py-1.5 rounded font-medium text-xs transition-colors ${
                          isStart && isEnd
                            ? "bg-[#9B6D49] text-white"
                            : isInRange
                            ? "bg-[#e8dcc8] text-[#9B6D49]"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#9B6D49]"
                        }`}
                      >
                        <div className="text-[10px] font-bold">{dayName}</div>
                        <div className="text-sm">{dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Range & Date Picker - Inline */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <button
                  onClick={() => {
                    const today = format(new Date(), "yyyy-MM-dd");
                    setDateRange({ start: today, end: today });
                  }}
                  className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100"
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => {
                    const start = format(new Date(), "yyyy-MM-dd");
                    const end = format(
                      new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
                      "yyyy-MM-dd"
                    );
                    setDateRange({ start, end });
                  }}
                  className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100"
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
                  className="px-2 py-1 border border-gray-200 rounded bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#9B6D49]"
                >
                  <option value="all">Semua Status</option>
                  <option value="in_production">Proses Masak</option>
                  <option value="completed">Selesai Masak</option>
                </select>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({
                      start: e.target.value,
                      end: e.target.value,
                    });
                  }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#9B6D49]"
                />
                <span className="text-gray-400 ml-auto">
                  {format(new Date(dateRange.start), "d MMM", {
                    locale: idLocale,
                  })}{" "}
                  -{" "}
                  {format(new Date(dateRange.end), "d MMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              </div>
            </div>

            {/* Stats - More Compact */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <p className="text-[10px] text-gray-500">Order</p>
                <p className="text-lg font-bold text-blue-600">
                  {orders.length}
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
            {orders.length > 0 && (
              <button
                onClick={handlePrintAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors w-fit"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Semua ({orders.length})
              </button>
            )}
          </div>

          {/* Production Target Form - Compact */}
          {orders.length > 0 && (
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
          {!loading && orders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList size={16} /> Daftar (
                  {
                    orders.filter((o) => {
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
                {orders
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
                          className={`h-1 w-full ${
                            status === "pending"
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
                                className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Eye size={12} /> Preview
                              </button>
                              <button
                                onClick={() => handlePrint(order)}
                                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Printer size={12} /> Cetak
                              </button>
                            </div>
                            <select
                              value={
                                status === "pending" ? "in_production" : status
                              }
                              onChange={(e) => {
                                const newStatus = e.target.value as
                                  | "pending"
                                  | "in_production"
                                  | "completed";
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
                              }}
                              className={`w-full py-1.5 px-2 text-xs font-medium rounded-lg appearance-none text-center cursor-pointer focus:outline-none transition-colors ${
                                status === "pending" ||
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
          {!loading && orders.length === 0 && (
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
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition-colors flex items-center gap-1"
                    >
                      {isEditingOrder ? <Save size={14} /> : <Edit size={14} />}
                      {isEditingOrder ? "Selesai Edit" : "Edit"}
                    </button>
                  )}
                  {editedOrder.status !== "verifying" && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock size={14} /> Tidak Bisa Diubah
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
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Terima
                    </button>
                    <button
                      onClick={() => {
                        handleRejectOrder(editedOrder.id);
                        setSelectedOrderId(null);
                        setEditedOrder(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Tolak
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
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Check size={14} /> Terima
            </button>
            <button
              onClick={() => onReject?.(order.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <X size={14} /> Tolak
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
