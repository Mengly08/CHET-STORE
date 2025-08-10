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

  const renderProductCard = (product: GameProduct) => {
    const isSelected = selectedProduct?.id === product.id;
    
    return (
      <li key={product.id}>
        <button 
          type="button" 
          className={`game-card-btn ${isSelected ? 'selected' : ''}`} 
          onClick={() => onSelect(product)}
        >
          <div className="custom-card">
            <div className="content">
              <div className="title-cover">
                <h3 className="title">{product.name}</h3>
              </div>
              <div className="price-cover">
                <p className="price">${product.price.toFixed(2)}</p>
                {isReseller && product.resellerPrice && (
                  <p className="reseller-price text-xs text-gray-600">Reseller: ${product.resellerPrice.toFixed(2)}</p>
                )}
              </div>
            </div>
            <div className="icon">
              <img 
                alt={product.name} 
                loading="lazy" 
                width="45" 
                height="45" 
                decoding="async" 
                data-nimg="1" 
                src={product.image || 'https://via.placeholder.com/45'} 
                style={{color: 'transparent'}}
              />
            </div>
          </div>
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedProducts).map(([type, group]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
            {type === 'special' ? 'Best Seller' : 
             type === 'diamonds' ? 'Saving Packages' : 
             type === 'subscription' ? 'Subscription Packages' : type}
          </h3>
          <ul className="game-list">
            {Array.isArray(group) 
              ? group.map(renderProductCard)
              : Object.values(group).flat().map(renderProductCard)
            }
          </ul>
        </div>
      ))}

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
        .game-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .game-card-btn {
          width: 143px;
          height: 48px;
          padding: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .game-card-btn:hover {
          border-color: #d1d5db;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .game-card-btn.selected {
          border-color: #3b82f6;
          background: white;
        }
        .custom-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 4px 8px;
        }
        .content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          min-width: 0;
        }
        .title-cover {
          overflow: hidden;
        }
        .title {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .price-cover {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .price {
          font-size: 12px;
          font-weight: 700;
          color: #ef4444;
        }
        .reseller-price {
          font-size: 10px;
          color: #6b7280;
        }
        .icon {
          flex-shrink: 0;
        }
        .icon img {
          width: 35px;
          height: 35px;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
