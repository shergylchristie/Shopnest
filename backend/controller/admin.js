const QueryCollection = require("../models/query");
const ProductCollection = require("../models/product");
const sendMail = require("../utils/sendMail");
const cloudinary = require("cloudinary").v2;
cloudinary.config();


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
    const imagesPublicIds = files.map((file) => file.filename);

    const product = new ProductCollection({
      title,
      price,
      description,
      category,
      image: images[0],
      images,
      imagePublicId: imagesPublicIds[0],
      imagesPublicIds,
    });

    await product.save();

    return res.status(201).json({
      message: "Product Added Successfully",
      product
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductController = async (req, res) => {
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
    const { id } = req.params;

    const product = await ProductCollection.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const publicIds = [];

    if (product.imagePublicId) {
      publicIds.push(product.imagePublicId);
    }

    if (product.imagesPublicIds?.length > 0) {
      publicIds.push(...product.imagesPublicIds);
    }

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await product.deleteOne();

    return res.status(200).json({
      message: "Product and images deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category, stock } = req.body;

    const replaceIndexes = req.body.replaceIndexes
      ? Array.isArray(req.body.replaceIndexes)
        ? req.body.replaceIndexes.map(Number)
        : [Number(req.body.replaceIndexes)]
      : [];

    const deleteIndexes = req.body.deleteIndexes
      ? Array.isArray(req.body.deleteIndexes)
        ? req.body.deleteIndexes.map(Number)
        : [Number(req.body.deleteIndexes)]
      : [];

    const replaceFiles = req.files?.replaceImages || [];
    const newFiles = req.files?.newImages || [];

    const product = await ProductCollection.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (title) product.title = title;
    if (price) product.price = price;
    if (description) product.description = description;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    replaceIndexes.forEach((index, i) => {
      if (!product.images[index] || !replaceFiles[i]) return;

      cloudinary.api.delete_resources([product.imagesPublicIds[index]]);

      product.images[index] = replaceFiles[i].path;
      product.imagesPublicIds[index] = replaceFiles[i].filename;
    });

    deleteIndexes.sort((a, b) => b - a);
    for (const index of deleteIndexes) {
      if (product.images[index]) {
        await cloudinary.api.delete_resources([product.imagesPublicIds[index]]);
        product.images.splice(index, 1);
        product.imagesPublicIds.splice(index, 1);
      }
    }

    newFiles.forEach((file) => {
      product.images.push(file.path);
      product.imagesPublicIds.push(file.filename);
    });

    if (product.images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    if (product.images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    product.image = product.images[0];
    product.imagePublicId = product.imagesPublicIds[0];

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



const sendReplyData = async (req, res) => {
  try {
    const { to, sub, reply, query } = req.body;

    if (!to || !sub || !reply) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await sendMail({
      to,
      subject: sub,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px">
          <p>${reply}</p>
          <br/>
          <p><strong>Original query:</strong></p>
          <blockquote>${query || ""}</blockquote>
        </div>
      `,
    });

    return res.status(200).json({ message: "Replied Successfully" });
  } catch (error) {
    console.error("Send reply mail error:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
};




module.exports = {
  showQueryController,
  deleteQueryController,
  addProductController,
  getProductController,
  deleteProductController,
  editProductController,
  sendReplyData,
};
