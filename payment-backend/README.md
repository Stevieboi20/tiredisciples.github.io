# Tire Disciples Payment Backend

Node.js/Express backend server for processing Square payments for the Tire Disciples website.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd payment-backend
npm install
```

### 2. Configure Environment

The `.env` file is already configured with your Square credentials:
- Application ID: `sq0idp-3Uyrur-G_ydF0QRb1NIkPA`
- Access Token: `EAAAlxwTrhY6_1m3GO8cut48yLLOpwGSbVaSoQ5-oDRPjupdPBexPFLCk1BzQ6sJ`
- Location ID: `LQT5HQNR8XVXE` (verify this in your Square Dashboard)

### 3. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3001`

### 4. Test the Server

Open your browser and visit:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T...",
  "service": "Tire Disciples Payment API"
}
```

## 📡 API Endpoints

### Process Payment
**POST** `/api/payments/process`

Process a tire purchase payment.

**Request Body:**
```json
{
  "sourceId": "card_token_from_square",
  "amount": 170.00,
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "303-895-7849",
    "notes": "Delivery instructions..."
  },
  "items": [
    {
      "name": "Continental CrossContact LX 20",
      "size": "275/60R20",
      "tread": "70%",
      "price": 170.00,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "abc123...",
  "status": "COMPLETED",
  "receiptUrl": "https://squareup.com/receipt/...",
  "message": "Payment processed successfully"
}
```

### Get Payment Details
**GET** `/api/payments/:paymentId`

Retrieve payment information.

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "abc123...",
    "status": "COMPLETED",
    "amount": 170.00,
    "currency": "USD",
    "createdAt": "2026-02-01T...",
    "receiptUrl": "https://squareup.com/receipt/..."
  }
}
```

### Health Check
**GET** `/health`

Check if the server is running.

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Environment Variables**: Sensitive credentials stored securely
- **HTTPS Ready**: Deploy with SSL certificate

## 🌐 Connecting Frontend to Backend

The frontend (`cart.js`) is already configured to connect to this backend:

```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://api.tiredisciples.com';
```

### For Local Testing:
1. Start backend: `npm start` (runs on port 3001)
2. Open website: `index.html` (runs on port 8080 or file://)
3. Backend automatically accepts requests from localhost

### For Production:
1. Deploy backend to a server (see Deployment section)
2. Update `WEBSITE_URL` in `.env` to your actual domain
3. Update `API_URL` in `cart.js` line 329 with your backend URL

## 📦 Dependencies

- **express**: Web server framework
- **square**: Official Square SDK for Node.js
- **cors**: Enable cross-origin requests
- **helmet**: Security middleware
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variable management
- **uuid**: Generate unique idempotency keys

## 🚀 Deployment Options

### Option 1: Heroku (Recommended for beginners)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create tire-disciples-api`
4. Set environment variables:
```bash
heroku config:set SQUARE_APPLICATION_ID=sq0idp-3Uyrur-G_ydF0QRb1NIkPA
heroku config:set SQUARE_ACCESS_TOKEN=EAAAlxwTrhY6_1m3GO8cut48yLLOpwGSbVaSoQ5-oDRPjupdPBexPFLCk1BzQ6sJ
heroku config:set SQUARE_LOCATION_ID=LQT5HQNR8XVXE
heroku config:set WEBSITE_URL=https://tiredisciples.com
```
5. Deploy: `git push heroku main`

### Option 2: DigitalOcean App Platform

1. Create account at DigitalOcean
2. Create new App
3. Connect GitHub repository
4. Set environment variables in dashboard
5. Deploy automatically

### Option 3: VPS (DigitalOcean, Linode, AWS EC2)

1. Set up Ubuntu server
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
3. Install dependencies: `sudo apt-get install -y nodejs`
4. Clone repository
5. Install PM2: `npm install -g pm2`
6. Start server: `pm2 start server.js --name tire-disciples-api`
7. Set up Nginx reverse proxy
8. Configure SSL with Let's Encrypt

## 🔧 Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify `.env` file exists and has correct credentials
- Run `npm install` to ensure dependencies are installed

### Payment fails with "Invalid credentials"
- Verify Square credentials in `.env` are correct
- Check Location ID matches your Square account
- Ensure Access Token is for Production (not Sandbox)

### CORS errors in browser
- Update `WEBSITE_URL` in `.env` to match your frontend domain
- For local testing, use `http://localhost:8080` or `*` for any origin

### "Cannot find module" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## 📞 Support

For Square-specific issues:
- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square Support](https://squareup.com/help)

For backend issues:
- Check server logs: `npm start` or `pm2 logs`
- Test health endpoint: `http://localhost:3001/health`
- Contact: (303) 895-7849 or Djwisamazing123@gmail.com

## 📝 TODO / Future Enhancements

- [ ] Add email confirmation to customers after purchase
- [ ] Send order notifications to business owner
- [ ] Store orders in database (MongoDB/PostgreSQL)
- [ ] Add refund endpoint
- [ ] Implement webhook for payment status updates
- [ ] Add inventory management
- [ ] Create admin dashboard for viewing orders
- [ ] Add customer order history

## 🔐 Security Checklist

- [x] Access Token stored in `.env` (not in code)
- [x] `.env` added to `.gitignore`
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] CORS configured
- [ ] Deploy with HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular dependency updates
- [ ] Monitor for suspicious activity

---

**Last Updated:** February 1, 2026  
**Version:** 1.0.0  
**Node.js Version:** 18.x or higher
