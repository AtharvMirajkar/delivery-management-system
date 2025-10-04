'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Order, Partner } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AssignOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  partners: Partner[];
  onSuccess: () => void;
}

export function AssignOrderDialog({
  open,
  onOpenChange,
  order,
  partners,
  onSuccess,
}: AssignOrderDialogProps) {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const availablePartners = partners.filter((p) => p.isAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    setIsLoading(true);
    try {
      await api.assignOrder(order._id, selectedPartnerId);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Order to Partner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="font-semibold mb-2">{order.orderNumber}</p>
            <p className="text-sm text-gray-600">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">From: {order.pickupAddress}</p>
            <p className="text-sm text-gray-600">To: {order.deliveryAddress}</p>
          </div>

          {availablePartners.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No available partners at the moment
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner">Select Partner</Label>
                <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                  <SelectTrigger id="partner">
                    <SelectValue placeholder="Choose a partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePartners.map((partner) => (
                      <SelectItem key={partner._id} value={partner._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{partner.name}</span>
                          {partner.phone && (
                            <span className="text-xs text-gray-500 ml-2">{partner.phone}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !selectedPartnerId}
                >
                  {isLoading ? 'Assigning...' : 'Assign Order'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
