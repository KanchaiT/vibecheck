const Product = require('../models/Product');

// ==========================================
// 🎯 Function 4.5 - Aggregation Report
// ==========================================
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $project: {
          category: 1,
          salePriceCalc: {
            $multiply: [
              "$originalPrice",
              { $divide: [{ $subtract: [100, "$discountPercent"] }, 100] }
            ]
          }
        }
      },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                avgSalePrice: { $avg: "$salePriceCalc" },
                maxSalePrice: { $max: "$salePriceCalc" }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: "$category",
                totalByCategory: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    if (!stats[0].overallStats.length) {
      return res.status(200).json(null);
    }

    res.status(200).json({
      maxSalePrice: stats[0].overallStats[0].maxSalePrice,
      avgSalePrice: stats[0].overallStats[0].avgSalePrice,
      categoryCounts: stats[0].categoryStats
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, originalPrice, discountPercent, stock } = req.body;
    const newProduct = await Product.create({
      name, category, originalPrice, discountPercent, stock
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🚨 ส่งออกให้ครบทั้ง 4 ฟังก์ชัน
module.exports = { getProductStats, getProducts, getProductById, createProduct };