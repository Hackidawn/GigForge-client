import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../services/api'

export default function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async e => {
    e.preventDefault()
    const { error, paymentIntent } = await stripe.confirmCardPayment(elements.getElement(CardElement).clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })

    if (!error && paymentIntent.status === 'succeeded') {
      await api.post('/orders/confirm', { paymentIntentId: paymentIntent.id })
      alert('Payment confirmed!')
    } else {
      alert('Payment failed!')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <CardElement />
      <button className="mt-4 bg-green-600 text-white p-2 rounded">Pay</button>
    </form>
  )
}
