# Payments — read before connecting anything

## The problem with the original brief

The brief said "configure a Stripe checkout integration." **Stripe cannot serve a
domestic Indian store on a standard account.** This is regulatory, not technical:

- Stripe India stopped onboarding new domestic businesses. Indian entities selling
  to Indian customers in INR generally cannot use Stripe for that flow.
- RBI card-storage rules require tokenisation; RBI e-mandate rules govern
  recurring charges. Domestic gateways implement these; Stripe's India product
  is effectively limited to export/international collection.

Swapping an API key will not fix this. The provider has to change.

## What to use instead

**Razorpay** is the default recommendation for a Chandigarh-based store:
UPI, cards, netbanking, wallets, and COD reconciliation. Alternatives worth a
look are Cashfree and PhonePe PG.

UPI matters more than cards here. For a store with ₹18,000–₹65,000 pieces, UPI
and netbanking will carry most of the volume.

## What is built right now

`src/components/commerce/checkout-form.tsx` collects and validates the delivery
address — Indian shape, with PIN code and a mandatory 10-digit mobile, because
couriers call before delivery. On submit it stops and says payment is not
connected. It does **not** pretend to charge anyone.

## To connect Razorpay

1. Create a Razorpay account and complete KYC for the business entity.
2. `npm install razorpay`
3. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local` (never commit).
4. Add a Server Action that creates an order server-side and returns `order_id`.
   Never trust an amount sent from the browser — recompute it from the catalogue.
5. Open Razorpay Checkout with that `order_id`.
6. Add a webhook route that verifies the signature, marks the order paid, and
   decrements stock.

## Stock is the real risk

Most pieces are `stock: 1`. Two people can add the same shawl and both reach
payment. Before going live you need to reserve stock at order creation and
release it on failure or timeout. Selling the same one-of-one shawl twice is the
worst failure this shop can have.

## GST

Textiles are not zero-rated. Confirm the correct HSN and rate with an accountant
and show tax on the invoice.
