import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
