const categoryModel = require ('../models/categoryModel');
const asyncHandler = require ('../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
    const data = await categoryModel.findAll();
    res.json({ success: true, data });
});