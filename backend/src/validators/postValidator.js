const { body } = require('express-validator');

exports.postValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required.')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters.'),

    body('content')
        .trim()
        .notEmpty().withMessage('Content is required.'),

    body('type')
        .optional()
        .isIn(['post', 'page']).withMessage('Type must be "post" or "page".'),

    body('slug')
        .optional()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')

];

exports.updatePostValidationRules = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters.'),

    body('content')
        .optional()
        .trim()
        .notEmpty().withMessage('Content cannot be empty.'),

    body('type')
        .not().exists().withMessage('Type cannot be changed.'),

    body('slug')
        .optional()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')


];
