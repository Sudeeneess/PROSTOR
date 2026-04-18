import { apiRequest } from './client';
import { createAuthService } from './services/auth';
import { createProductsService } from './services/products';
import { createCategoriesService } from './services/categories';
import { createBrandsService } from './services/brands';
import { createSizesService } from './services/sizes';
import { createOrdersService } from './services/orders';
import { createOrderMovementsService } from './services/orderMovements';
import { createPaymentsService } from './services/payments';
import { createCustomerService } from './services/customer';

export const api = {
  ...createAuthService(apiRequest),
  ...createProductsService(apiRequest),
  ...createCategoriesService(apiRequest),
  ...createBrandsService(apiRequest),
  ...createSizesService(apiRequest),
  ...createOrdersService(apiRequest),
  ...createOrderMovementsService(apiRequest),
  ...createPaymentsService(apiRequest),
  ...createCustomerService(apiRequest),
};
