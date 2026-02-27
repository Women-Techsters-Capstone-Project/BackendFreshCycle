const { body, validationResult } = require('express-validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const jwt = require('jsonwebtoken');

const validateAuth = [
    body('phone_number')
        .trim()
        .custom(value => {
            const phoneNumber = parsePhoneNumberFromString(value, 'ZW');

            if (!phoneNumber || !phoneNumber.isValid()) {
                throw new Error('Please enter a Zimbabwe phone number')
            }
            return true;
        })
        .customSanitizer(value => {
            const phoneNumber = parsePhoneNumberFromString(value, 'ZW');
            if (!phoneNumber || !phoneNumber.isValid()) {
                throw new Error('Invalid phone number format');
            }
            return phoneNumber.formatNational().replace(/\s+/g, '');
        }),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }
]

const validateSignup = [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('phone_number').trim().isMobilePhone().withMessage('Valid phone number required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ chars'),
    body('role')
        .isIn(['farmer', 'buyer', 'logistics', 'admin'])
        .withMessage('Role must be farmer, buyer, logistics, or admin'),
    body('location').trim().notEmpty().withMessage('Location is required')
];

module.exports = { validateAuth, validateSignup }
