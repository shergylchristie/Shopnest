import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiShoppingCart, FiLock } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCart, cartTotal } from "../features/cartSlice";
import { clearCart } from "../features/cartSlice";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const CheckoutPage = () => {
  const cartData = useSelector((state) => state.cartItem.cart);
  const carttInfo = useSelector((state) => state.cartItem);
  const token = localStorage.getItem("token");
  const userid = localStorage.getItem("user");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", address: [] });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [prevAddressIds, setPrevAddressIds] = useState([]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    label: "",
    addressline: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shipping = 30;
  const tax = 10;
  const totalprice = carttInfo.TotalPrice + shipping + tax;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (userid) dispatch(fetchCart(userid));
    loadUser();
  }, [dispatch, navigate, userid, token]);

  useEffect(() => {
    if (cartData.length > 0) dispatch(cartTotal());
  }, [cartData, dispatch]);

  async function loadUser() {
    try {
      const res = await fetch(`/api/getUser/${userid}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      let index = 0;
      if (data.address && data.address.length > 0) {
        const def = data.address.findIndex((a) => a.default);
        index = def !== -1 ? def : 0;
      }
      setUser(data);
      setSelectedAddressIndex(index);
    } catch {
      toast.error("Unable to load user details.");
    }
  }

  const selectedAddress =
    user.address && user.address.length > 0
      ? user.address[selectedAddressIndex] || {}
      : {};

  const handleAddressSelect = (idx) => {
    setSelectedAddressIndex(idx);
    setShowAddressDropdown(false);
    setShowAddForm(false);
    setPrevAddressIds([]);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const validateNewAddress = () => {
    if (!newAddress.name?.trim()) return "Receiver name is required";
    if (!newAddress.phone?.trim()) return "Receiver phone is required";
    if (!newAddress.addressline?.trim()) return "Address line is required";
    if (!newAddress.city?.trim()) return "City is required";
    if (!newAddress.state?.trim()) return "State is required";
    if (!newAddress.pincode?.trim()) return "PIN code is required";
    return null;
  };

  const handleAddAddress = async () => {
    const err = validateNewAddress();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const res = await fetch(`/api/changeuseraddress/${userid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to add address");
        return;
      }

      setUser(data);

      const newIds = (data.address || []).map((a) => String(a._id));
      let addedId = newIds.find((id) => !prevAddressIds.includes(id));
      let newIndex = -1;

      if (addedId) {
        newIndex = data.address.findIndex((a) => String(a._id) === addedId);
      } else {
        newIndex = data.address.findIndex(
          (a) =>
            a.addressline === newAddress.addressline &&
            a.pincode === newAddress.pincode &&
            (a.name || "") === (newAddress.name || "") &&
            (a.phone || "") === (newAddress.phone || "")
        );
      }

      if (newIndex === -1) {
        newIndex = data.address.length > 0 ? data.address.length - 1 : 0;
      }

      setSelectedAddressIndex(newIndex);
      setShowAddForm(false);
      setShowAddressDropdown(false);
      setNewAddress({
        name: "",
        phone: "",
        label: "",
        addressline: "",
        city: "",
        state: "",
        pincode: "",
      });
      setPrevAddressIds([]);
      toast.success("Address added and selected");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handlePayment = async () => {
    if (cartData.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!selectedAddress || !selectedAddress.addressline) {
      toast.error("No delivery address selected.");
      return;
    }

    try {
      const amount = totalprice;
      const currency = "INR";
      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      const options = {
        key: import.meta.env.VITE_RZR_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SherTech",
        description: "Order payment",
        image: "/logo.png",
        order_id: order.id,
        handler: function (response) {
          const token = localStorage.getItem("token");
          const userid = localStorage.getItem("user");
          fetch("/api/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
              userid,
              receipt: order.receipt,
              shipping: {
                name: selectedAddress.name || user.name,
                phone: selectedAddress.phone || "",
                email: user.email || "",
                addressline: selectedAddress.addressline,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
              },
            }),
          })
            .then((r) => r.json())
            .then((result) => {
              if (result.success) {
                toast.success(result.message);
                dispatch(clearCart());
                navigate("/order-success", {
                  replace: true,
                  state: {
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                  },
                });
              } else toast.error(result.message);
            })
            .catch(() => toast.error("Payment verification failed."));
        },
        prefill: {
          name: selectedAddress.name || user.name || "",
          email: user.email || "",
          contact: selectedAddress.phone || "",
        },
        notes: {
          userId: userid || "",
          addressline: selectedAddress.addressline || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "",
          pincode: selectedAddress.pincode || "",
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        toast.error(response.error?.description || "Payment failed");
      });
      paymentObject.open();
    } catch {
      toast.error("Something went wrong while starting the payment.");
    }
  };

  return (
    <div className="h-full bg-slate-50 flex items-center justify-center px-3 py-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="text-lg sm:text-xl" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <FiLock className="text-sm" />
            <span>Secure checkout</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-xs sm:text-sm font-medium text-slate-800 uppercase tracking-wide">
                Delivery details
              </h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 items-start">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        Delivering to{" "}
                        {selectedAddress.name || user.name || "Customer"}
                      </p>
                      {selectedAddress.phone && (
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                          Phone: {selectedAddress.phone}
                        </p>
                      )}
                      {user.email && (
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                          Email: {user.email}
                        </p>
                      )}
                      <div className="mt-3 sm:mt-2 text-xs sm:text-sm text-slate-800">
                        {selectedAddress && selectedAddress.addressline ? (
                          <>
                            <p className="truncate">
                              {selectedAddress.addressline}
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                              {selectedAddress.city}, {selectedAddress.state} -{" "}
                              {selectedAddress.pincode}
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] sm:text-xs text-slate-500">
                            No saved address. Add one to continue.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className=" self-start sm:self-center ">
                      {user.address && user.address.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressDropdown((s) => !s);
                            setShowAddForm(false);
                            setPrevAddressIds(
                              user.address
                                ? user.address.map((a) => String(a._id))
                                : []
                            );
                          }}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-800 bg-white hover:bg-slate-100"
                        >
                          Change address
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressDropdown(true);
                            setShowAddForm(true);
                            setPrevAddressIds(
                              user.address
                                ? user.address.map((a) => String(a._id))
                                : []
                            );
                          }}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-800 bg-white hover:bg-slate-100"
                        >
                          Add address
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddressDropdown && (
                    <div className="mt-3 w-60 sm:w-full bg-white shadow rounded-lg border border-slate-200 p-3 space-y-3 max-h-72 overflow-auto">
                      {!showAddForm ? (
                        <div>
                          {user.address && user.address.length > 0 ? (
                            <div>
                              {user.address.map((addr, idx) => (
                                <div
                                  key={addr._id || idx}
                                  onClick={() => handleAddressSelect(idx)}
                                  className={`p-2 rounded-lg cursor-pointer transition border mb-2 text-sm ${
                                    idx === selectedAddressIndex
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">
                                        {addr.label || "Address"}
                                      </p>
                                      <p className="text-[12px] opacity-90 truncate mt-1">
                                        {addr.addressline}, {addr.city},{" "}
                                        {addr.state} - {addr.pincode}
                                      </p>
                                      <p className="text-[12px] opacity-80 mt-1">
                                        {addr.name}
                                        {addr.phone ? ` • ${addr.phone}` : ""}
                                      </p>
                                    </div>
                                    {addr.default && (
                                      <span className="text-[10px] rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}

                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    setShowAddForm(true);
                                    setPrevAddressIds(
                                      user.address
                                        ? user.address.map((a) => String(a._id))
                                        : []
                                    );
                                  }}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                                >
                                  Add new address
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-slate-700 mb-2">
                                No saved addresses.
                              </p>
                              <button
                                onClick={() => {
                                  setShowAddForm(true);
                                  setPrevAddressIds(
                                    user.address
                                      ? user.address.map((a) => String(a._id))
                                      : []
                                  );
                                }}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                              >
                                Add address
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-0 p-0">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                  Receiver name
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  value={newAddress.name}
                                  onChange={handleNewAddressChange}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                  Receiver phone
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={newAddress.phone}
                                  onChange={handleNewAddressChange}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                Label
                              </label>
                              <input
                                type="text"
                                name="label"
                                value={newAddress.label}
                                onChange={handleNewAddressChange}
                                placeholder="Home / Work"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                              />
                            </div>

                            <div className="mt-3">
                              <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                Address line
                              </label>
                              <input
                                type="text"
                                name="addressline"
                                value={newAddress.addressline}
                                onChange={handleNewAddressChange}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                              />
                            </div>

                            <div className="grid gap-3 md:grid-cols-3 mt-3">
                              <div>
                                <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                  City
                                </label>
                                <input
                                  type="text"
                                  name="city"
                                  value={newAddress.city}
                                  onChange={handleNewAddressChange}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                  State
                                </label>
                                <select
                                  name="state"
                                  value={newAddress.state}
                                  onChange={handleNewAddressChange}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                                >
                                  <option value="">Select state</option>
                                  {indianStates.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                                  PIN Code
                                </label>
                                <input
                                  type="text"
                                  name="pincode"
                                  value={newAddress.pincode}
                                  onChange={handleNewAddressChange}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none"
                                />
                              </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={async () => {
                                  await handleAddAddress();
                                  setShowAddForm(false); // return to list
                                }}
                                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm w-full"
                              >
                                Save address
                              </button>

                              <button
                                onClick={() => {
                                  setShowAddForm(false);
                                  setPrevAddressIds([]);
                                }}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm w-full"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 md:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between">
              Order summary
              <span className="text-[10px] sm:text-[11px] font-normal text-slate-500">
                {carttInfo.TotalQuantity} items
              </span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm max-h-40 sm:max-h-40 overflow-y-auto pr-1">
              {cartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800 line-clamp-2 break-words">
                      {item.title}
                    </span>
                    {item.quantity > 1 && (
                      <span className="block text-[10px] sm:text-[11px] text-slate-500">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-slate-800 whitespace-nowrap">
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-200" />

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{carttInfo.TotalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Govt. Taxes</span>
                <span>₹{tax}</span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between text-sm sm:text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{totalprice}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
            >
              Continue to Payment
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="mt-3 w-full rounded-xl  px-4 py-2.5 text-xs sm:text-sm font-medium text-black hover:text-white shadow-sm transition hover:bg-red-800 active:scale-[0.99]"
            >
              Cancel
            </button>

            <p className="text-[10px] sm:text-[11px] text-slate-500 text-center">
              You will be redirected to a secure payment gateway.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
