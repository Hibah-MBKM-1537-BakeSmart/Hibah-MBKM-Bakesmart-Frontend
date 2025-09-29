'use client';

import React, { useState } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Calculator,
  Receipt,
  X
} from 'lucide-react';

export function KasirCart() {
  const {
    state,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemNote,
    clearCart,
    setCustomerName,
    setPaymentMethod,
    setDiscount,
    processPayment,
    calculateSubtotal,
    calculateTax,
    calculateTotal
  } = useKasir();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      const success = await processPayment();
      if (success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          setProcessingPayment(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setProcessingPayment(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  const paymentMethods = [
    { id: 'cash', label: 'Tunai', icon: Banknote },
    { id: 'card', label: 'Kartu', icon: CreditCard },
    { id: 'digital', label: 'Digital', icon: Smartphone }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Keranjang ({state.cart.length})
          </h2>
          {state.cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 p-1"
              title="Kosongkan keranjang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4">
        {state.cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Keranjang masih kosong</p>
            <p className="text-sm text-gray-500">Pilih produk untuk ditambahkan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.cart.map((item) => (
              <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {item.product.nama}
                    </h4>
                    <p className="text-orange-600 font-semibold text-sm">
                      {formatPrice(item.product.harga)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 hover:text-red-700 p-1 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.product.harga * item.quantity)}
                  </span>
                </div>

                {/* Note Input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Catatan (opsional)"
                    value={item.note || ''}
                    onChange={(e) => updateCartItemNote(item.product.id, e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {state.cart.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pelanggan (Opsional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={state.customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diskon
            </label>
            <input
              type="number"
              value={state.discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Price Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (10%):</span>
              <span>{formatPrice(tax)}</span>
            </div>
            {state.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon:</span>
                <span>-{formatPrice(state.discount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-orange-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>Proses Pembayaran</span>
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
            {paymentSuccess ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Pembayaran Berhasil!
                </h3>
                <p className="text-gray-600 mb-4">
                  Transaksi telah diproses dengan sukses
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(total)}
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Proses Pembayaran</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                              state.paymentMethod === method.id
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Ringkasan Pesanan</h4>
                    <div className="space-y-2 text-sm">
                      {state.cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between">
                          <span>{item.quantity}x {item.product.nama}</span>
                          <span>{formatPrice(item.product.harga * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-semibold">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="text-orange-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      processingPayment
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {processingPayment ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
