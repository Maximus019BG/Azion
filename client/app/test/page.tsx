import CheckoutButton from "@/app/components/stripe/CheckoutButton";

const Test = () => {
    return (
        <div>
        <h1>Test</h1>
        <CheckoutButton priceId={"price_1RGnggQw1qI3j2q27lmkaC2w"} quantity={21}/>
        </div>
    );
}

export default Test;