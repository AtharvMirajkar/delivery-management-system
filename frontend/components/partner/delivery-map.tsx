"use client";

import { useEffect, useRef } from "react";
import { Order } from "@/lib/api";

interface DeliveryMapProps {
  orders: Order[];
}

export function DeliveryMap({ orders }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      if (!mapRef.current) return;

      const defaultCenter: [number, number] =
        orders.length > 0
          ? [orders[0].pickupLocation.lat, orders[0].pickupLocation.lng]
          : [40.7128, -74.006];

      const map = L.map(mapRef.current).setView(defaultCenter, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const bounds: [number, number][] = [];

      orders.forEach((order) => {
        const pickupMarker = L.marker(
          [order.pickupLocation.lat, order.pickupLocation.lng],
          { icon: customIcon }
        ).addTo(map);
        pickupMarker.bindPopup(`
          <div style="min-width: 200px">
            <b>Pickup</b><br/>
            ${order.orderNumber}<br/>
            ${order.pickupAddress}<br/>
            <span style="color: #2563eb; font-weight: 500;">Status: ${order.status}</span>
          </div>
        `);
        bounds.push([order.pickupLocation.lat, order.pickupLocation.lng]);

        const deliveryMarker = L.marker(
          [order.deliveryLocation.lat, order.deliveryLocation.lng],
          { icon: customIcon }
        ).addTo(map);
        deliveryMarker.bindPopup(`
          <div style="min-width: 200px">
            <b>Delivery</b><br/>
            ${order.orderNumber}<br/>
            ${order.deliveryAddress}<br/>
            <span style="color: #2563eb; font-weight: 500;">Status: ${order.status}</span>
          </div>
        `);
        bounds.push([order.deliveryLocation.lat, order.deliveryLocation.lng]);

        L.polyline(
          [
            [order.pickupLocation.lat, order.pickupLocation.lng],
            [order.deliveryLocation.lat, order.deliveryLocation.lng],
          ],
          {
            color: "#2563eb",
            weight: 2,
            opacity: 0.6,
            dashArray: "5, 10",
          }
        ).addTo(map);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [orders]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      {orders.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">No deliveries to display on map</p>
        </div>
      )}
    </div>
  );
}
