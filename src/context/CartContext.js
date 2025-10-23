import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(
        item => item.id === action.payload.id && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && 
            item.size === action.payload.size && 
            item.color === action.payload.color
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      };
      
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && 
            item.size === action.payload.size && 
            item.color === action.payload.color)
        )
      };
      
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && 
          item.size === action.payload.size && 
          item.color === action.payload.color
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
      
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem('cart') || '[]')
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, size, color, quantity = 1, customPrice = null) => {
    // Use custom price if provided, otherwise get price from sizesWithPrices or fallback to priceEGP
    let price = customPrice;
    
    if (!price && product.sizesWithPrices) {
      const sizeData = product.sizesWithPrices.find(item => item.size === size);
      price = sizeData ? sizeData.price : product.priceEGP;
    }
    
    if (!price) {
      price = product.priceEGP;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product._id,
        name: product.name,
        price: price,
        image: product.images?.[0] || null,
        size,
        color,
        quantity
      }
    });
  };

  const removeFromCart = (id, size, color) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id, size, color }
    });
  };

  const updateQuantity = (id, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id, size, color, quantity }
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
