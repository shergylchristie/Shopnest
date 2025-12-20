import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiArrowLeft,
  FiSave,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import { apiFetch } from "../apiClient";
import { Skeleton } from "@mui/material";

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

const EditProfileSkeleton = () => (
  <div className="bg-slate-50 flex items-center justify-center px-4 py-2 md:py-5">
    <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 p-5 max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200">
            <FiArrowLeft className="text-sm" />
          </button>
          <div className="flex items-center gap-2">
            <FiUser className="text-lg sm:text-xl" />
            <Skeleton
              variant="text"
              width={100}
              height={20}
              className="!w-[100px] sm:!w-[120px]"
            />
          </div>
        </div>
        <Skeleton
          variant="rectangular"
          width={110}
          height={32}
          className="rounded-full w-[110px] sm:w-[130px]"
        />
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[2fr,1.2fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton
                variant="circular"
                width={56}
                height={56}
                className="!w-[56px] !h-[56px] sm:w-16 sm:h-16"
              />
              <div className="space-y-1 w-[140px] sm:w-[160px]">
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="100%" height={14} />
              </div>
            </div>

            <div className="mt-2 space-y-4">
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col w-[120px]">
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="100%" height={14} />
              </div>
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                className="!w-7 !h-7"
              />
            </div>
            <div className="space-y-3">
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                className="!w-7 !h-7"
              />
            </div>
            <div className="space-y-3">
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
              <Skeleton
                variant="rectangular"
                height={40}
                className="rounded-xl w-full"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                className="!w-7 !h-7"
              />
            </div>
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton
              variant="rectangular"
              height={40}
              className="rounded-xl w-full"
            />
          </section>
        </div>
      </div>
    </div>
  </div>
);


const EditProfilePage = () => {
  const id = localStorage.getItem("user");
  const { addId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const openFromNav = location.state?.openAddress;

  
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
    address: [],
  });

  const [newaddress, setNewAddress] = useState({
    name: "",
    phone: "",
    label: "",
    addressline: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [showProfile, setShowProfile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showPass, setShowPass] = useState({});
  const [username, setUsername] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [profileOpen, setProfileOpen] = useState(!addId || !openFromNav);
  const [addressOpen, setAddressOpen] = useState(!!addId || !!openFromNav);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  useEffect(() => {
    if (openFromNav) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = username?.match(/\b\w/g)?.join("").toUpperCase() || "?";

  const toggle = (key) =>
    setShowPass((prev) => ({ ...prev, [key]: !prev[key] }))


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setShowProfile(true);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && !showProfile) {
      navigate("/login", { replace: true });
    }
  }, [authChecked, showProfile, navigate]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const res = await apiFetch(`/api/getUser/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
        setUsername(data.name);
      } catch {
        toast.error("Failed to load user data");
      } finally {
        setLoadingUser(false);
      }
    };

    if (id) loadUser();
  }, [id]);

  useEffect(() => {
    if (!addId) {
      setNewAddress({
        name: "",
        phone: "",
        label: "",
        addressline: "",
        city: "",
        state: "",
        pincode: "",
      });
      return;
    }

    const addr = user.address.find((a) => a._id === addId);
    if (addr) {
      setNewAddress({
        name: addr.name || user.name || "",
        phone: addr.phone || user.phone || "",
        label: addr.label || "",
        addressline: addr.addressline || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
      });
    } else {
      setNewAddress({
        name: "",
        phone: "",
        label: "",
        addressline: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  }, [addId, user.address, user.name, user.phone]);

  if (!authChecked) return null;
  if (!showProfile) return null;
  if (loadingUser) return <EditProfileSkeleton />;

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAddress = (e) => {
    setNewAddress({ ...newaddress, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const profileRes = await apiFetch(`/api/changeuserprofile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          email: user.email,
        }),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) {
        toast.error(profileData.message || "Failed to save profile");
        return;
      }

      let updatedUser = profileData;

      const hasAddressData = Object.values(newaddress).some(
        (v) => v && v.toString().trim() !== ""
      );

      if (hasAddressData) {
        const isEditing = Boolean(addId);
        const url = isEditing
          ? `/api/changeuseraddress/${id}/${addId}`
          : `/api/changeuseraddress/${id}`;
        const method = isEditing ? "PUT" : "POST";

        const res = await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newaddress),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to save address");
          return;
        }

        updatedUser = data;
      }

      setUser(updatedUser);
      toast.success("Saved Successfully");
      navigate("/profile");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await apiFetch(`/api/changepass/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else toast.error(result.message);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingPassword(false);
    }
  };
 

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-2 md:py-5">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 p-5 max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-50"
            >
              <FiArrowLeft className="text-sm" />
            </button>
            <div className="flex items-center gap-2">
              <FiUser className="text-lg sm:text-xl" />
              <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
                Edit profile
              </h1>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:inline-flex items-center justify-center gap-2 text-xs sm:text-sm rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed"
          >
            <FiSave className="text-xs" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[2fr,1.2fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-200 flex items-center justify-center text-xl sm:text-2xl font-semibold text-slate-700">
                  {initials}
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    {username}
                  </p>
                  <p className="text-xs text-slate-500">
                    Update your personal information
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:hidden mt-2">
                <h2 className="text-xs font-semibold text-slate-900">
                  Profile details
                </h2>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 hover:bg-slate-100"
                >
                  <FiChevronDown
                    className={`text-sm transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className={`mt-2 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  profileOpen
                    ? "max-h-[600px] opacity-100"
                    : "max-h-0 opacity-0"
                } sm:max-h-none sm:opacity-100`}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      Name
                    </label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="name"
                      value={user.name}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700 flex items-center gap-1">
                      <FiMail className="text-[10px]" />
                      Email
                    </label>
                    <input
                      type="email"
                      onChange={handleChange}
                      name="email"
                      value={user.email}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700 flex items-center gap-1">
                      <FiPhone className="text-[10px]" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      onChange={handleChange}
                      name="phone"
                      value={user.phone}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-3 w-full sm:hidden rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <FiSave className="text-xs" />
                    {saving ? "Saving..." : "Save profile"}
                  </span>
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                    Address details
                  </h2>
                  <span className="text-[11px] sm:text-xs text-slate-500">
                    Used for deliveries
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressOpen((open) => !open)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 hover:bg-slate-100 sm:hidden"
                >
                  <FiChevronDown
                    className={`text-sm transition-transform ${
                      addressOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  addressOpen
                    ? "max-h-[700px] opacity-100"
                    : "max-h-0 opacity-0"
                } sm:max-h-none sm:opacity-100`}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      Receiver name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newaddress.name}
                      onChange={handleAddress}
                      placeholder="Person receiving the order"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      Receiver phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newaddress.phone}
                      onChange={handleAddress}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                    Address label
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={newaddress.label}
                    onChange={handleAddress}
                    placeholder="Label (e.g. Home, Work)"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <label className="text-[11px] sm:text-xs font-medium text-slate-700 mt-3">
                    Address line
                  </label>
                  <input
                    type="text"
                    name="addressline"
                    value={newaddress.addressline}
                    onChange={handleAddress}
                    placeholder="Address"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex flex-col gap-1 md:col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Jaipur"
                      onChange={handleAddress}
                      value={newaddress.city}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      State
                    </label>
                    <select
                      value={newaddress.state}
                      name="state"
                      onChange={handleAddress}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="">Select state</option>
                      {indianStates.map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={newaddress.pincode}
                      onChange={handleAddress}
                      placeholder="000000"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm w-full outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-3 w-full sm:hidden rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <FiSave className="text-xs" />
                    {saving ? "Saving..." : "Save address"}
                  </span>
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  Security
                </h2>
                <button
                  type="button"
                  onClick={() => setSecurityOpen((open) => !open)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-slate-200 hover:bg-slate-100 sm:hidden"
                >
                  <FiChevronDown
                    className={`text-sm transition-transform ${
                      securityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  securityOpen
                    ? "max-h-[600px] opacity-100"
                    : "max-h-0 opacity-0"
                } sm:max-h-none sm:opacity-100`}
              >
                <form onSubmit={handlePassword}>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                        Current password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass.current ? "text" : "password"}
                          name="currentPassword"
                          value={password.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          disabled={updatingPassword}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => toggle("current")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600"
                          disabled={updatingPassword}
                        >
                          {showPass.current ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass.new ? "text" : "password"}
                          name="newPassword"
                          value={password.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="New password"
                          disabled={updatingPassword}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => toggle("new")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600"
                          disabled={updatingPassword}
                        >
                          {showPass.new ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] sm:text-xs font-medium text-slate-700">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={password.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm password"
                          disabled={updatingPassword}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => toggle("confirm")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600"
                          disabled={updatingPassword}
                        >
                          {showPass.confirm ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="mt-3 w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:border-slate-400 disabled:cursor-not-allowed"
                  >
                    {updatingPassword ? "Updating..." : "Update password"}
                  </button>
                </form>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-rose-900">
                  Danger zone
                </h2>
                <button
                  type="button"
                  onClick={() => setDangerOpen((open) => !open)}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-rose-200 hover:bg-rose-100 sm:hidden"
                >
                  <FiChevronDown
                    className={`text-sm transition-transform ${
                      dangerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${
                  dangerOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                } sm:max-h-none sm:opacity-100`}
              >
                <p className="text-[11px] sm:text-xs text-rose-700">
                  Deleting your account will log you out and remove all the data
                  related to your account. You can not retrieve any data, once
                  your account is deleted.
                </p>
                <button className="w-full rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-rose-700 hover:bg-rose-50">
                  Delete account
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
