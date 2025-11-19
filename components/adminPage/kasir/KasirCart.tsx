'use client';

import React, { useState } from 'react';
import { useKasir } from '@/app/contexts/KasirContext';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  MapPin,
  Percent,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Calculator,
  Receipt,
  X,
} from 'lucide-react';

export function KasirCart() {
  const {
    state,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemNote,
    clearCart,
    setCustomerName,
    setCustomerWhatsApp,
    setCustomerAddress,
    setPaymentMethod,
    setDiscount,
    setDiscountType,
    processPayment,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    calculateDiscountAmount
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
    // Validasi field wajib
    if (!state.customerName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }
    if (!state.customerWhatsApp.trim()) {
      alert('Nomor WhatsApp pelanggan wajib diisi!');
      return;
    }

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
  const discountAmount = calculateDiscountAmount();
  const total = calculateTotal();

  const paymentMethods = [
    { id: 'cash', label: 'Bayar Tunai', description: 'Bayar langsung saat pengiriman/pickup', icon: Banknote },
    { id: 'transfer', label: 'Transfer Bank', description: 'Transfer ke rekening toko', icon: Building },
    { id: 'gopay', label: 'GoPay', description: 'Pembayaran melalui GoPay', icon: Smartphone },
    { id: 'ovo', label: 'OVO', description: 'Pembayaran melalui OVO', icon: Smartphone },
    { id: 'dana', label: 'DANA', description: 'Pembayaran melalui DANA', icon: Smartphone }
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
            {state.cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {item.product.nama}
                    </h4>
                    
                    {/* Display customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-blue-600 font-medium">Kustomisasi:</p>
                        <ul className="text-xs text-gray-600 ml-2">
                          {item.customizations.map((custom, customIndex) => (
                            <li key={customIndex}>
                              • {custom.nama} {custom.harga_tambahan > 0 && `(+${formatPrice(custom.harga_tambahan)})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Display custom note */}
                    {item.note && (
                      <p className="text-xs text-gray-600 italic mb-2">
                        Catatan: {item.note}
                      </p>
                    )}
                    
                    <p className="text-orange-600 font-semibold text-sm">
                      {formatPrice(item.finalPrice || item.product.harga)}
                      {item.customizations && item.customizations.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          (termasuk kustomisasi)
                        </span>
                      )}
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
          {/* Customer Name - Wajib */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pelanggan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={state.customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Customer WhatsApp - Wajib */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={state.customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Customer Address - Opsional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Pengiriman (Opsional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={state.customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap pengiriman"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diskon
            </label>
            <div className="space-y-2">
              {/* Discount Type Selector */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDiscountType('nominal')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    state.discountType === 'nominal'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Rp
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    state.discountType === 'percentage'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  %
                </button>
              </div>
              
              {/* Discount Input */}
              <div className="relative">
                {state.discountType === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">Rp</span>
                )}
                <input
                  type="number"
                  value={state.discount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDiscount(0);
                    } else {
                      const numValue = Number(value);
                      if (state.discountType === 'percentage') {
                        // Batasi persentase maksimal 100%
                        setDiscount(Math.min(100, Math.max(0, numValue)));
                      } else {
                        // Batasi nominal tidak negatif
                        setDiscount(Math.max(0, numValue));
                      }
                    }
                  }}
                  placeholder={state.discountType === 'percentage' ? '0' : '0'}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  min="0"
                  max={state.discountType === 'percentage' ? '100' : undefined}
                />
              </div>
            </div>
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
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Diskon {state.discountType === 'percentage' ? `(${state.discount}%)` : ''}:
                </span>
                <span>-{formatPrice(discountAmount)}</span>
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
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ 
            backgroundColor: 'rgba(139, 111, 71, 0.1)', // Warna coklat muda yang soft
            backdropFilter: 'blur(2px)' // Efek blur halus
          }}
          onClick={() => setShowPaymentModal(false)} // Klik di backdrop untuk close
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
            style={{ borderColor: '#e0d5c7' }}
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
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
                <div className="p-6 border-b flex-shrink-0" style={{ borderColor: '#e0d5c7' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{ color: '#5d4037' }}>Proses Pembayaran</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" style={{ color: '#8b6f47' }} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Metode Pembayaran
                    </label>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              state.paymentMethod === method.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                state.paymentMethod === method.id
                                  ? 'bg-orange-100'
                                  : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  state.paymentMethod === method.id
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium ${
                                  state.paymentMethod === method.id
                                    ? 'text-orange-700'
                                    : 'text-gray-700'
                                }`}>
                                  {method.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {method.description}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                state.paymentMethod === method.id
                                  ? 'border-orange-500 bg-orange-500'
                                  : 'border-gray-300'
                              }`}>
                                {state.paymentMethod === method.id && (
                                  <div className="w-full h-full rounded-full bg-white border-2 border-orange-500"></div>
                                )}
                              </div>
                            </div>
                          </div>
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
