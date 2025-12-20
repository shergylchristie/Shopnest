const mongoose = require("mongoose");
const userCollection = require("../models/user");
const ProductCollection = require("../models/product");
const Address = require("../models/address");
const CartCollection = require("../models/cart");
const OrderCollection = require("../models/order");
const QueryCollection = require("../models/query");
const WishlistCollection = require("../models/wishlist");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const razorpay = require("razorpay");
const crypto = require("crypto");

const rzrpay = new razorpay({
  key_id: process.env.RZR_ID,
  key_secret: process.env.RZR_SECRET,
});

const adminEmails = JSON.parse(process.env.ADMIN_EMAILS);

const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await userCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "An account already exists with this email",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const record = new userCollection({
      name,
      email,
      password: hashPassword,
    });

    if (adminEmails.includes(email)) {
      record.role = "admin";
    }

    await record.save();

    res.status(200).json({
      message:
        record.role === "admin"
          ? "Admin account successfully created"
          : "Successfully registered",
      role: record.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailExists = await userCollection.findOne({ email });

    if (!emailExists) {
      return res
        .status(400)
        .json({ message: "No account found with the given email" });
    }

    const isMatch = await bcrypt.compare(password, emailExists.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Credentials don't match" });
    }

    const token = jwt.sign(
      {
        id: emailExists._id,
        email: emailExists.email,
        role: emailExists.role || "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );

    return res.status(200).json({
      message: "Successfully Logged-In",
      token,
      id: emailExists._id,
      role: emailExists.role,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userCollection.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = await Address.find({ userId: id }).lean();
    return res.status(200).json({ ...user, address });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const updatedUser = await userCollection
      .findByIdAndUpdate(id, { $set: { name, phone, email } }, { new: true })
      .lean();

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    const address = await Address.find({ userId: id }).lean();
    return res.json({ ...updatedUser, address });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const userQueryController = async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;

    if (!name || !email || !query) {
      res.status(400).json({ message: "Please fill all the required fields." });
    }

    const record = new QueryCollection({
      name: name,
      email: email,
      phone: phone,
      query: query,
    });

    await record.save();
    res.status(200).json({ message: "Query Submitted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeAddressController = async (req, res) => {
  try {
    const { id, addressId } = req.params;
    const {
      name,
      phone,
      label,
      addressline,
      city,
      state,
      pincode,
      default: isDefault,
    } = req.body;

    const user = await userCollection.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (addressId) {
      const address = await Address.findOne({ _id: addressId, userId: id });
      if (!address)
        return res.status(404).json({ message: "Address not found" });

      if (name !== undefined) address.name = name;
      if (phone !== undefined) address.phone = phone;
      if (label !== undefined) address.label = label;
      if (addressline !== undefined) address.addressline = addressline;
      if (city !== undefined) address.city = city;
      if (state !== undefined) address.state = state;
      if (pincode !== undefined) address.pincode = pincode;

      if (isDefault === true) {
        address.default = true;
        await Address.updateMany(
          { userId: id, _id: { $ne: addressId } },
          { $set: { default: false } }
        );
      }

      await address.save();
    } else {
      const existingCount = await Address.countDocuments({ userId: id });
      const shouldBeDefault = existingCount === 0 || isDefault === true;

      const address = new Address({
        userId: id,
        name: name || user.name,
        phone: phone || user.phone || "",
        label: label || "",
        addressline,
        city,
        state,
        pincode,
        default: shouldBeDefault,
      });

      await address.save();

      if (shouldBeDefault) {
        await Address.updateMany(
          { userId: id, _id: { $ne: address._id } },
          { $set: { default: false } }
        );
      }
    }

    const updatedUser = await userCollection.findById(id).lean();
    const address = await Address.find({ userId: id }).lean();
    return res.json({ ...updatedUser, address });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const setDefaultAddressController = async (req, res) => {
  try {
    const { id, addressId } = req.params;

    const user = await userCollection.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Address.updateMany({ userId: id }, { $set: { default: false } });
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId: id },
      { $set: { default: true } },
      { new: true }
    );

    if (!updatedAddress)
      return res.status(404).json({ message: "Address not found" });

    const updatedUser = await userCollection.findById(id).lean();
    const address = await Address.find({ userId: id }).lean();
    return res.json({ ...updatedUser, address });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteAddressController = async (req, res) => {
  try {
    const { userid, addressid } = req.params;

    const user = await userCollection.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Address.deleteOne({ _id: addressid, userId: userid });

    const addresses = await Address.find({ userId: userid }).lean();
    if (addresses.length > 0 && !addresses.some((a) => a.default)) {
      const firstId = addresses[0]._id;
      await Address.updateOne({ _id: firstId }, { $set: { default: true } });
    }

    const updatedUser = await userCollection.findById(userid).lean();
    const address = await Address.find({ userId: userid }).lean();
    return res.status(200).json({ ...updatedUser, address });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const changePassController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const userExists = await userCollection.findById(id);
    if (!userExists) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, userExists.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userExists.password = hashedPassword;
    await userExists.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const displayProductController = async (req, res) => {
  const { category } = req.query;
  try {
    if (category) {
      const productdata = await ProductCollection.find({
        category: category,
        stock: "In-Stock",
      });
      return res.json(productdata);
    } else {
      const productdata = await ProductCollection.find({ stock: "In-Stock" });
      return res.json(productdata);
    }
  } catch (error) {
    console.error("displayProductController error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const displaySingleProductController = async (req, res) => {
  const { id } = req.params;
  try {
    const productdata = await ProductCollection.findById(id);
    res.json(productdata);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const mergeGuestCartController = async (req, res) => {
  try {
    const { userid, guestCart = [] } = req.body;

    const cart = await CartCollection.findOne({ userid });

    const mergedItems = (() => {
      const map = new Map();

      cart?.cartItems.forEach((i) =>
        map.set(i.productId.toString(), i.quantity)
      );

      guestCart.forEach((i) => {
        const id = i.productId.toString();
        map.set(id, (map.get(id) || 0) + i.quantity);
      });

      return Array.from(map, ([productId, quantity]) => ({
        productId,
        quantity,
      }));
    })();

    await CartCollection.findOneAndUpdate(
      { userid },
      { cartItems: mergedItems },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const mergeGuestWishlistController = async (req, res) => {
  try {
    const { userid, guestWishlist = [] } = req.body;

    const wishlist = await WishlistCollection.findOne({ userid });

    const mergedItems = (() => {
      const set = new Set();

      wishlist?.wishlistItems.forEach((item) =>
        set.add(item.productId.toString())
      );

      guestWishlist.forEach((productId) => set.add(productId.toString()));

      return Array.from(set).map((productId) => ({ productId }));
    })();

    await WishlistCollection.findOneAndUpdate(
      { userid },
      { wishlistItems: mergedItems },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const saveCartController = async (req, res) => {
  try {
    const { userid, cartItems } = req.body;

    await CartCollection.findOneAndUpdate(
      { userid },
      { cartItems },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const saveWishlistController = async (req, res) => {
  try {
    const { userid, productId } = req.params;

    const wishlist = await WishlistCollection.findOneAndUpdate(
      { userid },
      { $addToSet: { wishlistItems: { productId } } },
      { upsert: true, new: true }
    );

    const populatedWishlist = await wishlist.populate(
      "wishlistItems.productId"
    );

    res.status(200).json({
      wishlistItems: populatedWishlist.wishlistItems.map((i) => i.productId),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchProductsController = async (req, res) => {
  try {
    const keyword = req.query.query.trim() || "";

    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const result = await ProductCollection.find({
      $or: [
        { title: { $regex: safeKeyword, $options: "i" } },
        { category: { $regex: safeKeyword, $options: "i" } },
      ],
      stock: "In-Stock",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};

const fetchCartController = async (req, res) => {
  try {
    const { userid } = req.params;

    const cart = await CartCollection.findOne({ userid }).populate(
      "cartItems.productId"
    );

    if (!cart) {
      return res.status(200).json({ cartItems: [] });
    }

    res.status(200).json({
      cartItems: cart.cartItems.map((item) => ({
        ...item.productId.toObject(),
        quantity: item.quantity,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchWishlistController = async (req, res) => {
  try {
    const { userid } = req.params;

    const wishlist = await WishlistCollection.findOne({ userid }).populate(
      "wishlistItems.productId"
    );

    if (!wishlist) {
      return res.status(200).json({ wishlistItems: [] });
    }

    res.status(200).json({
      wishlistItems: wishlist.wishlistItems.map((item) => item.productId),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCartItemController = async (req, res) => {
  try {
    const { userid, productId } = req.params;

    const updatedCart = await CartCollection.findOneAndUpdate(
      { userid },
      { $pull: { cartItems: { productId } } },
      { new: true }
    ).populate("cartItems.productId");

    if (!updatedCart) {
      res.status(403).json({ message: "Cart Not Found" });
    }

    res.status(200).json({
      cartItems: updatedCart.cartItems.map((item) => ({
        ...item.productId.toObject(),
        quantity: item.quantity,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteWishlistItemController = async (req, res) => {
  try {
    const { userid, productId } = req.params;

    const updatedWishlist = await WishlistCollection.findOneAndUpdate(
      { userid },
      { $pull: { wishlistItems: { productId } } },
      { new: true }
    ).populate("wishlistItems.productId");

    res.status(200).json({
      wishlistItems: updatedWishlist
        ? updatedWishlist.wishlistItems.map((i) => i.productId)
        : [],
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createOrderController = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const receipt = `rcpt_${Date.now()}`;
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };
    const order = await rzrpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const orderVerifyController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      userid,
      receipt,
    } = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RZR_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generate_signature = hmac.digest("hex");
    if (generate_signature === razorpay_signature) {
      const record = new OrderCollection({
        userid: userid,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        receipt: receipt,
        amount: amount,
        status: "Paid",
      });
      await record.save();
      res.status(200).json({ success: true, message: "Payment Successful" });
    } else res.status(400).json({ success: false, message: "Payment Failed" });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const { userid } = req.params;

    const userExists = await userCollection.findById(userid);

    if (!userExists) {
      return res
        .status(400)
        .json({ message: "No account found" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
     
    await Promise.all([
      CartCollection.deleteMany({ userid: userid }),
      WishlistCollection.deleteMany({ userid: userid }),
      Address.deleteMany({ userid: userid }),
    ]);

    await userCollection.findByIdAndDelete(userid);

    res.status(200).json({ message: "Account successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerUserController,
  userLoginController,
  displayProductController,
  saveCartController,
  searchProductsController,
  fetchCartController,
  displaySingleProductController,
  createOrderController,
  orderVerifyController,
  getUserController,
  editProfileController,
  deleteAddressController,
  changeAddressController,
  changePassController,
  setDefaultAddressController,
  userQueryController,
  deleteCartItemController,
  deleteWishlistItemController,
  fetchWishlistController,
  saveWishlistController,
  mergeGuestCartController,
  mergeGuestWishlistController,
  deleteUserAccount,
};
