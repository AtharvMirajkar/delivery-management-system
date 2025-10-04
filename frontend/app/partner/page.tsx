'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MapPin } from 'lucide-react';
import { DeliveryMap } from '@/components/partner/delivery-map';

export default function PartnerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'partner')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'partner') {
      setIsAvailable(user.isAvailable ?? true);
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoadingData(true);
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      await api.updateAvailability(checked);
      setIsAvailable(checked);
      toast({
        title: 'Success',
        description: `You are now ${checked ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: 'picked_up' | 'delivered') => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadOrders();
      toast({
        title: 'Success',
        description: `Order marked as ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'picked_up':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="availability" className="text-sm">
                  Available
                </Label>
                <Switch
                  id="availability"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityChange}
                  disabled={isUpdatingAvailability}
                />
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryMap orders={orders} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No deliveries assigned yet
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <p className="font-medium">Pickup:</p>
                        <p className="pl-2">{order.pickupAddress}</p>
                        <p className="font-medium mt-2">Delivery:</p>
                        <p className="pl-2">{order.deliveryAddress}</p>
                        {order.notes && (
                          <>
                            <p className="font-medium mt-2">Notes:</p>
                            <p className="pl-2 text-gray-500">{order.notes}</p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'assigned' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order._id, 'picked_up')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Mark as Picked Up
                          </Button>
                        )}
                        {order.status === 'picked_up' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
