const ticketModel = require('../models/ticketModel');
const categoryModel = require('../models/categoryModel');
const replyModel = require('../models/replyModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { STATUSES, PRIORITIES, validateTicketInput, str } = require('../utils/validators');

const parseId= (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <=0 ) throw new AppError(400, 'ID tidak valid');
    return id;
};