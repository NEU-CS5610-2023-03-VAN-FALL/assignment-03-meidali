import * as dotenv from 'dotenv'
dotenv.config()
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from 'express-oauth2-jwt-bearer'

const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

const app = express();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.json());

app.get("/ping", (req, res) => {
    res.send("pong");
  });
  
app.get('/api/menu-items', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/menu-items', async (req, res) => {
    try {
        const menuItems = await prisma.menuItem.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/order-history', requireAuth, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub; 
        const user = await prisma.user.findUnique({
            where: {
              auth0Id,
            },
          });
        const orders = await prisma.orderHistory.findMany({
            where: { userId: user.id},
            select: {
                id: true,
                createdTime: true
            }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/order-detail/:orderId', async (req, res) => {
  try {
      const orderId = parseInt(req.params.orderId);
      const orderDetails = await prisma.orderHistory.findUnique({
          where: {
              id: orderId
          },
          include: {
              orderItems: {
                  include: {
                      menuItem: true
                  }
              }
          }
      });
      res.json(orderDetails);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/order-history/:orderId', requireAuth, async (req, res) => {
  try {
      const { orderId } = req.params;

      const order = await prisma.orderHistory.findUnique({
          where: { id: parseInt(orderId, 10) },
          include: {
              orderItems: {
                  include: {
                      menuItem: true
                  }
              }
          }
      });

      if (order) {
          res.json(order);
      } else {
          res.status(404).send('Order not found');
      }
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).send('Internal server error');
  }
});

app.put('/api/order-history/:orderId', requireAuth, async (req, res) => {
  try {
      const { orderId } = req.params;
      const updatedData = req.body; 

      const updatedOrder = await prisma.orderHistory.update({
          where: { id: parseInt(orderId, 10) },
          data: updatedData
      });

      res.json(updatedOrder);
  } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).send('Internal server error');
  }
});

app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub; 

        const user = await prisma.user.findUnique({
            where: { auth0Id: auth0Id },
            include: {
                likes: {
                    include: {
                        menuItem: true
                    }
                }
            }
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Internal server error');
    }
});

app.put('/api/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.auth.payload.sub; 
        const { name } = req.body;

        const updatedUser = await prisma.user.update({
            where: { auth0Id: userId },
            data: { name },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/order', requireAuth, async (req, res) => {
    try {
        const { menuItemId } = req.body;
        const userId = req.auth.payload.sub; 

        const newOrder = await prisma.orderHistory.create({
            data: {
                user: { connect: { auth0Id: userId } },
                orderItems: {
                    create: [{ menuItem: { connect: { id: menuItemId } } }]
                }
            }
        });

        res.status(200).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Internal server error');
    }
});

app.delete('/api/order-history/:orderId', requireAuth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.auth.payload.sub; // Adjust based on your auth setup

        // First delete related OrderItem records
        await prisma.orderItem.deleteMany({
            where: {
                orderId: parseInt(orderId, 10),
            }
        });

        // Then delete the OrderHistory record
        await prisma.orderHistory.delete({
            where: {
                id: parseInt(orderId, 10),
            }
        });

        res.status(200).send('Order deleted');
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send('Internal server error');
    }
});



app.post("/verify-user", requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
    const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
  
    if (user) {
      res.json(user);
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          auth0Id,
          name,
        },
      });
  
      res.json(newUser);
    }
  });

  app.post('/api/like', requireAuth, async (req, res) => {
    try {
        const { menuItemId } = req.body;
        const auth0UserId = req.auth.payload.sub; 

        // Lookup internal user ID
        const user = await prisma.user.findUnique({
            where: { auth0Id: auth0UserId }
        });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const like = await prisma.like.create({
            data: {
                userId: user.id, 
                menuItemId: menuItemId
            }
        });

        res.status(200).json(like);
    } catch (error) {
        console.error('Error liking menu item:', error);
        res.status(500).send('Internal server error');
    }
});


app.delete('/api/like/:menuItemId', requireAuth, async (req, res) => {
  try {
      const { menuItemId } = req.params;
      const auth0UserId = req.auth.payload.sub; 

      const user = await prisma.user.findUnique({
        where: { auth0Id: auth0UserId }
    });
    if (!user) {
        return res.status(404).send('User not found');
    }

      await prisma.like.deleteMany({
          where: {
              userId: user.id,
              menuItemId: parseInt(menuItemId, 10)
          }
      });

      res.status(200).send('Successfully unliked');
  } catch (error) {
      console.error('Error unliking menu item:', error);
      res.status(500).send('Internal server error');
  }
});

app.get('/api/likes', requireAuth, async (req, res) => {
    try {
        const auth0UserId = req.auth.payload.sub; 
        const user = await prisma.user.findUnique({
            where: { auth0Id: auth0UserId }
        });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const likes = await prisma.like.findMany({
            where: { userId: user.id },
            include: {
                menuItem: true
            }
        });

        res.json(likes);
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).send('Internal server error');
    }
});



app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});