"use client";

import React, { useState, useId, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  CalendarDays,
  Package,
  Play,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
}

export function MLPredictionCard({ products = [] }: { products?: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [predictedProductName, setPredictedProductName] = useState("");

  const selectId = useId();
  const dateId = useId();

  // Logic untuk rentang kalender (Hari ini s/d 7 Hari ke depan)
  const [dateRange, setDateRange] = useState({ min: "", max: "" });

  useEffect(() => {
    const today = new Date();

    // Set format YYYY-MM-DD untuk atribut min & max input date
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    setDateRange({
      min: formatDate(today),
      max: formatDate(sevenDaysLater),
    });
  }, []);

  const handlePredict = () => {
    if (!selectedProduct || !targetDate) return;

    setIsPredicting(true);

    const product = products.find((p) => p.id === selectedProduct);
    const productName = product ? product.name : "produk";

    setTimeout(() => {
      // Dummy logic sederhana
      const fakeSales = Math.floor(Math.random() * 30) + 5;

      setPredictionResult(fakeSales);
      setPredictedProductName(productName);
      setIsPredicting(false);
    }, 1500);
  };

  // Helper untuk cek apakah tanggal yang dipilih adalah hari ini
  const isToday = targetDate === dateRange.min;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-full flex flex-col font-admin-body">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-amber-700" />
          </div>
          <h3 className="font-bold text-stone-800 font-admin-heading">
            ML Sales Forecast
          </h3>
        </div>
        <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-100">
          AI MODEL READY
        </div>
      </div>

      <div className="p-6 space-y-5 flex-grow">
        {/* Product Selection */}
        <div className="space-y-2">
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-stone-600 flex items-center">
            <Package className="w-4 h-4 mr-2" /> Nama Produk
          </label>
          <select
            id={selectId}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-700">
            <option value="">-- Pilih Produk --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label
            htmlFor={dateId}
            className="text-sm font-medium text-stone-600 flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" /> Pilih Tanggal Prediksi
          </label>
          <input
            id={dateId}
            type="date"
            min={dateRange.min}
            max={dateRange.max}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all text-stone-700"
          />
          <p className="text-[10px] text-stone-400 italic">
            *Prediksi tersedia untuk hari ini hingga 7 hari kedepan.
          </p>
        </div>

        {/* Result Area */}
        <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center min-h-[140px]">
          {isPredicting ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-stone-500 animate-pulse">
                Menghitung Probabilitas...
              </p>
            </div>
          ) : predictionResult !== null ? (
            <div className="text-center space-y-1">
              <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                {isToday ? "PREDIKSI HARI INI" : "HASIL ANALISIS"}
              </p>
              <p className="text-stone-700 leading-relaxed">
                {isToday ? (
                  "Hari ini,"
                ) : (
                  <>
                    Pada tanggal{" "}
                    <span className="font-bold">
                      {new Date(targetDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    ,
                  </>
                )}
                <br />
                produk{" "}
                <span className="font-semibold text-stone-800">
                  {predictedProductName}
                </span>
                <br />
                diprediksi terjual{" "}
                <span className="text-3xl font-bold text-amber-700">
                  {predictionResult}
                </span>{" "}
                unit.
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-400 text-center italic px-6">
              Pilih produk dan tanggal untuk melihat estimasi penjualan.
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0 mt-auto">
        <button
          type="button"
          onClick={handlePredict}
          disabled={!selectedProduct || !targetDate || isPredicting}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#8b6f47", color: "white" }}>
          <Play
            className={`w-4 h-4 ${isPredicting ? "hidden" : "block"}`}
            fill="currentColor"
          />
          <span className="uppercase tracking-wider text-sm">
            {isPredicting ? "Analyzing..." : "Generate Forecast"}
          </span>
        </button>
      </div>
    </div>
  );
}
