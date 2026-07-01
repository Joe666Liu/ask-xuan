import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"
import { getPlanById, getPriceById } from "@/config/payment-config"
import { getDefaultPaymentAdapter, getPaymentAdapter } from "@/integrations/payment/"
import {
  generateProductName,
  getCheckoutPaymentType,
  getOrderTypeFromPlan,
} from "@/integrations/payment/utils"
import { OrderService } from "@/services/order.service"
import { logger } from "@/shared/lib/tools/logger"
import { Resp } from "@/shared/lib/tools/response"
import { apiAuthMiddleware } from "@/shared/middleware/auth.middleware"
import type { PaymentProvider } from "@/shared/types/payment"

const checkoutSchema = z.object({
  planId: z.string().min(1),
  priceId: z.string().min(1),
  provider: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const Route = createFileRoute("/api/payment/checkout")({
  server: {
    middleware: [apiAuthMiddleware],
    handlers: {
      POST: async ({ context, request }) => {
        try {
          const { user } = context.session
          const userId = user.id

          const body = await request.json()
          const { planId, priceId, provider, successUrl, cancelUrl, metadata } =
            checkoutSchema.parse(body)

          const plan = getPlanById(planId)
          if (!plan) {
            return Resp.error(`Plan not found: ${planId}`, 400)
          }

          const price = getPriceById(planId, priceId)
          if (!price) {
            return Resp.error(`Price not found: ${priceId}`, 400)
          }

          const adapter = provider
            ? await getPaymentAdapter(provider as PaymentProvider)
            : await getDefaultPaymentAdapter()

          const paymentType = getCheckoutPaymentType(plan.planType)

          if (paymentType === "subscription" && !adapter.capabilities.subscription) {
            return Resp.error(`Provider ${adapter.name} does not support subscriptions`, 400)
          }

          if (paymentType === "one_time" && !adapter.capabilities.oneTime) {
            return Resp.error(`Provider ${adapter.name} does not support one-time payments`, 400)
          }

          const orderService = new OrderService()
          const order = await orderService.createOrder({
            userId,
            orderType: getOrderTypeFromPlan(plan),
            productId: priceId,
            productName: generateProductName(plan.name || plan.id, price.interval),
            amount: price.amount,
            currency: price.currency,
            metadata: {
              ...metadata,
              planId,
              priceId,
            },
          })

          const result = await adapter.createCheckout({
            type: paymentType,
            orderId: order.id,
            planId,
            priceId,
            email: user.email,
            userId,
            successUrl:
              successUrl || `${process.env.VITE_APP_URL}/app/settings/billing?success=true`,
            cancelUrl: cancelUrl || `${process.env.VITE_APP_URL}/app/settings/billing`,
            metadata: {
              ...metadata,
              planId,
              priceId,
            },
          })

          logger.info(
            `Checkout created: ${adapter.name} - ${result.sessionId} for order ${order.id}`
          )

          return Resp.success({
            provider: adapter.name,
            orderId: order.id,
            ...result,
          })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Resp.error(`Invalid data: ${error.issues.map((i) => i.message).join(", ")}`, 400)
          }
          logger.error("Error creating checkout:", error)
          const message = error instanceof Error ? error.message : "Unknown error"
          return Resp.error(`Failed to create checkout: ${message}`, 500)
        }
      },
    },
  },
})
