'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupAddress: '',
    pickupLat: '',
    pickupLng: '',
    deliveryAddress: '',
    deliveryLat: '',
    deliveryLng: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.createOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        pickupAddress: formData.pickupAddress,
        pickupLocation: {
          lat: parseFloat(formData.pickupLat),
          lng: parseFloat(formData.pickupLng),
        },
        deliveryAddress: formData.deliveryAddress,
        deliveryLocation: {
          lat: parseFloat(formData.deliveryLat),
          lng: parseFloat(formData.deliveryLng),
        },
        notes: formData.notes,
      });

      setFormData({
        customerName: '',
        customerPhone: '',
        pickupAddress: '',
        pickupLat: '',
        pickupLng: '',
        deliveryAddress: '',
        deliveryLat: '',
        deliveryLng: '',
        notes: '',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pickup Address</Label>
            <Input
              id="pickupAddress"
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLat">Pickup Latitude</Label>
              <Input
                id="pickupLat"
                type="number"
                step="any"
                placeholder="e.g., 40.7128"
                value={formData.pickupLat}
                onChange={(e) => setFormData({ ...formData, pickupLat: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupLng">Pickup Longitude</Label>
              <Input
                id="pickupLng"
                type="number"
                step="any"
                placeholder="e.g., -74.0060"
                value={formData.pickupLng}
                onChange={(e) => setFormData({ ...formData, pickupLng: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryLat">Delivery Latitude</Label>
              <Input
                id="deliveryLat"
                type="number"
                step="any"
                placeholder="e.g., 40.7580"
                value={formData.deliveryLat}
                onChange={(e) => setFormData({ ...formData, deliveryLat: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryLng">Delivery Longitude</Label>
              <Input
                id="deliveryLng"
                type="number"
                step="any"
                placeholder="e.g., -73.9855"
                value={formData.deliveryLng}
                onChange={(e) => setFormData({ ...formData, deliveryLng: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
