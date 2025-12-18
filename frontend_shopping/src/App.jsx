import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Footer from "./components/Footer";
import Query from "./pages/Query";
import Login from "./components/Login";
import Register from "./components/Register";
import CartPage from "./components/Cart";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./admin/AdminDashboard";
import ManageQuery from "./admin/ManageQuery";
import ManageProducts from "./admin/ManageProducts";
import AddProducts from "./admin/AddProducts";
import QueryReply from "./admin/QueryReply";
import EditProduct from "./admin/EditProduct";
import Categories from "./components/Categories";
import Wishlist from "./components/Wishlist";
import ProductDetails from "./components/ProductDetails";
import CheckoutPage from "./pages/Checkout";
import ProfilePage from "./pages/Profile";
import EditProfilePage from "./pages/EditProfile";
import AdminRoute from "./routes/AdminRoute";
import OrderSuccess from "./components/OrderSuccess";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, mergeGuestCart } from "./features/cartSlice";
import { fetchwishlist, mergeGuestWishlist } from "./features/wishlistSlice";

const App = () => {
  const guestCart = useSelector((state) => state.cartItem.cart);
  const guestWishlist = useSelector((state) => state.wishlistItem.wishlist);
  const dispatch = useDispatch();
  const [token, setToken] = useState(null);
  const cartSnapshotRef = useRef(null);
  const wishlistSnapshotRef = useRef(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!token) return;

    if (!cartSnapshotRef.current) {
      cartSnapshotRef.current = [...guestCart];
    }

    if (!wishlistSnapshotRef.current) {
      wishlistSnapshotRef.current = [...guestWishlist];
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const userid = localStorage.getItem("user");
    if (!userid) return;

    const cartSnapshot = cartSnapshotRef.current;
    const wishlistSnapshot = wishlistSnapshotRef.current;

    if (!cartSnapshot && !wishlistSnapshot) return;

    const hydrate = async () => {
      try {
        if (cartSnapshot?.length > 0) {
          await dispatch(
            mergeGuestCart({
              userid,
              guestCart: cartSnapshot.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
              })),
            })
          ).unwrap();
        }

        if (wishlistSnapshot?.length > 0) {
          await dispatch(
            mergeGuestWishlist({
              userid,
              guestWishlist: wishlistSnapshot.map((item) => item._id),
            })
          ).unwrap();
        }

        await dispatch(fetchCart(userid)).unwrap();
        await dispatch(fetchwishlist(userid)).unwrap();

        cartSnapshotRef.current = null;
        wishlistSnapshotRef.current = null;
      } catch (error) {
        console.error("Hydration failed", error);
      }
    };

    hydrate();
  }, [token]);

  const [activeCategory, setActiveCategory] = useState("All");
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar token={token} setActiveCategory={setActiveCategory} />
      <div className="min-h-screen pt-16 bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              <Homepage
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            }
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/query" element={<Query />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/editprofile" element={<EditProfilePage />} />
          <Route path="/editprofile/:addId" element={<EditProfilePage />} />
          <Route path="/category/:categoryName" element={<Categories />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/manageQuery"
            element={
              <AdminRoute>
                <ManageQuery />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/manageProducts"
            element={
              <AdminRoute>
                <ManageProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/addProducts"
            element={
              <AdminRoute>
                <AddProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/queryReply/:id"
            element={
              <AdminRoute>
                <QueryReply />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/editProduct/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
