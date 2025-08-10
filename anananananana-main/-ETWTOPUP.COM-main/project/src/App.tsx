import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { ProductList } from './components/ProductList';
import { PaymentModal } from './components/PaymentModal';
import { TopUpForm, GameProduct } from './types';
import { supabase } from './lib/supabase';
import storeConfig from './lib/config';
import { BannerSlider } from './components/BannerSlider';
import { PopupBanner } from './components/PopupBanner';

const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const ResellerPage = lazy(() => import('./pages/ResellerPage').then(module => ({ default: module.ResellerPage })));

interface MLBBValidationResponse {
  status?: 'success' | 'invalid';
  success?: boolean;
  message?: string;
  data?: {
    userName: string;
  };
  name?: string; // For Magic Chess API compatibility
}

const GameSelector: React.FC<{ onSelect: (game: 'mlbb' | 'mlbb_ph' | 'freefire' | 'magicchessgogo') => void }> = ({ onSelect }) => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="w-full mb-4 rounded-lg overflow-hidden">
        <img
          src="https://raw.githubusercontent.com/Cheagjihvg/jackstore-asssets/refs/heads/main/Untitled-1%20(1).png"
          alt="Banner"
          className="w-full h-auto max-h-48 sm:max-h-64 object-contain"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
        <div
          className="bg-[#232836] backdrop-blur-md border border-white/20 rounded-xl p-3 text-white transition-all duration-300 group cursor-pointer hover:bg-[#2c3242]"
          onClick={() => onSelect('mlbb')}
        >
          <img
            src="https://raw.githubusercontent.com/Cheagjihvg/feliex-assets/refs/heads/main/IMG_1324.JPG"
            alt="Mobile Legends"
            className="w-16 h-16 rounded-xl mx-auto mb-2 transform group-hover:scale-105 transition-transform"
          />
          <h3 className="text-base font-semibold text-center">Mobile Legends</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/40">
            Top Up Now
          </div>
        </div>
        <div
          className="bg-[#232836] backdrop-blur-md border border-white/20 rounded-xl p-3 text-white transition-all duration-300 group cursor-pointer hover:bg-[#2c3242]"
          onClick={() => onSelect('freefire')}
        >
          <img
            src="https://raw.githubusercontent.com/Cheagjihvg/feliex-assets/refs/heads/main/IMG_1225.JPG"
            alt="Free Fire"
            className="w-16 h-16 rounded-xl mx-auto mb-2 transform group-hover:scale-105 transition-transform"
          />
          <h3 className="text-base font-semibold text-center">Free Fire</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/40">
            Top Up Now
          </div>
        </div>
        <div
          className="bg-[#232836] backdrop-blur-md border border-white/20 rounded-xl p-3 text-white transition-all duration-300 group cursor-pointer hover:bg-[#2c3242]"
          onClick={() => onSelect('mlbb_ph')}
        >
          <img
            src="https://raw.githubusercontent.com/Cheagjihvg/feliex-assets/refs/heads/main/IMG_2707.PNG"
            alt="Mobile Legends PH"
            className="w-16 h-16 rounded-xl mx-auto mb-2 transform group-hover:scale-105 transition-transform"
          />
          <h3 className="text-base font-semibold text-center">Mobile Legends PH</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/40">
            Top Up Now
          </div>
        </div>
        <div
          className="bg-[#232836] backdrop-blur-md border border-white/20 rounded-xl p-3 text-white transition-all duration-300 group cursor-pointer hover:bg-[#2c3242]"
          onClick={() => onSelect('magicchessgogo')}
        >
          <img
            src="https://kiragamestore.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdhztk4abr%2Fimage%2Fupload%2Fv1746748767%2Fproducts%2Fdssblzg5q8u6rfkd98ok.png&w=256&q=75&dpl=dpl_ET82toPhxbv1P7PxmsrZSLqdx3XW"
            alt="Magic Chess GoGo"
            className="w-16 h-16 rounded-xl mx-auto mb-2 transform group-hover:scale-105 transition-transform"
          />
          <h3 className="text-base font-semibold text-center">Magic Chess GoGo</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/40">
            Top Up Now
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl opacity-70 cursor-not-allowed flex flex-col w-full max-w-[180px] mx-auto">
          <img
            src="https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf2nWqO7VaGKL10-G5UIygxED-WNOc3pg"
            alt="PUBG Mobile"
            className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover transition-transform duration-300 hover:scale-110"
          />
          <h3 className="text-base sm:text-lg font-bold text-white text-center leading-tight break-words hyphens-auto">PUBG Mobile</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-800 text-gray-400 cursor-not-allowed">
            អស់ស្តុក
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl opacity-70 cursor-not-allowed flex flex-col w-full max-w-[180px] mx-auto">
          <img
            src="https://raw.githubusercontent.com/Cheagjihvg/anajak-topup/refs/heads/main/512x512bb.jpg"
            alt="Honor of Kings"
            className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover transition-transform duration-300 hover:scale-110"
          />
          <h3 className="text-base sm:text-lg font-bold text-white text-center leading-tight break-words hyphens-auto">Honor of Kings</h3>
          <div className="mt-1 w-full py-2 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-300 bg-green-800 text-gray-400 cursor-not-allowed">
            អស់ស្តុក
          </div>
        </div>
      </div>
    </main>
  );
};

function App() {
  const [form, setForm] = useState<TopUpForm>(() => {
    const savedForm = localStorage.getItem('customerInfo');
    return savedForm ? JSON.parse(savedForm) : {
      userId: '',
      serverId: '',
      product: null,
      game: 'mlbb'
    };
  });
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderFormat, setOrderFormat] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<MLBBValidationResponse | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [formErrors, setFormErrors] = useState<{ userId?: string; serverId?: string }>({});
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isResellerRoute, setIsResellerRoute] = useState(false);
  const [isResellerLoggedIn, setIsResellerLoggedIn] = useState(false);
  const [showPopupBanner, setShowPopupBanner] = useState(true);
  const [paymentCooldown, setPaymentCooldown] = useState(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [priceRefreshInterval, setPriceRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (priceRefreshInterval) clearInterval(priceRefreshInterval);
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [priceRefreshInterval, cooldownInterval]);

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setIsAdminRoute(path === '/adminlogintopup');
      setIsResellerRoute(path === '/reseller');
      const resellerAuth = localStorage.getItem('jackstore_reseller_auth');
      setIsResellerLoggedIn(resellerAuth === 'true');
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  useEffect(() => {
    if (!isAdminRoute && !isResellerRoute) {
      fetchProducts(form.game);
      const interval = setInterval(() => fetchProducts(form.game), 3600000);
      setPriceRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [form.game, isAdminRoute, isResellerRoute]);

  useEffect(() => {
    if (form.userId || form.serverId) {
      localStorage.setItem('customerInfo', JSON.stringify({
        userId: form.userId,
        serverId: form.serverId,
        game: form.game,
        product: null
      }));
    }
  }, [form.userId, form.serverId, form.game]);

  const startPaymentCooldown = () => {
    setPaymentCooldown(7);
    if (cooldownInterval) clearInterval(cooldownInterval);
    const interval = setInterval(() => {
      setPaymentCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCooldownInterval(interval);
  };

  const handleNotify = (message: string) => {
    setSelectionMessage(message);
    setTimeout(() => setSelectionMessage(null), 3000);
  };

  const fetchProducts = async (game: 'mlbb' | 'mlbb_ph' | 'freefire' | 'magicchessgogo') => {
    setLoading(true);
    try {
      let data;
      let error;
      const isReseller = localStorage.getItem('jackstore_reseller_auth') === 'true';
      let tableName = '';
      if (game === 'mlbb') tableName = 'mlbb_products';
      else if (game === 'mlbb_ph') tableName = 'mlbb_ph_products';
      else if (game === 'freefire') tableName = 'freefire_products';
      else if (game === 'magicchessgogo') tableName = 'magicchessgogo_products';
      const response = await supabase.from(tableName).select('*').order('id', { ascending: true });
      data = response.data;
      error = response.error;
      if (error) throw error;
      let transformedProducts: GameProduct[] = data.map(product => ({
        id: product.id,
        name: product.name,
        diamonds: product.diamonds || undefined,
        price: product.price,
        currency: product.currency,
        type: product.type as 'diamonds' | 'subscription' | 'special',
        game: game,
        image: product.image || undefined,
        code: product.code || undefined,
        tagname: product.tagname || undefined
      }));
      if (isReseller) {
        const resellerPricesResponse = await supabase
          .from('reseller_prices')
          .select('*')
          .eq('game', game);
        if (!resellerPricesResponse.error && resellerPricesResponse.data) {
          const resellerPrices = resellerPricesResponse.data;
          transformedProducts = transformedProducts.map(product => {
            const resellerPrice = resellerPrices.find(rp => rp.product_id === product.id && rp.game === product.game);
            return resellerPrice ? { ...product, price: resellerPrice.price, resellerPrice: resellerPrice.price } : product;
          });
        }
      }
      setProducts(transformedProducts);
      if (form.product) {
        const updatedProduct = transformedProducts.find(p => p.id === form.product?.id);
        if (updatedProduct && updatedProduct.price !== form.product.price) {
          setForm(prev => ({ ...prev, product: updatedProduct }));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const validateAccount = async () => {
    if (!form.userId || !form.serverId || !['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game)) return;
    setValidating(true);
    setValidationResult(null);
    try {
      let apiUrl: string;
      if (form.game === 'mlbb_ph') {
        apiUrl = `https://api.isan.eu.org/nickname/ml?id=${form.userId}&zone=${form.serverId}`;
      } else if (form.game === 'mlbb') {
        apiUrl = `https://api.vibolshop.com/api_reseller/checkid_mlbb.php?userid=${form.userId}&zoneid=${form.serverId}`;
      } else if (form.game === 'magicchessgogo') {
        apiUrl = `https://valid.ihsangan.com/mcgg?id=${form.userId}&server=${form.serverId}`;
      } else {
        return;
      }
      const response = await axios.get(apiUrl, {
        responseType: 'json',
      });
      let validationResult: MLBBValidationResponse;
      if (form.game === 'mlbb_ph') {
        const jsonResponse = response.data as { success: boolean; name?: string; message?: string };
        if (jsonResponse.success) {
          validationResult = {
            status: 'success',
            success: true,
            data: { userName: jsonResponse.name },
          };
          setForm(prev => ({ ...prev, nickname: jsonResponse.name }));
        } else {
          validationResult = {
            status: 'invalid',
            success: false,
            message: jsonResponse.message || 'Invalid user ID or zone ID',
          };
        }
      } else if (form.game === 'magicchessgogo') {
        const jsonResponse = response.data as { success: boolean; name?: string; message?: string };
        if (jsonResponse.success) {
          validationResult = {
            status: 'success',
            success: true,
            data: { userName: jsonResponse.name },
          };
          setForm(prev => ({ ...prev, nickname: jsonResponse.name }));
        } else {
          validationResult = {
            status: 'invalid',
            success: false,
            message: jsonResponse.message || 'Invalid user ID or zone ID',
          };
        }
      } else {
        const jsonResponse = response.data as MLBBValidationResponse;
        if (jsonResponse.status === 'success') {
          validationResult = jsonResponse;
          setForm(prev => ({ ...prev, nickname: jsonResponse.data?.userName }));
        } else if (jsonResponse.status === 'invalid') {
          validationResult = {
            status: 'invalid',
            success: false,
            message: jsonResponse.message || 'Invalid user ID or server ID',
          };
        } else {
          validationResult = {
            status: 'error',
            success: false,
            message: 'Unexpected response from server',
          };
        }
      }
      setValidationResult(validationResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Failed to validate account:', errorMessage);
      setValidationResult({ success: false, message: 'Failed to validate account. Please try again.' });
    } finally {
      setValidating(false);
    }
  };

  const handleProductSelect = (product: GameProduct) => {
    setForm(prev => ({ ...prev, product }));
    handleNotify(`${product.diamonds || product.name} = $${product.price.toFixed(2)} Selected`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentCooldown > 0) {
      alert(`Please wait ${paymentCooldown} seconds before making another payment`);
      return;
    }
    const errors: { userId?: string; serverId?: string } = {};
    if (!form.userId?.trim()) errors.userId = 'User ID is required';
    if (!['freefire'].includes(form.game) && !form.serverId?.trim()) {
      errors.serverId = form.game === 'magicchessgogo' ? 'Zone ID is required' : 'Server ID is required';
    }
    if (!form.product) {
      alert('Please select a product');
      return;
    }
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    const currentProduct = products.find(p => p.id === form.product?.id);
    if (currentProduct && currentProduct.price !== form.product.price) {
      setForm(prev => ({ ...prev, product: currentProduct }));
      alert(`Product price has been updated from ${form.product.price} to ${currentProduct.price}. Please review before continuing.`);
      return;
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game)) {
      if (!validationResult) {
        alert('Please verify your account first');
        return;
      }
      if (validationResult.status !== 'success') {
        alert(validationResult.message || 'Account verification failed. Please check your User ID and Server/Zone ID.');
        return;
      }
    }
    const productIdentifier = form.product.code || form.product.diamonds || form.product.name;
    const format = ['freefire'].includes(form.game) ? `${form.userId} 0 ${productIdentifier}` : `${form.userId} ${form.serverId} ${productIdentifier}`;
    setOrderFormat(format);
    setShowCheckout(true);
  };

  const clearSavedInfo = () => {
    localStorage.removeItem('customerInfo');
    setForm({ userId: '', serverId: '', product: null, game: form.game });
    setValidationResult(null);
  };

  const handleClosePayment = () => {
    setShowCheckout(false);
    setShowPayment(false);
    startPaymentCooldown();
  };

  const handleGameSelect = (game: 'mlbb' | 'mlbb_ph' | 'freefire' | 'magicchessgogo') => {
    if (!storeConfig.games[game].enabled) {
      alert(storeConfig.games[game].maintenanceMessage || 'This game is currently unavailable');
      return;
    }
    setForm(prev => ({ ...prev, game }));
    setShowTopUp(true);
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Loader2 className="w-10 h-10 animate-spin text-green-500" />
          <span className="ml-2 text-gray-700">Loading admin panel...</span>
        </div>
      }>
        <AdminPage />
      </Suspense>
    );
  }

  if (isResellerRoute) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Loader2 className="w-10 h-10 animate-spin text-green-500" />
          <span className="ml-2 text-gray-700">Loading reseller panel...</span>
        </div>
      }>
        <ResellerPage onLogin={() => {
          setIsResellerLoggedIn(true);
          window.location.href = '/';
        }} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center flex flex-col font-khmer" style={{ backgroundColor: '#000000' }}>
      <nav className="bg-green-500 p-4 shadow-md flex items-center justify-between fixed w-full top-0 z-50" style={{
        height: '70px',
        backgroundImage: 'url("https://i.postimg.cc/jdfhhJKy/IMG-20250524-221013-479.png")',
        backgroundSize: '300px',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000000'
      }}>
        <a href="/" className="text-white hover:text-gray-200 bg-black/50 p-2 rounded-full">
          <img
            src="https://raw.githubusercontent.com/Cheagjihvg/anajak-topup/refs/heads/main/IMG_20250311_235159_486.png"
            alt="Logo"
            className="w-16 h-16 rounded-full"
          />
        </a>
      </nav>
      <div className="flex-grow">
        <div className="w-full p-4 m-0 mt-[120px]">
          <div className="rounded-lg overflow-hidden">
            <BannerSlider banners={storeConfig.banners} />
          </div>
        </div>
        {!showTopUp ? (
          <GameSelector onSelect={handleGameSelect} />
        ) : (
          <main className="container mx-auto px-4 py-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowTopUp(false);
                    setShowCheckout(false);
                    setSelectionMessage(null);
                  }}
                  className="text-white hover:text-gray-200 bg-green-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Games
                </button>
                {(form.userId || form.serverId) && (
                  <button
                    onClick={clearSavedInfo}
                    className="text-red-300 hover:text-red-200 bg-green-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Clear Saved Info
                  </button>
                )}
              </div>
              {selectionMessage && (
                <div className="fixed top-32 right-4 z-50 animate-slide-in sm:right-[calc(50%-384px+1rem)]">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium dangrek">{selectionMessage}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col space-y-6">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={
                      form.game === 'mlbb' || form.game === 'mlbb_ph'
                        ? "https://play-lh.googleusercontent.com/M9_okpLdBz0unRHHeX7FcZxEPLZDIQNCGEBoql7MxgSitDL4wUy4iYGQxfvqYogexQ"
                        : form.game === 'freefire'
                        ? "https://play-lh.googleusercontent.com/WWcssdzTZvx7Fc84lfMpVuyMXg83_PwrfpgSBd0IID_IuupsYVYJ34S9R2_5x57gHQ"
                        : "https://kiragamestore.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdhztk4abr%2Fimage%2Fupload%2Fv1746748767%2Fproducts%2Fdssblzg5q8u6rfkd98ok.png&w=256&q=75&dpl=dpl_ET82toPhxbv1P7PxmsrZSLqdx3XW"
                    }
                    alt={form.game === 'mlbb' || form.game === 'mlbb_ph' ? "Mobile Legends" : form.game === 'freefire' ? "Free Fire" : "Magic Chess GoGo"}
                    className="w-16 h-16 rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {form.game === 'mlbb' ? 'Mobile Legends (KH)' : form.game === 'mlbb_ph' ? 'Mobile Legends (PH)' : form.game === 'freefire' ? 'Free Fire' : 'Magic Chess GoGo'}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://raw.githubusercontent.com/Cheagjihvg/feliex-assets/refs/heads/main/48_-Protected_System-_Yellow-512-removebg-preview.png"
                          alt="Safety Guarantee"
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-green-300">Safety Guarantees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://raw.githubusercontent.com/Cheagjihvg/feliex-assets/refs/heads/main/IMG_1820.PNG"
                          alt="Instant Delivery"
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-green-300">Instant Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] p-4 border border-gray-700 shadow-sm rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-white">
                        {form.game === 'freefire' ? 'Free Fire ID' : 'User ID'}
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                        <input
                          type="number"
                          value={form.userId}
                          onChange={(e) => {
                            setForm(prev => ({ ...prev, userId: e.target.value, nickname: undefined }));
                            setValidationResult(null);
                            setFormErrors(prev => ({ ...prev, userId: undefined }));
                          }}
                          className="pl-9 w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-green-300 text-sm"
                          placeholder={`Enter your ${form.game === 'freefire' ? 'Free Fire ID' : 'User ID'}`}
                        />
                        {formErrors.userId && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.userId}</p>
                        )}
                      </div>
                    </div>
                    {form.game !== 'freefire' && (
                      <div>
                        <label className="block text-sm font-medium mb-1 text-white">
                          {form.game === 'magicchessgogo' ? 'Zone ID' : 'Server ID'}
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                          <input
                            type="number"
                            value={form.serverId}
                            onChange={(e) => {
                              setForm(prev => ({ ...prev, serverId: e.target.value, nickname: undefined }));
                              setValidationResult(null);
                              setFormErrors(prev => ({ ...prev, serverId: undefined }));
                            }}
                            className="pl-9 w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-green-300 text-sm"
                            placeholder={`Enter your ${form.game === 'magicchessgogo' ? 'Zone ID' : 'Server ID'}`}
                          />
                          {formErrors.serverId && (
                            <p className="text-red-400 text-xs mt-1">{formErrors.serverId}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game) && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={validateAccount}
                          disabled={!form.userId || !form.serverId || validating}
                          className="w-full max-w-[300px] bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm justify-center"
                        >
                          {validating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Check ID
                            </>
                          )}
                        </button>
                      </div>
                      {validationResult && (
                        <>
                          {validationResult.status === 'success' && validationResult.data?.userName && (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{validationResult.data.userName}</span>
                            </div>
                          )}
                          {validationResult.status === 'invalid' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                              <XCircle className="w-4 h-4" />
                              <span>{validationResult.message || 'Invalid user ID or server ID'}</span>
                            </div>
                          )}
                          {!validationResult.status && !validationResult.success && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                              <XCircle className="w-4 h-4" />
                              <span>{validationResult.message || 'Failed to validate account'}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-[#121212] p-4 border border-gray-700 shadow-sm rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    Select Package
                  </h3>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                      <span className="ml-2 text-white">Loading products...</span>
                    </div>
                  ) : (
                    <ProductList
                      products={products}
                      selectedProduct={form.product}
                      onSelect={handleProductSelect}
                      game={form.game}
                    />
                  )}
                </div>
                <div className="bg-[#121212] p-4 border border-gray-700 shadow-sm rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 11h16M4 15h6m2 0h2m2 0h2M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold text-base">Payment Method</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3" id="payment-grid">
                    <div
                      className={`relative cursor-pointer transition-all rounded-[7px] flex items-center gap-3 p-3 border hover:border-red-500 bg-white/70 ${selectedPayment === 'khqr' ? 'border-2 border-green-700' : 'border-gray-300'}`}
                      style={{ height: '65px' }}
                      data-payment-id="khqr"
                      onClick={() => handlePaymentSelect('khqr')}
                    >
                      <div className={`absolute top-[-2px] left-[-2px] w-8 h-8 bg-green-600 check-icon ${selectedPayment === 'khqr' ? '' : 'hidden'}`} style={{ clipPath: 'polygon(0px 0px, 100% 0px, 0px 100%)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="w-10 h-10 overflow-hidden rounded-[5px] shadow-sm">
                        <img src="https://raw.githubusercontent.com/Cheagjihvg/anajak-topup/main/img/KHQR.png" alt="KHQR" className="w-full h-full object-cover rounded-[5px]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">KHQR</p>
                        <p className="text-xs text-gray-600">Scan QR code to pay instantly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
        {showTopUp && (
          <div id="bottom-checkout" className="fixed bottom-0 inset-x-0 z-50 bg-[#121212] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-4 py-3 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                  <img
                    src="https://raw.githubusercontent.com/Cheagjihvg/anajak-topup/main/img/logo-sys.png"
                    alt="Diamond Icon"
                    className="w-11 h-11 rounded-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span id="selected-package-name" className="text-sm font-semibold text-white truncate max-w-[140px]">
                      {form.product ? form.product.diamonds || form.product.name : 'Select a package'}
                    </span>
                  </div>
                  <span id="selected-package-price" className="text-sm font-bold text-green-600">
                    {form.product ? `$${form.product.price.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
              </div>
              <button
                id="bottom-checkout-btn"
                onClick={handleSubmit}
                disabled={!form.product || paymentCooldown > 0 || (['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game) && validationResult?.status !== 'success') || !selectedPayment}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span id="bottom-checkout-btn-text">{paymentCooldown > 0 ? `Wait ${paymentCooldown}s` : 'Buy Now'}</span>
              </button>
            </div>
          </div>
        )}
        {showCheckout && (
          <PaymentModal
            form={form}
            orderFormat={orderFormat}
            onClose={handleClosePayment}
            discountPercent={discountPercent}
          />
        )}
        {storeConfig.popupBanner.enabled && showPopupBanner && (
          <PopupBanner
            image={storeConfig.popupBanner.image}
            onClose={() => setShowPopupBanner(false)}
          />
        )}
      </div>
      <div className="relative w-full h-[90px] overflow-hidden">
        <svg
          width="100%"
          className="hero-waves absolute top-0 left-0 z-10"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
        >
          <defs>
            <path
              id="wave-path"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            ></path>
          </defs>
          <g className="wave1">
            <use xlinkHref="#wave-path" x="50" y="3" fill="rgba(0, 128, 0, .1)" />
          </g>
          <g className="wave2">
            <use xlinkHref="#wave-path" x="50" y="0" fill="rgba(0, 128, 0, .2)" />
          </g>
          <g className="wave3">
            <use xlinkHref="#wave-path" x="50" y="4" fill="#008000" />
          </g>
        </svg>
      </div>
      <footer className="relative text-white py-12 md:py-16 overflow-hidden" style={{ backgroundColor: '#008000' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <img alt="logo" src={storeConfig.logoUrl} className="h-16 mb-4 rounded-full" />
                <p className="text-gray-300">
                  Experience seamless online game top-up services at ETW, offering unbeatable deals on popular titles like Mobile Legends, Free Fire, and more. Enjoy fast, secure, and reliable transactions.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <div className="space-y-2 text-gray-300">
                  <p>For inquiries, please contact us via Telegram (Chat only)</p>
                  <a
                    href={storeConfig.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Visit our support
                  </a>
                </div>
              </div>
              {isResellerLoggedIn && (
                <button
                  onClick={() => {
                    localStorage.removeItem('jackstore_reseller_auth');
                    localStorage.removeItem('jackstore_reseller_username');
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600/80 px-4 py-2 rounded-full transition-all duration-300"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                <div className="flex space-x-4 mb-6">
                  <a
                    href={storeConfig.fb}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02"></path>
                    </svg>
                  </a>
                  <a
                    href=""
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-300 hover:text-pink-500 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
                    </svg>
                  </a>
                  <a
                    href=""
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-300 hover:text-black transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.321 5.562a5 5 0 0 1-.443-.258a6.2 6.2 0 0 1-1.137-.966c-.849-.971-1.166-1.956-1.282-2.645h.004c-.097-.573-.057-.943-.05-.943h-3.865v14.943q.002.3-.008.595l-.004.073q0 .016-.003.033v.009a3.28 3.28 0 0 1-1.65 2.604a3.2 3.2 0 0 1-1.6.422c-1.8 0-3.26-1.468-3.26-3.281s1.46-3.282 3.26-3.282c.341 0 .68.054 1.004.16l.005-3.936a7.18 7.18 0 0 0-5.532 1.62a7.6 7.6 0 0 0-1.655 2.04c-.163.281-.779 1.412-.853 3.246c-.047 1.04.266 2.12.415 2.565v.01c.093.262.457 1.158 1.049 1.913a7.9 7.9 0 0 0 1.674 1.58v-.01l.009.01c1.87 1.27 3.945 1.187 3.945 1.187c.359-.015 1.562 0 2.928-.647c1.515-.718 2.377-1.787 2.377-1.787a7.4 7.4 0 0 0 1.296-2.153c.35-.92.466-2.022.466-2.462V8.273c.047.028.672.441.672.441s.9.577 2.303.952c1.006.267 2.363.324 2.363.324V6.153c-.475.052-1.44-.098-2.429-.59"></path>
                    </svg>
                  </a>
                  <a
                    href={storeConfig.channelUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.50c-.94-.65-.33-1.01.21-1.59c.14-.15 2.71-2.48 2.76-2.69c.01-.05.01-.1-.02-.14c-.04-.05-.10-.03-.14-.02c-.06.02-1.49.95-4.22 2.79c-.40.27-.76.41-1.08.40c-.36-.01-1.04-.20-1.55-.37c-.63-.20-1.13-.31-1.09-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.12.27"></path>
                    </svg>
                  </a>
                </div>
                <h4 className="text-lg font-semibold mb-2">Legal</h4>
                <button
                  onClick={() => document.getElementById('terms-modal').classList.remove('hidden')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Terms & Conditions
                </button>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">We Accept:</h4>
                <div className="flex items-center space-x-4">
                  <img
                    alt="KHQR"
                    src="https://raw.githubusercontent.com/Cheagjihvg/svg/aee1480802998cec595324cb335444a14b4a48ea/khqr.svg"
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-6 mt-6">
            <div className="text-center text-gray-400 text-sm">
              <p>{storeConfig.footer.copyright}</p>
              <p className="mt-1">
                Developed by:{" "}
                <a
                  href={storeConfig.fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ETW
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
      <div id="terms-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto dangrek">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 concert-one-regular">Terms & Conditions</h2>
          <div className="text-gray-300 text-sm md:text-base space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Payment Agreement</h3>
              <p>By choosing to make a payment, you acknowledge and agree to the following terms:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Agreement Acceptance:</strong> When you initiate a payment, it is understood that you fully accept and abide by the terms and policies outlined here.</li>
                <li><strong>No Refunds for Diamond Top-ups Success:</strong> We do not offer refunds for diamond top-ups success. If your top-up is in pending status for under 5 hours, we will refund the money.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Refund Policy</h3>
              <p>In the event of a refund request, please be aware of the following conditions:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Refund Eligibility:</strong> Refunds are available only for top-ups that are not successful or are pending for under 5 hours, under specific circumstances, and eligibility will be determined on a case-by-case basis.</li>
                <li><strong>Processing Time:</strong> Refund processing may take up to 3 business days from the date of approval.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Fraud Prevention</h3>
              <p>We take fraud prevention seriously to ensure a secure environment for all users. If there are suspicions of scam or cheating:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Verification Process:</strong> To address potential fraudulent activities, you may be required to verify your identity by providing an ID and recording a video explaining the issue.</li>
                <li><strong>Resolution Time:</strong> The resolution process for fraud-related cases may extend up to 48 hours.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Changes to Terms and Conditions</h3>
              <p>Any changes will be effective immediately upon posting on the website.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>User Acknowledgment:</strong> Continued use of our services after any changes constitutes acceptance of the new terms and conditions. Users are encouraged to review the terms regularly.</li>
                <li><strong>Discontinuation of Services:</strong> We reserve the right to discontinue any aspect of our services at any time, including the sale of diamonds, without prior notice.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">5. Privacy Policy</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Data Collection:</strong> We collect and store personal information provided by users during registration and transactions. This information is used solely for providing and improving our services.</li>
                <li><strong>Data Security:</strong> We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</li>
                <li><strong>Third-Party Services:</strong> Our website may contain links to third-party services. We are not responsible for the privacy practices or content of these services.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">6. Governing Law and Dispute Resolution</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Governing Law:</strong> These terms and conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is registered.</li>
                <li><strong>Dispute Resolution:</strong> Any disputes arising from or relating to these terms and conditions shall be resolved through binding arbitration in accordance with the rules of the relevant arbitration body. The arbitration decision shall be final and binding on both parties.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">7. Contact Information</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Customer Support:</strong> For any questions or concerns regarding these terms and conditions, users can contact our customer support team via the contact details provided on the website.</li>
                <li><strong>Business Hours:</strong> Our customer support team is available during business hours as listed on the website. Responses to inquiries may take up to 48 hours.</li>
              </ul>
            </div>
            <p>Thank you for your understanding and cooperation.</p>
          </div>
          <button
            onClick={() => document.getElementById('terms-modal').classList.add('hidden')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition-all duration-300 dangrek"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
