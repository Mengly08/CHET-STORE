import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { Loader2, XCircle, ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { ProductList } from './components/ProductList';
import { PaymentModal } from './components/PaymentModal';
import { BannerSlider } from './components/BannerSlider';
import { PopupBanner } from './components/PopupBanner';
import { supabase } from './lib/supabase';
import storeConfig from './lib/config';
import { GameProduct, TopUpForm, MLBBValidationResponse } from './types';
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const ResellerPage = lazy(() => import('./pages/ResellerPage').then(module => ({ default: module.ResellerPage })));
const Header = () => (
  <nav className="bg-[#f7d365] text-white p-3 shadow-lg sticky top-0 z-50">
    <div className="flex items-center justify-between w-full max-w-[422px] mx-auto">
      <div className="flex-shrink-0">
        <button className="text-black hover:text-gray-700 focus:outline-none p-1" aria-label="Open menu">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeWidth="2">
            <path d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
      <div className="flex-1 flex justify-center">
        <span className="text-lg font-bold text-black whitespace-nowrap khmer-font">CHA KVAI STORE</span>
      </div>
      <div className="flex-shrink-0">
        <a href="/" className="text-black hover:text-gray-700 transition-colors p-1 block" aria-label="Home">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 8C22.1046 8 23 8.89543 23 10V14C23 15.1046 22.1046 16 21 16H19.9381C19.446 19.9463 16.0796 23 12 23V21C15.3137 21 18 18.3137 18 15V9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9V16H3C1.89543 16 1 15.1046 1 14V10C1 8.89543 1.89543 8 3 8H4.06189C4.55399 4.05369 7.92038 1 12 1C16.0796 1 19.446 4.05369 19.9381 8H21ZM15.5 15a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"></path>
          </svg>
        </a>
      </div>
    </div>
  </nav>
);
const gameConfig = {
  mlbb: {
    name: 'Mobile legend KH',
    image: 'https://dinotopup.com/assets/thumbnail/09fefb01ece6b4dc30caf14da82658d3e4b095e7.webp',
    tableName: 'mlbb_products',
    apiUrl: 'https://api.vibolshop.com/api_reseller/checkid_mlbb.php?userid={userId}&zoneid={serverId}',
    requiresServerId: true,
    enabled: true,
  },
  mlbb_ph: {
    name: 'Mobile Legends PH',
    image: 'https://dinotopup.com/assets/thumbnail/dbpsroyf1mso95otl5ds%20(1).webp',
    tableName: 'mlbb_ph_products',
    apiUrl: 'https://api.isan.eu.org/nickname/ml?id={userId}&zone={serverId}',
    requiresServerId: true,
    enabled: true,
  },
  freefire: {
    name: 'Free Fire',
    image: 'https://play-lh.googleusercontent.com/sKh_B4ZLfu0jzqx9z98b2APe2rxDb8dIW-QqFHyS3cpzDK2Qq8tAbRAz3rXzOFtdAw',
    tableName: 'freefire_products',
    requiresServerId: false,
    enabled: true,
  },
  magicchessgogo: {
    name: 'Magic Chess GoGo',
    image: 'https://dinotopup.com/assets/thumbnail/636752d662ac725bf1da0b5e9e813c9cff582086.jpeg',
    tableName: 'magicchessgogo_products',
    apiUrl: 'https://valid.ihsangan.com/mcgg?id={userId}&server={serverId}',
    requiresServerId: true,
    enabled: true,
  },
  pubg: {
    name: 'PUBG Mobile',
    image: 'https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf2nWqO7VaGKL10-G5UIygxED-WNOc3pg',
    tableName: 'pubg_products',
    requiresServerId: false,
    enabled: false,
  },
  honorofkings: {
    name: 'Honor of Kings',
    image: 'https://raw.githubusercontent.com/Cheagjihvg/anajak-topup/refs/heads/main/512x512bb.jpg',
    tableName: 'honorofkings_products',
    requiresServerId: false,
    enabled: false,
  },
};
const hardcodedProducts = [
  { id: 1, name: 'Weekly Pass', price: 1.34, diamonds: null, type: 'subscription', game: 'mlbb' },
  { id: 2, name: 'Weekly Pass x2', price: 2.75, diamonds: null, type: 'subscription', game: 'mlbb' },
  { id: 3, name: 'Weekly Pass x5', price: 6.85, diamonds: null, type: 'subscription', game: 'mlbb' },
  { id: 4, name: '86 DM + Weekly', price: 2.86, diamonds: '86', type: 'diamonds', game: 'mlbb' },
  { id: 5, name: '257 DM + Weekly', price: 4.95, diamonds: '257', type: 'diamonds', game: 'mlbb' },
  { id: 6, name: '55 DM', price: 0.79, diamonds: '55', type: 'diamonds', game: 'mlbb' },
  { id: 7, name: '86 DM', price: 1.90, diamonds: '86', type: 'diamonds', game: 'mlbb' },
  { id: 8, name: '165 DM', price: 2.15, diamonds: '165', type: 'diamonds', game: 'mlbb' },
  { id: 9, name: '172 DM', price: 2.20, diamonds: '172', type: 'diamonds', game: 'mlbb' },
  { id: 10, name: '257 DM', price: 3.30, diamonds: '257', type: 'diamonds', game: 'mlbb' },
  { id: 11, name: '429 DM', price: 5.50, diamonds: '429', type: 'diamonds', game: 'mlbb' },
  { id: 12, name: '514 DM', price: 6.50, diamonds: '514', type: 'diamonds', game: 'mlbb' },
  { id: 13, name: '565 DM', price: 6.95, diamonds: '565', type: 'diamonds', game: 'mlbb' },
  { id: 14, name: '600 DM', price: 7.50, diamonds: '600', type: 'diamonds', game: 'mlbb' },
];
const diamondCombinations = {
  '86': { total: '86', breakdown: '86+0bonus' },
  '172': { total: '172', breakdown: '172+0bonus' },
  '257': { total: '257', breakdown: '257+0bonus' },
  '343': { total: '343', breakdown: '257+86bonus' },
  '429': { total: '429', breakdown: '257+172bonus' },
  '514': { total: '514', breakdown: '514+0bonus' },
  '600': { total: '600', breakdown: '514+86bonus' },
  '706': { total: '706', breakdown: '706+0bonus' },
  '792': { total: '792', breakdown: '706+86bonus' },
  '878': { total: '878', breakdown: '706+172bonus' },
  '963': { total: '963', breakdown: '706+257bonus' },
  '1049': { total: '1049', breakdown: '963+86bonus' },
  '1135': { total: '1135', breakdown: '963+172bonus' },
  '1220': { total: '1220', breakdown: '963+257bonus' },
  '1412': { total: '1412', breakdown: '1412+0bonus' },
  '1584': { total: '1584', breakdown: '1412+172bonus' },
  '1756': { total: '1756', breakdown: '1412+344bonus' },
  '1926': { total: '1926', breakdown: '1412+514bonus' },
  '2195': { total: '2195', breakdown: '2195+0bonus' },
  '2384': { total: '2384', breakdown: '2195+189bonus' },
  '2637': { total: '2637', breakdown: '2195+442bonus' },
  '2810': { total: '2810', breakdown: '2195+615bonus' },
};
const App: React.FC = () => {
  const [form, setForm] = useState<TopUpForm>(() => {
    const savedForm = sessionStorage.getItem('customerInfo');
    return savedForm ? JSON.parse(savedForm) : {
      userId: '',
      serverId: '',
      product: null,
      game: 'mlbb',
      nickname: undefined,
    };
  });
  const [showTopUp, setShowTopUp] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderFormat, setOrderFormat] = useState('');
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
  const [isPaymentSelected, setIsPaymentSelected] = useState(false);
  const [validationResult, setValidationResult] = useState<MLBBValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const blogBoxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleBlogs, setVisibleBlogs] = useState<boolean[]>([false, false, false]);

  const formatItemDisplay = (product: GameProduct | null) => {
    if (!product) return 'None';
    const identifier = product.diamonds || product.name;
    const combo = diamondCombinations[identifier];
    if (!combo) return identifier;
    return combo.breakdown.endsWith('+0bonus') ? combo.total : `${combo.total} (${combo.breakdown})`;
  };

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setIsAdminRoute(path === '/adminlogintopup');
      setIsResellerRoute(path === '/reseller');
      const resellerAuth = sessionStorage.getItem('jackstore_reseller_auth');
      setIsResellerLoggedIn(resellerAuth === 'true');
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  useEffect(() => {
    if (!isAdminRoute && !isResellerRoute) {
      fetchProducts(form.game);
    }
  }, [form.game, isAdminRoute, isResellerRoute]);

  useEffect(() => {
    if (form.userId || form.serverId) {
      sessionStorage.setItem('customerInfo', JSON.stringify({
        userId: form.userId,
        serverId: form.serverId,
        game: form.game,
        product: null,
      }));
    }
  }, [form.userId, form.serverId, form.game]);

  useEffect(() => {
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [cooldownInterval]);

  useEffect(() => {
    const observers = blogBoxRefs.current.map((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleBlogs(prev => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(ref);
        return observer;
      }
      return null;
    });
    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

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

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProducts = async (game: keyof typeof gameConfig) => {
    setLoading(true);
    try {
      const { tableName } = gameConfig[game];
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      let transformedProducts: GameProduct[] = data.map(product => ({
        id: product.id,
        name: product.name,
        diamonds: product.diamonds || undefined,
        price: product.price,
        currency: product.currency,
        type: product.type as 'diamonds' | 'subscription' | 'special',
        game,
        image: product.image || undefined,
        code: product.code || undefined,
        tagname: product.tagname || undefined,
      }));
      if (sessionStorage.getItem('jackstore_reseller_auth') === 'true') {
        const { data: resellerPrices, error: resellerError } = await supabase
          .from('reseller_prices')
          .select('*')
          .eq('game', game);
        if (!resellerError && resellerPrices) {
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
          showNotification(`Price for ${updatedProduct.name} updated to $${updatedProduct.price.toFixed(2)}`, 'error');
        }
      }
    } catch (error) {
      showNotification('Failed to load products. Using fallback data.', 'error');
      setProducts(hardcodedProducts.filter(p => p.game === game));
    } finally {
      setLoading(false);
    }
  };

  const validateAccount = async () => {
    if (!form.userId || (gameConfig[form.game].requiresServerId && !form.serverId) || !['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game)) {
      showNotification('Please enter valid User ID and Server/Zone ID', 'error');
      return;
    }
    setValidating(true);
    setValidationResult(null);
    try {
      const { apiUrl } = gameConfig[form.game];
      const url = apiUrl.replace('{userId}', form.userId).replace('{serverId}', form.serverId);
      const response = await axios.get(url, { responseType: 'json' });
      let validationResult: MLBBValidationResponse;
      if (form.game === 'mlbb_ph') {
        const jsonResponse = response.data as { success: boolean; name?: string; message?: string };
        if (jsonResponse.success) {
          validationResult = { status: 'success', success: true, data: { userName: jsonResponse.name } };
          setForm(prev => ({ ...prev, nickname: jsonResponse.name }));
        } else {
          validationResult = { status: 'invalid', success: false, message: jsonResponse.message || 'Invalid user ID or zone ID' };
        }
      } else if (form.game === 'magicchessgogo') {
        const jsonResponse = response.data as { success: boolean; name?: string; message?: string };
        if (jsonResponse.success) {
          validationResult = { status: 'success', success: true, data: { userName: jsonResponse.name } };
          setForm(prev => ({ ...prev, nickname: jsonResponse.name }));
        } else {
          validationResult = { status: 'invalid', success: false, message: jsonResponse.message || 'Invalid user ID or zone ID' };
        }
      } else {
        const jsonResponse = response.data as MLBBValidationResponse;
        if (jsonResponse.status === 'success') {
          validationResult = jsonResponse;
          setForm(prev => ({ ...prev, nickname: jsonResponse.data?.userName }));
        } else {
          validationResult = { status: 'invalid', success: false, message: jsonResponse.message || 'Invalid user ID or server ID' };
        }
      }
      setValidationResult(validationResult);
      showNotification(validationResult.success ? `Account verified: ${validationResult.data?.userName}` : validationResult.message || 'Account verification failed', validationResult.success ? 'success' : 'error');
    } catch (error) {
      showNotification('Failed to validate account. Please try again.', 'error');
      setValidationResult({ success: false, message: 'Failed to validate account. Please try again.' });
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentCooldown > 0) {
      showNotification(`Please wait ${paymentCooldown} seconds before making another payment`, 'error');
      return;
    }
    const errors: { userId?: string; serverId?: string } = {};
    if (!form.userId?.trim()) errors.userId = 'User ID is required';
    if (gameConfig[form.game].requiresServerId && !form.serverId?.trim()) {
      errors.serverId = form.game === 'magicchessgogo' ? 'Zone ID is required' : 'Server ID is required';
    }
    if (!form.product) {
      showNotification('Please select a product', 'error');
      return;
    }
    if (!isPaymentSelected) {
      showNotification('Please select a payment method', 'error');
      return;
    }
    const currentProduct = products.find(p => p.id === form.product?.id);
    if (currentProduct && currentProduct.price !== form.product.price) {
      setForm(prev => ({ ...prev, product: currentProduct }));
      showNotification(`Product price updated to $${currentProduct.price.toFixed(2)}. Please review.`, 'error');
      return;
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game) && (!validationResult || validationResult.status !== 'success')) {
      showNotification('Please verify your account first', 'error');
      return;
    }
    const productIdentifier = form.product.code || form.product.diamonds || form.product.name;
    const format = gameConfig[form.game].requiresServerId ? `${form.userId} ${form.serverId} ${productIdentifier}` : `${form.userId} 0 ${productIdentifier}`;
    setOrderFormat(format);
    const now = new Date();
    const tranId = `2025${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const paymentForm = document.getElementById('aba_merchant_request') as HTMLFormElement;
    paymentForm.querySelector('input[name="req_time"]')!.value = tranId;
    paymentForm.querySelector('input[name="tran_id"]')!.value = tranId;
    paymentForm.querySelector('input[name="amount"]')!.value = form.product ? form.product.price.toFixed(2) : '0';
    paymentForm.querySelector('input[name="return_params"]')!.value = JSON.stringify({
      accountId: form.userId,
      serverId: form.serverId,
      transactionId: tranId,
      amount: form.product ? form.product.price : 0,
      bundles: {},
      products: [{ id: form.product ? form.product.id : '' }],
    });
    paymentForm.submit();
    setShowCheckout(true);
  };

  const clearSavedInfo = () => {
    sessionStorage.removeItem('customerInfo');
    setForm({ userId: '', serverId: '', product: null, game: form.game, nickname: undefined });
    setValidationResult(null);
    showNotification('Saved info cleared', 'success');
  };

  const handleProductSelect = (product: GameProduct) => {
    setForm(prev => ({ ...prev, product }));
    showNotification(`${formatItemDisplay(product)} = $${product.price.toFixed(2)} Selected`, 'success');
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <span className="ml-2 text-white">Loading admin panel...</span>
        </div>
      }>
        <AdminPage />
      </Suspense>
    );
  }

  if (isResellerRoute) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <span className="ml-2 text-white">Loading reseller panel...</span>
        </div>
      }>
        <ResellerPage onLogin={() => {
          sessionStorage.setItem('jackstore_reseller_auth', 'true');
          setIsResellerLoggedIn(true);
          window.location.href = '/';
        }} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col relative overflow-x-hidden font-khmer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&family=Poppins:wght@400;500;600&display=swap');
        .khmer-font { font-family: 'Noto Sans Khmer', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .section-number {
          width: 32px;
          height: 32px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: bold;
          color: #297aa2;
          margin-right: 8px;
        }
        .user-info-section {
          background-color: #121212;
          border-radius: 8px;
          padding: 16px;
          width: 100%;
          max-width: 422px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #4b5563;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .user-info-section input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #4b5563;
          padding: 8px 12px 8px 36px;
          background-color: #1f2937;
          color: #ffffff;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .user-info-section input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 4px;
        }
        .payment-section {
          background-color: #121212;
          border: 1px solid #4b5563;
          border-radius: 8px;
          padding: 12px;
          width: 100%;
          max-width: 422px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 12px auto;
        }
        .game-container {
          display: grid;
          grid-template-columns: repeat(3, 107px);
          gap: 12px;
          max-width: 351px;
          margin: 0 auto;
          padding: 10px 5px;
          justify-content: center;
        }
        .game-card {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #333;
          width: 107px;
          height: 134px;
        }
        .game-card.enabled {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .game-card.enabled:hover { transform: scale(1.05); }
        .game-card.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .game-card img { width: 100%; height: 100%; object-fit: cover; }
        .game-name {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #ffd700;
          color: #1a1a1a;
          text-align: center;
          padding: 3px 0;
          font-size: 10px;
          font-weight: bold;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .coming-soon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: #ffffff;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 8px;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .mlbb-container11 {
          display: flex;
          align-items: center;
          background-color: transparent;
          padding: 16px;
          border-radius: 8px;
          margin: 12px 0;
          gap: 12px;
        }
        .mlbb-image13 {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        .mlbb-container12 {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mlbb-text18 {
          font-size: 1.4em;
          font-weight: bold;
          color: #ffffff;
        }
        .mlbb-container13 {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mlbb-icon20 {
          width: 16px;
          height: 16px;
        }
        .mlbb-text19 {
          font-size: 0.875rem;
          color: #d1d5db;
        }
        .nav-container {
          display: flex;
          justify-content: center;
          margin: 5px 0 16px 0;
          width: 100%;
          max-width: 422px;
          margin: 0 auto;
        }
        .nav-container > div {
          width: 100%;
          max-width: 422px;
          height: 50px;
        }
        .nav-container .flex {
          justify-content: space-between;
          height: 100%;
          align-items: center;
        }
        .payment-group {
          display: flex;
          gap: 4px;
        }
        .social-group {
          display: flex;
          gap: 4px;
        }
        .payment-method {
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #4b5563;
          background-color: #1f2937;
          height: 65px;
        }
        .payment-method.selected { border-color: #ffd700; }
        .checkmark {
          position: absolute;
          top: -2px;
          left: -2px;
          width: 20px;
          height: 20px;
          background-color: #ffd700;
          clip-path: polygon(0px 0px, 100% 0px, 0px 100%);
        }
        .fixed-payment-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          max-width: 422px;
          margin: 0 auto;
          background-color: #121212;
          border: 1px solid #4b5563;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .pay-line {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .pay-line {
            flex-direction: row;
            align-items: center;
          }
        }
        .price {
          width: 100%;
          text-align: center;
        }
        @media (min-width: 640px) {
          .price { width: 50%; }
        }
        .pay-button {
          width: 100%;
        }
        @media (min-width: 640px) {
          .pay-button { width: 50%; }
        }
        .section-spacing { margin-bottom: 24px; }
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background-color: #1f2937;
          color: #ffffff;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .notification.success { border-left: 4px solid #ffd700; }
        .notification.error { border-left: 4px solid #ef4444; }
        .blog-section {
          max-width: 422px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .blog-section h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ffd700;
          margin-bottom: 16px;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .blog-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .blog-box {
          background-color: #1f2937;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
        }
        .blog-box:hover {
          transform: scale(1.05);
        }
        .blog-box img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        @media (max-width: 422px) {
          .blog-box img {
            height: 150px;
          }
        }
        .blog-box .author {
          position: absolute;
          top: 8px;
          left: 8px;
          background-color: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .blog-box .text-box {
          padding: 16px;
        }
        .blog-box .title {
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 8px;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .blog-box .title a {
          color: #ffffff;
          text-decoration: none;
        }
        .blog-box .title a:hover {
          color: #ffd700;
        }
        .blog-box .date {
          font-size: 12px;
          color: #d1d5db;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .slide-in {
          animation: slideIn 0.8s ease-out forwards;
        }
        .footer-container {
          max-width: 422px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .feature-card {
          background-color: #1f2937;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform-style: preserve-3d;
        }
        .feature-card:hover {
          transform: translateY(-5px) rotateY(5deg);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }
        .feature-card .icon-circle {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffd700;
          border-radius: 50%;
          margin-bottom: 8px;
        }
        .feature-card .icon-circle svg {
          width: 24px;
          height: 24px;
          stroke: #ffffff;
          stroke-width: 2;
        }
        .feature-title {
          color: #ffd700;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .feature-desc {
          color: #d1d5db;
          font-size: 12px;
          line-height: 1.4;
        }
        .social-icon {
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .social-icon:hover {
          transform: scale(1.2);
          color: #f9d43d;
        }
        @media (max-width: 422px) {
          .feature-card .icon-circle {
            width: 36px;
            height: 36px;
          }
          .feature-card .icon-circle svg {
            width: 18px;
            height: 18px;
          }
          .feature-title {
            font-size: 12px;
          }
          .feature-desc {
            font-size: 10px;
          }
          .blog-box .title {
            font-size: 14px;
          }
          .blog-box .date {
            font-size: 10px;
          }
        }
        @media (min-width: 640px) {
          .feature-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .telegram-floating-button {
          position: fixed;
          bottom: 28px;
          right: 16px;
          z-index: 1000;
          background-color: #0088cc;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        .telegram-floating-button:hover {
          opacity: 0.8;
        }
        .telegram-floating-button svg {
          width: 32px;
          height: 32px;
          fill: #ffffff;
        }
        /* Enhanced Styles for Popular Section */
        .popular-section {
          max-width: 422px;
          margin: 0 auto;
          padding: 16px;
          background: linear-gradient(180deg, #1f2937 0%, #121212 100%);
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }
        .popular-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #ffd700, #f9d43d);
        }
        .popular-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .popular-header h2 {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffd700;
          font-family: 'Noto Sans Khmer', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .popular-header p {
          font-size: 0.65rem;
          color: #d1d5db;
          line-height: 1.2;
          font-family: 'Noto Sans Khmer', sans-serif;
        }
        .popular-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, auto);
          gap: 3px;
        }
        @media (min-width: 640px) {
          .popular-grid {
            gap: 4px;
          }
        }
        .popular-card {
          display: flex;
          align-items: center;
          gap-x-1.5;
          rounded-xl;
          bg-murky-600;
          p-1.5;
          duration-300;
          ease-in-out;
          hover:shadow-2xl;
          hover:ring-2;
          hover:ring-primary-500;
          hover:ring-offset-2;
          hover:ring-offset-murky-800;
          md:gap-x-3;
          md:rounded-2xl;
          md:p-3;
          bg-murky-800;
        }
        .popular-card img {
          aspect-square;
          h-14;
          w-14;
          rounded-lg;
          !object-cover;
          !object-center;
          ring-1;
          ring-murky-600;
          md:h-20;
          md:w-20;
          md:rounded-xl;
        }
        .popular-card .relative {
          flex;
          w-full;
          flex-col;
        }
        .popular-card h2 {
          w-[100px];
          truncate;
          text-white;
          font-semibold;
          sm:w-[200px];
          md:w-[275px];
          md:text-base;
        }
        .popular-card p {
          text-white;
          md:text-sm;
        }
        .melpaSlideUp {
          animation-delay: 0s;
        }
        @keyframes melpaSlideUp {
          from {
            opacity: 0;
            transform: translateY(50%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .melpaSlideUp {
          animation: melpaSlideUp 0.5s ease-out forwards;
        }
        .bg-nvd {
          background: transparent;
        }
        .neverzoom {
          pointer-events: none;
        }
        .bg-murky-600 {
          background-color: #1a1a1a;
        }
        .bg-murky-800 {
          background-color: #121212;
        }
        .ring-murky-600 {
          --tw-ring-color: #1a1a1a;
        }
        .hover\:ring-offset-murky-800:hover {
          --tw-ring-offset-color: #121212;
        }
        .hover\:ring-primary-500:hover {
          --tw-ring-color: #ffd700;
        }
        .text-white {
          font-size: 0.625rem;
        }
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
        .skeleton-loader {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, auto);
          gap: 2px;
          margin-top: 12px;
        }
        @media (min-width: 640px) {
          .skeleton-loader {
            gap: 4px;
          }
        }
        .ph-item.skeleton-populer {
          background: linear-gradient(90deg, #2d3748 25%, #4a5568 37%, #2d3748 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
          height: 80px;
          border-radius: 10px;
          border: 2px solid #ffd700;
        }
      `}</style>
      <Header />
      {notification && (
        <div className={`notification ${notification.type}`}>
          <CheckCircle2 className={`w-5 h-5 ${notification.type === 'success' ? 'text-yellow-500' : 'text-red-500'}`} />
          <span className="text-sm khmer-font">{notification.message}</span>
        </div>
      )}
      <div className="flex-grow">
        <div className="container mx-auto px-2 py-3">
          <div className="bg-[#0a86aa] rounded-2xl shadow-xl overflow-hidden max-w-[422px] mx-auto">
            <BannerSlider banners={storeConfig.banners} />
          </div>
        </div>
        {showTopUp ? (
          <main className="container mx-auto px-2 py-3 max-w-[422px]">
            <div className="header py-1 section-spacing">
              <img
                src="https://raw.githubusercontent.com/Cheagjihvg/jackstore-asssets/refs/heads/main/Untitled-1%20(1).png"
                alt="Banner"
                className="w-full h-auto max-h-40 object-contain max-w-[422px] mx-auto"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 section-spacing">
              <button
                onClick={() => {
                  setShowTopUp(false);
                  setShowCheckout(false);
                }}
                className="text-white hover:text-gray-300 transition-colors text-sm flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg khmer-font"
                aria-label="Back to game selection"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Games
              </button>
              {(form.userId || form.serverId) && (
                <button
                  onClick={clearSavedInfo}
                  className="text-white hover:text-gray-300 transition-colors text-sm flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg khmer-font"
                  aria-label="Clear saved information"
                >
                  <XCircle className="w-5 h-5" /> Clear Saved Info
                </button>
              )}
            </div>
            <div className="mlbb-container11 section-spacing">
              <img
                alt={gameConfig[form.game].name}
                src={gameConfig[form.game].image}
                className="mlbb-image13"
              />
              <div className="mlbb-container12">
                <span className="mlbb-text18 khmer-font">{gameConfig[form.game].name}</span>
                <div className="mlbb-container13">
                  <svg width="16" height="16" viewBox="0 0 20 20" className="mlbb-icon20">
                    <path d="M10.277 2.084a.5.5 0 0 0-.554 0a15.05 15.05 0 0 1-6.294 2.421A.5.5 0 0 0 3 5v4.5c0 3.891 2.307 6.73 6.82 8.467a.5.5 0 0 0 .36 0C14.693 16.23 17 13.39 17 9.5V5a.5.5 0 0 0-.43-.495a15.05 15.05 0 0 1-6.293-2.421M11.5 9a1.5 1.5 0 0 1-1 1.415V12.5a.5.5 0 0 1-1 0v-2.085A1.5 1.5 0 1 1 11.5 9" fill="currentColor"></path>
                  </svg>
                  <span className="mlbb-text19 khmer-font">Safety guarantee</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 100 100" className="mlbb-icon20">
                    <path d="M50 5 L35 55 H55 L30 95 L65 45 H45 Z" fill="yellow"></path>
                  </svg>
                  <span className="mlbb-text19 khmer-font">Instant</span>
                </div>
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); validateAccount(); }} className="user-info-section section-spacing">
              <div>
                <label className="block text-sm font-medium mb-1 text-white khmer-font">
                  {form.game === 'freefire' ? 'Free Fire ID' : 'User ID'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={form.userId}
                    onChange={e => {
                      setForm(prev => ({ ...prev, userId: e.target.value, nickname: undefined }));
                      setValidationResult(null);
                      setFormErrors(prev => ({ ...prev, userId: undefined }));
                    }}
                    className="pl-10 w-full rounded-lg border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
                    placeholder={`Enter your ${form.game === 'freefire' ? 'Free Fire ID' : 'User ID'}`}
                    aria-label="User ID"
                    required
                  />
                  {formErrors.userId && <span className="error-text">{formErrors.userId}</span>}
                </div>
              </div>
              {gameConfig[form.game].requiresServerId && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-white khmer-font">
                    {form.game === 'magicchessgogo' ? 'Zone ID' : 'Server ID'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      value={form.serverId}
                      onChange={e => {
                        setForm(prev => ({ ...prev, serverId: e.target.value, nickname: undefined }));
                        setValidationResult(null);
                        setFormErrors(prev => ({ ...prev, serverId: undefined }));
                      }}
                      className="pl-10 w-full rounded-lg border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm"
                      placeholder={`Enter your ${form.game === 'magicchessgogo' ? 'Zone ID' : 'Server ID'}`}
                      aria-label={form.game === 'magicchessgogo' ? 'Zone ID' : 'Server ID'}
                      required
                    />
                    {formErrors.serverId && <span className="error-text">{formErrors.serverId}</span>}
                  </div>
                </div>
              )}
              {['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game) && (
                <div>
                  <button
                    type="submit"
                    disabled={!form.userId || (gameConfig[form.game].requiresServerId && !form.serverId) || validating}
                    className="w-full bg-[#ffd700] text-white px-4 py-2 rounded-lg hover:bg-[#e6c532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm justify-center khmer-font"
                    aria-label="Check account ID"
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
                  {validationResult && (
                    <div className={`flex items-center gap-2 text-sm mt-2 ${validationResult.status === 'success' ? 'text-yellow-400' : 'text-red-400'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{validationResult.status === 'success' ? validationResult.data?.userName : validationResult.message || 'Invalid user ID or server ID'}</span>
                    </div>
                  )}
                </div>
              )}
            </form>
            <div className="products-section max-w-[422px] mx-auto section-spacing">
              <div className="section-header">
                <div className="section-number">02</div>
                <h3 className="text-lg font-semibold text-white khmer-font">ផលិតផល Diamond</h3>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                  <span className="ml-2 text-white">Loading products...</span>
                </div>
              ) : (
                <ProductList
                  products={products.length > 0 ? products : hardcodedProducts.filter(p => p.game === form.game)}
                  onSelect={handleProductSelect}
                  selectedProduct={form.product}
                  game={form.game}
                />
              )}
            </div>
            <div className="payment-section section-spacing">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#ffd700] rounded-full flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 11h16M4 15h6m2 0h2m2 0h2M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"></path>
                  </svg>
                </div>
                <h4 className="text-[#ffd700] font-semibold text-base khmer-font">ទូទាត់ប្រាក់បានគ្រប់ធនាគារ</h4>
              </div>
              <div className="grid grid-cols-1 gap-3" id="payment-grid">
                <div
                  className={`payment-method ${isPaymentSelected ? 'selected' : ''}`}
                  onClick={() => setIsPaymentSelected(true)}
                  aria-label="Select KHQR payment"
                >
                  {isPaymentSelected && (
                    <div className="checkmark">
                      <svg className="h-3 w-3 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                  <div className="w-10 h-10 overflow-hidden rounded-[5px] shadow-sm">
                    <img
                      src="https://sakuratopup.com/assets/images/KHQR.svg"
                      alt="KHQR"
                      className="w-full h-full object-cover rounded-[5px]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">KHQR</p>
                    <p className="text-xs text-[#d1d5db]">Scan QR code to pay instantly</p>
                  </div>
                </div>
              </div>
              <div className="wpr_t_c mt-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="check_btn"
                    checked={isPaymentSelected}
                    onChange={e => setIsPaymentSelected(e.target.checked)}
                    aria-label="Agree to terms and conditions"
                  />
                  <label className="form-check-label text-white khmer-font" htmlFor="check_btn">
                    I agree{' '}
                    <a className="text-[#ffd700] hover:underline" href="https://sakuratopup.com/terms" target="_blank" rel="noopener noreferrer">
                      TERMS AND CONDITIONS
                    </a>
                  </label>
                </div>
              </div>
            </div>
            <div className="fixed-payment-bar">
              <div className="pay-line">
                <div className="price">
                  <p className="text-sm text-white khmer-font">
                    Total: <span className="text-[#ffd700] font-semibold">${form.product ? form.product.price.toFixed(2) : '0.00'}</span>
                  </p>
                </div>
                <div className="pay-button">
                  <button
                    className="w-full bg-[#ffd700] text-white px-3 py-1.5 rounded-lg hover:bg-[#e6c532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm justify-center khmer-font"
                    disabled={!form.product || paymentCooldown > 0 || !isPaymentSelected || (['mlbb', 'mlbb_ph', 'magicchessgogo'].includes(form.game) && validationResult?.status !== 'success')}
                    onClick={handleSubmit}
                    aria-label="Proceed to payment"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="20" width="20">
                      <path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-36,80a12,12,0,1,1,12-12A12,12,0,0,1,180,144Z"></path>
                    </svg>
                    {paymentCooldown > 0 ? `Wait ${paymentCooldown}s` : 'Pay Now'}
                  </button>
                  <form
                    action="https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase"
                    method="post"
                    id="aba_merchant_request"
                    target="aba_webservice"
                  >
                    <input type="hidden" name="req_time" value="" />
                    <input type="hidden" value="morgangaming" name="merchant_id" />
                    <input type="hidden" name="tran_id" value="" />
                    <input type="hidden" value={form.product ? form.product.price.toFixed(2) : '0'} name="amount" />
                    <input type="hidden" value="abapay" name="payment_option" />
                    <input type="hidden" value="USD" name="currency" />
                    <input type="hidden" value="aHR0cHM6Ly9tb3JnYW5nYW1pbmdzaG9wLmNvbS9hcGkvYWJhL2NhbGxiYWNr" name="return_url" />
                    <input type="hidden" value="https://morgangamingshop.com/success/invoice" name="continue_success_url" />
                    <input type="hidden" name="return_params" value="" />
                    <input type="hidden" value="5zXd32YEoxTfot/mkpd/1/cfgVT9EjeSddImW75XgKERQiC5dZwqd6Y08CfZPUU7xdo7HGjEY27BpZXAV5UxIw==" name="hash" />
                  </form>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <main className="container mx-auto px-2 py-3 max-w-[422px]">
            <div className="header py-1 section-spacing">
              <img
                src="https://raw.githubusercontent.com/Cheagjihvg/jackstore-asssets/refs/heads/main/Untitled-1%20(1).png"
                alt="Banner"
                className="w-full h-auto max-h-40 object-contain max-w-[422px] mx-auto"
              />
            </div>
            <div className="nav-container">
              <div className="w-full max-w-[422px] h-[50px] mx-auto">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg flex items-center justify-between h-full">
                  <div className="payment-group">
                    {['wing', 'aba', 'khqr'].map(method => (
                      <div key={method} className="relative group cursor-pointer">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-md">
                          <div className="w-6 h-6 relative">
                            <img
                              src={`https://netonlinestores.com/_next/image?url=%2Fassets%2Fmain%2F${method}-lg.webp&w=750&q=75`}
                              alt={`${method.toUpperCase()} Payment`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          {method.toUpperCase()}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-transparent border-t-black/80"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ul className="social-group">
                    <li>
                      <a href="https://www.facebook.com/KvaiSellDiamond/" aria-label="facebook" target="_blank" rel="noopener noreferrer" className="group">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook w-6 h-6 text-white group-hover:text-yellow-300 transition-colors duration-200">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                          </svg>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="https://t.me/kvaiselldiamond" aria-label="telegram" target="_blank" rel="noopener noreferrer" className="group">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-6 h-6 text-white group-hover:text-yellow-300 transition-colors duration-200">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                          </svg>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="https://t.me/Kvaisell" aria-label="youtube" target="_blank" rel="noopener noreferrer" className="group">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube w-6 h-6 text-white group-hover:text-yellow-300 transition-colors duration-200">
                            <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z"></path>
                          </svg>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <section className="popular-section">
              <div className="popular-header">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[#ffd700] khmer-font flex items-center gap-2">
                    <div className="popular-header-icon">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                      </svg>
                    </div>
                    POPULAR!
                  </h2>
                  <p className="text-[10px] text-[#d1d5db] leading-tight">Some of the most popular selected games today.</p>
                </div>
              </div>
              <div id="skeleton-loader" className="skeleton-loader grid grid-cols-2 gap-2 md:gap-4 mt-3" style={{ display: loading ? 'grid' : 'none' }}>
                <div className="ph-item skeleton-populer"></div>
                <div className="ph-item skeleton-populer"></div>
                <div className="ph-item skeleton-populer"></div>
                <div className="ph-item skeleton-populer"></div>
              </div>
              <div className="popular-grid grid grid-cols-2 gap-3 md:gap-4 mt-3" style={{ display: loading ? 'none' : 'grid' }}>
                {[
                  { gameId: 'mlbb', href: 'https://dinotopup.com/id/mlbb', title: 'Mobile Legends', subtitle: 'Mobile Legends 🇰🇭' },
                  { gameId: 'freefire', href: 'https://dinotopup.com/id/freefire_sgmy', title: 'Free Fire', subtitle: 'Free Fire 🇰🇭🇸🇬🇲🇾' },
                  { gameId: 'mlbb_ph', href: 'https://dinotopup.com/id/mlbb_ph', title: 'Mobile Legends PH', subtitle: 'Mobile Legends PH 🇰🇭' },
                  { gameId: 'magicchessgogo', href: 'https://dinotopup.com/id/magicchessgogo', title: 'Magic Chess GoGo', subtitle: 'Magic Chess GoGo 🇰🇭' },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="melpaSlideUp bg-nvd neverzoom flex items-center gap-x-1.5 rounded-xl bg-murky-600 p-1.5 duration-300 ease-in-out hover:shadow-2xl hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 hover:ring-offset-murky-800 md:gap-x-3 md:rounded-2xl md:p-3 bg-murky-800"
                    style={{ animationDelay: '0s' }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (gameConfig[item.gameId as keyof typeof gameConfig].enabled) {
                        setForm(prev => ({ ...prev, game: item.gameId as keyof typeof gameConfig }));
                        setShowTopUp(true);
                      } else {
                        showNotification(`${item.title} is coming soon`, 'error');
                      }
                    }}
                    aria-label={`Select ${item.title}`}
                  >
                    <img
                      src={gameConfig[item.gameId as keyof typeof gameConfig].image}
                      className="aspect-square h-14 w-14 rounded-lg !object-cover !object-center ring-1 ring-murky-600 md:h-20 md:w-20 md:rounded-xl"
                      alt={item.title}
                    />
                    <div className="relative flex w-full flex-col">
                      <h2 className="w-[100px] truncate text-white font-semibold sm:w-[200px] md:w-[275px] md:text-base">{item.title}</h2>
                      <p className="text-white md:text-sm">{item.subtitle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
            <h2 className="text-md font-bold text-[#ffd700] my-2 khmer-font">Popular Games</h2>
            <div className="game-container">
              {Object.entries(gameConfig).slice(0, 3).map(([gameId, { name, image, enabled }]) => (
                <div
                  key={gameId}
                  className={`game-card ${enabled ? 'enabled' : 'disabled'}`}
                  onClick={() => {
                    if (!enabled) {
                      showNotification(`${name} is coming soon`, 'error');
                      return;
                    }
                    setForm(prev => ({ ...prev, game: gameId as keyof typeof gameConfig }));
                    setShowTopUp(true);
                  }}
                  role={enabled ? 'button' : undefined}
                  aria-label={enabled ? `Select ${name}` : `${name} (Coming Soon)`}
                >
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <div className="game-name">{name}</div>
                  {!enabled && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>
            <div className="game-container mt-3">
              {Object.entries(gameConfig).slice(3, 6).map(([gameId, { name, image, enabled }]) => (
                <div
                  key={gameId}
                  className={`game-card ${enabled ? 'enabled' : 'disabled'}`}
                  onClick={() => {
                    if (!enabled) {
                      showNotification(`${name} is coming soon`, 'error');
                      return;
                    }
                    setForm(prev => ({ ...prev, game: gameId as keyof typeof gameConfig }));
                    setShowTopUp(true);
                  }}
                  role={enabled ? 'button' : undefined}
                  aria-label={enabled ? `Select ${name}` : `${name} (Coming Soon)`}
                >
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <div className="game-name">{name}</div>
                  {!enabled && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>
            <section className="blog-section section-spacing">
              <div className="header-text-link mb-4">
                <h2 className="khmer-font">ព័ត៌មានថ្មីៗ</h2>
              </div>
              <div className="blog-grid">
                {[
                  {
                    image: 'https://raw.githubusercontent.com/Mengly08/pic/refs/heads/main/photo_2025-08-11_08-33-41.jpg',
                    alt: 'EVENTS',
                    title: 'KVAI STORE',
                    link: 'https://www.kvaitopup.com/',
                    date: 'contact us now',
                  },
                  {
                    image: 'https://raw.githubusercontent.com/Mengly08/PICCCC/refs/heads/main/photo_2025-06-15_10-14-44.jpg',
                    alt: 'EVENTS',
                    title: 'MORE ABOUT US',
                    link: 'https://www.kvaitopup.com/',
                    date: 'contact us now',
                  },
                  {
                    image: 'https://raw.githubusercontent.com/Mengly08/pic/refs/heads/main/photo_2025-08-11_08-33-48.jpg',
                    alt: 'EVENTS',
                    title: 'ACCOUNT SELLER',
                    link: 'https://www.kvaitopup.com/',
                    date: 'contact us now',
                  },
                ].map((post, index) => (
                  <div
                    key={index}
                    ref={el => (blogBoxRefs.current[index] = el)}
                    className={`blog-box ${visibleBlogs[index] ? 'slide-in' : ''}`}
                  >
                    <div className="img-box relative">
                      <img
                        src={post.image}
                        alt={post.alt}
                        className="w-full h-[190px] object-cover rounded-t-lg"
                      />
                      <span className="author">Admin</span>
                    </div>
                    <div className="text-box">
                      <h5 className="title">
                        <a href={post.link} className="khmer-font">{post.title}</a>
                      </h5>
                      <span className="date khmer-font">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}
      </div>
      <footer className="bg-[#1a1a1a] text-white border-t-4 border-[#ffd700] py-8 mt-[100px]">
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&display=swap');
    .khmer-font { font-family: 'Noto Sans Khmer', sans-serif; }
    .footer-container {
      max-width: 422px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .feature-card {
      background-color: #1f2937;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      transform-style: preserve-3d;
    }
    .feature-card:hover {
      transform: translateY(-5px) rotateY(5deg);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }
    .feature-card .icon-circle {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffd700;
      border-radius: 50%;
      margin-bottom: 8px;
    }
    .feature-card .icon-circle svg {
      width: 24px;
      height: 24px;
      stroke: #ffffff;
      stroke-width: 2;
    }
    .feature-title {
      color: #ffd700;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .feature-desc {
      color: #d1d5db;
      font-size: 12px;
      line-height: 1.4;
    }
    .social-icon {
      transition: transform 0.3s ease, color 0.3s ease;
    }
    .social-icon:hover {
      transform: scale(1.2);
      color: #f9d43d;
    }
    @media (max-width: 422px) {
      .feature-card .icon-circle {
        width: 36px;
        height: 36px;
      }
      .feature-card .icon-circle svg {
        width: 18px;
        height: 18px;
      }
      .feature-title {
        font-size: 12px;
      }
      .feature-desc {
        font-size: 10px;
      }
    }
    @media (min-width: 640px) {
      .feature-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `}</style>
  <div className="footer-container">
    {/* Top Section */}
    <div className="grid grid-cols-1 gap-8 mb-8">
      {/* Left Side */}
      <div className="flex flex-col items-center space-y-4">
        <p className="text-[#ffd700] text-lg font-bold khmer-font">CHA KVAI STORE</p>
        <p className="text-center text-lg font-bold khmer-font">
          ហេតុអ្វីអ្នកគួរជ្រើសរើស <span className="text-[#ffd700]">CHA KVAI STORE</span> <br />
          ធ្វើជាកន្លែងបញ្ចូលពេជ្រហ្គេមរបស់អ្នក?
        </p>
      </div>
      {/* Right Side - Features with 3D Boxes */}
      <div className="feature-grid grid grid-cols-2 gap-4">
        {[
          {
            icon: (
              <svg className="lucide lucide-rocket icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
              </svg>
            ),
            title: 'មានភាពងាយស្រួលនិងឆាប់រល័ស',
            desc: 'ទូទាត់ប្រាប់ភ្លាម និង ទទួលបានពេជ្យភ្លាមក្នុងហ្គេមភ្លាម និងធានានៅពេជ្ឈភ្លាមដោយប្រើពេលមិនដល់១នាទី។',
          },
          {
            icon: (
              <svg className="lucide lucide-shield icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              </svg>
            ),
            title: 'សុវត្តិភាព និងទំនុកចិត្ត',
            desc: 'វិបសាយឌីជីថលនិងសេវាកម្មរបស់ពួកយើងខ្ងុំជាក្រុមហ៊ុនដែលមានទំនុកចិត្ត។',
          },
          {
            icon: (
              <svg className="lucide lucide-credit-card icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
            ),
            title: 'មានជម្រើសច្រើនក្នុងការទូទាត់ប្រាក់',
            desc: 'យើងមានក្រុមហ៊ុនទូទាត់ប្រាក់ជាដៃគូសហការច្រើនក្នុងប្រទេសកម្ពុជា។',
          },
          {
            icon: (
              <svg className="lucide lucide-gift icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                <path d="M12 8v13"></path>
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
              </svg>
            ),
            title: 'មានការបញ្ចុះតម្លៃច្រើន',
            desc: 'យើងតែងតែមានការបញ្ចុះតម្លៃរាល់ពេលមាន event ថ្មីៗនៅហ្គេម។',
          },
          {
            icon: (
              <svg className="lucide lucide-handshake icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                <path d="M21 3 L2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                <path d="M3 4h8"></path>
              </svg>
            ),
            title: 'ទំនួលខុសត្រូវខ្ពស់ សម្រាប់អតិថិជន',
            desc: 'យើងមានទំនួលខុសត្រូវផ្តល់សម្រាប់បញ្ហាផ្សេងៗដែលទាក់ទងនឹងការដាក់ពេជ្យតាមរយៈពួកយើង។',
          },
          {
            icon: (
              <svg className="lucide lucide-zap icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            ),
            title: 'ជំនួយការអតិថិជនដែររហ័ស',
            desc: 'ជំនួយការអតិថិជនដែលទាក់ទងរបស់ពួកយើងតែងតែមាន ដើម្បីអ្នកគ្រប់ពេលវេលា។',
          },
        ].map((item, index) => (
          <div
            key={index}
            className="feature-card"
          >
            <div className="flex justify-center">
              <div className="icon-circle">{item.icon}</div>
            </div>
            <h4 className="text-center feature-title khmer-font">{item.title}</h4>
            <p className="text-center feature-desc khmer-font">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
    {/* Bottom Section */}
    <div className="grid grid-cols-1 gap-8 text-center">
      {/* Contact Us */}
      <div>
        <h3 className="text-[#ffd700] font-bold text-xl mb-4 khmer-font">ទំនាក់ទំនង</h3>
        <ul className="flex justify-center space-x-4">
          <li>
            <a href="https://www.facebook.com/KvaiSellDiamond/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 51.5-135.3 130.8-135.3c37.9 0 77.4 6.8 77.4 6.8v85.2h-43.5c-43 0-56.4 26.6-56.4 53.8v65.2h95.5l-15.5 78.2H287v170.6C413.2 475.8 512 377.9 512 256z"></path>
              </svg>
            </a>
          </li>
          <li>
            <a href="https://t.me/Kvaisell" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 496 512">
                <path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142q-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7q108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"></path>
              </svg>
            </a>
          </li>
        </ul>
      </div>
      {/* Legal */}
      <div>
        <ul className="space-y-2">
          <li>
            <a href="/term-and-policy" className="text-[#ffd700] hover:text-[#f9d43d] font-bold underline underline-offset-4 transition-colors khmer-font">
              <span>Privacy Policy</span> | <span>Terms and Conditions</span>
            </a>
          </li>
          <li className="khmer-font">Copyright © CHA KVAI STORE. All Rights Reserved.</li>
        </ul>
      </div>
      {/* Payments */}
      <div>
        <h3 className="text-[#ffd700] font-bold text-xl mb-4 khmer-font">ទទួលយកការទូទាត់</h3>
        <ul className="flex justify-center space-x-4">
          <li>
            <img src="https://sakuratopup.com/assets/images/KHQR.svg" alt="KHQR" className="w-16 h-16 object-contain" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</footer>
      {showCheckout && (
        <PaymentModal
          form={form}
          orderFormat={orderFormat}
          onClose={() => {
            setShowCheckout(false);
            startPaymentCooldown();
          }}
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
  );
};

export default App;
