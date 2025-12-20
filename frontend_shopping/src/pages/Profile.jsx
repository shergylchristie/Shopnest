import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiShield,
  FiMoreHorizontal,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";
import { Skeleton } from "@mui/material";

const ProfilePageSkeleton = () => {
  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-4 md:py-8">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 p-5 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiUser className="text-xl" />
            <Skeleton variant="text" width={120} height={24} />
          </div>
          <Skeleton
            variant="rectangular"
            width={110}
            height={32}
            className="rounded-full"
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={56} height={56} />
              <div>
                <Skeleton variant="text" width={160} height={18} />
                <Skeleton variant="text" width={120} height={14} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-3">
                <FiMail className="text-slate-400 mt-0.5" />
                <div className="w-full">
                  <Skeleton variant="text" width={60} height={14} />
                  <Skeleton variant="text" width="80%" height={18} />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiPhone className="text-slate-400 mt-0.5" />
                <div className="w-full">
                  <Skeleton variant="text" width={60} height={14} />
                  <Skeleton variant="text" width="50%" height={18} />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiShield className="text-slate-400 mt-0.5" />
                <div className="w-full">
                  <Skeleton variant="text" width={90} height={14} />
                  <Skeleton variant="text" width={70} height={18} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width={140} height={18} />
              <Skeleton variant="text" width={60} height={16} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 flex gap-3">
                <FiMapPin className="text-slate-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={18}
                      className="rounded-full"
                    />
                  </div>
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="90%" height={16} />
                </div>
              </div>

              <Skeleton variant="text" width={120} height={16} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const id = localStorage.getItem("user");
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
    address: [],
  });
  const [show, setShow] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const initials = user.name?.match(/\b\w/g)?.join("").toUpperCase() || "?";

  const hasAddress = user.address && user.address.length > 0;
  const addresses = hasAddress ? user.address : [];
  const defaultAddress = addresses.find((a) => a.default === true);

  const navigate = useNavigate();

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
      } catch {
        toast.error("Failed to load user");
      } finally {
        setLoadingUser(false);
      }
    };
    if (id) loadUser();
  }, [id]);

  const handleSetDefault = async (addressId) => {
    try {
      const res = await apiFetch(`/api/setDefault/${id}/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to set default address");
        return;
      }

      setUser(data);
      toast.success("Default address updated");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await apiFetch(`/api/deleteAddress/${id}/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data);
        toast.success("Address deleted");
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!authChecked) return null;
  if (!showProfile) return null;
  if (loadingUser) return <ProfilePageSkeleton />;

  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-4 md:py-8">
      <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 p-5 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiUser className="text-xl" />
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              My Profile
            </h1>
          </div>
          <button
            onClick={() => navigate("/editprofile")}
            className="inline-flex items-center gap-2 text-xs md:text-sm rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
          >
            <FiEdit2 className="text-xs" />
            Edit profile
          </button>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-700">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-3">
                <FiMail className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="text-slate-800">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiPhone className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Phone
                  </p>
                  <p className="text-slate-800">
                    {user.phone ? `+91${user.phone}` : "Not added"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiShield className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Account status
                  </p>
                  <p className="text-emerald-600 text-xs font-medium">
                    Verified
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Saved addresses
              </h2>
              <button
                onClick={() => navigate("/editprofile/?add=new")}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Add new
              </button>
            </div>

            {defaultAddress ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 flex gap-3 relative">
                  <FiMapPin className="text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {defaultAddress.label || "Other"}
                      </span>
                      <span className="text-[10px] rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {defaultAddress.name && `${defaultAddress.name}, `}
                      {defaultAddress.phone && `+91${defaultAddress.phone}, `}
                      {`${defaultAddress.addressline}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.pincode}`}
                    </p>
                    <div className="text-end mt-1 me-2">
                      <button
                        onClick={() =>
                          setShow(
                            show === defaultAddress._id
                              ? null
                              : defaultAddress._id
                          )
                        }
                        onBlur={() => {
                          setTimeout(() => setShow(null), 250);
                        }}
                        className="p-1 rounded-full hover:bg-slate-100"
                      >
                        <FiMoreHorizontal className="text-lg" />
                      </button>
                    </div>

                    {show === defaultAddress._id && (
                      <div className="absolute right-2 top-10 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                        <button
                          onClick={() =>
                            navigate(`/editprofile/${defaultAddress._id}`)
                          }
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                        >
                          Edit address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {addresses.length > 1 ? (
                  <button
                    onClick={() => setShowAddress((s) => !s)}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    {showAddress ? "Hide Addresses" : "Show All Addresses"}
                  </button>
                ) : null}

                {showAddress &&
                  addresses
                    .filter((value) => !value.default)
                    .map((value) => (
                      <div
                        key={value._id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 flex gap-3 relative"
                      >
                        <FiMapPin className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              {value.label || "Other"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {value.name && `${value.name}, `}
                            {value.phone && `+91${value.phone}, `}
                            {`${value.addressline}, ${value.city}, ${value.state}, ${value.pincode}`}
                          </p>
                          <div className="text-end mt-1 me-2">
                            <button
                              onClick={() =>
                                setShow(show === value._id ? null : value._id)
                              }
                              onBlur={() => {
                                setTimeout(() => setShow(null), 250);
                              }}
                              className="p-1 rounded-full hover:bg-slate-100"
                            >
                              <FiMoreHorizontal className="text-lg" />
                            </button>
                          </div>

                          {show === value._id && (
                            <div className="absolute right-2 top-10 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                              <button
                                onClick={() => handleSetDefault(value._id)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                              >
                                Set as default
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/editprofile/${value._id}`)
                                }
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                              >
                                Edit address
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(value._id)}
                                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                              >
                                Delete address
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            ) : (
              <div className="p-3">
                <p className="text-center text-sm font-light">
                  No Saved Addresses...
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
