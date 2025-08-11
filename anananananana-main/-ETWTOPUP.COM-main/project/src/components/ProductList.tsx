import React, { useMemo } from 'react';
import { GameProduct } from '../types';

interface Props {
  products: GameProduct[];
  selectedProduct: GameProduct | null;
  onSelect: (product: GameProduct) => void;
  game: string;
}

export function ProductList({ products, selectedProduct, onSelect, game }: Props) {
  const isReseller = localStorage.getItem('jackstore_reseller_auth') === 'true';

  // Group products by type and further subgroup diamonds by inferred categories
  const groupedProducts = useMemo(() => {
    const groups = products.reduce((acc, product) => {
      const type = product.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(product);
      return acc;
    }, {} as Record<string, GameProduct[]>);

    if (groups.diamonds) {
      const diamondSubgroups = groups.diamonds.reduce((acc, product) => {
        let subgroup: string;
        const nameLower = product.name.toLowerCase();
        if (nameLower.includes('pass') || nameLower.includes('weekly')) {
          subgroup = 'passes';
        } else if (/^\d+\s*diamonds?$/.test(nameLower)) {
          subgroup = 'rawdiamonds';
        } else {
          subgroup = 'other';
        }
        if (!acc[subgroup]) {
          acc[subgroup] = [];
        }
        acc[subgroup].push(product);
        return acc;
      }, {} as Record<string, GameProduct[]>);

      Object.keys(diamondSubgroups).forEach((subgroup) => {
        if (subgroup === 'rawdiamonds') {
          diamondSubgroups[subgroup].sort((a, b) => (a.diamonds || 0) - (b.diamonds || 0));
        } else {
          diamondSubgroups[subgroup].sort((a, b) => a.price - b.price);
        }
      });
      groups.diamonds = diamondSubgroups;
    }
    return groups;
  }, [products]);

  // Define the order of sections
  const sectionOrder = ['special', 'diamonds', 'subscription'];

  const renderProductCard = (product: GameProduct) => {
    const isSelected = selectedProduct?.id === product.id;

    return (
      <li key={product.id} className="flex">
        <button
          type="button"
          className={`diamond-list-item relative flex items-center w-full px-2 py-1 rounded-lg border border-gray-300 bg-[#6E6E6E] transition-all hover:border-yellow-400 ${isSelected ? 'bg-gray-500 border-yellow-400 shadow-md' : ''}`}
          onClick={() => onSelect(product)}
          data-package-id={product.id}
        >
          {product.discount && (
            <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-br-lg rounded-tl-lg">
              {product.discount}% OFF
            </div>
          )}
          <div className="item-title flex items-center w-full">
            <div className="diamond-icon mr-2">
              <div className="rounded-full overflow-hidden w-10 h-10">
                <img
                  alt={`${product.name} icon`}
                  src={product.image || 'https://via.placeholder.com/40'}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="text-white font-semibold text-xs truncate">{product.name}</div>
              <div className="text-yellow-400 font-bold text-sm">
                ${product.price.toFixed(2)}
              </div>
              {isReseller && product.resellerPrice && (
                <div className="text-gray-300 text-[10px]">Reseller: ${product.resellerPrice.toFixed(2)}</div>
              )}
            </div>
          </div>
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {sectionOrder.map((type) => {
        const group = groupedProducts[type];
        if (!group) return null;
        return (
          <div key={type}>
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">
              {type === 'special' ? 'Best Seller' :
               type === 'diamonds' ? 'Saving Packages' :
               type === 'subscription' ? 'Subscription Packages' : type}
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {Array.isArray(group)
                ? group.map(renderProductCard)
                : Object.values(group).flat().map(renderProductCard)
              }
            </ul>
          </div>
        );
      })}
      {products.length === 0 && (
        <div className="text-center py-10">
          <div className="rounded-xl p-6 border border-gray-200 shadow-lg">
            <p className="text-lg font-medium text-gray-800">
              No products available for {
                game === 'mlbb' ? 'Mobile Legends' :
                game === 'mlbb_ph' ? 'Mobile Legends PH' :
                game === 'freefire' ? 'Free Fire' :
                'Free Fire TH'
              }.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please check back later for new products.
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        .diamond-list-item {
          padding: 6px 8px; /* Reduced padding */
          background: #6E6E6E;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          height: 70px; /* Slightly reduced height */
          width: 100%; /* Full width within grid cell */
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }
        .diamond-list-item:hover {
          border-color: #facc15;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .diamond-list-item.bg-gray-500 {
          background: #6b7280;
          border-color: #facc15;
        }
        .item-title {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .diamond-icon img {
          object-fit: contain;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%; /* Prevent text overflow */
        }
      `}</style>
    </div>
  );
}
