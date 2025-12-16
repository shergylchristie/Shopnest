import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../apiClient";


const initialState = {
  wishlist: [],
};

export const fetchwishlist = createAsyncThunk(
  "wishlist/fetch",
  async (userid) => {
    const token = localStorage.getItem("token");
    const res = await apiFetch(`/api/wishlist/fetch/${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
);

export const savewishlist = createAsyncThunk(
  "wishlist/add",
  async ({ userid, productId }) => {
    const token = localStorage.getItem("token");
    const res = await apiFetch(`/api/wishlist/save/${userid}/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  }
);

export const deleteWishlistItemThunk = createAsyncThunk(
  "wishlist/delete",
  async ({ userid, productId }) => {
    const token = localStorage.getItem("token");
    const res = await apiFetch(`/api/wishlist/delete/${userid}/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
);

export const mergeGuestWishlist = createAsyncThunk(
  "wishlist/mergeGuest",
  async ({ userid, guestWishlist }) => {
    const token = localStorage.getItem("token");

    const res = await apiFetch("/api/wishlist/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userid, guestWishlist }),
    });

    return res.json();
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addTowishlist: (state, action) => {
      state.wishlist.push(action.payload);
    },
    deleteWishlistItem: (state, action) => {
      state.wishlist = state.wishlist.filter(
        (item) => item._id !== action.payload
      );
    },
    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchwishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload.wishlistItems;
      })
      .addCase(deleteWishlistItemThunk.fulfilled, (state, action) => {
        state.wishlist = action.payload.wishlistItems;
      })
      .addCase(savewishlist.fulfilled, (state, action) => {
        if (action.payload?.wishlistItems) {
          state.wishlist = action.payload.wishlistItems;
        }
      })

      .addCase("app/logout", () => initialState);
  },
});

export const { addTowishlist, deleteWishlistItem, markWishlistReady } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
