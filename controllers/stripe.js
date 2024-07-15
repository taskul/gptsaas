const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DOMAIN = "http://localhost:3000";

exports.createCheckout = async (req, res) => {
    const { priceId, sub } = req.body;

    try {
        const user = await User.findById(req.user);
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            metadata: { 
                user_id: user._id.toString(), 
                subscription: sub 
            },
            success_url: `${DOMAIN}/`,
            cancel_url: `${DOMAIN}/`,
            automatic_tax: { enabled: true },
        });
        return res.status(200).json(session);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

exports.createPortal = async (req, res) => {
    const { customerId } = req.body;
    try {
        // The customer URL parameter will take that customer ID variable we just defined, and the return variable will just be the home page.
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${DOMAIN}/`,
        });
        // And then after that we'll just return that portal session object.
        return res.status(200).json(portalSession);
    } catch (err) {
        console.error(err);
        return res.status(404).json({ message: err.message });
    }
}

exports.createWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('Error verifying webhook signature:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("EVENT:", event.type);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                console.log("checkout session completed");
                const user_id = event.data.object.metadata.user_id;
                await stripe.customers.update(event.data.object.customer, {
                    metadata: {
                        user_id: user_id,
                        sub: event.data.object.metadata.subscription,
                    },
                });
                const user = await User.findById(user_id);
                user.customerId = event.data.object.customer;
                user.subscription = event.data.object.metadata.subscription;
                await user.save();
                break;
            }
            case 'payment_intent.succeeded': {
                console.log("payment intent succeeded");
                const customer_id = event.data.object.customer;
                const customer = await stripe.customers.retrieve(customer_id);

                const user = await User.findOne({ customerId: customer_id });
                console.log("USER SUBSCRIPTION 1", customer.metadata.sub);
                console.log("USER", user);
                if (user) {
                    user.subscription = customer.metadata.sub;
                    console.log("USER SUBSCRIPTION", customer.metadata.sub);
                    await user.save();
                }
                break;
            }
            
            case 'payment_intent.payment_failed': {
                console.log("payment intent failed");
                const customer_id = event.data.object.customer;
                const user = await User.findOne({ customerId: customer_id });
                if (user) {
                    user.subscription = "";
                    await user.save();
                }
                break;
            }
            case 'customer.subscription.deleted': {
                console.log("customer subscription deleted");
                const customer_id = event.data.object.customer;
                const user = await User.findOne({ customerId: customer_id });
                if (user) {
                    user.subscription = "";
                    await user.save();
                }
                break;
            }
            case 'customer.deleted': {
                console.log("customer deleted");
                const customer_id = event.data.object.customer;
                const user = await User.findOne({ customerId: customer_id });
                if (user) {
                    user.customerId = "";
                    user.subscription = "";
                    await user.save();
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }
    } catch (err) {
        console.error(`Webhook handler error: ${err.message}`);
        return res.status(500).send(`Webhook handler error: ${err.message}`);
    }

    res.status(200).json({ received: true });
}
