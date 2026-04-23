# FANAH Fragrances — Decants Shop

## Overview

E-commerce de venta de decants (muestras) de perfumes de lujo y nicho en Lima, Perú. Marca: FANAH FRAGRANCES (negro, dorado y plata). Toda la UI en español.

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9, Node 24
- **Frontend**: React + Vite + Tailwind v4, wouter, TanStack Query (`artifacts/decants-shop`)
- **API**: Express 5 (`artifacts/api-server`) — sesión por cookie para el carrito
- **DB**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Codegen**: Orval desde `lib/api-spec/openapi.yaml`

## Modelo de datos

- `brands` — marcas
- `products` — perfumes (con descripción, notas top/heart/base, longevidad, sillage)
- `decant_variants` — tamaños 5/10/30 ml por perfume
- `carts` + `cart_items` — carrito por sesión
- `orders` + `order_items` — pedidos con métodos de envío y pago

## Endpoints clave (`/api`)

- Catálogo: `/brands`, `/products` (filtros), `/products/featured|bestsellers|new-arrivals`, `/products/:slug`, `/catalog/summary`
- Carrito: `GET/DELETE /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/:id`
- Pedidos: `POST /orders`, `GET /orders/:orderNumber`

## Comandos

- `pnpm run typecheck` — typecheck completo
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks/schemas
- `pnpm --filter @workspace/db run push` — push schema a DB
- `pnpm --filter @workspace/scripts run seed` — sembrar marcas y perfumes demo

## Notas

- Las imágenes de productos están en `artifacts/decants-shop/public/products/`.
- El logo está en `artifacts/decants-shop/public/fanah-logo.png`.
- Métodos de envío: delivery Lima, envío a provincia, recojo en tienda.
- Métodos de pago: Yape, Plin, transferencia, contraentrega.
- Precios en céntimos de PEN (S/.).
