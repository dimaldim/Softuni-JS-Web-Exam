const {Schema, model} = require('mongoose');

const expensesSchema = new Schema({
    merchant: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: new Date(Date.now())
    },
    total: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        minlength: [10, 'Description should be minimum 10 characters!'],
        maxlength: [50, 'Description should be maximum 50 characters!']
    },
    report: {
        type: Boolean,
        required: true,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = model('Expenses', expensesSchema)