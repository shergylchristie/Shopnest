import React, { useState, useEffect } from "react";
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
import AdminRoute from "./routes/AdminRoute"
import OrderSuccess from "./components/OrderSuccess";
import AuthFetch from "./components/AuthFetch";

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role")
    }
  }, [token]);

  const [activeCategory, setActiveCategory] = useState("All");
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthFetch />
      <Navbar
        token={token}
        setToken={setToken}
        setActiveCategory={setActiveCategory}
      />
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
