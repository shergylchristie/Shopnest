const QueryCollection = require("../models/query");
const ProductCollection = require("../models/product");
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

const showQueryController = async (req, res) => {
  const id = req.params.id;
  try {
    if (id) {
      const queryEmail = await QueryCollection.findById(id);
      res.json(queryEmail);
    } else {
      const queryData = await QueryCollection.find();
      res.json(queryData);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQueryController = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await QueryCollection.findByIdAndDelete(id);
    if (deleted) {
      res.status(200).json({ message: "Deleted Successfully" });
    } else res.status(400).json({ message: "Something went wrong" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addProductController = async (req, res) => {
  try {
    const { title, price, description, category } = req.body;
    const files = req.files || [];

    if (!title || !price || !description || !category) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    if (files.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image." });
    }

    
    const images = files.map((file) => file.path);

    const record = new ProductCollection({
      title,
      price,
      description,
      category,
      image: images[0], // primary image
      images, // all images
    });

    await record.save();

    return res.status(201).json({
      message: "Product Added Successfully",
      product: record,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductController = async (req, res) => {
  console.log("manage called")
  const id = req.params.id;
  try {
    if (id) {
      const singleproductdata = await ProductCollection.findById(id);
      res.json(singleproductdata);
    } else {
      const productdata = await ProductCollection.find();
      res.json(productdata);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await ProductCollection.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const filename = product.image;

    if (filename) {
      const filePath = path.resolve(UPLOAD_DIR, filename);
      if (filePath.startsWith(UPLOAD_DIR)) {
        await fs.unlink(filePath).catch((err) => {
          if (err.code !== "ENOENT") console.error(err);
        });
      }
    }

    await ProductCollection.findByIdAndDelete(id);

    return res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category, stock } = req.body;
    const files = req.files || [];

    const product = await ProductCollection.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields ONLY if they are provided and not empty
    if (title !== undefined && title !== "") product.title = title;
    if (price !== undefined && price !== "") product.price = price;
    if (description !== undefined && description !== "")
      product.description = description;
    if (category !== undefined && category !== "") product.category = category;
    if (stock !== undefined && stock !== "") product.stock = stock;

    // Handle new images
    if (files.length > 0) {
      const newImages = files.map((file) => file.path);

      product.images = [...(product.images || []), ...newImages];

      // Only set primary image if it does not exist
      if (!product.image) {
        product.image = newImages[0];
      }
    }

    // 🔒 GUARANTEE image is never empty
    if (!product.image || product.image.trim() === "") {
      product.image = product.images?.[0] || "";
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReplyData = async (req, res) => {
  try {
    const { to, sub, reply, query } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "shergyljchristie@gmail.com",
        pass: "ezwx tknv gwvp crfg",
      },
    });

    const info = transporter.sendMail({
      from: '"ChristieTech" <shergyljchristie@gmail.com>',
      to: to,
      subject: sub,
      text: `${reply}\n\n---\nOriginal query:\n${query}`,
      html: `<div style="font-family:Arial,sans-serif; font-size: 16px">
      <p>${reply}</p>
      <br/>
      <p><strong>Original query:</strong></p>
      <blockquote>${query}</blockquote>
    </div>
  `,
    });
    if (info) {
      res.status(200).json({ message: "Replied Successfully" });
    } else res.status(400).json({ message: "Something went wrong" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  showQueryController,
  deleteQueryController,
  addProductController,
  getProductController,
  deleteProductController,
  editProductController,
  getReplyData,
};
