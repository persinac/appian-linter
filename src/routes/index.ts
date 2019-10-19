import { Router } from 'express';
import UserRouter from './Users';
import LinterRouter from './linter';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/linter', LinterRouter);

// Export the base-router
export default router;
