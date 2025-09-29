import { mockMenuItems } from "./mockData";

// Stock manager untuk mengelola stock secara real-time
class StockManager {
  private stockData: Map<number, number> = new Map();

  constructor() {
    // Initialize stock dari mockData
    mockMenuItems.forEach((item) => {
      this.stockData.set(item.id, item.stok);
    });
  }

  // Get current stock untuk item tertentu
  getStock(itemId: number): number {
    return this.stockData.get(itemId) || 0;
  }

  // Update stock untuk item tertentu
  updateStock(itemId: number, newStock: number): boolean {
    if (newStock < 0) return false;
    this.stockData.set(itemId, newStock);

    // Update mockData juga agar konsisten
    const item = mockMenuItems.find((item) => item.id === itemId);
    if (item) {
      item.stok = newStock;
    }

    // Save to localStorage untuk persistence
    this.saveToStorage();
    return true;
  }

  // Decrease stock ketika item dibeli
  decreaseStock(itemId: number, quantity: number): boolean {
    const currentStock = this.getStock(itemId);
    if (currentStock < quantity) return false;

    return this.updateStock(itemId, currentStock - quantity);
  }

  // Increase stock (untuk return/cancel)
  increaseStock(itemId: number, quantity: number): boolean {
    const currentStock = this.getStock(itemId);
    return this.updateStock(itemId, currentStock + quantity);
  }

  // Save stock data to localStorage
  private saveToStorage() {
    const stockObj = Object.fromEntries(this.stockData);
    localStorage.setItem("merpati-bakery-stock", JSON.stringify(stockObj));
  }

  // Load stock data from localStorage
  loadFromStorage() {
    const saved = localStorage.getItem("merpati-bakery-stock");
    if (saved) {
      const stockObj = JSON.parse(saved);
      this.stockData = new Map(
        Object.entries(stockObj).map(([k, v]) => [
          Number.parseInt(k),
          v as number,
        ])
      );

      // Update mockData dengan stock yang tersimpan
      mockMenuItems.forEach((item) => {
        const savedStock = this.stockData.get(item.id);
        if (savedStock !== undefined) {
          item.stok = savedStock;
        }
      });
    }
  }

  // Reset stock ke nilai awal
  resetStock() {
    mockMenuItems.forEach((item) => {
      // Reset ke nilai default dari mockData
      const originalItem = mockMenuItems.find(
        (original) => original.id === item.id
      );
      if (originalItem) {
        this.stockData.set(item.id, originalItem.stok);
        item.stok = originalItem.stok;
      }
    });
    this.saveToStorage();
  }
}

// Singleton instance
export const stockManager = new StockManager();

// Initialize dari localStorage saat pertama kali load
if (typeof window !== "undefined") {
  stockManager.loadFromStorage();
}
