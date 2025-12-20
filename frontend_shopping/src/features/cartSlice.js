import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../apiClient";


const initialState = {
  cart: [],
  TotalPrice: 0,
  TotalQuantity: 0,
  paymentCompleted: false,
  status: "idle",
};

export const saveCart = createAsyncThunk("cart/save", async (cartInfo) => {
  const token = localStorage.getItem("token");

  {
    const response = await apiFetch("/api/cart/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cartInfo),
    });
    return await response.json();
  }
});

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (userid, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(`/api/cart/fetch/${userid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to fetch cart");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const deleteCartItemThunk = createAsyncThunk(
  "cart/deleteItem",
  async ({ userid, productId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(
        `/api/cart/delete/${userid}/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Delete Response:", data);

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuest",
  async ({ userid, guestCart }) => {
    const token = localStorage.getItem("token");

    const res = await apiFetch("/api/cart/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userid, guestCart }),
    });

    return res.json();
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, actions) => {
      state.cart.push({ ...actions.payload, quantity: 1 });
    },

    deleteCartItem: (state, actions) => {
      state.cart = state.cart.filter((value) => {
        return value._id !== actions.payload._id;
      });
    },
    increaseQuantity: (state, actions) => {
      state.cart = state.cart.map((value) => {
        if (value._id === actions.payload._id) {
          return { ...value, quantity: value.quantity + 1 };
        }
        return value;
      });
    },
    decreaseQuantity: (state, actions) => {
      state.cart = state.cart.map((value) => {
        if (value._id === actions.payload._id) {
          return {
            ...value,
            quantity: value.quantity > 1 ? value.quantity - 1 : 1,
          };
        }
        return value;
      });
    },
    clearCart: (state) => {
      state.cart = [];
      state.TotalPrice = 0;
      state.TotalQuantity = 0;
    },

    cartTotal: (state) => {
      const { totalPrice, totalQuantity } = state.cart.reduce(
        (cartTotal, cartItems) => {
          const { price, quantity } = cartItems;
          const itemTotal = parseFloat(price) * quantity;
          cartTotal.totalPrice += itemTotal;
          cartTotal.totalQuantity += quantity;

          return cartTotal;
        },
        {
          totalPrice: 0,
          totalQuantity: 0,
        }
      );
      state.TotalPrice = Math.round(totalPrice * 100) / 100;
      state.TotalQuantity = totalQuantity;
    },
    paymentSuccess: (state) => {
      state.paymentCompleted = true;
    },
    resetPayment: (state) => {
      state.paymentCompleted = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveCart.fulfilled, (state, actions) =>
      console.log("Cart Saved:", actions.payload)
    );
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload?.cartItems ?? [];
      })
      .addCase(deleteCartItemThunk.pending, (state, action) => {
        const { productId } = action.meta.arg;
        state.cart = state.cart.filter((item) => item._id !== productId);
      })
      .addCase(deleteCartItemThunk.fulfilled, (state, action) => {
        const { cartItems } = action.payload;
        if (state.cart.length === 0) {
          state.cart = [];
        } else if (cartItems) {
          state.cart = cartItems;
        }
      })
      .addCase("app/logout", () => initialState);
  },
});

export const {
  addToCart,
  deleteCartItem,
  increaseQuantity,
  decreaseQuantity,
  cartTotal,
  clearCart,
  markCartReady,
  paymentSuccess,
  resetPayment
} = cartSlice.actions;

export default cartSlice.reducer;
