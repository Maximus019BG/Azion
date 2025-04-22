"use client";
import React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import axios from 'axios';
import {apiUrl} from "@/app/api/config";
import Cookie from 'js-cookie';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface CheckoutButtonProps {
    priceId: string
    quantity?: number
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ priceId, quantity }) => {
    const handleCheckout = async () => {
        try {
            const response = await axios.post(`${apiUrl}/checkout`, {priceId, quantity}, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': Cookie.get('azionAccessToken'),
                },
            });
            const sessionId = response.data.id;

            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({
                    sessionId,
                });

                if (error) {
                    console.error('Error redirecting to checkout:', error);
                }
            }
        } catch (error) {
            console.error('Error during checkout session creation:', error);
        }
    };

    return (
        <button onClick={handleCheckout} className="btn">
            Checkout
        </button>
    );
};

export default CheckoutButton;
