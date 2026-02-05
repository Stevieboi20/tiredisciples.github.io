require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Client, Environment } = require('square');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Square Client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEBSITE_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Tire Disciples Payment API'
  });
});

// Process Payment
app.post('/api/payments/process', async (req, res) => {
  try {
    const { sourceId, amount, customer, items } = req.body;

    // Validate input
    if (!sourceId || !amount) {
      return res.status(400).json({ error: 'Missing required payment information' });
    }

    // Create payment with Square
    const { paymentsApi } = squareClient;
    
    const paymentRequest = {
      sourceId: sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: uuidv4(),
      autocomplete: true,
      note: `Tire Order: ${items?.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', ')}`,
      buyerEmailAddress: customer?.email
    };

    console.log('Processing payment:', {
      amount: amount,
      customer: customer?.name,
      email: customer?.email,
      items: items?.length
    });

    const response = await paymentsApi.createPayment(paymentRequest);
    const payment = response.result.payment;

    // Log successful payment
    console.log('✅ Payment processed:', {
      paymentId: payment.id,
      amount: payment.amountMoney.amount / 100,
      customer: customer?.name,
      email: customer?.email
    });

    // TODO: Send confirmation email to customer
    // TODO: Send notification to business owner
    // TODO: Store order in database

    res.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      receiptUrl: payment.receiptUrl,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error.message 
    });
  }
});

// Get payment details
app.get('/api/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentsApi } = squareClient;
    
    const response = await paymentsApi.getPayment(paymentId);
    const payment = response.result.payment;

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amountMoney.amount / 100,
        currency: payment.amountMoney.currency,
        createdAt: payment.createdAt,
        receiptUrl: payment.receiptUrl
      }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      details: error.message 
    });
  }
});

// Process Cash on Pickup Order
app.post('/api/orders/cash', async (req, res) => {
  try {
    const { customer, items, totals, orderDate } = req.body;

    // Validate input
    if (!customer || !items || !totals) {
      return res.status(400).json({ error: 'Missing required order information' });
    }

    const orderId = `CASH-${Date.now()}`;

    // Log the cash order
    console.log('💵 Cash Order Received:', {
      orderId: orderId,
      customer: customer.name,
      email: customer.email,
      phone: customer.phone,
      total: totals.total,
      items: items.length
    });

    // TODO: Store order in database
    // TODO: Send confirmation email to customer
    // TODO: Send notification to business owner at Djwisamazing123@gmail.com
    // TODO: Send SMS notification to (303) 895-7849

    // For now, just log the order details
    console.log('Order Details:', {
      orderId,
      customer,
      items,
      totals,
      orderDate,
      paymentMethod: 'cash',
      status: 'pending_pickup'
    });

    res.json({
      success: true,
      orderId: orderId,
      message: 'Cash order received successfully',
      customer: {
        name: customer.name,
        phone: customer.phone
      }
    });

  } catch (error) {
    console.error('❌ Cash order processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process cash order',
      details: error.message 
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Tire Disciples Payment Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💳 Square Environment: Production`);
});

module.exports = app;
