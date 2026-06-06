import { useCallback } from 'react';
import { Product, COST_PRICE_OPTIONS } from '../types';
import { useLocalStorage, generateId } from './useLocalStorage';

const PRODUCTS_KEY = 'booth-ledger-products';

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>(PRODUCTS_KEY, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id'>) => {
      const product: Product = { ...data, id: generateId() };
      setProducts((prev) => [...prev, product]);
    },
    [setProducts],
  );

  const updateProduct = useCallback(
    (id: string, data: Partial<Omit<Product, 'id'>>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
    },
    [setProducts],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [setProducts],
  );

  const adjustStock = useCallback(
    (id: string, delta: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
        ),
      );
    },
    [setProducts],
  );

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id) ?? null,
    [products],
  );

  const lowStockProducts = products.filter((p) => p.stock < p.lowStockThreshold);

  return {
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getProduct,
    lowStockProducts,
    costPriceOptions: COST_PRICE_OPTIONS,
  };
}
